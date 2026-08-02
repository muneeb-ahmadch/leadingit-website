import { useEffect, useRef } from 'react';
import { trackBrandPageEngaged } from '@/lib/analytics';

/**
 * Fires `brand_page_engaged` once per page view when a visitor shows real
 * interest in a brand hub, rather than bouncing.
 *
 * Why it exists: brand hubs are the primary target of the whole brand+geo
 * ranking strategy, and clicks alone under-measure them. A visitor who reads a
 * hub and then goes to a product page never fires a conversion on the hub, so
 * without this the page that did the work gets no credit.
 *
 * Threshold: 15 seconds of dwell OR 50% scroll depth, whichever comes first.
 * Both are deliberately generous — this is meant to separate "read it" from
 * "bounced", not to flatter the number.
 *
 * ## Constraints this respects
 *
 * - **Fires at most once per mount.** `trackBrandPageEngaged` does not
 *   deduplicate; that is the caller's job, and this is the caller.
 * - **SSG-safe.** `vite-react-ssg` executes route modules in Node, where there
 *   is no `window`. Everything here lives inside an effect, which never runs
 *   during prerender.
 * - **INP-safe.** The scroll listener is passive and does nothing but compare
 *   two numbers, and it detaches the moment the event fires. INP is currently
 *   0 ms of total blocking time across all seven templates and must stay there.
 * - **Inert with no measurement ID.** `trackBrandPageEngaged` returns before
 *   touching anything when GA4 is unconfigured, so this costs one timer and one
 *   passive listener and nothing else.
 */
export function useBrandEngagement(brand: string): void {
  const firedRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    // `BrandPage` early-returns a redirect on an unknown slug, and a hook cannot
    // be called after that return — so it calls this one above the guard with an
    // empty string. Nothing to report for a page that is about to redirect.
    if (brand === '') return;

    const fire = (trigger: string) => {
      if (firedRef.current) return;
      firedRef.current = true;
      trackBrandPageEngaged({ brand, trigger });
      cleanup();
    };

    const onScroll = () => {
      const scrolled = window.scrollY + window.innerHeight;
      const total = document.documentElement.scrollHeight;
      // Guard against a zero/short document, where the ratio is meaningless.
      if (total <= window.innerHeight) return;
      if (scrolled / total >= 0.5) fire('scroll_50pct');
    };

    // Declared as a function so it is hoisted above `timer`'s declaration below.
    // It only ever executes after `timer` is assigned — either from `fire()`,
    // which is asynchronous, or as React's cleanup on unmount.
    function cleanup() {
      clearTimeout(timer);
      window.removeEventListener('scroll', onScroll);
    }

    const timer = setTimeout(() => fire('dwell_15s'), 15_000);
    window.addEventListener('scroll', onScroll, { passive: true });

    return cleanup;
  }, [brand]);
}
