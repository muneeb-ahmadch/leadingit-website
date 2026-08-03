// Build-time font subsetting — perf-engineer, Phase 5 CWV remediation.
//
// @fontsource ships each weight pre-split by Unicode block (latin, latin-ext,
// cyrillic, cyrillic-ext, greek, greek-ext, vietnamese) via `unicode-range`, so
// a browser rendering English copy already fetches only the "latin" file per
// weight — the `cyrillic`/`greek`/`vietnamese` files it also ships are dead
// weight on disk, never requested over the network. But that "latin" file
// itself is NOT scoped to this site: it carries the full Latin-1 + General
// Punctuation range (~230 glyphs) Google Fonts ships for any Latin site, when
// the 124 pages this site actually renders (`dist/**/index.html`, script/
// style/svg stripped) use 111 distinct code points total.
//
// This script re-subsets the three Latin families actually loaded
// (`src/styles/globals.css`) to exactly that observed character set plus a
// small, explicit safety margin (documented below), and writes the result to
// `src/assets/fonts/`, committed like any other pipeline derivative — never
// regenerated at `npm run build` time, so a production build never depends on
// network access or the harfbuzz WASM binary. Re-run manually
// (`npm run fonts`) after a copy change introduces a character not already in
// TARGET_TEXT, and commit the regenerated files alongside it.
//
// Requires `devDependencies: subset-font` (harfbuzz/hb-subset via WASM, no
// native build step, dev-only — never reaches the browser bundle).
import subsetFont from 'subset-font';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

/**
 * The observed character set, derived 2026-08-02 by walking every prerendered
 * page in `dist/` (124 routes), stripping `<script>`/`<style>`/`<svg>`, and
 * collecting the distinct Unicode code points left in visible text. Method is
 * reproducible: see the walk in git history of this file's commit message, or
 * re-derive with a throwaway script against a fresh `npm run build`.
 *
 * Deliberately EXCLUDES the Arabic code points that scan also found (in
 * `LocaleSwitcher`'s disabled `ar`/`ur` buttons, which render in
 * `font-arabic`/`font-urdu`, never these three families) — including them
 * here would do nothing, since none of Cormorant Garamond / Inter / JetBrains
 * Mono ever carried Arabic glyphs, at any subset width.
 */
const OBSERVED =
  ' !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[]`abcdefghijklmnopqrstuvwxyz{|}~' +
  '©®°±µ·×éΩ–—’…™↔−';

/**
 * Safety margin: characters not observed in current copy but cheap to include
 * and plausible in near-future editorial text — mixed curly-quote pairs
 * (only the closing single quote ’ was observed; editorial copy commonly
 * needs the opening one too, and neither double curly quote was observed at
 * all, straight `"` being used instead) — plus U+00A0 (non-breaking space,
 * used defensively in some locales' number formatting) and → (found in
 * unrouted-but-real source, `src/features/litHome` UI copy, absent from the
 * 124 *routed* pages only because those components render conditionally).
 * Omitting this margin would not break the build — `font-display: swap`
 * means a missing glyph falls back to the next family in the CSS stack, not a
 * blank box — but it would silently change a rendered glyph's typeface the
 * next time such a character is typed, which is the one outcome subsetting
 * must not risk.
 */
const SAFETY_MARGIN = ' ‘“”→';

const TARGET_TEXT = OBSERVED + SAFETY_MARGIN;

const ROOT = resolve(import.meta.dirname, '..');
const OUT_DIR = resolve(ROOT, 'src/assets/fonts');

/** [package, family-file-stem, weights[]] — must match `src/styles/globals.css`'s imports exactly. */
const TARGETS = [
  ['cormorant-garamond', 'cormorant-garamond', [400, 500, 600]],
  ['inter', 'inter', [400, 500, 600]],
  ['jetbrains-mono', 'jetbrains-mono', [400]],
];

async function subsetOne(pkg, stem, weight) {
  const srcPath = resolve(
    ROOT,
    `node_modules/@fontsource/${pkg}/files/${stem}-latin-${weight}-normal.woff2`,
  );
  const srcBuffer = await readFile(srcPath);
  const [woff2, woff] = await Promise.all([
    subsetFont(srcBuffer, TARGET_TEXT, { targetFormat: 'woff2' }),
    subsetFont(srcBuffer, TARGET_TEXT, { targetFormat: 'woff' }),
  ]);
  const outStem = `${stem}-latin-${weight}-normal`;
  await writeFile(resolve(OUT_DIR, `${outStem}.woff2`), woff2);
  await writeFile(resolve(OUT_DIR, `${outStem}.woff`), woff);
  return { srcBuffer, woff2 };
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  let totalBefore = 0;
  let totalAfter = 0;
  for (const [pkg, stem, weights] of TARGETS) {
    for (const weight of weights) {
      const { srcBuffer, woff2 } = await subsetOne(pkg, stem, weight);
      totalBefore += srcBuffer.byteLength;
      totalAfter += woff2.byteLength;
      console.log(
        `${stem}-${weight}: ${srcBuffer.byteLength} B -> ${woff2.byteLength} B ` +
          `(woff2, -${(100 - (woff2.byteLength / srcBuffer.byteLength) * 100).toFixed(0)}%)`,
      );
    }
  }
  console.log(
    `\nTotal (woff2 only, latin subset baseline): ${totalBefore} B -> ${totalAfter} B ` +
      `(-${(100 - (totalAfter / totalBefore) * 100).toFixed(0)}%)`,
  );
}

main();
