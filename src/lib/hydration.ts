/**
 * Hydration helpers for the prerendered (vite-react-ssg) build.
 *
 * Every indexable route is shipped as complete static HTML, so that markup — not
 * a JavaScript render pass — is what crawlers, no-JS visitors and the browser's
 * first paint see. Components therefore must not emit hidden initial states
 * (`opacity: 0`, offset transforms) into the prerendered output; they opt into
 * those client-only visual states *after* React has taken over.
 */
import { useEffect, useState } from 'react';

let hydrationComplete = false;
let hydrationEndScheduled = false;

/**
 * Ends the hydration pass on the frame after the first mount effect runs, i.e.
 * once React has finished adopting the prerendered markup.
 */
function scheduleHydrationEnd(): void {
  if (hydrationComplete || hydrationEndScheduled) return;
  hydrationEndScheduled = true;
  requestAnimationFrame(() => {
    hydrationComplete = true;
  });
}

/**
 * Render-safe: `false` on the server and for the whole hydration render, `true`
 * for anything mounted afterwards (client-side navigations). Safe to read during
 * render because it can only flip after hydration has committed.
 */
export function hasHydrated(): boolean {
  return hydrationComplete;
}

/**
 * Call from a mount effect. `true` when the component mounted as part of the
 * initial hydration pass, `false` when it mounted on a later client navigation.
 */
export function mountedDuringHydration(): boolean {
  const duringHydration = !hydrationComplete;
  scheduleHydrationEnd();
  return duringHydration;
}

/**
 * `false` on the server and on the first client render (so the tree hydrates
 * against identical markup), `true` from the first commit onwards.
 */
export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    scheduleHydrationEnd();
    setHydrated(true);
  }, []);
  return hydrated;
}
