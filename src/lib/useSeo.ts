import { useEffect } from 'react';
import { SITE_NAME, absoluteUrl } from './site';

type SeoInput = {
  /** Page title. SITE_NAME is appended automatically unless `rawTitle` is true. */
  title: string;
  description: string;
  /** Site-relative canonical path, e.g. "/brands/marantz/cinema-30". */
  path: string;
  /** Absolute URL or site-relative path to the social-share image. */
  image?: string;
  type?: 'website' | 'article' | 'product';
  keywords?: string;
  /** JSON-LD structured data object(s). */
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
  rawTitle?: boolean;
};

function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

/**
 * Client-side head manager for SEO. Sets <title>, meta description, canonical,
 * Open Graph / Twitter tags and JSON-LD structured data for the current page.
 *
 * Note: this is a single-page app without server-side rendering. Modern crawlers
 * (Google) execute JS and read these tags, but for guaranteed crawler coverage a
 * prerender/SSG step should be added in the build phase.
 */
export function useSeo({
  title,
  description,
  path,
  image = '/og-default.jpg',
  type = 'website',
  keywords,
  jsonLd,
  rawTitle = false,
}: SeoInput) {
  const fullTitle = rawTitle ? title : `${title} | ${SITE_NAME}`;
  const url = absoluteUrl(path);
  const imageUrl = absoluteUrl(image);
  const ld = jsonLd ? JSON.stringify(jsonLd) : null;

  useEffect(() => {
    document.title = fullTitle;

    upsertMeta('name', 'description', description);
    if (keywords) upsertMeta('name', 'keywords', keywords);
    upsertLink('canonical', url);

    upsertMeta('property', 'og:title', fullTitle);
    upsertMeta('property', 'og:description', description);
    upsertMeta('property', 'og:type', type === 'product' ? 'website' : type);
    upsertMeta('property', 'og:url', url);
    upsertMeta('property', 'og:image', imageUrl);
    upsertMeta('property', 'og:site_name', SITE_NAME);

    upsertMeta('name', 'twitter:card', 'summary_large_image');
    upsertMeta('name', 'twitter:title', fullTitle);
    upsertMeta('name', 'twitter:description', description);
    upsertMeta('name', 'twitter:image', imageUrl);

    let script = document.head.querySelector<HTMLScriptElement>('script[data-seo-jsonld]');
    if (ld) {
      if (!script) {
        script = document.createElement('script');
        script.type = 'application/ld+json';
        script.setAttribute('data-seo-jsonld', '');
        document.head.appendChild(script);
      }
      script.textContent = ld;
    } else if (script) {
      script.remove();
    }
  }, [fullTitle, description, url, imageUrl, type, keywords, ld]);
}
