# Community data

Everything OpenInventory knows about rare patterns, Doppler phases and notable stickers/charms lives
here as plain JSON, so it can be corrected or extended without touching app code.

```
data/
  patterns/<weapon>/<finish>.json   seed tiers and/or phases for one weapon + finish
  attachments.json                  stickers and charms that make an item notable
  schema/                           JSON Schemas (editors use them for validation and hints)
  index.generated.ts                generated list of the files above — don't edit
```

## Add or fix a pattern

1. Create or edit `data/patterns/<weapon>/<finish>.json`. Lowercase, dashes, no accents:
   `data/patterns/karambit/fade.json`, `data/patterns/ak-47/case-hardened.json`.
2. Run `pnpm data:build` (only needed when you **add or remove** a file) and `pnpm test`.

```jsonc
{
  "$schema": "../../schema/pattern-file.schema.json",
  "weapon": "AK-47", // as in the catalog name "AK-47 | Case Hardened"
  "finish": "Case Hardened",
  "retrieved": "2026-11-07", // when you last checked the sources
  "sources": ["https://example.com/guide"], // where the numbers come from (required)
  "notes": ["How tiers were chosen, what was left out."],
  "groups": [
    {
      "label": "Blue gem", // a family of patterns with its own tier numbering
      "source": "https://example.com/guide/blue-gem",
      "tiers": [
        { "seeds": [661, 670, 955] }, // tiers[0] is T1, the most valuable
        { "seeds": [4, 13, 168] },
      ],
    },
  ],
}
```

- **Seeds** are paint seeds (0–1000). A seed may appear once per group; tiers go best to worst.
- A tier can carry its own `"label"` (for example `"Sapphire"`) to override the group's label.
- **Doppler phases** use `"phases": { "tierCount": 2, "entries": [{ "paintIndex": 416, "label": "Sapphire", "tier": 1 }] }`
  keyed by paint kit id. A group can also set `"paintIndexes": [...]` to apply only to those phases.
- A file may hold `groups`, `phases`, or both.

## Add a notable sticker or charm

Add an entry to `data/attachments.json`. `name` matches any attachment whose name contains it
(ignoring case); `kind` is `"sticker"` or `"charm"`.

## What checks run

`pnpm test` validates every file against the schema (unknown fields, bad seeds, duplicate seeds,
phases above `tierCount`, a file in the wrong folder) and fails if `index.generated.ts` is out of
date. The app validates the data again on startup and names the bad file in the error.

## Sourcing rules

Cite where numbers came from in `sources`, and update `retrieved` when you re-check. Only add data
with a published source or one you can show how to reproduce; mention anything you left out in
`notes`.
