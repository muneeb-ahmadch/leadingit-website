// Loads this project's TypeScript modules (path-aliased, untranspiled) into a
// plain Node script with no new dependency: `scripts/gen-sitemap.mjs` already
// established this pattern (a Vite dev server in middleware mode, used only
// for its module graph, never bound to a port or serving a request). Reused
// here so the SEO/vocabulary validators read the same single sources of truth
// (`src/seo/ranges.ts`, `src/seo/jsonld/localBusiness.ts`, `src/seo/meta.ts`,
// `src/seo/routes.ts`) instead of a second, hand-copied list that can drift.
import { createServer } from 'vite';

/**
 * @param {string} root repo root
 * @param {(loadModule: (path: string) => Promise<any>) => Promise<T>} fn
 * @returns {Promise<T>}
 * @template T
 */
export async function withViteSsr(root, fn) {
  const server = await createServer({
    root,
    server: { middlewareMode: true, hmr: false, watch: null },
    appType: 'custom',
    // Nothing here imports node_modules at the top level, so there is nothing
    // to pre-bundle; skipping discovery keeps this fast and side-effect-free.
    optimizeDeps: { noDiscovery: true, include: [] },
    logLevel: 'error',
  });
  try {
    return await fn((path) => server.ssrLoadModule(path));
  } finally {
    await server.close();
  }
}
