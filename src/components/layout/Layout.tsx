import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Lenis from 'lenis';
import { Header } from './Header';
import { Footer } from './Footer';

export function Layout() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Lenis overrides native scroll with a rAF-driven smoothing loop — a
    // permanent INP cost and a motion-sickness risk. Skip it entirely for
    // visitors who have asked for reduced motion; native scroll is what they
    // get instead, which is strictly better on both counts for them.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const lenis = new Lenis({ duration: 1.1, smoothWheel: true });
    // Track the latest handle so cleanup cancels the live frame, not just the first one.
    let id = requestAnimationFrame(function raf(time: number) {
      lenis.raf(time);
      id = requestAnimationFrame(raf);
    });
    return () => {
      cancelAnimationFrame(id);
      lenis.destroy();
    };
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      {/*
       * Skip link — WCAG 2.2 SC 2.4.1 Bypass Blocks (A), net-new in Phase 4.
       * Every page repeats the same five header links before its content, and
       * a keyboard or screen-reader user had no way past them.
       *
       * Visually hidden until focused, rather than `display: none` — a hidden
       * element is not focusable, which would make the link useless. It is the
       * first thing in the DOM so it is the first tab stop.
       *
       * `href` is a bare fragment on purpose: it must not go through `href()`,
       * which prepends the site path convention for real routes. This targets
       * an element on the current page.
       */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:start-4 focus:z-[100]
          focus:bg-ink-900 focus:text-bone-100 focus:px-5 focus:py-3 focus:border focus:border-gold
          focus:text-sm focus:uppercase focus:tracking-luxe"
      >
        Skip to content
      </a>
      <Header />
      {/*
       * `id` is the skip-link target. `tabIndex={-1}` makes <main> programmatically
       * focusable so the skip actually moves focus rather than only scrolling —
       * without it, Safari and older Firefox jump the viewport but leave focus in
       * the header, and the next Tab returns the user to the nav they just skipped.
       * -1 keeps it out of the natural tab order.
       */}
      <main id="main" tabIndex={-1} className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
