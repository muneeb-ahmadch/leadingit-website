import { Outlet } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { href } from '@/seo/paths';
import { NAP_ADDRESS_LINE, NAP_PHONE_DISPLAY } from '@/data/nap';
import { SITE_NAME } from '@/lib/site';

/**
 * The shell for campaign landing pages (`/go/*`) — deliberately not `Layout`.
 *
 * Three differences, each with a reason:
 *
 * 1. **Light ground.** `docs/02-DESIGN-SOURCE-OF-TRUTH.md` Amendment 1. The site
 *    stays Direction B dark; campaign surfaces invert to bone ground / ink text.
 *    The `bg-bone-100` is set here rather than on the page so every future
 *    campaign page inherits it and none can half-apply it.
 *
 * 2. **No site navigation.** Paid traffic that wanders is paid traffic that does
 *    not convert. The one deliberate exception is the wordmark, which links home:
 *    somebody about to hand over a six-figure project is entitled to go and vet
 *    the company, and refusing them that reads as evasive rather than focused.
 *
 * 3. **No Lenis.** Smooth scroll is an INP cost on a page whose only job is a
 *    form. Campaign pages get native scroll.
 */
export function CampaignLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-bone-100 text-ink-800">
      {/* Same skip link as the site shell — WCAG 2.2 SC 2.4.1. There is far less
          to skip here, but "less" is not "none" and the tab order still starts
          above the form. Colours are the light-surface pair; ink on bone is
          15.73:1. */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:start-4 focus:z-[100]
          focus:bg-ink-950 focus:text-bone-100 focus:px-5 focus:py-3 focus:border focus:border-copper-700
          focus:text-sm focus:uppercase focus:tracking-luxe"
      >
        Skip to content
      </a>

      <header className="container-luxe pt-8 pb-2">
        <Link
          to={href('/')}
          className="inline-block font-serif text-2xl tracking-luxe text-ink-950
            transition-colors duration-300 hover:text-copper-700"
        >
          {SITE_NAME}
        </Link>
      </header>

      <main id="main" tabIndex={-1} className="flex-1">
        <Outlet />
      </main>

      {/*
       * The minimum a stranger needs to believe this is a real company with a
       * real address before typing their number into it — nothing more. No nav,
       * no link farm. The address string comes from `NAP_ADDRESS_LINE` and is
       * never retyped: character drift between surfaces reads as two businesses
       * to a citation aggregator.
       */}
      <footer className="container-luxe py-12 mt-20 border-t border-ink-800/15">
        <div className="flex flex-col gap-3 text-sm text-ink-800/70 md:flex-row md:justify-between">
          <p>{NAP_ADDRESS_LINE}</p>
          <p>
            <a href={`tel:${NAP_PHONE_DISPLAY.replace(/\s/g, '')}`} className="hover:text-copper-700">
              {NAP_PHONE_DISPLAY}
            </a>
            <span className="mx-3 opacity-40">·</span>
            {/* The neutral wording, not "authorized dealer". No per-brand dealer
                wording has been approved (docs/OPEN-QUESTIONS.md #3 and the
                2026-07-29 standing direction), and `validate-seo.mjs` fails the
                build on the stronger phrasing — which it did, on this file. */}
            <span>Crestron supplied and installed in Dubai</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
