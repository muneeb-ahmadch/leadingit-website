// `@id` conventions for the entity graph — see .claude/skills/schema-jsonld/SKILL.md.
// Every builder in this directory funnels page-level URLs through `pageUrl()`
// rather than calling `absoluteUrl()` directly, so the trailing slash rule
// (docs/05-URL-TAXONOMY.md §1/§4 — present on every route) is enforced in one
// place instead of re-implemented per builder.
import { SITE_URL, absoluteUrl } from '@/lib/site';

/**
 * Canonical, trailing-slash page URL for a site-relative path. `absoluteUrl()`
 * alone does not add the trailing slash (it is a thin string-join helper used
 * for images too, where a trailing slash would be wrong) — this wrapper is the
 * page-URL-specific rule.
 */
export function pageUrl(path: string): string {
  const abs = absoluteUrl(path);
  if (abs === SITE_URL) return `${SITE_URL}/`;
  return abs.endsWith('/') ? abs : `${abs}/`;
}

export const ORG_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;
/** Gated — see localBusiness.ts. Reserved now so every other node that will
 * eventually reference it (Organization.location, breadcrumbs, etc.) can use
 * the same constant from day one without a future find-and-replace. */
export const SHOWROOM_DUBAI_ID = `${SITE_URL}/#showroom-dubai`;

export function brandId(brandSlug: string): string {
  return `${pageUrl(`/brands/${brandSlug}`)}#brand`;
}

export function productId(brandSlug: string, productSlug: string): string {
  return `${pageUrl(`/brands/${brandSlug}/${productSlug}`)}#product`;
}

export function webpageId(path: string): string {
  return `${pageUrl(path)}#webpage`;
}

export function breadcrumbNodeId(path: string): string {
  return `${pageUrl(path)}#breadcrumb`;
}
