# OpenInventory site

The landing page at <https://openinventory.unsurf.sh>. Astro, with the **real app UI** running on sample data.

```sh
cd site
pnpm install
pnpm dev          # http://localhost:4321
pnpm typecheck
pnpm build
```

## How the demos work

Nothing from the app is copied. `~` points at the repo's `src/`, so the demos import the same components the app ships (`~/components/item-table/...`) and a UI change shows up on the site on the next build.

- `plugins/app-source.ts` makes that work: it resolves the app's bare imports against this package's `node_modules` (one copy of React), and applies the landing-only patches listed in `plugins/app-source.config.ts` at build time. If the app changes so that a patch no longer matches, the build fails and names the patch.
- `src/mock/data/` is the sample account, typed with the app's own types, so a breaking type change fails `pnpm typecheck`.
- `src/mock/data/storage-client.mock.ts` replaces the app's `storage.client` (it would call the local server) and `src/mock/stubs/` replaces the router.
- `src/mock/demo/` composes the app's components into the five views.

The site is its own pnpm workspace (`pnpm-workspace.yaml`) and does not install the app's dependencies. A new library imported by a component the demos use must also be added to `package.json` here, or the build says it cannot resolve it.

## Deploy

Vercel project settings: Root Directory `site`, and **Include source files outside of the Root Directory** on. `vercel.json` skips builds that touch neither `site/` nor the app's `src/`.
