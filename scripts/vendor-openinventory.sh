#!/usr/bin/env bash
# Vendors the presentational parts of OpenInventory (origin/main) into src/mock and applies the demo patches.
# Usage: scripts/vendor-openinventory.sh ~/openinventory
set -euo pipefail
SRC_REPO="${1:-$HOME/openinventory}"
TMP="$(mktemp -d)"
git -C "$SRC_REPO" archive origin/main | tar -x -C "$TMP"
OUT=src/mock
rm -rf "$OUT/components" "$OUT/utils" "$OUT/lib"
mkdir -p "$OUT/lib/storage"
cp -R "$TMP/src/components" "$OUT/components"
cp -R "$TMP/src/utils" "$OUT/utils"
cp -R "$TMP/src/lib/copy" "$TMP/src/lib/items" "$TMP/src/lib/cases" "$OUT/lib/"
cp "$TMP/src/lib/storage/storage.types.ts" "$TMP/src/lib/storage/storage.config.ts" "$OUT/lib/storage/"
# Parts that need the real server, router or auth gate are not part of the demo.
(cd "$OUT/components" && rm -rf app-shell app-shell-skeleton auth-gate sign-in-screen transfer-status sync-banner loading-region \
  cases-skeleton dashboard-skeleton tradeup-skeleton && rm -f */*.skeleton.tsx)
# Hydration safety: fixed timezone for every formatted date, and a server value for media queries.
sed -i '' 's/{ dateStyle: "medium" }/{ dateStyle: "medium", timeZone: "UTC" }/; s/^  minute: "2-digit",$/  minute: "2-digit",\n  timeZone: "UTC",/' "$OUT/utils/format.ts"
python3 - <<'PY'
import re, pathlib
p = pathlib.Path('src/mock/utils/use-media-query.ts'); s = p.read_text()
s = s.replace("    () => window.matchMedia(query).matches,\n  );", "    () => window.matchMedia(query).matches,\n    () => false,\n  );"); p.write_text(s)
p = pathlib.Path('src/mock/components/history-panel/history-panel.utils.ts'); s = p.read_text()
s = s.replace("new Date(new Date(now).getFullYear(), 0, 1).getTime()", "Date.UTC(new Date(now).getUTCFullYear(), 0, 1)"); p.write_text(s)
PY
python3 - <<'PY'
import pathlib
p = pathlib.Path('src/mock/components/data-table/data-table.component.tsx'); s = p.read_text()
s = s.replace("overscan: DATA_TABLE.overscan,", "overscan: DATA_TABLE.overscan,\n    initialRect: { width: 800, height: 480 },")
s = s.replace('<div ref={scrollRef} className="min-h-0 flex-1 overflow-auto" role="rowgroup">', '<div ref={scrollRef} data-lenis-prevent className="min-h-0 flex-1 overflow-auto" role="rowgroup">')
p.write_text(s)
p = pathlib.Path('src/mock/components/transfer-bar/transfer-bar.component.tsx'); s = p.read_text()
s = s.replace('from "~/lib/storage/storage.client"', 'from "~/data/transfer.mock"'); p.write_text(s)
p = pathlib.Path('src/mock/components/item-thumb/item-thumb.component.tsx'); s = p.read_text()
s = s.replace('import { useState } from "react";', 'import { useEffect, useRef, useState } from "react";')
s = s.replace('const [loadedUrl, setLoadedUrl] = useState<string>();', 'const [loadedUrl, setLoadedUrl] = useState<string>();\n  const imgRef = useRef<HTMLImageElement>(null);\n  // Server-rendered images finish before React attaches onLoad, so check once on mount.\n  useEffect(() => {\n    if (imgRef.current?.complete && imageUrl) setLoadedUrl(imageUrl);\n  }, [imageUrl]);')
s = s.replace('<img\n          src={imageUrl}', '<img\n          ref={imgRef}\n          src={imageUrl}')
p.write_text(s)
PY
python3 - <<'PY'
# Accessibility and landing-page fit. Each replace must match, so a drifting source fails loudly.
import pathlib, re
root = pathlib.Path('src/mock/components')

def edit(rel, pairs):
    f = root / rel
    text = f.read_text()
    for old, new in pairs:
        if old not in text:
            raise SystemExit(f'patch missed in {rel}: {old[:60]!r}')
        text = text.replace(old, new)
    f.write_text(text)

# The landing owns h1..h3; the embedded app starts at h4.
for f in root.rglob('*.tsx'):
    t = f.read_text()
    shift = {'1': '4', '2': '4', '3': '5'}
    t2 = re.sub(r'<h([123])(\s|>)', lambda m: f'<h{shift[m.group(1)]}{m.group(2)}', t)
    t2 = re.sub(r'</h([123])>', lambda m: f'</h{shift[m.group(1)]}>', t2)
    if t2 != t:
        f.write_text(t2)

# DataTable: plain div grid, so no table roles that need a full table tree; no aria-sort on buttons.
edit('data-table/data-table.component.tsx', [
    (' role="rowgroup"', ''),
    ('                  role="row"\n', ''),
    ('                  aria-selected={selection ? checked : undefined}\n', ''),
    ('                      role="cell"\n', ''),
    ('              aria-sort={active ? (sort.direction === "asc" ? "ascending" : "descending") : "none"}\n', '              title={column.sortValue ? `Sort by ${column.header}` : undefined}\n'),
])
edit('tradeup-inputs/tradeup-inputs.component.tsx', [
    ('title={`${item.name} \u00b7 ${copy.remove}`}', 'title={`${item.name} \u00b7 ${copy.remove}`}\n                  aria-label={`${item.name} \u00b7 ${copy.remove}`}'),
    ('<ul className={cn("flex flex-col overflow-y-auto"', '<ul data-lenis-prevent className={cn("flex flex-col overflow-y-auto"'),
])
# Contrast and hover feedback on already-active controls.
edit('kind-pills/kind-pills.component.tsx', [('tabular opacity-60', 'tabular opacity-100')])
edit('pill/pill.component.tsx', [('"border-foreground bg-foreground text-background"', '"border-foreground bg-foreground text-background hover:bg-foreground/85"')])
edit('breakdown-panel/breakdown-panel.component.tsx', [('"rounded px-2 py-1 text-xs text-muted-foreground transition-colors"', '"rounded px-2 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground"'), ('active === tab.key && "bg-card font-medium text-foreground shadow-sm"', 'active === tab.key && "bg-card font-medium text-foreground shadow-sm hover:bg-accent"')])
edit('unit-card/unit-card.component.tsx', [('className="absolute inset-0 rounded-lg"', 'className="absolute inset-0 rounded-lg transition-colors hover:bg-foreground/5"')])
PY
rm -rf "$TMP"
echo "vendored from origin/main"
