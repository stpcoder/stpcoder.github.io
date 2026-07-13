# Reality Lab Design and Provenance

Last updated: 2026-07-13

## Purpose

Reality Lab is an original portfolio view that turns Taeho Je's profile into a continuous sketch-to-outcome journey. It borrows interaction principles from Vizcom's homepage without copying Vizcom assets, source code, brand copy, or product UI.

## Reference audit

Primary references inspected on 2026-07-13:

- Live homepage: <https://vizcom.com/>
- Webflow production case study: <https://webflow.com/blog/vizcom-offbrand-homepage-motion>
- OFF+BRAND project page: <https://www.itsoffbrand.com/our-work/vizcom>
- Vizcom product layout documentation: <https://docs.vizcom.com/overview-of-the-vizcom-layout>

The in-app and Chrome automation sessions were unavailable during this audit. The current live HTML, page JavaScript, public production case study, and the case study's full-resolution captures were inspected directly instead. Reference captures were kept under `/tmp/vizcom-analysis` and were not copied into this repository.

### Observed experience model

1. The hero presents three selectable objects: a car, coat, and chair.
2. Each object crosses from a loose sketch into a dimensional render as the visitor interacts.
3. The visual demonstration precedes most explanatory copy, so the interaction teaches the product.
4. A later sticky product demonstration advances through `Sketch`, `Render`, `Iterate`, and `Make it real` as vertical scroll progress changes.
5. The final transition places the generated object in a believable physical room, making the abstract-to-real threshold literal.
6. Mobile keeps the same story but uses a purpose-built carousel and separate visual assets rather than forcing the desktop scene into a smaller viewport.

### Observed implementation strategy

The live markup exposes a dedicated WebGL canvas, a long scroll track, left and right product panels, a staged sketch canvas, an iteration grid, a final real-world video, and a synthetic cursor. The public bundle references GSAP, ScrollTrigger, Lenis, OGL, Rive, Draco, KTX, and separate desktop/mobile GLB room assets.

The production case study documents the performance strategy:

- Assets are compressed and loaded asynchronously.
- Parsing is deferred until an asset is needed.
- Mobile uses separate lower-resolution textures.
- Believable motion uses small purpose-built shader algorithms instead of a general physics engine.
- OGL is used to keep the WebGL layer comparatively small.

## Portfolio adaptation

Reality Lab keeps the experience principles but changes the narrative, visual objects, language, and implementation.

| Reference principle | Reality Lab adaptation |
| --- | --- |
| Three product objects | Memory Device, Memento, and Heritage Panel objects taken from Taeho's actual work |
| Hover sketch-to-render | Pointer-controlled aligned sketch/real image reveal |
| Product carousel | Three floating keyboard-accessible objects plus story tabs and previous/next controls |
| Sketch / Render / Iterate / Make it real | Sketch / Resolve / Evidence / In context |
| Physical room threshold | A different believable destination for each selected object |
| Product UI panels | Data-driven Layers and Direction panels tied to resume records |
| Product examples | The actual Education, Experience, Projects, Awards, Scholarships, Media, and Activities dataset |

### Semantic object map

The first version used a wafer and an abstract glass AI cube. They looked polished, but they
were symbols rather than outcomes Taeho actually works on. Version two replaces every abstract
symbol with a concrete object and gives each object its own real-world destination.

| Story | Floating sketch object | Hover / resolved object | Scroll destination | Verified portfolio evidence |
| --- | --- | --- | --- | --- |
| `memory` | Exploded mobile-device drawing with one memory package emphasized | A generic transparent-back smartphone engineering prototype with the DRAM package visible | The same device on a professional memory-validation bench | Current DRAM AE role at SK hynix; POSTECH foundation; Presidential Science Scholarship |
| `memento` | A travel snapshot folding upward into a miniature landscape | A palm-sized travel-photo-to-3D collectible | The collectible beside its source photo in a lived-in creative space | Memento Land; AI_TOP_100 Grand Prize; Kakao Impact media; Challenge K-Startup |
| `heritage` | A damaged Korean ink painting under conservation scan lines | The same painting stabilized in conservation glass | The panel inside a believable restoration and digitization lab | Heritage Science Project; MuEunJae Award; POSTECH Times; Nobel Week |

The memory scene deliberately uses a generic phone and generic lab. It does not imply that Taeho
designs phones or disclose any SK hynix product. It visualizes the downstream device context of
the DRAM behavior tested by an application engineer.

### Experience continuity

1. All three rough objects float together in the hero so the visitor chooses a real Taeho story,
   not a category label.
2. Hovering or dragging across any object reveals the aligned physical version in place.
3. Selecting an object promotes it to the center and locks that narrative for the scroll journey.
4. The sticky sequence advances through `Sketch`, `Resolve`, `Evidence`, and `In context`.
5. The final threshold expands the selected object into its own environment instead of combining
   unrelated objects in one generic room.

All record names, organizations, periods, descriptions, and links come from `data/resume-data.json` through `liquid-glass/src/lib/profileData.js`. Only the short narrative bridge copy is view-specific.

## Vertex AI asset pipeline

The nine production images are generated through the Gemini API on Vertex AI using existing gcloud Application Default Credentials.

- Model: `gemini-2.5-flash-image`
- Generator: `liquid-glass/scripts/generate-reality-lab-assets.py`
- Pinned tools: `liquid-glass/scripts/requirements-reality-lab.txt`
- Output and checksums: `liquid-glass/src/assets/reality-lab/manifest.json`

Generation flow:

1. Generate a photorealistic, semantically concrete object for each story.
2. Send each output back to Gemini as an image reference.
3. Request an aligned expert concept-sketch treatment that preserves camera, scale, position, and silhouette.
4. Send each realized object back as the reference for its own believable real-world destination.
5. Convert all nine returned images to compressed WebP and record SHA-256 checksums.

No Google Cloud project ID, account identifier, access token, or credential is committed.

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

Reality Lab intentionally does not add another WebGL engine.

- The view is route-level code split.
- The six lightweight hero WebPs are the interaction itself, so all three sketch/real pairs can respond immediately; story-specific scene images use native lazy loading and idle preloading.
- `Save-Data` skips idle scene preloading, and the complete nine-image set remains under 650 KB.
- Pointer reveal updates a CSS custom property inside one animation frame and does not trigger React rendering on every pointer event.
- Scroll progress uses one passive listener and one requestAnimationFrame scheduler.
- React state changes only when the active discrete step changes.
- The long proof and footer sections use `content-visibility`.
- `prefers-reduced-motion` removes nonessential transitions and smooth scrolling.
- Mobile uses a range control for the reveal instead of hijacking vertical touch gestures.

## Key files

- `liquid-glass/src/components/styles/RealityLabView.jsx`
- `liquid-glass/src/components/styles/RealityLabView.css`
- `liquid-glass/src/lib/realityLab.js`
- `liquid-glass/src/assets/reality-lab/`
- `liquid-glass/scripts/generate-reality-lab-assets.py`
