# Interactive Portfolio Source

This directory contains the React and Vite source application for `stpcoder.github.io`. The repository root contains the generated GitHub Pages output; application changes begin here.

## Current views

- Liquid Glass: adaptive Three.js glass-bubble portfolio
- Terminal: interactive Darwin-style virtual shell
- macOS Desktop: functional desktop and application simulation
- Reality Lab: four cinematic, evidence-backed visual stories
- Blueprint: technical profile dossier
- Arcade: profile discovery through Snake, Minesweeper, and Signal Frontier

Every view reads the same normalized profile data. Do not create a view-specific copy of factual resume records.

## Local development

```bash
npm ci
npm run dev
```

The `predev` hook validates and synchronizes the canonical root dataset before Vite starts.

Direct view examples:

```text
http://localhost:5173/?style=reality-lab
http://localhost:5173/?style=terminal
http://localhost:5173/?style=macos
```

## Validation

Run the complete local gate before committing runtime changes:

```bash
npm run lint
npm test
npm run build
npm audit --omit=dev
```

The build fails when required profile sections or archived records fall below the integrity baseline.

## Source layout

```text
src/
├── assets/                 # Runtime images, HDR data, and generated visual assets
├── components/
│   ├── games/              # Arcade implementations
│   ├── styles/             # Top-level portfolio views
│   └── terminal/           # Interactive terminal subcomponents
├── contexts/               # Style and performance-mode state
├── data/                   # Synchronized runtime profile copy
└── lib/                    # Pure engines, adapters, timing, and parsing helpers
scripts/
├── sync-resume-data.mjs
├── test-interactions.mjs
└── generate-reality-lab-assets.py
```

## Profile data

- Canonical detailed source: `../data/resume-data.json`
- Integrity baseline: `../data/resume-data-integrity.json`
- Generated runtime copy: `src/data/resume-data.json`
- Shared adapter: `src/lib/profileData.js`

Edit the canonical source only. `featured: false` controls default presentation but does not make a record private in this public repository.

## Reality Lab

Reality Lab is lazy-loaded at `?style=reality-lab`. Its component owns the story definitions and interactions, its pure helper owns deterministic scroll timing, and its asset manifest owns image-generation provenance.

- Project introduction and maintenance: `../docs/reality-lab-project.md`
- Design research and asset provenance: `../docs/reality-lab-design.md`
- Main component: `src/components/styles/RealityLabView.jsx`
- Timing helper: `src/lib/realityLab.js`
- Asset manifest: `src/assets/reality-lab/manifest.json`

Reality-only work must not alter the Liquid Glass renderer or its performance modes.

## Build and publish

```bash
npm run build
cd ..
cp liquid-glass/dist/index.html index.html
rsync -a --delete liquid-glass/dist/assets/ assets/
rsync -a --delete liquid-glass/dist/fonts/ fonts/
cp liquid-glass/dist/Montserrat-SemiBold.ttf .
cp liquid-glass/dist/SpaceGrotesk-Bold.woff .
cp liquid-glass/dist/vite.svg .
```

Commit source and generated output together for runtime changes. Documentation-only changes do not require a rebuild.

## Safety rules

- Never hand-edit hashed files in the root `assets/` directory.
- Never delete or reduce profile sections without an intentional data migration.
- Never commit credentials, tokens, cloud project identifiers, or private notes.
- Preserve keyboard, focus, reduced-motion, and mobile behavior while changing presentation.
- Keep each style isolated unless a shared data or infrastructure change is explicitly required.
