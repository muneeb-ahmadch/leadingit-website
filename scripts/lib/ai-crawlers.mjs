// The single source of truth for which AI/answer-engine crawlers this site
// explicitly allows in robots.txt (user-ratified: being cited by an answer
// engine is a first-class channel — CLAUDE.md's SEO mandate). Extracted out
// of scripts/gen-sitemap.mjs so scripts/validate-seo.mjs can assert the
// generated dist/robots.txt actually grants every one of these a real
// "Allow: /" group, instead of re-typing a second, driftable copy of the
// list — the same "no second hand-copied list" rule this codebase applies to
// its TypeScript sources of truth (docs/11-SEO-VALIDATION.md).
//
// A plain data module only: importing it must never run the sitemap
// generator's side effects (starting a Vite server, writing files, calling
// process.exit).
export const AI_CRAWLERS = [
  'GPTBot',
  'ClaudeBot',
  'Claude-User',
  'PerplexityBot',
  'Google-Extended',
  'Bingbot',
  'Amazonbot',
  'Applebot-Extended',
];
