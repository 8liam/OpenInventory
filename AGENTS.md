# Repository rules

## Before you push

The landing site in `site/` imports the real app UI and types from `src/` and `server/`
(see `.github/workflows/site.yml`). A change to a shared type, a prop, or a copy key can break
the site even when the app is green, so run both sets of checks before pushing:

```sh
# app
vp check && pnpm test && pnpm build

# site (separate lockfile, install first in a fresh worktree)
cd site && pnpm install --frozen-lockfile && pnpm typecheck && pnpm build
```

- Adding a required field to a type from `src/lib/**/*.types.ts` (for example `Dashboard`,
  `ItemView`): grep `site/src/mock/` for the type and update every mock that builds it.
- Don't skip `pnpm typecheck` in `site/` because the change looks app-only. That is exactly
  how the site CI fails.
