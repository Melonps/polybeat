# AGENTS.md

## Git hooks (lefthook)

This repo uses [lefthook](https://lefthook.dev/) to enforce checks before commits and pushes.
Hooks are installed automatically via the `prepare` script (`pnpm install` runs `lefthook install`).

- **pre-commit**: runs `biome check --write` on staged JS/TS/JSON/CSS files. Formatting/lint
  fixes are applied and re-staged automatically.
- **pre-push**: runs `pnpm run typecheck` (`tsc --noEmit`) and `pnpm run build` (`tsc -b && vite build`).
  This catches TypeScript build errors — including files that were never `git add`ed — *before*
  they reach CI/Vercel.

Config lives in `lefthook.yml` at the repo root. If a hook fails, fix the reported error and
re-commit/re-push; do not bypass with `--no-verify` except in a genuine emergency, and explain why
if you do.

### Why this exists
A previous push succeeded locally (`pnpm typecheck` passed) but failed on Vercel because a new
file (`song-yaml-dialog.tsx`) had never been `git add`ed, so `tsc -b` in the deploy build saw a
missing module. Running the full `pnpm run build` in `pre-push` (not just `typecheck`) catches this
class of "works on my machine, untracked file" bug because it operates on the actual git-tracked
tree the same way CI does.

## Workflow expectations for coding agents

- Before committing: rely on the pre-commit hook (biome), but you may also run
  `pnpm exec biome check --write .` manually first.
- Before pushing: rely on the pre-push hook, but proactively run `pnpm run typecheck` and
  `pnpm run build` yourself first so failures are caught early, and always double check
  `git status` shows no relevant untracked files before pushing.
