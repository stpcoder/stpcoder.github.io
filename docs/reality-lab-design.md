# Reality Lab Design and Provenance

Last updated: 2026-07-13

## Purpose

Reality Lab is an original portfolio view that turns Taeho Je's profile into four visual stories. The experience begins as a quiet character selector: one isolated concept sketch floats in the center, horizontal swipes choose another story, and selecting the sketch moves directly into a full-viewport cinematic sequence.

The view borrows high-level interaction principles from product-visualization sites without copying their assets, source, product UI, or brand language.

## Reference audit

Primary references inspected on 2026-07-13:

- Live homepage: <https://vizcom.com/>
- Webflow production case study: <https://webflow.com/blog/vizcom-offbrand-homepage-motion>
- OFF+BRAND project page: <https://www.itsoffbrand.com/our-work/vizcom>
- Vizcom product layout documentation: <https://docs.vizcom.com/overview-of-the-vizcom-layout>

The reusable principles were visual-first selection, object continuity, scroll-directed progression, and mobile-specific interaction. Reality Lab replaces the reference subjects, copy, visual system, and implementation with portfolio-specific material.

## Experience model

### Hero selector

1. Exactly one transparent concept-sketch cutout is centered at a time.
2. Pointer drag, touch swipe, or the left and right arrow keys moves between the four stories.
3. The neighboring drawings stay outside the viewport until a drag begins; there are no cards, category labels, descriptions, or visible arrow controls.
4. A tap, click, Enter, or Space selection briefly darkens the viewport and begins the selected story.
5. The selected story also determines the section initially opened in the proof archive. AI_TOP_100 opens `Awards`.

### Fullscreen journey

The selected story is rendered as a sticky, full-viewport image sequence. Images use `object-fit: cover` directly against every viewport edge; there is no rounded frame, inset panel, or decorative container. Stage navigation and one large sentence are overlaid on the image.

| Story | Scroll sequence | Proof destination |
| --- | --- | --- |
| `memory` | Wafer -> circuit traces -> packaged DRAM -> memory inside a phone -> validation bench -> everyday device use | Experience |
| `memento` | Capture a trip -> photo forgotten -> album reopened -> place unfolds -> memory revisited | Projects |
| `heritage` | Inspect damage -> calibrated capture -> model restoration -> print fragment -> careful placement -> preserve | Projects |
| `aitop` | Study -> code -> face the challenge -> break through -> receive the AI_TOP_100 Grand Prize | Awards |

### Proof archive

Education, Experience, Projects, Awards, Scholarships, Media, and Activities are read from `data/resume-data.json` through `liquid-glass/src/lib/profileData.js`. Reality Lab does not duplicate profile records. The archive uses larger numbered section controls and larger record typography so the proof remains readable after the cinematic sequence.

## Semantic object map

| Story | Floating cutout | Narrative outcome | Verified evidence |
| --- | --- | --- | --- |
| `memory` | Exploded mobile-device and memory concept | A memory package moves from wafer to a dependable everyday device | Current DRAM AE role at SK hynix; POSTECH; Presidential Science Scholarship |
| `memento` | A travel photograph unfolding into a miniature | A digital travel memory becomes an object that can be kept | Memento Land; AI_TOP_100 Grand Prize; Kakao Impact; Challenge K-Startup |
| `heritage` | A damaged Korean ink painting under conservation | Restrained restoration returns the work to public memory | Heritage Science Project; MuEunJae Award; POSTECH Times; Nobel Week |
| `aitop` | A student and upward challenge composition | Study and code culminate in a first-place award moment | AI_TOP_100 Grand Prize; Kakao Impact media; POSTECH |

The memory story deliberately uses generic devices, packages, instruments, and labs. It visualizes the downstream context of DRAM application engineering without implying phone-design responsibility or exposing proprietary SK hynix products.

## Vertex AI asset pipeline

The production set contains 33 WebP files:

- 29 images generated with Gemini 3 Pro Image on Vertex AI.
- 4 transparent hero cutouts extracted locally from the generated sketches.

Configuration:

- Model: `gemini-3-pro-image-preview`
- Output request: 2K, 16:9 PNG
- Runtime asset: quality-controlled WebP
- Generator: `liquid-glass/scripts/generate-reality-lab-assets.py`
- Pinned tools: `liquid-glass/scripts/requirements-reality-lab.txt`
- Provenance and SHA-256 checksums: `liquid-glass/src/assets/reality-lab/manifest.json`

Generation flow:

1. Generate one photorealistic anchor object for each story.
2. Generate the story-specific cinematic frames, reusing prior outputs as references where continuity matters.
3. Generate a clean expert concept sketch on a uniform warm-white field.
4. Remove that field locally, retain soft graphite edges, crop the alpha bounds, and save the transparent hero cutout.
5. Generate each final context scene from its story references.
6. Convert API output to WebP and record file size, prompts, reference relationships, model, image size, and checksum in the manifest.

No Google Cloud project ID, account identifier, token, or credential is committed.

Reproduction:

```bash
cd liquid-glass
python3 -m venv /tmp/reality-lab-venv
/tmp/reality-lab-venv/bin/pip install -r scripts/requirements-reality-lab.txt
GOOGLE_CLOUD_PROJECT="your-project" \
GOOGLE_CLOUD_LOCATION="global" \
GOOGLE_GENAI_USE_VERTEXAI="true" \
/tmp/reality-lab-venv/bin/python scripts/generate-reality-lab-assets.py
```

## Runtime and performance model

Reality Lab adds no WebGL engine.

- The entire view remains route-level code split.
- The hero loads four compressed cutouts rather than four sketch/photo pairs.
- Only the selected story's five or six narrative frames exist in the DOM.
- `Save-Data` disables idle preloading; otherwise idle time fetches only the next cutout and its first and final frames.
- Swipe movement writes one CSS custom property through `requestAnimationFrame` and does not re-render React on each pointer event.
- Scroll work uses one passive listener and one animation-frame scheduler.
- Frame transforms and opacity are written directly to the selected figure nodes; React updates only when the discrete stage changes.
- `prefers-reduced-motion` removes floating, smooth scrolling, and nonessential transitions.

## Key files

- `liquid-glass/src/components/styles/RealityLabView.jsx`
- `liquid-glass/src/components/styles/RealityLabView.css`
- `liquid-glass/src/lib/realityLab.js`
- `liquid-glass/src/assets/reality-lab/`
- `liquid-glass/scripts/generate-reality-lab-assets.py`
