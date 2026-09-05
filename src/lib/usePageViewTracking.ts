import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from '@/lib/analytics';

/**
 * Whether this page load has already reported its entry view.
 *
 * Module scope, not a ref: it is a property of the page load, not of a
 * component. Exactly one layout is mounted at a time and it stays mounted for
 * the life of the SPA session, so this flips once, on the landing view, and the
 * first-view branch below never runs again until the browser reloads.
 */
let entryViewSent = false;

/**
 * Runs `run` when the browser is next idle, so the gtag request is issued after
 * the page has painted rather than competing with it.
 *
 * `requestIdleCallback` is not in Safari before 16.4; a short timeout is the
 * fallback. The 2s cap matters on a page that never goes idle — without it, a
 * busy tab could hold the entry view back indefinitely, and the entry view is
 * the one carrying the campaign's UTM parameters.
 */
function whenIdle(run: () => void): void {
  if (typeof window.requestIdleCallback === 'function') {
    window.requestIdleCallback(run, { timeout: 2000 });
    return;
  }
  window.setTimeout(run, 200);
}

/**
 * Reports a GA4 `page_view` for the entry load and for every client-side route
 * change. Call it once, from a layout that wraps the routes it should cover —
 * today that is `Layout` (the site) and `CampaignLayout` (`/go/*`).
 *
 * ## Why this exists
 *
 * GA4 received nothing at all between the property going live on 2026-08-05 and
 * 2026-09-05. Two independent faults caused it, and both had to be fixed:
 *
 * 1. `window.gtag` pushed an array into `dataLayer` instead of an `arguments`
 *    object, so gtag.js discarded every command it was ever given. Fixed in
 *    `analytics.ts`.
 * 2. **No `page_view` existed anywhere in the codebase**, and the loader ran
 *    only from inside `sendEvent()` — so an ordinary visitor who read a page and
 *    left never loaded GA4 at all. `page_view` is what opens a session, and the
 *    session is what carries the UTM parameters, so the 57 tagged ad URLs had
 *    nothing to attach to. That is this file.
 *
 * ## What it protects
 *
 * - **The CWV budget.** The lazy load in `analytics.ts` was a deliberate LCP
 *   decision and this keeps its intent: the entry view is deferred to idle, so
 *   the gtag script is still requested after first paint, just without needing
 *   the visitor to click something first.
 * - **Attribution accuracy.** The URL is captured when the route settles and
 *   passed to `trackPageView` explicitly, so a view is always credited to the
 *   URL that was on screen — never to a later one, if the visitor moves on
 *   before the event is flushed. Nothing here cancels a scheduled send for the
 *   same reason: a dropped entry view is a lost campaign attribution.
 * - **One view per route.** `search` is part of the key, so `?utm_content=T2-07`
 *   and the bare path are distinct views, while a re-render of the same URL
 *   reports nothing.
 * - **SSG safety.** All of it lives in an effect, which `vite-react-ssg` never
 *   runs during the Node prerender pass.
 */
export function usePageViewTracking(): void {
  const { pathname, search } = useLocation();
  const lastReported = useRef<string | null>(null);

  useEffect(() => {
    const path = pathname + search;
    if (lastReported.current === path) return;
    lastReported.current = path;

    // Captured now, read later — see "Attribution accuracy" above.
    const location = window.location.href;
    const send = () => trackPageView({ page_location: location, page_path: path });

    if (entryViewSent) {
      // A route change costs no network request the entry view has not already
      // paid for, so there is nothing left to defer. One frame is still worth
      // waiting: react-helmet-async commits the new <title> in its own effect,
      // and without the frame `page_title` would report the previous page.
      window.requestAnimationFrame(send);
      return;
    }

    entryViewSent = true;
    whenIdle(send);
  }, [pathname, search]);
}
