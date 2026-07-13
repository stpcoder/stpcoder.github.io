#!/usr/bin/env python3
"""Generate Reality Lab source imagery with Gemini Image on Vertex AI."""

import argparse
import datetime
import hashlib
import io
import json
import os
import time
from pathlib import Path

from PIL import Image
from google import genai
from google.genai import types
from google.genai.errors import ClientError


MODEL = os.environ.get("REALITY_LAB_IMAGE_MODEL", "gemini-2.5-flash-image")

STORY_PROMPTS = {
    "memory": {
        "real": """Create one super-realistic editorial product photograph for a premium interactive portfolio. Show a generic premium smartphone engineering prototype at a clear three-quarter angle, with its transparent rear cover lifted slightly in an elegant exploded view. The internal mainboard is physically plausible and a single small matte-black mobile DRAM package is visibly seated on the board, emphasized only by a restrained cyan inspection glow and two fine nonverbal probe marks. The complete phone remains recognizable as the outcome; the memory package is important but not oversized. Warm off-white seamless drafting-paper background with faint technical grid lines, centered composition, entire device visible, generous negative space, eye-level 50mm product camera, crisp industrial-design lighting, soft contact shadow, believable glass, aluminum, PCB, and silicon materials. No people, hands, logos, brands, company names, readable text, letters, numbers, watermark, border, UI, or impossible circuitry.""",
        "scene": """Use the supplied smartphone engineering prototype as the exact hero object and place it in a super-realistic professional mobile-memory validation environment. The same phone sits prominently in the foreground on a clean antistatic bench with its transparent rear and small DRAM package still visible. Surround it with a compact high-speed oscilloscope, fine probe fixture, thermal inspection camera, and restrained abstract signal traces on one monitor, all physically plausible and without readable labels. The phone must remain the visual focus and should clearly feel like the real device context reached from the sketch. Dark charcoal lab, brushed aluminum, cool cyan instrument light balanced by warm task light, cinematic 35mm wide composition, premium editorial realism, subtle reflections and depth. Generic non-proprietary equipment only. No people, hands, logos, brands, company names, readable text, watermark, UI chrome, sci-fi holograms, or oversized chips.""",
    },
    "memento": {
        "real": """Create one super-realistic editorial product photograph for a premium interactive portfolio. Show a single palm-sized 3D travel-memory collectible: a glossy borderless travel snapshot card gently folds upward and becomes a richly detailed miniature coastal town with a tiny hill, tiled houses, one winding path, and blue water, all rising naturally from a refined dark-metal base. The transition from flat photo memory to tangible miniature must be immediately understandable. Warm off-white seamless drafting-paper background with faint technical grid lines, centered composition, entire collectible visible, generous negative space, eye-level 50mm product camera, soft directional studio lighting and contact shadow, tactile resin, paper, metal, and miniature foliage. No people, hands, logos, brands, readable text, letters, numbers, watermark, border, UI, toy packaging, or fantasy architecture.""",
        "scene": """Use the supplied travel-memory collectible as the exact hero object and place it in a super-realistic lived-in creative workspace. The same miniature coastal town sits prominently on a warm oak shelf beside a generic smartphone displaying only the matching source travel photograph with no readable interface. Add a compact camera, two unmarked photo prints, and soft late-afternoon window light so the scene clearly communicates a digital travel memory becoming something physical that can be kept. The collectible remains the visual focus and its shape and materials match the reference. Eye-level 35mm wide editorial photograph, warm natural light with a restrained cyan reflection, premium but personal, believable scale and materials. No people, hands, logos, brands, company names, readable text, watermark, visible app UI, or unrelated objects.""",
    },
    "heritage": {
        "real": """Create one super-realistic editorial product photograph for a premium interactive portfolio. Show a museum-grade Korean ink-painting conservation panel: a small vertical silk landscape with expressive black-ink mountains and an old pine, stabilized inside minimal frameless conservation glass on a dark stone plinth. One restrained area shows aged fibers and faint loss while an adjacent restored passage is coherent and respectful; a thin cyan scanning line and a subtle gold conservation seam make the restoration process legible without turning it decorative. Warm off-white seamless drafting-paper background with faint technical grid lines, centered composition, entire panel visible, generous negative space, eye-level 50mm product camera, museum-grade directional lighting, real silk fibers, aged paper, glass reflections, and soft contact shadow. No people, hands, museum logos, readable text, letters, numbers, watermark, border, UI, or fantasy imagery.""",
        "scene": """Use the supplied Korean ink-painting conservation panel as the exact hero object and place it in a super-realistic heritage-science conservation and digitization lab. The same panel stands prominently under a restrained overhead spectral-scanning rig, beside a magnifier, archival brush, neutral color-calibration tiles without labels, and a monitor showing only abstract monochrome restoration layers. In the deeper background, reveal a quiet museum viewing wall where the conserved work could eventually be displayed, creating a clear path from analysis to public memory. Warm museum task light balanced by cool cyan scanning light, dark wood and neutral stone, cinematic eye-level 35mm wide composition, tactile and believable. No people, hands, logos, institutions, readable text, watermark, UI chrome, or unrelated art.""",
    },
}

SKETCH_PROMPT = """Redraw this exact product photograph as a genuinely hand-drawn expert industrial-design concept sheet while preserving the subject, camera angle, scale, silhouette, framing, and exact object position closely enough for a seamless aligned hover reveal. The central object and its function must remain immediately recognizable. Replace photographic materials and realistic lighting with predominantly monochrome black graphite, charcoal, and grease-pencil linework on visibly fibrous warm off-white drafting paper. Use several exploratory contour strokes, loose under-drawing, cross-hatched shadows, erased construction marks, and only very restrained pale-cyan construction-pencil accents. Do not retain glossy photographic rendering, full-color surfaces, lens blur, or photo-real textures. Add only a few nonverbal measurement arrows, scan arcs, exploded-view guide lines, or construction circles that support the object's function. Keep the backdrop calm and premium. Absolutely no readable text, letters, numbers, logos, watermark, border, UI, or generic futuristic symbols. This must look like an original physical sketch by an expert product designer, not a filtered photograph."""


def response_image(response):
    for part in response.candidates[0].content.parts:
        if part.inline_data:
            return part.inline_data.data, part.inline_data.mime_type
    raise RuntimeError("Vertex AI returned no image")


def generate(client, contents):
    for attempt in range(5):
        try:
            response = client.models.generate_content(
                model=MODEL,
                contents=contents,
                config=types.GenerateContentConfig(
                    response_modalities=[types.Modality.IMAGE],
                    image_config=types.ImageConfig(
                        aspect_ratio="16:9",
                        image_size="1K",
                        output_mime_type="image/png",
                    ),
                ),
            )
            return response_image(response)
        except ClientError as error:
            if error.code != 429 or attempt == 4:
                raise
            delay = 20 * (attempt + 1)
            print(f"Vertex AI quota is cooling down; retrying in {delay}s")
            time.sleep(delay)

    raise RuntimeError("unreachable")


def save_webp(data, destination):
    image = Image.open(io.BytesIO(data)).convert("RGB")
    image.save(destination, "WEBP", quality=86, method=6)


def load_asset(path):
    return path.read_bytes(), "image/webp"


def write_manifest(output_dir):
    assets = {}
    for path in sorted(output_dir.glob("*.webp")):
        assets[path.name] = {
            "bytes": path.stat().st_size,
            "sha256": hashlib.sha256(path.read_bytes()).hexdigest(),
        }

    manifest = {
        "generator": "Vertex AI Gemini API",
        "model": MODEL,
        "generated_on": datetime.date.today().isoformat(),
        "semantic_version": 2,
        "assets": assets,
        "prompts": {
            "stories": STORY_PROMPTS,
            "sketch_edit": SKETCH_PROMPT,
        },
    }
    (output_dir / "manifest.json").write_text(
        json.dumps(manifest, indent=2, ensure_ascii=True) + "\n",
        encoding="utf-8",
    )


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--output",
        type=Path,
        default=Path("src/assets/reality-lab"),
    )
    parser.add_argument("--force", action="store_true")
    parser.add_argument(
        "--stories",
        nargs="+",
        choices=tuple(STORY_PROMPTS),
        default=tuple(STORY_PROMPTS),
    )
    parser.add_argument(
        "--kinds",
        nargs="+",
        choices=("real", "sketch", "scene"),
        default=("real", "sketch", "scene"),
    )
    args = parser.parse_args()

    project = os.environ.get("GOOGLE_CLOUD_PROJECT")
    location = os.environ.get("GOOGLE_CLOUD_LOCATION", "global")
    if not project:
        raise SystemExit("Set GOOGLE_CLOUD_PROJECT before running this script")

    args.output.mkdir(parents=True, exist_ok=True)
    client = genai.Client(vertexai=True, project=project, location=location)
    expected_names = {
        f"{slug}-{kind}.webp"
        for slug in STORY_PROMPTS
        for kind in ("real", "sketch", "scene")
    }
    for stale_path in args.output.glob("*.webp"):
        if stale_path.name not in expected_names:
            stale_path.unlink()

    for slug in args.stories:
        prompts = STORY_PROMPTS[slug]
        real_path = args.output / f"{slug}-real.webp"
        if not real_path.exists() or ("real" in args.kinds and args.force):
            print(f"Generating {real_path.name}")
            data, mime = generate(client, prompts["real"])
            save_webp(data, real_path)
        else:
            data, mime = load_asset(real_path)

        sketch_path = args.output / f"{slug}-sketch.webp"
        if "sketch" in args.kinds and (args.force or not sketch_path.exists()):
            print(f"Generating {sketch_path.name}")
            sketch_data, _ = generate(
                client,
                [types.Part.from_bytes(data=data, mime_type=mime), SKETCH_PROMPT],
            )
            save_webp(sketch_data, sketch_path)

        scene_path = args.output / f"{slug}-scene.webp"
        if "scene" in args.kinds and (args.force or not scene_path.exists()):
            print(f"Generating {scene_path.name}")
            scene_data, _ = generate(
                client,
                [types.Part.from_bytes(data=data, mime_type=mime), prompts["scene"]],
            )
            save_webp(scene_data, scene_path)

    write_manifest(args.output)


if __name__ == "__main__":
    main()
