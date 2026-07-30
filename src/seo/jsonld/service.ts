import type { JsonLdNode } from './types';
import { ORG_ID, pageUrl } from './ids';

export type ServiceInput = {
  /** Site-relative canonical path, e.g. `/solutions/home-cinema`. */
  path: string;
  name: string;
  description: string;
  /** e.g. `['United Arab Emirates', 'Pakistan']` — never a city, per the
   * Dubai-only local-SEO rule (no Karachi/Pakistan place claims). */
  areaServed: string[];
  serviceType?: string;
};

/**
 * AWAITING CONTENT — `/solutions/*` does not exist yet (docs/05-URL-TAXONOMY.md
 * §2 lists 7 solution pages, none built). `Service` represents one named
 * offering (e.g. "Home Cinema Installation") with `provider` pointing at
 * `Organization`. Wire this once the solutions IA and copy exist; do not
 * invent a service name or description ahead of that content.
 */
export function buildService(input: ServiceInput): JsonLdNode {
  const url = pageUrl(input.path);
  return {
    '@type': 'Service',
    '@id': `${url}#service`,
    name: input.name,
    description: input.description,
    url,
    provider: { '@id': ORG_ID },
    areaServed: input.areaServed,
    ...(input.serviceType ? { serviceType: input.serviceType } : {}),
  };
}
