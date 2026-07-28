// Google Search Central's documented required/recommended structured-data
// properties for the six @types this site emits (Product, BreadcrumbList,
// Organization, WebSite, ItemList, WebApplication) — transcribed by hand from
// the live docs on 2026-07-28. There is no public API for these tables, so
// they are not auto-fetched; re-check the URLs below if Google's guidance
// changes and this file drifts.
//
// ## The one deliberate deviation from "assert everything Google recommends"
//
// Google's Product snippet and Software App specs each require *at least one*
// of a pricing/review group (Product: offers|review|aggregateRating;
// WebApplication: offers.price, plus separately aggregateRating|review) for
// the type to earn its rich result at all. This project's locked rule
// (CLAUDE.md, src/seo/jsonld/product.ts, src/seo/jsonld/webApplication.ts) is
// the opposite: never emit a price, availability or rating without a real,
// user-approved source — an absent property is safe, a fabricated one is a
// liability. Those two rules cannot both be satisfied at once, and fabricating
// data to close the gap is exactly what this project exists to refuse.
//
// So: those specific items are modelled as `requiredAcknowledgedGaps` /
// `recommendedAcknowledgedGaps` — printed loudly, every run, under their own
// non-blocking report section — rather than silently asserted away *or*
// treated as a build-breaking warning that could only ever be "fixed" by
// inventing a price or a review. docs/11-SEO-VALIDATION.md spells this out.
export const GOOGLE_SPECS = [
  {
    type: 'Organization',
    docUrl: 'https://developers.google.com/search/docs/appearance/structured-data/organization',
    // Only the sitewide identity node — Product.manufacturer's inline
    // `{ "@type": "Organization", "name": ... }` stub (src/seo/jsonld/product.ts)
    // is a distinct, deliberately minimal value, not a claim to have filled
    // out Organization's own recommended fields.
    matchNode: (node, ref) => node['@id'] === ref.ORG_ID,
    requiredChecked: [],
    requiredAcknowledgedGaps: [],
    // Google: "There are no required properties; instead, we recommend adding
    // as many properties that are relevant to your organization."
    recommendedChecked: ['name', 'url', 'description', 'contactPoint'],
    recommendedAcknowledgedGaps: [
      {
        prop: 'logo',
        reason:
          'no real Leading IT logo asset exists in the repo yet (src/seo/jsonld/organization.ts) — the 1200×630 og:image is a social-share image, not a logo, and asserting it as one would mischaracterise it.',
      },
      { prop: 'sameAs', reason: 'no confirmed social profile URLs (docs/OPEN-QUESTIONS.md #8).' },
      {
        prop: 'address',
        reason:
          'NAP not confirmed yet (docs/OPEN-QUESTIONS.md #1) — gated behind NAP_CONFIRMED in src/seo/jsonld/localBusiness.ts; Dubai-only, never fabricated.',
      },
      { prop: 'foundingDate', reason: 'unverified (docs/OPEN-QUESTIONS.md #8).' },
    ],
  },
  {
    type: 'BreadcrumbList',
    docUrl: 'https://developers.google.com/search/docs/appearance/structured-data/breadcrumb',
    matchNode: () => true,
    requiredChecked: ['itemListElement'],
    requiredAcknowledgedGaps: [],
    recommendedChecked: [],
    recommendedAcknowledgedGaps: [],
  },
  {
    type: 'Product',
    docUrl: 'https://developers.google.com/search/docs/appearance/structured-data/product-snippet',
    matchNode: () => true, // range pages never carry a Product node — checked separately
    requiredChecked: ['name'],
    requiredAcknowledgedGaps: [
      {
        description: 'one of offers, review or aggregateRating (Google: "Required" — at least one)',
        reason:
          'no user-approved pricing stance exists yet (CLAUDE.md; src/seo/jsonld/product.ts never emits offers/price/InStock) and no real customer reviews exist to source a review or aggregateRating from. Product pages on this site cannot earn Google\'s Product rich result until a pricing stance is set — a tracked, accepted gap, not a defect of this harness.',
      },
    ],
    recommendedChecked: ['image', 'description', 'brand'],
    recommendedAcknowledgedGaps: [
      {
        prop: 'sku / mpn / gtin',
        reason: 'no manufacturer part number on file for any catalog record — never synthesised from the slug.',
      },
    ],
  },
  {
    type: 'WebSite',
    docUrl: null,
    note:
      '"Sitelinks search box" — the only Google rich result WebSite ever powered — was removed ' +
      '2024-11-29 (Search Central changelog: "The sitelinks search box feature is no longer ' +
      'available in Google Search results"). WebSite carries no documented Google rich-result ' +
      'requirement today; only generic schema.org vocabulary validity applies (checked separately).',
    matchNode: (node, ref) => node['@id'] === ref.WEBSITE_ID,
    requiredChecked: [],
    requiredAcknowledgedGaps: [],
    recommendedChecked: [],
    recommendedAcknowledgedGaps: [],
  },
  {
    type: 'ItemList',
    docUrl: null,
    note:
      'Google only processes ItemList inside a Course/Movie/Recipe/Restaurant carousel ' +
      '(developers.google.com/search/docs/appearance/structured-data/carousel) — none of which ' +
      'this site has. Standalone ItemList (the brand and product listings here) has no documented ' +
      'Google rich result; only generic schema.org vocabulary validity applies.',
    matchNode: () => true,
    requiredChecked: [],
    requiredAcknowledgedGaps: [],
    recommendedChecked: [],
    recommendedAcknowledgedGaps: [],
  },
  {
    type: 'WebApplication',
    docUrl: 'https://developers.google.com/search/docs/appearance/structured-data/software-app',
    // Google's guide documents "Software App" for schema.org SoftwareApplication,
    // of which WebApplication is a subtype.
    matchNode: () => true,
    requiredChecked: ['name'],
    requiredAcknowledgedGaps: [
      {
        description: 'offers.price (Google: "Required")',
        reason:
          'LIT Home and the Black Nova keypad designer are free in-browser tools ' +
          '(isAccessibleForFree: true, src/seo/jsonld/webApplication.ts) — inventing an Offer ' +
          'to satisfy this would misstate that fact.',
      },
      {
        description: 'aggregateRating or review (Google: "Required" — one of)',
        reason: 'no real reviews exist for either tool — never fabricated.',
      },
    ],
    recommendedChecked: ['applicationCategory'],
    recommendedAcknowledgedGaps: [
      {
        prop: 'operatingSystem',
        reason: 'a browser tool has no OS-specific packaging to claim (src/seo/jsonld/webApplication.ts).',
      },
    ],
  },
];

/**
 * @param {Array<{ type: string, node: Record<string, unknown>, file: string }>} typedNodeOccurrences
 *   every `{ type, node, file }` found anywhere in dist/, across all pages
 * @param {{ ORG_ID: string, WEBSITE_ID: string }} ref
 * @param {{ error: Function, warn: Function, gap: Function }} sink
 */
export function checkGoogleRichResults(typedNodeOccurrences, ref, { error, warn, gap }) {
  for (const spec of GOOGLE_SPECS) {
    const occurrences = typedNodeOccurrences.filter(
      (o) => o.type === spec.type && spec.matchNode(o.node, ref),
    );

    if (spec.docUrl === null) {
      gap(
        'google-rich-results',
        `(type: ${spec.type})`,
        `${spec.type}: ${spec.note} — ${occurrences.length} node(s) found in dist/, vocabulary-checked only.`,
      );
      continue;
    }

    for (const { node, file } of occurrences) {
      for (const prop of spec.requiredChecked) {
        if (!(prop in node)) {
          error(
            'google-required',
            file,
            `${spec.type} is missing "${prop}", which Google documents as required (${spec.docUrl}).`,
          );
        }
      }
      for (const prop of spec.recommendedChecked) {
        if (!(prop in node)) {
          warn(
            'google-recommended',
            file,
            `${spec.type} is missing "${prop}", which Google documents as recommended (${spec.docUrl}) — ` +
              'the phase gate is zero errors AND zero warnings.',
          );
        }
      }
    }

    for (const g of spec.requiredAcknowledgedGaps) {
      gap(
        'google-required-acknowledged',
        `(type: ${spec.type}, ${occurrences.length} page(s))`,
        `${spec.type}: Google requires ${g.description}. Not emitted — ${g.reason}`,
      );
    }
    for (const g of spec.recommendedAcknowledgedGaps) {
      gap(
        'google-recommended-acknowledged',
        `(type: ${spec.type}, ${occurrences.length} page(s))`,
        `${spec.type}: Google recommends "${g.prop}". Not emitted — ${g.reason}`,
      );
    }
  }
}
