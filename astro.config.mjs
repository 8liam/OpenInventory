// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'node:url';

// Assumption: deployed on Vercel under this name. Change `site` if the production URL differs.
export default defineConfig({
  site: 'https://openinventory-web.vercel.app',
  integrations: [react(), sitemap({ filter: (page) => !page.includes('/og-card') && !page.includes('/404') })],
  build: { inlineStylesheets: 'always' },
  image: { layout: 'constrained' },
  vite: {
    plugins: [tailwindcss()],
    // `~` is the vendored OpenInventory UI, so its imports stay identical to the source repo.
    resolve: { alias: { '~': fileURLToPath(new URL('./src/mock', import.meta.url)) } },
  },
});
