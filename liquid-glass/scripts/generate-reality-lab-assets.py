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

from PIL import Image, ImageChops, ImageFilter, ImageOps, ImageStat
from google import genai
from google.genai import types
from google.genai.errors import ClientError


MODEL = os.environ.get("REALITY_LAB_IMAGE_MODEL", "gemini-3-pro-image-preview")
IMAGE_SIZE = os.environ.get("REALITY_LAB_IMAGE_SIZE", "2K")

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
    "aitop": {
        "real": """Create one super-realistic editorial product photograph for a premium interactive portfolio. Show a single substantial contemporary award sculpture representing a first-place artificial-intelligence problem-solving prize. The object rises from a precise black-stone base as one continuous brushed-aluminum ribbon that bends upward into an open threshold, with a restrained cyan core and one warm amber edge. It should feel important, credible, and physically manufacturable rather than like a gaming trophy. Warm off-white drafting-paper background with faint grid lines, centered composition, entire award visible, generous negative space, eye-level 50mm camera, premium museum-grade product lighting, soft contact shadow. No people, hands, logos, brand marks, organization names, readable text, letters, numbers, watermark, border, UI, laurel wreaths, cups, or fantasy effects.""",
        "scene": """Use the supplied award sculpture as the exact trophy in a super-realistic cinematic award-stage scene. A young Korean male university student is seen primarily from behind and in partial silhouette as he receives and raises the same substantial sculpture at center stage. A high paper-like challenge wall has opened behind him into a bright elevated space; restrained cyan and warm amber beams sweep in a gentle spiral to imply upward movement and breakthrough. The moment should feel earned, large, and documentary-real rather than celebrity glamour. Wide 35mm composition, strong depth, a small audience in soft silhouette, subtle paper fragments in the air, physically plausible stage lighting. No identifiable face, logos, organization names, readable text, letters, numbers, watermark, UI, medals, cups, or fantasy costumes.""",
    },
}

NARRATIVE_PROMPTS = {
    "memory": {
        "wafer": """Create a super-realistic cinematic portfolio frame showing the beginning of a memory-device journey: a complete silicon wafer on a clean transfer tray in a generic semiconductor environment, viewed at a dramatic shallow three-quarter angle. Dense die grids catch restrained cyan and warm amber reflections. The wafer is large and unmistakable, filling most of a wide 16:9 frame while the background remains softly out of focus. Physically plausible cleanroom materials and lighting, premium editorial photography. No people, logos, brands, company names, readable text, watermark, UI, or science-fiction machinery.""",
        "circuit": """Create a super-realistic cinematic macro frame that feels like the camera has moved from a silicon wafer down into its etched memory circuitry. Show physically plausible repeating memory-cell structures, copper interconnect layers, vias, and microscopic traces stretching like an engineered landscape. Use restrained cyan inspection light and warm amber edge light, extreme macro depth, crisp central detail, and dark falloff at the edges. The frame must clearly advance wafer into circuit, not become a generic neon city. No people, logos, brands, company names, readable text, watermark, UI, or fantasy electronics.""",
        "package": """Create a super-realistic cinematic product frame showing a finished generic mobile DRAM package after fabrication. A single compact matte-black memory package rests above a precise mobile PCB in a restrained exploded assembly view, with fine solder-ball geometry and physically plausible surrounding components. The package is the clear hero and fills most of the frame; cyan inspection light travels along real circuit traces toward it, with warm task light and a dark neutral background. No oversized chip, people, hands, logos, brands, company names, readable text, letters, numbers, watermark, UI, or impossible circuitry.""",
        "everyday": """Create a super-realistic cinematic final frame for a memory-device journey. In a calm evening commute or cafe, a young adult is naturally using a generic smartphone for an everyday task; the phone and the person's hand are sharp in the foreground while the face remains unidentifiable and softly out of focus. A very restrained reflection in the phone glass echoes the cyan memory-circuit pattern from earlier frames, but the scene must remain documentary-real and not look holographic. Warm human light, subtle city depth, 35mm editorial photography. No logos, brands, company names, readable screen text, watermark, UI close-up, or visible private information.""",
    },
    "memento": {
        "capture": """Create a super-realistic cinematic opening frame for a travel-memory story. A traveler seen from behind lifts a generic smartphone and photographs a sunlit coastal hillside town with blue water and a winding green path. The act of capture is unmistakable: phone in foreground, real destination beyond it, natural late-afternoon light, lively but refined 35mm travel photography. Keep the traveler unidentifiable. No logos, brands, readable screen text, watermark, UI close-up, selfie pose, or staged advertising look.""",
        "forgotten": """Create a super-realistic cinematic frame showing a travel photograph becoming forgotten. A closed, slightly dusty photo album rests on a quiet shelf in dim late-evening light; one borderless coastal-town photograph is barely visible between its pages, and the same generic phone lies dark and unused nearby. The scene should communicate time passing and a memory left dormant without sadness or decay. Premium tactile paper, cloth, wood, subtle dust motes, wide 16:9 composition. No people, logos, brands, readable text, dates, watermark, or UI.""",
        "reopen": """Create a super-realistic cinematic frame of the forgotten album being rediscovered. Two natural hands open the clothbound album on a warm wooden desk; the coastal-town photograph inside begins to curl upward at one corner, with a tiny physically plausible ridge and path emerging from the paper. The transformation is only beginning, like a memory waking up. Soft morning window light, tactile paper fibers, shallow 35mm depth, wide 16:9 frame. No visible face, jewelry logos, brands, readable text, watermark, UI, magical sparkles, or fantasy effects.""",
        "remember": """Use the supplied travel-memory collectible as the exact object in a super-realistic cinematic closing frame. A young adult seen from behind sits at a quiet desk and leans toward the unfolded coastal miniature, with the reopened photo album and original phone nearby. Warm reflected light from the miniature falls gently across the person's hands and posture, communicating recognition and recollection rather than spectacle. The collectible remains clearly visible and consistent with the reference. Wide 35mm editorial composition, intimate and believable. No identifiable face, logos, brands, readable text, watermark, visible app UI, or fantasy effects.""",
    },
    "heritage": {
        "inspect": """Create a super-realistic cinematic opening frame for a Korean-painting restoration workflow. A conservator in neutral archival gloves examines a damaged section of a traditional Korean ink painting through a large optical magnifier under warm museum task light. Show real silk fibers, faint pigment loss, an old pine and mountain passage, and the careful slow manual process. The hands and magnifier dominate the wide frame; the person remains unidentifiable. No logos, institutions, readable text, watermark, UI, dramatic damage, or fantasy restoration.""",
        "capture": """Create a super-realistic cinematic frame showing the same type of Korean ink painting being digitized. The artwork lies perfectly flat beneath a professional overhead camera and even calibration lighting; neutral color tiles without labels sit at one edge, and a gloved hand has just moved away. The camera, painting, and capture geometry are immediately understandable, precise, and physically plausible. Wide 16:9 conservation-lab photography, warm neutral materials with restrained cyan inspection light. No logos, institutions, readable text, watermark, UI, or unrelated art.""",
        "model": """Create a super-realistic cinematic frame of a heritage-science AI restoration workflow at a desktop workstation. A large monitor shows the photographed Korean ink painting as several aligned visual layers: original damage, a monochrome inferred structure layer, and a restrained proposed repair mask. The interface must be abstract with no readable words, letters, numbers, or branded UI. The real painting is visible softly in the background under neutral conservation light. Wide 16:9 composition, dark focused workspace, cyan model trace accents, believable monitor and input devices. No people in focus, logos, institutions, watermark, holograms, or fantasy effects.""",
        "print": """Create a super-realistic cinematic macro frame showing a precision laser-printing stage for heritage restoration. A compact professional printer produces several tiny irregularly shaped replacement fragments on conservation-grade paper or silk, matching missing ink-painting textures in restrained black and gray. A clean tray catches the pieces; a magnifier and archival tweezers wait nearby. Make the process mechanically and materially believable, with warm task light and fine cyan alignment marks that contain no text. No people, logos, brands, readable text, watermark, UI, sparks, or industrial danger.""",
        "apply": """Use the supplied conserved Korean ink-painting panel as visual reference and create a super-realistic cinematic close frame of the final intervention. Archival-gloved hands use fine tweezers to place one precisely printed irregular fragment into a small damaged passage of the painting beneath a magnifier. The fragment should align naturally with the existing ink landscape; the act is careful, reversible-looking, and restrained. Real silk fibers, subtle repair boundary, warm conservation light, shallow macro depth. No visible face, logos, institutions, readable text, watermark, UI, glue mess, or magical transformation.""",
    },
    "aitop": {
        "study": """Create a super-realistic cinematic opening frame for an earned-award journey. A young Korean male student, seen from behind and not identifiable, studies alone at a modest desk late at night with textbooks, handwritten diagrams, and a small laptop. On a distant wall, a soft rectangular opening of warm light suggests an ambition not yet reached; no trophy is physically present. Quiet determination, realistic student room, blue night light balanced by one warm desk lamp, wide 16:9 editorial photograph. No logos, university marks, readable text, watermark, visible code, luxury room, or fantasy effects.""",
        "code": """Create a super-realistic cinematic frame of the same kind of young Korean male student coding in a university computer lab. Seen from behind, he works between a notebook and two monitors containing only abstract code-like blocks and diagrams with no readable characters. Other students and the campus corridor are softly visible, while a cyan line of light begins to arc upward through the composition. Energetic but believable 35mm photography, wide 16:9 frame. No identifiable face, logos, university names, readable text, watermark, branded UI, or science-fiction holograms.""",
        "challenge": """Create a super-realistic cinematic metaphor grounded in a real competition: the student stands before a tall wall made from layered paper problem sheets, code diagrams, and blank challenge panels, all without readable text. The wall fills the frame and blocks an upward-lit stage beyond it; a narrow crack of cyan and warm light appears at the center. The student is seen from behind, small but determined. Documentary materials combined with restrained conceptual staging, wide 16:9 composition. No logos, competition names, readable text, watermark, fantasy monsters, or superhero pose.""",
        "breakthrough": """Create a high-impact but physically believable cinematic transition frame. The same unidentifiable student moves upward through the paper challenge wall as it opens in a controlled spiral, with sheets and diagram fragments sweeping around him in a corkscrew motion. The camera is slightly tilted and the cyan-to-warm light path rotates upward toward a larger stage, creating a fast whoosh feeling without turning into fantasy. Motion blur is restrained around the edges while the student remains readable. Wide 16:9 frame. No identifiable face, logos, readable text, watermark, cape, flying, explosions, or supernatural effects.""",
    },
}

FRAME_REFERENCES = {
    ("memento", "remember"): "real",
    ("heritage", "inspect"): "real",
    ("heritage", "capture"): "real",
    ("heritage", "model"): "real",
    ("heritage", "print"): "real",
    ("heritage", "apply"): "real",
    ("aitop", "code"): "study",
    ("aitop", "challenge"): "study",
    ("aitop", "breakthrough"): "study",
}

SCENE_FRAME_REFERENCES = {
    "aitop": "breakthrough",
}

SKETCH_SOURCES = {
    "aitop": "study",
}

SKETCH_PROMPT = """Redraw the supplied subject as one premium hand-drawn concept sketch for a character-selection-style portfolio hero. Preserve the subject, camera angle, scale, silhouette, and recognizable function, but remove the surrounding photographic environment. Isolate only the central subject and the few construction strokes directly attached to it. Use confident black graphite, charcoal, and grease-pencil contour work, restrained cross-hatching, and a very small amount of pale-cyan construction pencil. Place it on a completely uniform warm-white background with no paper texture, floor, contact shadow, vignette, frame, border, detached notes, or background objects so the sketch can be cleanly cut out. Do not retain glossy rendering, full-color surfaces, or lens blur. Absolutely no readable text, letters, numbers, logos, watermark, UI, checkerboard transparency pattern, or generic futuristic symbols. It must look like an original expert design sketch, not a filtered photograph."""


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
                    response_modalities=[types.Modality.TEXT, types.Modality.IMAGE],
                    image_config=types.ImageConfig(
                        aspect_ratio="16:9",
                        image_size=IMAGE_SIZE,
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
    image.save(destination, "WEBP", quality=88, method=6)


def save_cutout(source, destination):
    """Remove the model's uniform sketch backdrop while preserving soft pencil edges."""
    image = Image.open(source).convert("RGB")
    width, height = image.size
    border = max(8, min(width, height) // 50)
    border_samples = Image.new("RGB", (width * 2 + height * 2, border))
    cursor = 0
    for sample in (
        image.crop((0, 0, width, border)),
        image.crop((0, height - border, width, height)),
        image.crop((0, 0, border, height)).transpose(Image.Transpose.ROTATE_90),
        image.crop((width - border, 0, width, height)).transpose(Image.Transpose.ROTATE_90),
    ):
        border_samples.paste(sample, (cursor, 0))
        cursor += sample.width
    background = tuple(round(value) for value in ImageStat.Stat(border_samples).median)

    difference = ImageChops.difference(image, Image.new("RGB", image.size, background))
    red_delta, green_delta, blue_delta = difference.split()
    color_delta = ImageChops.lighter(
        ImageChops.lighter(red_delta, green_delta), blue_delta
    )
    chroma_alpha = color_delta.point(
        lambda value: max(0, min(255, (value - 8) * 8))
    )
    dark_alpha = ImageOps.invert(ImageOps.grayscale(image)).point(
        lambda value: max(0, min(255, (value - 23) * 6))
    )
    alpha = ImageChops.lighter(chroma_alpha, dark_alpha).filter(ImageFilter.GaussianBlur(0.55))
    alpha = alpha.point(
        lambda value: 0 if value < 13 else min(255, round((value - 13) * 1.18))
    )

    rgba = image.convert("RGBA")
    rgba.putalpha(alpha)
    crop_mask = alpha.point(lambda value: 255 if value >= 24 else 0)
    bbox = crop_mask.getbbox()
    if bbox:
        padding = max(24, min(width, height) // 32)
        bbox = (
            max(0, bbox[0] - padding),
            max(0, bbox[1] - padding),
            min(width, bbox[2] + padding),
            min(height, bbox[3] + padding),
        )
        rgba = rgba.crop(bbox)
    rgba.save(destination, "WEBP", quality=92, method=6, exact=True)


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
        "image_size": IMAGE_SIZE,
        "generated_on": datetime.date.today().isoformat(),
        "semantic_version": 4,
        "assets": assets,
        "prompts": {
            "stories": STORY_PROMPTS,
            "narrative_frames": NARRATIVE_PROMPTS,
            "frame_references": {
                f"{story}:{frame}": reference
                for (story, frame), reference in FRAME_REFERENCES.items()
            },
            "scene_frame_references": SCENE_FRAME_REFERENCES,
            "sketch_sources": SKETCH_SOURCES,
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
        choices=("real", "frames", "sketch", "cutout", "scene"),
        default=("real", "frames", "sketch", "cutout", "scene"),
    )
    parser.add_argument(
        "--frames",
        nargs="+",
        help="Optional narrative frame ids to generate within the selected stories",
    )
    args = parser.parse_args()

    if args.frames and "frames" not in args.kinds:
        parser.error("--frames requires --kinds frames")
    if args.frames:
        available_frames = {
            frame
            for slug in args.stories
            for frame in NARRATIVE_PROMPTS[slug]
        }
        unknown_frames = sorted(set(args.frames) - available_frames)
        if unknown_frames:
            parser.error(f"Unknown frame ids for selected stories: {', '.join(unknown_frames)}")

    args.output.mkdir(parents=True, exist_ok=True)
    needs_api = any(kind in args.kinds for kind in ("real", "frames", "sketch", "scene"))
    project = os.environ.get("GOOGLE_CLOUD_PROJECT")
    location = os.environ.get("GOOGLE_CLOUD_LOCATION", "global")
    if needs_api and not project:
        raise SystemExit("Set GOOGLE_CLOUD_PROJECT before generating Gemini assets")
    client = (
        genai.Client(vertexai=True, project=project, location=location)
        if needs_api
        else None
    )
    expected_names = {
        f"{slug}-{kind}.webp"
        for slug in STORY_PROMPTS
        for kind in ("real", "sketch", "cutout", "scene")
    }
    expected_names.update(
        f"{slug}-{frame}.webp"
        for slug, frames in NARRATIVE_PROMPTS.items()
        for frame in frames
    )
    for stale_path in args.output.glob("*.webp"):
        if stale_path.name not in expected_names:
            stale_path.unlink()

    real_assets = {}

    def ensure_real(slug, force=False):
        prompts = STORY_PROMPTS[slug]
        real_path = args.output / f"{slug}-real.webp"
        if not real_path.exists() or force:
            print(f"Generating {real_path.name}")
            data, mime = generate(client, prompts["real"])
            save_webp(data, real_path)
        else:
            data, mime = load_asset(real_path)
        real_assets[slug] = (data, mime)
        return data, mime

    def ensure_frame(slug, frame, force=False):
        frame_path = args.output / f"{slug}-{frame}.webp"
        if frame_path.exists() and not force:
            return load_asset(frame_path)

        print(f"Generating {frame_path.name}")
        prompt = NARRATIVE_PROMPTS[slug][frame]
        reference = FRAME_REFERENCES.get((slug, frame))
        if reference == "real":
            reference_data, reference_mime = real_assets.get(slug) or ensure_real(slug)
            contents = [
                types.Part.from_bytes(data=reference_data, mime_type=reference_mime),
                prompt,
            ]
        elif reference:
            reference_data, reference_mime = ensure_frame(slug, reference)
            contents = [
                types.Part.from_bytes(data=reference_data, mime_type=reference_mime),
                prompt,
            ]
        else:
            contents = prompt
        frame_data, frame_mime = generate(client, contents)
        save_webp(frame_data, frame_path)
        return load_asset(frame_path)

    for slug in args.stories:
        if "real" in args.kinds:
            ensure_real(slug, force=args.force)

    if "frames" in args.kinds:
        selected_frames = set(args.frames or ())
        for slug in args.stories:
            for frame in NARRATIVE_PROMPTS[slug]:
                if selected_frames and frame not in selected_frames:
                    continue
                ensure_frame(slug, frame, force=args.force)

    for slug in args.stories:
        prompts = STORY_PROMPTS[slug]

        sketch_path = args.output / f"{slug}-sketch.webp"
        if "sketch" in args.kinds and (args.force or not sketch_path.exists()):
            print(f"Generating {sketch_path.name}")
            source_frame = SKETCH_SOURCES.get(slug)
            if source_frame:
                data, mime = ensure_frame(slug, source_frame)
            else:
                data, mime = real_assets.get(slug) or ensure_real(slug)
            sketch_data, _ = generate(
                client,
                [types.Part.from_bytes(data=data, mime_type=mime), SKETCH_PROMPT],
            )
            save_webp(sketch_data, sketch_path)

        cutout_path = args.output / f"{slug}-cutout.webp"
        if "cutout" in args.kinds and (args.force or not cutout_path.exists()):
            if not sketch_path.exists():
                raise RuntimeError(f"{sketch_path.name} is required to build its cutout")
            print(f"Extracting {cutout_path.name}")
            save_cutout(sketch_path, cutout_path)

        scene_path = args.output / f"{slug}-scene.webp"
        if "scene" in args.kinds and (args.force or not scene_path.exists()):
            print(f"Generating {scene_path.name}")
            data, mime = real_assets.get(slug) or ensure_real(slug)
            contents = [types.Part.from_bytes(data=data, mime_type=mime)]
            scene_frame = SCENE_FRAME_REFERENCES.get(slug)
            if scene_frame:
                frame_data, frame_mime = ensure_frame(slug, scene_frame)
                contents.append(types.Part.from_bytes(data=frame_data, mime_type=frame_mime))
            contents.append(prompts["scene"])
            scene_data, _ = generate(
                client,
                contents,
            )
            save_webp(scene_data, scene_path)

    write_manifest(args.output)


if __name__ == "__main__":
    main()
