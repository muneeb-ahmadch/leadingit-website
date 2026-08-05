// Removes build-only artefacts that Vite/vite-react-ssg leave inside dist/ after a
// production build but that a static host must never serve.
//
// dist/.vite/manifest.json and dist/.vite/ssr-manifest.json are Vite's asset/SSR
// manifests. vite-react-ssg reads both from disk *during* the build — to resolve
// preload links per rendered page — before it calls the `onFinished` hook and before
// this script ever runs (verified against node_modules/vite-react-ssg's build source:
// both files are read in the page-render step, which completes, and only afterwards is
// `onFinished`/the "Build finished" log emitted). Nothing reads them from the deployed
// tree at runtime. ssr-manifest.json also embeds the build machine's absolute
// filesystem path (every module id it lists is an absolute path), so leaving it in
// dist/ would publish the developer's local directory layout at a guessable URL.
//
// Do NOT remove dist/static-loader-data*/ — those ARE fetched by client-side JS on
// every route navigation (vite-react-ssg's per-route loader, keyed by
// window.__VITE_REACT_SSG_HASH__) and are required at runtime.
import { rm } from 'node:fs/promises';
import { resolve } from 'node:path';

// dist/.image-pipeline-cache.json is defence in depth, not the fix: the cache was
// moved out of public/ on 2026-08-06 so it is no longer copied here at all. This
// entry catches a stale copy left in public/ by an older checkout, so it can never
// silently ride along into a deploy again.
//
// NOTE what is deliberately NOT here: dist/static-loader-data-manifest-*.json is
// fetched client-side at runtime and must ship. Do not add it.
const targets = ['dist/.vite', 'dist/.image-pipeline-cache.json'];

for (const target of targets) {
  const abs = resolve(process.cwd(), target);
  // force: true makes rm a no-op (not an error) when the path is already absent, so
  // this is safe to run even if a future Vite version stops emitting the directory.
  await rm(abs, { recursive: true, force: true });
}
