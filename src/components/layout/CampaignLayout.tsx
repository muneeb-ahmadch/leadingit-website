import { Outlet, Link } from 'react-router-dom';
import { href } from '@/seo/paths';
import { NAP_ADDRESS_LINE, NAP_PHONE_DISPLAY } from '@/data/nap';
import { SITE_NAME } from '@/lib/site';
import { usePageViewTracking } from '@/lib/usePageViewTracking';
import { trackPhoneClick } from '@/lib/analytics';

/**
 * The shell for campaign landing pages (`/go/*`) — deliberately not `Layout`.
 *
 * It is the **locked dark system, unchanged** (`docs/02-DESIGN-SOURCE-OF-TRUTH.md`
 * Amendment 2, which reversed the light experiment). Two differences from the
 * site shell, each with a reason:
 *
 * 1. **No site navigation.** Paid traffic that wanders is paid traffic that does
 *    not convert. The one deliberate exception is the wordmark, which links home:
 *    somebody about to hand over a six-figure project is entitled to go and vet
 *    the company, and refusing them that reads as evasive rather than focused.
 *
 * 2. **No Lenis.** Smooth scroll is a permanent INP cost on a page whose only
 *    job is one form. Campaign pages get native scroll.
 *
 * The header is transparent and overlaps the hero band, so the wordmark sits on
 * the photograph rather than on a bar above it.
 */
export function CampaignLayout() {
  // The campaign shell needs this more than the site shell does: every visitor
  // here arrives on a tagged ad URL, and the page_view is the only thing that
  // opens the session those UTM parameters attach to. Miss it and all 57
  // creatives are unattributable.
  usePageViewTracking();

  return (
    <div className="min-h-screen flex flex-col bg-ink-950 text-bone-300">
      {/* Same skip link as the site shell — WCAG 2.2 SC 2.4.1. There is far less
          to skip here, but "less" is not "none". */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:start-4 focus:z-[100]
          focus:bg-ink-900 focus:text-bone-100 focus:px-5 focus:py-3 focus:border focus:border-gold
          focus:text-sm focus:uppercase focus:tracking-luxe"
      >
        Skip to content
      </a>

      <header className="absolute inset-x-0 top-0 z-20 container-luxe pt-8">
        <Link
          to={href('/')}
          className="inline-block font-serif text-2xl tracking-luxe text-bone-100
            transition-colors duration-300 hover:text-gold"
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
       * no link farm. `NAP_ADDRESS_LINE` is never retyped at a call site:
       * character drift between surfaces reads as two businesses to a citation
       * aggregator.
       */}
      <footer className="container-luxe py-12 mt-24 border-t border-white/10">
        <div className="flex flex-col gap-3 text-sm text-bone-500 md:flex-row md:justify-between">
          <p>{NAP_ADDRESS_LINE}</p>
          <p>
            {/*
             * This is the only `tel:` link on the entire site, and it sits on
             * the one page paid traffic lands on. Until now it fired nothing:
             * `trackPhoneClick` existed in the analytics layer and was never
             * called from anywhere, so a visitor who arrived on an ad and tapped
             * the number — the highest-intent thing a phone user can do here —
             * converted invisibly. Fire-and-forget, no `preventDefault()`: the
             * dial must still happen with JS disabled (see the non-blocking
             * contract in `src/lib/analytics.ts`).
             */}
            <a
              href={`tel:${NAP_PHONE_DISPLAY.replace(/\s/g, '')}`}
              className="transition-colors duration-300 hover:text-gold"
              onClick={() => trackPhoneClick({ placement: 'campaign-footer' })}
            >
              {NAP_PHONE_DISPLAY}
            </a>
            <span className="mx-3 opacity-40">·</span>
            {/* The exact line the ads carry, so a visitor who clicked on it finds
                it here. Crestron only: approved by Muneeb 2026-09-09
                (docs/OPEN-QUESTIONS.md #3, DEALER_CLAIM_ALLOWLIST in
                scripts/validate-seo.mjs). The other eight brands in #3 are still
                unconfirmed and the build still fails on their dealer wording. */}
            <span>Authorized Crestron Dealer · Dubai</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
