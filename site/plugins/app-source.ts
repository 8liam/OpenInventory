import { fileURLToPath } from 'node:url';
import path from 'node:path';
import type { Plugin } from 'vite';
import { APP_PATCHES, APP_SRC_DIR, HEADING_SHIFT } from './app-source.config';

const SITE_ROOT = fileURLToPath(new URL('..', import.meta.url));
const APP_SRC = path.resolve(SITE_ROOT, APP_SRC_DIR);
const APP_COMPONENTS = path.join(APP_SRC, 'components') + path.sep;
const PATCHES = new Map(APP_PATCHES.map((patch) => [path.join(APP_SRC, patch.file), patch]));
const HEADING_OPEN = /<h([123])(\s|>)/g;
const HEADING_CLOSE = /<\/h([123])>/g;

function isAppFile(id: string): boolean {
  return id.startsWith(APP_SRC + path.sep);
}

/**
 * Lets the landing run the real OpenInventory UI straight from the repo root:
 *  - bare imports made by app files resolve against the site's own node_modules (the site is its
 *    own workspace and never installs the app's dependencies, so React stays a single copy);
 *  - the landing-only patches in `app-source.config.ts` are applied at transform time, and the
 *    build fails loudly if the app changed so much that a patch no longer matches.
 */
export function appSource(): Plugin {
  return {
    name: 'openinventory-app-source',
    enforce: 'pre',
    async resolveId(source, importer, options) {
      if (!importer || !isAppFile(importer.split('?')[0] ?? importer)) return null;
      if (source.startsWith('.') || source.startsWith('/') || source.startsWith('~') || source.startsWith('@demo')) return null;
      return this.resolve(source, path.join(SITE_ROOT, 'package.json'), { ...options, skipSelf: true });
    },
    transform(code, rawId) {
      const id = rawId.split('?')[0] ?? rawId;
      if (!isAppFile(id)) return null;
      let out = code;
      const patch = PATCHES.get(id);
      for (const { from, to } of patch?.replacements ?? []) {
        if (!out.includes(from)) {
          this.error(`app patch no longer matches ${patch?.file}: ${JSON.stringify(from.slice(0, 70))}. Update site/plugins/app-source.config.ts.`);
        }
        out = out.replaceAll(from, to);
      }
      if (id.startsWith(APP_COMPONENTS) && id.endsWith('.tsx')) {
        out = out
          .replace(HEADING_OPEN, (_, level: string, tail: string) => `<h${HEADING_SHIFT[level]}${tail}`)
          .replace(HEADING_CLOSE, (_, level: string) => `</h${HEADING_SHIFT[level]}>`);
      }
      return out === code ? null : { code: out, map: null };
    },
  };
}
