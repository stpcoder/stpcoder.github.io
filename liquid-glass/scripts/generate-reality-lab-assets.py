#!/usr/bin/env python3
"""Generate Reality Lab source imagery with Gemini Image on Vertex AI."""

import argparse
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

REAL_PROMPTS = {
    "silicon": """Create one super-realistic editorial product photograph for a premium interactive portfolio. A single circular silicon wafer representing memory engineering, standing at a subtle three-quarter angle on a minimal matte-black precision stand. The wafer has a dense etched microchip grid, elegant cyan and warm amber spectral reflections, physically plausible glassy silicon material, soft directional studio lighting, and a slight contact shadow. Warm off-white seamless paper background with very faint technical grid lines, centered composition, entire object visible, generous negative space, camera at eye level, 50mm lens. Sophisticated industrial design photography, tactile and believable. No people, hands, logos, company names, typography, watermark, border, or UI.""",
    "intelligence": """Create one super-realistic editorial product photograph for a premium interactive portfolio. A single translucent optical-glass cube representing practical artificial intelligence, floating only a few millimeters above a precise dark-metal cradle. Inside the cube, fine luminous neural pathways and data traces form an elegant three-dimensional network, with cyan, electric blue, and restrained coral light. Physically plausible refraction, caustics, subtle dust, soft directional studio lighting, and a slight contact shadow. Warm off-white seamless paper background with very faint technical grid lines, centered composition, entire object visible, generous negative space, camera at eye level, 50mm lens. Sophisticated industrial design photography, tactile and believable. No people, hands, brains, robots, logos, typography, watermark, border, or UI.""",
    "heritage": """Create one super-realistic editorial product photograph for a premium interactive portfolio. A museum-grade Korean ink painting restoration object: a small vertical silk scroll held inside a minimal frameless conservation-glass display on a dark stone plinth. The painting shows expressive black-ink mountains and an old pine, with a restrained golden repaired seam and a very subtle cyan scanning light along one edge. Real silk fibers, aged paper, conservation glass reflections, soft museum-grade directional lighting, and a slight contact shadow. Warm off-white seamless paper background with very faint technical grid lines, centered composition, entire object visible, generous negative space, camera at eye level, 50mm lens. Sophisticated heritage-science photography, tactile and believable. No people, hands, museum logos, typography, watermark, border, or UI.""",
}

SKETCH_PROMPT = """Transform this exact image into a raw industrial-design concept sketch. Preserve the object, camera angle, scale, silhouette, framing, and exact object position so it can be overlaid with the source. Use expressive black graphite and grease-pencil linework, multiple exploratory contour strokes, cross-hatched shading, faint cyan construction-pencil accents, off-white drafting paper, and subtle square grid lines. Keep the composition clean and premium, with a few nonverbal measurement arrows and construction circles but absolutely no readable text, letters, numbers, logos, watermark, border, or UI. The result should feel hand-drawn by an expert designer, not like a generic image filter."""

FINAL_PROMPT = """Use the three supplied product references as visual ingredients and create one super-realistic cinematic engineering studio at night. The silicon wafer sits on the desk beside the translucent AI glass cube; the conserved Korean ink painting is mounted on the wall behind them. A wide monitor shows only abstract lines and image tiles, with no readable text. Warm task lighting meets cool cyan practical light, premium dark wood and brushed aluminum, subtle floor and glass reflections, believable materials, restrained film grain, eye-level 35mm camera, balanced wide composition with open space for a headline. The room should feel like one person's real working environment where memory engineering, applied AI, and heritage science meet. No people, hands, logos, company names, readable typography, watermark, border, or UI chrome."""


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
        "generated_on": "2026-07-13",
        "assets": assets,
        "prompts": {
            "real": REAL_PROMPTS,
            "sketch_edit": SKETCH_PROMPT,
            "final_room": FINAL_PROMPT,
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
    args = parser.parse_args()

    project = os.environ.get("GOOGLE_CLOUD_PROJECT")
    location = os.environ.get("GOOGLE_CLOUD_LOCATION", "global")
    if not project:
        raise SystemExit("Set GOOGLE_CLOUD_PROJECT before running this script")

    args.output.mkdir(parents=True, exist_ok=True)
    client = genai.Client(vertexai=True, project=project, location=location)
    real_assets = []

    for slug, prompt in REAL_PROMPTS.items():
        real_path = args.output / f"{slug}-real.webp"
        if args.force or not real_path.exists():
            print(f"Generating {real_path.name}")
            data, mime = generate(client, prompt)
            save_webp(data, real_path)
        else:
            data, mime = load_asset(real_path)
        real_assets.append((data, mime))

        sketch_path = args.output / f"{slug}-sketch.webp"
        if args.force or not sketch_path.exists():
            print(f"Generating {sketch_path.name}")
            sketch_data, _ = generate(
                client,
                [types.Part.from_bytes(data=data, mime_type=mime), SKETCH_PROMPT],
            )
            save_webp(sketch_data, sketch_path)

    room_path = args.output / "reality-room.webp"
    if args.force or not room_path.exists():
        print(f"Generating {room_path.name}")
        references = [
            types.Part.from_bytes(data=data, mime_type=mime)
            for data, mime in real_assets
        ]
        room_data, _ = generate(client, [*references, FINAL_PROMPT])
        save_webp(room_data, room_path)

    write_manifest(args.output)


if __name__ == "__main__":
    main()
