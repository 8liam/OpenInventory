# OpenInventory web: design notes

- **Idea:** one ledger, five views. The page behaves like the product: numbers tick up, rows roll, one stage switches views as you scroll.
- **Motion verb:** roll like an odometer (button labels, counter) and wipe like a page turning (stage screenshots).
- **Signature:** sticky stage that wipes between the five real product screenshots, driven by the active chapter.
- **Palette:** ground #0a0a0b, surface #111113, ink #f3f2ee, muted #9a9a96, accent #2bd49a (the product's own value line).
- **Type:** Geist (display + body), Geist Mono (labels, code).
- **Idle state:** hero glow drifts, live dot pings, sparkline dot pulses. All off under reduced motion.
- **Assumptions:** production URL https://openinventory-web.vercel.app (change `site` in astro.config.mjs and src/data/site.config.ts). Screenshots come from the OpenInventory repo docs/ folder and show a sample account.
