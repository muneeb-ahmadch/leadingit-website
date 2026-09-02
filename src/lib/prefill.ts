import type { Product } from '@/data/products';
import type { Brand } from '@/data/brands';

/**
 * WhatsApp prefill strings — the plain text a visitor's message opens with.
 *
 * These are **plain text only**. Encoding is owned by `whatsappHref()` in
 * `src/lib/site.ts`, which also owns the number; nothing here encodes anything
 * and nothing here knows the number (`docs/10-CONTENT-BRIEFS/_CONVENTIONS.md` §7).
 *
 * ## The rules every string below follows
 *
 * §7: one sentence, first person, naming the page's subject so the reply can
 * skip a round-trip. It has to read like something a human would actually send
 * — no emoji, no "I'm interested in your services". **Trade-intent pages lead
 * with part number + quantity; consumer-intent pages lead with room + city.**
 *
 * And the constraints that outrank tone: no lead time, no stock, no price,
 * anywhere (OQ #24 — Muneeb confirmed ~15 days internally with "dont quote that
 * exactly", so no duration is published and no rounded version of one either).
 * A prefill is the visitor's words, not ours, but it must never be phrased so
 * that the expected reply is a duration we have declined to publish.
 *
 * ## Why the 98 product pages are generated rather than hand-written
 *
 * The plan's own wording is "context-aware prefilled WhatsApp message per page,
 * generated from route metadata". 98 hand-typed strings is 98 chances for a
 * model name to drift from `products.ts` — and drift between a shipped string
 * and the record it describes is the single failure this project keeps
 * catching. A function reading the record cannot drift.
 */

/** The site's voice for an opening line. Every prefill starts here. */
const OPENING = 'Hi Leading IT';

/**
 * Product pages carry model-number long-tail intent (`docs/04` §6) — someone
 * searching `DIN-2MC2` is an integrator, not a homeowner — so they take the
 * TRADE lead: part number first, quantity second.
 *
 * The trailing `Quantity: ` is the whole trick. WhatsApp opens with the cursor
 * at the end of the prefilled text, so the first thing the sender types is the
 * number we most need in order to quote. That satisfies §7's "part number +
 * quantity" on all 98 pages with the part number pulled from the record rather
 * than retyped.
 *
 * `brandName` is passed in rather than looked up so this stays a pure function
 * and the caller keeps a single source for the brand record.
 */
export function productPrefill(product: Pick<Product, 'name'>, brandName: string): string {
  return `${OPENING} — I'd like a quotation for the ${brandName} ${product.name}. Quantity: `;
}

/**
 * Brand hubs sit above any single model, and their traffic splits between trade
 * and consumer, so they lead with the brand and the project rather than a part
 * number. City included per §7's place-name rule ("Dubai", never "the UAE").
 *
 * Hand-authored per brand rather than templated: the natural verb differs by
 * what the brand actually is, and "I'd like Crestron speakers" would be wrong
 * in a way a template cannot detect. Keyed by slug so a missing entry is a
 * build-visible `undefined` rather than a silently generic sentence.
 */
const BRAND_PREFILLS: Record<string, string> = {
  crestron: `${OPENING} — I'd like to specify Crestron control for a project in Dubai.`,
  blustream: `${OPENING} — I need Blustream video distribution for a project in Dubai.`,
  basalte: `${OPENING} — I'd like Basalte interfaces for a project in Dubai.`,
  'black-nova': `${OPENING} — I'd like Black Nova keypads for a project in Dubai.`,
  marantz: `${OPENING} — I'd like to build a Marantz system for a room in Dubai.`,
  denon: `${OPENING} — I'd like to build a Denon system for a room in Dubai.`,
  // "UandKSound" is the mixed-case entity form settled in OQ #15. Never "U&K Sound".
  uandksound: `${OPENING} — I'd like UandKSound speakers for a cinema room in Dubai.`,
  'polk-audio': `${OPENING} — I'd like Polk Audio speakers for a room in Dubai.`,
  jvc: `${OPENING} — I'd like a JVC projector for a cinema room in Dubai.`,
};

/**
 * Falls back to a correct-but-plainer sentence rather than throwing: a brand
 * added later should ship a slightly generic prefill, not break the build of
 * every page that brand appears on. The fallback still names the brand, so it
 * satisfies §7's "names the page's subject".
 */
export function brandPrefill(brand: Pick<Brand, 'slug' | 'name'>): string {
  return (
    BRAND_PREFILLS[brand.slug] ??
    `${OPENING} — I'd like ${brand.name} supplied for a project in Dubai.`
  );
}

/**
 * The site-level pages, hand-authored. Each leads the way its own traffic
 * arrives; the 404 deliberately leads with the failure rather than a pitch,
 * because a 404 that opens with a sales line reads as a bug, and the only
 * useful thing that page can do is offer a human.
 */
export const SITE_PREFILLS = {
  home: `${OPENING} — I'd like to talk about an automation project in Dubai.`,
  about: `${OPENING} — I'd like to talk to someone about working together.`,
  brands: `${OPENING} — I'd like to know which brands you can supply for my project.`,
  litHome: `${OPENING} — I'd like LIT Home control for a villa in Dubai.`,
  contact: `${OPENING} — I'd like to talk about a project.`,
  /** `/go/consultation/` — paid traffic, so it names the thing the ad promised. */
  consultation: `${OPENING} — I saw your ad and I'd like to book a private consultation.`,
  notFound: `${OPENING} — I was looking for something on your site and couldn't find it.`,
  /** Trade lead: the designer is the one page that can name its own output. */
  keypadDesigner: `${OPENING} — I've configured a Black Nova keypad and I'd like a quotation for it. Quantity: `,
} as const;
