/** Every patch the landing applies to the real app source at build time, so nothing is vendored. */
import type { AppPatch } from './app-source.types';

/** Matches the app's `<h1>`..`<h3>`; the landing owns those levels, the embedded app starts at h4. */
export const HEADING_SHIFT: Readonly<Record<string, string>> = { '1': '4', '2': '4', '3': '5' };

/** Modules the demo replaces outright: the app talks to its local server, and the demo has no router. */
export const MODULE_OVERRIDES = {
  '~/lib/storage/storage.client': '@demo/data/storage-client.mock',
  // The demo has no router; the app's links render as inert anchors.
  '@tanstack/react-router': '@demo/stubs/react-router',
} as const;

/** Prefix that marks an import as belonging to the app (see `~` in vite config). */
export const APP_SRC_DIR = '../src';

export const APP_PATCHES: readonly AppPatch[] = [
  {
    // Hydration safety: format every date in UTC so server and browser print the same text.
    file: 'utils/format.ts',
    replacements: [
      { from: '{ dateStyle: "medium" }', to: '{ dateStyle: "medium", timeZone: "UTC" }' },
      { from: '  minute: "2-digit",\n', to: '  minute: "2-digit",\n  timeZone: "UTC",\n' },
    ],
  },
  {
    // The server has no window, so media queries render their "no match" branch first.
    file: 'utils/use-media-query.ts',
    replacements: [
      {
        from: '    () => window.matchMedia(query).matches,\n  );',
        to: '    () => window.matchMedia(query).matches,\n    () => false,\n  );',
      },
    ],
  },
  {
    file: 'components/history-panel/history-panel.utils.ts',
    replacements: [
      {
        from: 'new Date(new Date(now).getFullYear(), 0, 1).getTime()',
        to: 'Date.UTC(new Date(now).getUTCFullYear(), 0, 1)',
      },
    ],
  },
  {
    // Virtualised rows need a size before layout, so the server render already has rows.
    // Plain div grid: the table ARIA roles need a full table tree and `aria-sort` is invalid on buttons.
    file: 'components/data-table/data-table.component.tsx',
    replacements: [
      { from: 'overscan: DATA_TABLE.overscan,', to: 'overscan: DATA_TABLE.overscan,\n    initialRect: { width: 800, height: 480 },' },
      { from: ' role="rowgroup"', to: '' },
      { from: '                  role="row"\n', to: '' },
      { from: '                  aria-selected={selection ? checked : undefined}\n', to: '' },
      { from: '                      role="cell"\n', to: '' },
      {
        from: '              aria-sort={active ? (sort.direction === "asc" ? "ascending" : "descending") : "none"}\n',
        to: '              title={column.sortValue ? `Sort by ${column.header}` : undefined}\n',
      },
    ],
  },
  {
    // Server-rendered images finish before React attaches onLoad, so check once on mount.
    file: 'components/item-thumb/item-thumb.component.tsx',
    replacements: [
      { from: 'import { useState } from "react";', to: 'import { useEffect, useRef, useState } from "react";' },
      {
        from: 'const [loadedUrl, setLoadedUrl] = useState<string>();',
        to: 'const [loadedUrl, setLoadedUrl] = useState<string>();\n  const imgRef = useRef<HTMLImageElement>(null);\n  useEffect(() => {\n    if (imgRef.current?.complete && imageUrl) setLoadedUrl(imageUrl);\n  }, [imageUrl]);',
      },
      { from: '<img\n          src={imageUrl}', to: '<img\n          ref={imgRef}\n          src={imageUrl}' },
    ],
  },
  {
    file: 'components/tradeup-inputs/tradeup-inputs.component.tsx',
    replacements: [
      {
        from: 'title={`${item.name} · ${copy.remove}`}',
        to: 'title={`${item.name} · ${copy.remove}`}\n                  aria-label={`${item.name} · ${copy.remove}`}',
      },
    ],
  },
  // Contrast and hover feedback on already-active controls.
  {
    file: 'components/kind-pills/kind-pills.component.tsx',
    replacements: [{ from: 'tabular opacity-60', to: 'tabular opacity-100' }],
  },
  {
    file: 'components/pill/pill.component.tsx',
    replacements: [
      { from: '"border-foreground bg-foreground text-background"', to: '"border-foreground bg-foreground text-background hover:bg-foreground/85"' },
    ],
  },
  {
    file: 'components/breakdown-panel/breakdown-panel.component.tsx',
    replacements: [
      { from: '"rounded px-2 py-1 text-xs text-muted-foreground transition-colors"', to: '"rounded px-2 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground"' },
      { from: 'active === tab.key && "bg-card font-medium text-foreground shadow-sm"', to: 'active === tab.key && "bg-card font-medium text-foreground shadow-sm hover:bg-accent"' },
    ],
  },
  {
    file: 'components/unit-card/unit-card.component.tsx',
    replacements: [{ from: 'className="absolute inset-0 rounded-lg"', to: 'className="absolute inset-0 rounded-lg transition-colors hover:bg-foreground/5"' }],
  },
];
