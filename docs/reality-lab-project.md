# Reality Lab Project Guide

Last updated: 2026-07-13

## Project status

Reality Lab is a production portfolio view inside `stpcoder.github.io`. It is available from the style menu and directly at `?style=reality-lab`. The current implementation contains four selectable stories, a full-viewport cinematic journey for each story, and a shared evidence archive backed by the canonical resume dataset.

This document is the owner-facing introduction and operating guide. Detailed visual research, image provenance, and generation settings remain in `docs/reality-lab-design.md`.

## Ready-to-use introduction copy

### One-line description

Reality Lab turns verified portfolio records into four interactive visual stories, moving from an isolated concept sketch to the real work behind it.

### Short project description

Reality Lab is an experimental portfolio interface built around discovery rather than a conventional list of credentials. Visitors choose one of four floating concept sketches, follow its story through a scroll-directed cinematic sequence, and arrive at the projects, awards, and experience that support the narrative. The interface uses AI-assisted imagery generated through Vertex AI, but every profile record comes from the same verified dataset used by the rest of the portfolio.

### Full case-study introduction

Most portfolios separate presentation from proof: the first screen creates atmosphere, while the resume appears somewhere else as a static list. Reality Lab combines those two layers. It begins with a quiet, character-selection-style canvas containing one concept sketch at a time. Swiping changes the subject; selecting it opens a full-screen visual sequence that explains how an idea becomes an outcome. The sequence then resolves into the portfolio archive, where the corresponding experience, project, award, scholarship, media appearance, or activity can be inspected directly.

The four stories represent different parts of Taeho Je's work: memory-device engineering, Memento Land, heritage-science restoration, and the AI_TOP_100 Grand Prize journey. The imagery is original and generated through a documented Vertex AI pipeline. The application itself is implemented with React, CSS, and browser-native scrolling rather than a second WebGL runtime, keeping the experience responsive and independently loadable from the 3D Liquid Glass view.

### Technical summary

Reality Lab is a route-level React view with pointer and keyboard story selection, requestAnimationFrame-coordinated scroll animation, story-specific image preloading, accessible stage controls, and data-driven proof dialogs. Thirty-three versioned WebP assets are accompanied by their prompts, model metadata, reference relationships, file sizes, and SHA-256 checksums.

### Portfolio card copy

**Reality Lab**  
An interactive, cinematic portfolio that connects four visual journeys to verified career evidence. Built with React and a reproducible Vertex AI image pipeline.

## Product idea

Reality Lab follows one rule: **wonder first, proof immediately after**.

- The hero should feel like selecting a subject, not browsing cards.
- Each story should communicate one transformation with a clear beginning and outcome.
- Images should occupy the full viewport so the story feels spatial rather than framed.
- Copy should remain short enough to read during motion.
- The proof archive must expose real records instead of repeating promotional claims.
- Visual experimentation must never create a second, conflicting source of profile data.

## Current experience

### 1. Story selector

- One transparent concept-sketch cutout is centered on a warm drafting-paper field.
- Horizontal pointer drag, touch swipe, or the left and right arrow keys changes the story.
- The neighboring subjects remain outside the viewport until a gesture begins.
- A click, tap, Enter, or Space selects the active subject.
- Selection darkens the viewport briefly and scrolls into the selected journey.

### 2. Cinematic journey

- The chosen story owns the entire sticky viewport.
- Every image uses `object-fit: cover` with no inset card or rounded media frame.
- Numbered stage controls provide direct navigation without interrupting native scrolling.
- Each frame first holds at full visibility, then enters a long eased crossfade.
- The incoming frame's copy switches slightly before the visual midpoint, preventing text from trailing the image.
- The current scroll allocation is `1.4` viewport heights per frame plus one final viewport.

### 3. Proof archive

- The selected story opens its most relevant proof category by default.
- Education, Experience, Projects, Awards, Scholarships, Media, and Activities remain available as large section controls.
- Record cards and dialogs read from `data/resume-data.json`; Reality Lab does not duplicate resume content.
- A story can frame the meaning of a record, but it cannot alter the underlying facts.

## Story map

| Story | Narrative sequence | Default proof section | Intended meaning |
| --- | --- | --- | --- |
| `Memory Device` | Wafer -> Circuit -> Package -> Device -> Validate -> Everyday | Experience | Invisible semiconductor work becomes dependable everyday technology. |
| `Memento` | Capture -> Forgotten -> Reopen -> Unfold -> Remember | Projects | A forgotten digital photograph becomes a physical object that restores a memory. |
| `Heritage` | Inspect -> Capture -> Model -> Print -> Apply -> Preserve | Projects | Digital inference supports a careful, restrained heritage-restoration workflow. |
| `AI_TOP_100` | Study -> Code -> Challenge -> Breakthrough -> Award | Awards | Repeated study and problem solving culminate in a verified first-place result. |

## Implementation architecture

```text
App.jsx
  -> lazy-loads RealityLabView.jsx for ?style=reality-lab
     -> uses RealityLabView.css for the complete visual system
     -> uses realityLab.js for deterministic index and scroll timing
     -> uses profileData.js for normalized portfolio records
     -> imports versioned WebP assets from assets/reality-lab/
        -> manifest.json records generation provenance and checksums
```

### React responsibilities

`RealityLabView.jsx` owns the four story definitions, hero gestures, journey selection, proof navigation, image preloading, and record dialogs. React state changes only for discrete events such as selecting a story, changing the active copy step, opening a proof section, or displaying a record.

### Animation responsibilities

Continuous pointer and scroll motion avoids per-frame React rendering:

- Hero drag writes `--hero-drag` through one animation-frame scheduler.
- Journey scroll writes transform and opacity CSS properties directly to frame elements.
- `getRealityVisualState()` returns the copy index and fractional visual position.
- Each segment holds until local progress `0.20`, then crossfades through `0.98` with smoothstep easing.
- Copy advances when the eased transition reaches `0.44`, just before the image midpoint.
- `prefers-reduced-motion` removes nonessential motion and smooth scrolling.

### Data responsibilities

The canonical detailed profile source is `data/resume-data.json`. The pre-development and pre-build scripts synchronize it to `liquid-glass/src/data/resume-data.json`. Presentation-only bridge copy stays in the view; factual titles, organizations, periods, descriptions, and links stay in the shared dataset.

### Asset responsibilities

- Production model: `gemini-3-pro-image-preview` through Vertex AI.
- Generation request: 2K, 16:9 PNG.
- Runtime format: quality-controlled WebP.
- Current set: 33 images, including four transparent selector cutouts.
- Metadata: `liquid-glass/src/assets/reality-lab/manifest.json`.
- Generator: `liquid-glass/scripts/generate-reality-lab-assets.py`.

## How to continue the project

### Change story copy

1. Edit only the relevant `frames` entry in `RealityLabView.jsx`.
2. Keep stage labels brief and keep each headline to one sentence.
3. Do not place factual resume details in story copy when they belong in the canonical JSON.
4. Verify that copy changes at the intended point during both wheel and touch scrolling.

### Change transition timing

1. Edit the pure timing function in `liquid-glass/src/lib/realityLab.js`.
2. Update the corresponding assertions in `liquid-glass/scripts/test-interactions.mjs`.
3. Prefer changing hold, crossfade, and copy thresholds over adding component timers.
4. Check the first transition carefully; it is the visitor's only opportunity to understand the initial image before scrolling.

### Replace or regenerate imagery

1. Edit the appropriate prompt or reference relationship in the generation script.
2. Generate only the required story and asset kind when possible.
3. Inspect subject continuity, cropping, readable-text artifacts, hands, logos, and factual implications.
4. Keep filenames stable unless the source imports are updated deliberately.
5. Regenerate `manifest.json` and review every changed checksum before committing.

Example selective generation:

```bash
cd liquid-glass
GOOGLE_CLOUD_PROJECT="your-project" \
GOOGLE_CLOUD_LOCATION="global" \
GOOGLE_GENAI_USE_VERTEXAI="true" \
/tmp/reality-lab-venv/bin/python scripts/generate-reality-lab-assets.py \
  --stories aitop \
  --kinds frames \
  --frames breakthrough \
  --force
```

### Add a new story

1. Confirm that the story points to meaningful, verifiable portfolio evidence.
2. Add prompts and reference rules to the generator before generating assets.
3. Add the cutout, frames, accessible alt text, accent, and proof destination to `STORIES`.
4. Keep the selector understandable with one centered subject; do not turn it into a card grid.
5. Test index wrapping, swipe thresholds, keyboard selection, preload behavior, and the final proof destination.
6. Update this document, `docs/reality-lab-design.md`, and the asset manifest.

### Update profile evidence

1. Edit `data/resume-data.json`, not the runtime copy inside `liquid-glass/src/data/`.
2. Preserve archived records and the integrity baseline unless an intentional migration is documented.
3. Run the normal build; synchronization happens automatically.
4. Confirm the relevant proof tab and record dialog display the new data correctly.

## Validation workflow

From the source application:

```bash
cd liquid-glass
npm ci
npm run lint
npm test
npm run build
npm audit --omit=dev
```

Required manual checks:

- Mouse drag, touch swipe, arrow keys, Enter, and Space all work in the selector.
- Frame 01 remains visible long enough before the first transition.
- Incoming copy never appears later than its image.
- Stage buttons land on the requested scene.
- Mobile images remain edge-to-edge without exposing a card frame.
- Proof tabs, record dialogs, external links, Escape-to-close, and focus return work.
- `prefers-reduced-motion` and `Save-Data` behavior remain functional.
- Liquid Glass, Terminal, macOS, Blueprint, and Arcade source are unchanged for a Reality-only task.

## Build and deployment

The GitHub Pages root contains generated output. Never hand-edit hashed files in `assets/`.

```bash
cp liquid-glass/dist/index.html index.html
rsync -a --delete liquid-glass/dist/assets/ assets/
rsync -a --delete liquid-glass/dist/fonts/ fonts/
cp liquid-glass/dist/Montserrat-SemiBold.ttf .
cp liquid-glass/dist/SpaceGrotesk-Bold.woff .
cp liquid-glass/dist/vite.svg .
```

Commit source, documentation, and generated output together when runtime code changes. Documentation-only changes do not require rebuilding the Vite output.

## Guardrails

- A Reality Lab request must not modify the Liquid Glass renderer, materials, scene, performance modes, or data presentation.
- Do not edit generated root assets without rebuilding from `liquid-glass/`.
- Do not commit Google Cloud project identifiers, access tokens, credentials, or private profile notes.
- `featured: false` controls default visibility; it is not a privacy boundary in a public repository.
- Keep AI-generated scenes generic where proprietary products or employer-specific processes could be implied.
- Preserve accessible names, keyboard interaction, focus behavior, and reduced-motion support.
- Prefer one strong visual idea per story over additional labels, cards, or decorative controls.

## Recommended next steps

Proceed in this order:

1. Perform visual QA on low-end Windows, iOS Safari, Android Chrome, and a large desktop display.
2. Tune only evidence-based issues in crop, timing, contrast, and copy synchronization.
3. Measure image decode cost and interaction latency before introducing another animation library.
4. Refine story copy when the canonical profile data changes.
5. Add another story only when it introduces a distinct transformation and points to substantial proof.

## Definition of done

A Reality Lab change is complete only when:

- The selected sketch, story sequence, copy, and proof destination describe the same subject.
- The first frame is readable and every later copy transition leads or matches the image.
- Desktop and mobile interactions remain usable without visible overflow or accidental navigation.
- The canonical profile data and hidden archive records remain intact.
- Image provenance and checksums are current when assets change.
- Lint, interaction tests, production build, and dependency audit pass.
- Only the intended Reality Lab source and generated output are included in the commit.

## Key files

- `liquid-glass/src/components/styles/RealityLabView.jsx`
- `liquid-glass/src/components/styles/RealityLabView.css`
- `liquid-glass/src/lib/realityLab.js`
- `liquid-glass/src/assets/reality-lab/manifest.json`
- `liquid-glass/scripts/generate-reality-lab-assets.py`
- `liquid-glass/scripts/requirements-reality-lab.txt`
- `liquid-glass/scripts/test-interactions.mjs`
- `data/resume-data.json`
- `docs/reality-lab-design.md`
