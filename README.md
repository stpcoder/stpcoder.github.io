# stpcoder.github.io

Source and GitHub Pages output for [stpcoder.github.io](https://stpcoder.github.io/), Taeho Je's interactive portfolio.

## Portfolio views

- Liquid Glass: the default 3D glass-bubble interface
- Terminal: a Darwin-style virtual shell with stable prompt rows, pipelines, writable files, manuals, and an interactive `vi` editor
- macOS Desktop: independently focusable/movable/resizable app windows, Finder navigation and context menus, Dock minimize/restore, working Calculator and Notes, and persistent wallpaper settings
- Blueprint: a technical dossier for fast scanning
- Arcade: a full-stage game journey through Taeho's profile, with Snake, Minesweeper, and the original Signal Frontier shooter
- Reduced Graphics: an adaptive performance mode inside Liquid Glass

Every portfolio view reads the same normalized profile data. Arcade opens with a concise journey tutorial and section roadmap, then uses featured records as unlockable discoveries across all three games. Progress persists in browser storage, and each expandable result appears under the same Education, Experience, Projects, Awards, Scholarships, Media, and Activities chapters used by Liquid Glass. Post-game screens focus on the profile records found rather than secondary game metrics. Minesweeper keeps a fixed 10x10 board and places its emoji open/flag selector in the top game bar. Records marked `featured: false` stay in the archive and can be exposed by each view's full-data control.

## Architecture

```text
.
├── data/                       # Canonical detailed profile data and integrity baseline
├── docs/                       # Current architecture and profile-management policy
├── profiles/                   # Public cross-platform profile snapshots
├── liquid-glass/               # React + Vite source application
│   ├── scripts/                # Data synchronization and validation
│   └── src/                    # Views, shared adapter, and 3D scene
├── assets/                     # Generated GitHub Pages assets
└── index.html                  # Generated GitHub Pages entry point
```

The `main` branch root is the GitHub Pages deployment. Do not edit generated root assets as source code; make changes in `liquid-glass/`, build, then synchronize `liquid-glass/dist/` to the root.

## Local development

```bash
cd liquid-glass
npm ci
npm run dev
```

`predev` validates `data/resume-data.json` and copies it to the Vite runtime location before the server starts.

## Validation and build

```bash
cd liquid-glass
npm run lint
npm test
npm run build
npm audit --omit=dev
```

The prebuild integrity check prevents accidental deletion of entire profile sections or archived records below the recorded baseline.

## Deployment

```bash
cp liquid-glass/dist/index.html index.html
rsync -a --delete liquid-glass/dist/assets/ assets/
cp liquid-glass/dist/Montserrat-SemiBold.ttf .
cp liquid-glass/dist/SpaceGrotesk-Bold.woff .
```

Commit the source and generated output together, then push `main`.

## Profile data policy

- Edit `data/resume-data.json` as the detailed source of truth.
- Use `profiles/master-profile.json` for the compact public cross-platform record.
- Track GitHub, LinkedIn, and site-specific state under `profiles/platforms/`.
- Treat `featured: false` as a display flag, not a privacy boundary.
- Never commit credentials, private notes, or sensitive personal information to this public repository.

See `docs/project-status.md` and `docs/profile-management.md` for the full operating model and recovery points.
