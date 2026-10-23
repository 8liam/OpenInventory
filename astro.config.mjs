// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Assumption: deployed on Vercel under this name. Change `site` if the production URL differs.
export default defineConfig({
  site: 'https://openinventory-web.vercel.app',
  integrations: [sitemap()],
  build: { inlineStylesheets: 'always' },
  image: { layout: 'constrained' },
});
