# OpenInventory web: design notes

- **Idea:** one ledger, five views. The page behaves like the product: numbers tick up, rows roll, one stage switches views as you scroll.
- **Motion verb:** roll like an odometer (button labels, counter) and wipe like a page turning (stage screenshots).
- **Signature:** sticky stage that wipes between the five real product screenshots, driven by the active chapter.
- **Palette:** ground #0a0a0b, surface #111113, ink #f3f2ee, muted #9a9a96, accent #2bd49a (the product's own value line).
- **Type:** Geist (display + body), Geist Mono (labels, code).
- **Idle state:** hero glow drifts, live dot pings, sparkline dot pulses. All off under reduced motion.
- **Assumptions:** production URL https://openinventory-web.vercel.app (change `site` in astro.config.mjs and src/data/site.config.ts). Screenshots come from the OpenInventory repo docs/ folder and show a sample account.

## Live product UI (replaces the screenshots in the feature rows)

- `src/mock` vendors OpenInventory's presentational components (from `origin/main` of the app repo) with sample data, run as React islands (`client:visible`).
- Re-vendor with `scripts/vendor-openinventory.sh ~/openinventory`; it applies the landing patches (heading levels, a11y fixes, SSR-safe images and dates).
- Tailwind runs without preflight, utilities-only, scanning `src/mock` only. The landing's CSS sits in `@layer site` so the app's utilities win inside `.oi-app`.
- All data is fixed sample data (`src/mock/data`). A "move" reassigns rows in the browser and is labelled as such; nothing is sent anywhere.
- Item thumbnails are 96px WebP copies of Steam CDN art (see `scripts/fetch-item-images.mjs`), served locally.
