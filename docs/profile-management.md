# Profile Data Management

Last updated: 2026-03-23

## Goal

This repo should manage two different things clearly:

1. Public profile data and platform-facing content
2. Deployment code for `stpcoder.github.io`

The earlier confusion happened because those concerns were mixed together and the cross-platform profile files were not preserved in git.

## Public vs private rule

This repository is public-facing.
Do not store private-only notes, secrets, or sensitive personal records here.

Use this repo for:

- public profile facts
- public links
- public awards
- public media
- public platform text
- platform sync status

Do not use this repo for:

- secret notes
- internal career notes
- non-public contact info
- credentials or tokens
- anything you would not want committed publicly

## Recommended file structure

```text
profiles/
├── README.md
├── master-profile.json
└── platforms/
    ├── github-bio.json
    ├── github-readme.json
    ├── linkedin.json
    ├── site.json
    └── sync-status.json
```

## File responsibilities

### `profiles/master-profile.json`

Use this as the public cross-platform master record.
It should contain:

- identity
- current role
- public links
- headline options
- selected highlights
- awards / scholarships / media highlights
- verification metadata

This file is not a full replacement for `data/resume-data.json`.
It is the compact cross-platform profile source.

### `profiles/platforms/site.json`

Tracks:

- how the website currently works
- what the website actually exposes
- which fields are still hardcoded
- which source files drive visible content

### `profiles/platforms/github-bio.json`

Tracks the manual GitHub profile settings page values.
This repo does not automatically apply those values.

### `profiles/platforms/github-readme.json`

Tracks the external `stpcoder/stpcoder` profile README content.
This repo does not own that README directly, but it should record the current and target state.

### `profiles/platforms/linkedin.json`

Tracks the LinkedIn current snapshot, target text, and manual update gaps.
LinkedIn remains a manual update surface.

### `profiles/platforms/sync-status.json`

Tracks whether:

- the website data is synced
- GitHub bio is synced
- GitHub README is synced
- LinkedIn is synced
- any manual follow-up is still needed

## Update workflow

When profile information changes:

1. Update `profiles/master-profile.json`
2. Update platform target files under `profiles/platforms/`
3. Sync website data into `data/resume-data.json`
4. Sync runtime website data into `liquid-glass/src/data/resume-data.json`
5. Build the site
6. Copy `liquid-glass/dist` output into root deploy files
7. Update external platforms manually where needed
8. Update `profiles/platforms/sync-status.json`

## Current repo-specific reality

Right now the site still uses duplicated JSON data:

- `data/resume-data.json`
- `liquid-glass/src/data/resume-data.json`

That duplication is the first thing to eliminate if you want stable profile management.

## Recommended next technical step

Add a small sync script, for example:

- `scripts/sync-resume-data.js`

Its job should be:

- read `data/resume-data.json`
- write `liquid-glass/src/data/resume-data.json`
- optionally validate required top-level fields

Until that exists, treat `data/resume-data.json` as canonical and manually copy it when changed.
