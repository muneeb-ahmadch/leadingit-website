import { absoluteUrl } from '@/lib/site';
import type { JsonLdNode } from './types';
import { pageUrl } from './ids';

export type WebApplicationInput = {
  /** Site-relative canonical path — `/lit-home` or `/brands/black-nova/keypad-designer`. */
  path: string;
  name: string;
  description: string;
  /** One of schema.org's suggested `applicationCategory` values, e.g.
   * `'HomeApplication'` (LIT Home) or `'DesignApplication'` (keypad designer). */
  applicationCategory?: string;
  screenshot?: string;
};

/**
 * `WebApplication` for `/lit-home` and `/brands/black-nova/keypad-designer` —
 * the two first-party, in-browser tools this site ships.
 *
 * Only claims verifiable from the codebase itself: both are free, no-signup
 * browser tools (`isAccessibleForFree: true`), and both require client-side
 * JavaScript to interact with (they render real content in prerendered HTML,
 * but the interactive canvas/demo hydrates on top).
 *
 * Deliberately omitted — no defensible basis for any of these: `aggregateRating`
 * (no real reviews exist), `offers` (not a priced product — `isAccessibleForFree`
 * already states "free" without inventing an `Offer`), `operatingSystem`
 * (a browser tool has no OS-specific packaging to claim).
 */
export function buildWebApplication(input: WebApplicationInput): JsonLdNode {
  const url = pageUrl(input.path);
  const node: JsonLdNode = {
    '@type': 'WebApplication',
    '@id': `${url}#webapp`,
    name: input.name,
    description: input.description,
    url,
    isAccessibleForFree: true,
    browserRequirements: 'Requires JavaScript.',
  };

  if (input.applicationCategory) node.applicationCategory = input.applicationCategory;
  if (input.screenshot) node.screenshot = absoluteUrl(input.screenshot);

  return node;
}
