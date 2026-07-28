import type { JsonLdNode } from './types';
import { pageUrl } from './ids';

export type FaqItem = { question: string; answer: string };

/**
 * AWAITING CONTENT — no FAQ copy exists on any page yet (Phase 3/4 content
 * work). `FAQPage` requires the question and answer text to be visibly
 * rendered on the page in the same words as the JSON-LD; never call this with
 * a Q&A pair a user cannot actually read on the page — that is undisclosed
 * structured data, one of Google's structured-data spam policies.
 *
 * Returns `null` for an empty list so a page can call this unconditionally
 * before it has real FAQ content without emitting a broken `FAQPage`.
 */
export function buildFaqPage(items: FaqItem[], path: string): JsonLdNode | null {
  if (items.length === 0) return null;

  return {
    '@type': 'FAQPage',
    '@id': `${pageUrl(path)}#faq`,
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}
