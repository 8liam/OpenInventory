# OpenInventory site redesign: Cap-style sky system

Reference: https://cap.so (screenshot at /private/tmp/claude-501/ref/cap.png). Copy its **layout, restraint and mood**, never its assets/copy.

## Look
- **Light only.** Near-white ground `--c-bg`, white cards `--c-surface`, hairline borders `--c-line`, soft blue-tinted shadows (`--shadow-card`, `--shadow-float`). The old dark/gold look is gone; do not reintroduce `prefers-color-scheme` branches or gold.
- **Sky.** Hero and the closing CTA are big rounded panels (`--radius-lg`, inset from the viewport edge by `--gutter` like Cap) filled with a soft blue sky and painterly, drifting clouds. Stops: `--sky-top/mid/low`.
- **Type.** Geist (already self-hosted: `--f-body`), Geist Mono for labels/code. Tight negative tracking on headlines (-0.03em+), weight 500-600, generous line height on body. Big calm headlines. One accent word per headline may be set in `--c-accent-lo` or a sky gradient clip, no italics hacks.
- **Buttons.** Pills (`--radius-pill`): primary = dark `--c-dark` fill; secondary = white with hairline border; tertiary = accent-soft with blue border (the "Download for macOS" style). 44px+ tall touch targets.
- **Product frame.** The real app (`.oi-app`, dark, via `lens-gallery.tsx`) sits inside a device/browser frame floating over the sky with `--shadow-float`.
- **Motion.** GSAP + Lenis already wired in `src/scripts/main.ts`. Calm: reveal-up once, slow cloud drift, subtle hover lifts. Everything off under `prefers-reduced-motion`; page must be fully legible with JS off.
- **Responsive.** Design mobile-first, verify at 390, 768, 1440. No horizontal scroll.

## Tokens (src/styles/tokens.css, already written, read it)
Use only these tokens, no raw hex in section CSS except inside gradients/illustrations. No magic strings/numbers in logic: copy lives in `src/data/site.config.ts` (+ `site.types.ts`), constants in `*.config.ts`, types in `*.types.ts`, per the repo's component-folder convention (`x.astro` + `x.config.ts` + `x.types.ts`).

## File ownership (HARD RULE: parallel agents share one checkout)
Edit ONLY the files you own. Never run `git add/commit/stash/checkout`, never reformat other files, never run prettier over the repo. If you need a change in a file you do not own, put it in your final report instead.

| Owner | Files |
|---|---|
| foundation | `src/styles/base.css`, `src/styles/tokens.css`, `src/layouts/Base.astro`, `src/scripts/main.ts`, `src/pages/404.astro`, `src/pages/og-card.astro`, `public/*` meta assets |
| header | `src/components/site-header/*`, `src/components/github-link/*`, `src/styles/sections/header.css` |
| hero-copy | `src/components/hero/*`, `src/styles/sections/hero.css` |
| cloud-field | `src/components/cloud-field/*`, `src/styles/sections/cloud-field.css` |
| device | `src/components/lens/*`, `src/styles/sections/device.css`, `src/mock/**` styling only |
| how | `src/components/how/*`, `src/styles/sections/how.css` |
| features | `src/components/features/*`, `src/styles/sections/features.css` |
| bento | `src/components/bento/*`, `src/styles/sections/bento.css` |
| selfhost | new `src/components/selfhost/*`, `src/styles/sections/selfhost.css` (only wired in by the integrator) |
| faq | `src/components/faq/*`, `src/styles/sections/faq.css` |
| cta | `src/components/cta/*`, `src/styles/sections/cta.css` |
| footer | `src/components/site-footer/*`, `src/styles/sections/footer.css` |
| copy | `src/data/site.config.ts`, `src/data/site.types.ts` (copy edits only; add keys, keep existing keys working) |

Old dark-theme CSS is in `.legacy/` for reference (vendored-app frame rules, lens gallery, download button logic hooks like `data-dl`, `data-reveal`, `[data-stars]` selectors that `main.ts` binds to). Preserve those data-attributes/hooks. Section CSS is wrapped in `@layer site`; class names are BEM, prefixed by section.

## Verify
`cd site && pnpm typecheck && pnpm build` must pass. Do not start dev servers; the parent hosts it. Report: what you changed, anything you need from another owner, anything unverified.

---
# REVISION 2 (supersedes "Look" above): DARK, matching the app
- **Dark only.** Ground `--c-bg` #0a0a0a, cards `--c-surface`, 8% white hairlines. The framed app is no longer an island: it should feel native to the page.
- **One accent: the logo's lime `#a0ff69` (`--c-accent`).** Gold/blue are gone. Primary buttons = lime fill with `--c-accent-ink` text; secondary = hairline outline; use lime for highlights, check marks, the accent headline word, focus rings. The real logo is `public/logo.svg` (a lime pill/crate glyph); never invent a new mark: use the exact path from that file (inline it with `fill="currentColor"`/accent) in the header and footer.
- **No clouds.** The hero/CTA backdrop is a "glow field": near-black panel (`--radius-lg`), a lime aurora/horizon glow rising from the bottom, a faint perspective dot/ledger grid fading to the top, drifting soft light, and (hero only) a few floating CS2 skin thumbnails from `public/demo/*.webp` on slow parallax. Component: `src/components/cloud-field/` is kept as the path but the content is replaced (it may be renamed to glow-field if you update imports in hero/cta, which the owners of those do).
- Ignore any remaining mention above of sky blue, white cards, soft blue shadows, light-only. Use tokens; nothing hard-coded white/black.
