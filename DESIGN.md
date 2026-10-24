# OpenInventory web: design notes

Layout brief for this pass: **follow cap.so's layout language.** Cap is a developer tool
landing page and so is this one; the reference is its *structure and restraint*, not its skin.

## Concept Card

```
Idea:        One ledger, five lenses. The page is the product: a segmented control picks a
             lens, the framed app answers, and every number on the page is a real figure
             from the same sample account.
Metaphor:    A bank statement / inventory ledger. Ruled lines, tabular figures, hairline
             rules, everything reconciles to one total ($4,045.19).
Signature:   The hero segmented control (Dashboard / Items / Storage / Cases / Trade-up)
             swaps the framed live app below it with a page-turn wipe, the same five views
             the story walks through — so the control is a real product surface, not a gimmick.
Emotion:     "This is a real, precise tool that respects me." Cool, quiet, confident.
Motion verb: settle like a ledger line — figures roll up (odometer), panels wipe like a
             page turning, rows rise once and stop. Nothing bounces.
Screenshot:  The hero: giant headline, the five-way pill, and the live dashboard framed in
             a browser chrome with its $4,045.19 total and value chart.
```

## Cap layout vocabulary adopted here

1. Centered hero: eyebrow, big headline, one lede, two CTAs, then a **pill segmented control**
   switching the product view, with the framed product shot beneath.
2. A "How it works" band with **numbered steps** (Cap: 1-2-3 for each recording mode).
3. **Alternating feature rows**: copy on one side, a framed live product view on the other,
   flipping sides each row. (Already present; tightened to Cap's proportions.)
4. A **hairline feature grid** ("Why Cap" / "Small on purpose") — 6 or 4 cells, top-ruled.
5. A **terminal / CLI** section (`self-host`) — kept and promoted.
6. FAQ / trust row, then a **giant footer wordmark**. (Wordmark kept.)

## What this pass actually changes

- **Hero reworked to Cap's centered stack**: eyebrow → headline → lede → CTA row → segmented
  control → framed view. The old split hero (headline left, readout card right) becomes the
  centered Cap arrangement; the readout card's live total is folded into the framed view's
  chrome so the number still counts up.
- **New segmented control** wired to the five real demos with a page-turn wipe — one driver,
  idle-rotating until the visitor touches it, paused off screen and off under reduced motion.
- **New "How it works" 3-step band** (Sign in once → It reads and keeps history → Move, never
  sell) using Cap's numbered-step layout.
- Numbers grid stays (it *is* Cap's hairline grid). Move stays as a feature row. Self-host and
  footer stay.
- Palette is deliberately **not** Cap's near-white: a screen-recording SaaS wants a light
  showroom, but a self-hosted *inventory ledger* wants a dark statement surface where the
  emerald value line and tabular figures read like a terminal. That divergence is the
  genericness fix — the layout is Cap, the art direction is OpenInventory's own.

## System

- **Palette:** ground `#0a0a0b`, surface `#111113`, ink `#f3f2ee`, muted `#c0c0bb`,
  line `rgb(255 255 255 / .11)`, accent `#de9b35` (CS2 T-side gold),
  negative `#ff7a6b`. Curtain = accent.
- **Type:** Geist (display + body), Geist Mono (labels, code, meta). Fluid scale `--t-mega…--t-xs`.
- **Grid:** `--max 92rem`, gutter fluid, 4fr/8fr story split, 4-up numbers. Ruled ledger lines
  behind hero/numbers/footer.
- **Shape:** one radius, `--radius: 14px`; pills at `999px`.
- **Motion:** one GSAP ticker + Lenis; eases `--ease-out (--t-out)`. Figures roll like an
  odometer, panels wipe like a page turn, rows rise once. Idle: hero glow drifts, live-dot
  pings, sparkline pulses, segmented control auto-advances slowly until touched. All idle
  motion off under reduced motion; every view present and legible with JS off.
- **Assumptions:** production URL `https://openinventory-web.vercel.app` (change in
  `astro.config.mjs` + `src/data/site.config.ts`). The five demos run fixed sample data;
  "moving" items reassigns rows locally and never sends anything.

## QA log

- **Round 2 → 3 fixes** (all measured, see `.shots/prod` + `scripts/mad.mjs`,
  `scripts/contrast-review.mjs`, `scripts/nav404-test.mjs`):
  1. *Faint hovers* → DataTable sort headers fill on hover (mad 0.14/0.55 → 5.17/6.5);
     every hover target now reports a real DOM change.
  2. *No item art in Breakdown* → BreakdownPanel gains a "Top holdings" strip with real
     item thumbnails from the same sample account.
  3. *Static 404→home* → cross-document view transition upgraded from a 0.45s bare
     cross-fade (finished before the first capture frame at +300ms) to a 0.5s out / 0.7s
     in choreography (old page lifts + fades, new page settles, header morphs in place);
     d-90 frames now capture motion; off under reduced motion.
  4. *95 contrast incompletes* → 9. The glow pseudo-element and ledger-rule backgrounds
     became real positioned divs (`.hero__glow`, `.rules`) so axe computes true
     backgrounds; remaining 9 are structural (pseudo/gradient/image-node) with measured
     ratios 10.3–17.7:1 vs 4.5 needed.
  5. *404 URL audit* → missing path serves real HTTP 404 with unique description and
     og:image 200 (`scripts/nav404-test.mjs` + curl evidence).
  6. *Dead left column on self-host* → security cards span the full grid row at ≥960px.
