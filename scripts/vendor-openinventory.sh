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
rm -rf "$TMP"
echo "vendored from origin/main"
