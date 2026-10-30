import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'node:url';
import { appSource } from './plugins/app-source';
import { MODULE_OVERRIDES } from './plugins/app-source.config';

const fromHere = (path: string): string => fileURLToPath(new URL(path, import.meta.url));

export default defineConfig({
  site: 'https://openinventory.unsurf.sh',
  integrations: [react(), sitemap({ filter: (page) => !page.includes('/og-card') && !page.includes('/404') })],
  build: { inlineStylesheets: 'always' },
  image: { layout: 'constrained' },
  vite: {
    plugins: [appSource(), tailwindcss()],
    server: { allowedHosts: ['.ts.net'], fs: { allow: [fromHere('..')] } },
    resolve: {
      // React must stay one copy: the app's files and the site's islands share the site's.
      dedupe: ['react', 'react-dom'],
      alias: [
        // Exact module swaps first, then `~` is the real OpenInventory source at the repo root.
        ...Object.entries(MODULE_OVERRIDES).map(([find, to]) => ({ find, replacement: to.replace('@demo', fromHere('./src/mock')) })),
        { find: '@demo', replacement: fromHere('./src/mock') },
        { find: /^~\//, replacement: fromHere('../src') + '/' },
      ],
    },
  },
});
