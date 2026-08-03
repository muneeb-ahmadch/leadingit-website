/**
 * The two font files every page needs for its very first paint: Cormorant
 * Garamond 400 (every `h1`/`h2` — `font-serif`, no weight utility applied,
 * so 400 is what actually renders, `tailwind.config.ts` `fontFamily.serif`)
 * and Inter 400 (`body`'s `font-sans`, so every paragraph, nav link and
 * breadcrumb not otherwise weighted).
 *
 * `Seo.tsx` preloads exactly these two, sitewide, as `<link rel="preload"
 * as="font">`. Not more: Inter 500 (the `.eyebrow` label) and JetBrains Mono
 * 400 do render above the fold on some templates too, but they cover far
 * less text — over-preloading competes with the two fonts and the LCP image
 * for the same early bandwidth, which can cost more than it saves
 * (`docs/12-PROVENANCE/phase5-cwv-fixes.md` "fix 1" has the measurement).
 *
 * Import path: `?url` forces Vite to always resolve these two-argument
 * imports to the built, hashed asset URL — never inlined as a data URI —
 * which is exactly what `src/styles/fonts-latin.css`'s `url(...)` also
 * resolves to (both references are under Vite's default 4 KB inline
 * threshold headroom: these files are 13–14 KB, `assetsInlineLimit` would
 * only apply below 4 KB, so this is belt-and-braces, not a fix for a real
 * risk today). Because both the CSS `@font-face` and this import point at the
 * same source file, Vite content-hashes them to the *same* output file, so
 * the preloaded URL and the URL the browser actually requests when it parses
 * `@font-face` are guaranteed to match byte-for-byte — verified in
 * `docs/12-PROVENANCE/phase5-cwv-fixes.md`.
 */
import cormorantGaramond400 from '@/assets/fonts/cormorant-garamond-latin-400-normal.woff2?url';
import inter400 from '@/assets/fonts/inter-latin-400-normal.woff2?url';

export type FontPreload = { href: string; type: 'font/woff2' };

export const CRITICAL_FONT_PRELOADS: readonly FontPreload[] = [
  { href: cormorantGaramond400, type: 'font/woff2' },
  { href: inter400, type: 'font/woff2' },
];
