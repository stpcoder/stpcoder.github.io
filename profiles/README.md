# Profiles Directory

This directory records how public profile data should be managed across:

- `stpcoder.github.io`
- GitHub profile settings (`github.com/stpcoder`)
- GitHub profile README (`stpcoder/stpcoder`)
- LinkedIn (`linkedin.com/in/taehoje`)

## Important rule

This repo is public.
Only store public-facing profile data here.

If you want a full private career log or sensitive notes, keep that in a private repository or a local non-public directory outside this repo.

## Files

- `master-profile.json`: public cross-platform master profile snapshot
- `platforms/site.json`: current website structure and data exposure
- `platforms/github-bio.json`: GitHub settings-page bio snapshot and target
- `platforms/github-readme.json`: GitHub profile README snapshot and target
- `platforms/linkedin.json`: LinkedIn current snapshot and target
- `platforms/sync-status.json`: overall sync status

## Current state

These files were recreated on 2026-03-23 because the earlier untracked profile-management files were no longer present in the restored repo state.
