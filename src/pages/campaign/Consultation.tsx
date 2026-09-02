import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Seo } from '@/seo/Seo';
import { consultationMeta } from '@/seo/meta';
import { CampaignHero, CAMPAIGN_HERO_LEAD, CAMPAIGN_HERO_SIZES } from '@/components/CampaignHero';
import { buildLcpImagePreload } from '@/components/media/imageSrcSet';
import { whatsappHref } from '@/lib/site';
import { SHOWROOM_VISIT_POLICY } from '@/data/nap';
import { SITE_PREFILLS } from '@/lib/prefill';
import { trackWhatsAppClick } from '@/lib/analytics';
import { TURNSTILE_SITE_KEY } from '@/lib/turnstile';
import { useEnquiryForm } from '@/features/enquiry/useEnquiryForm';

/**
 * `/go/consultation/` — the destination for the 23 creatives whose CTA is
 * "Book a private consultation", "Book a consultation" or "Speak to a
 * specialist" (`lit-marketing-os/campaigns/cta-url-map.csv`).
 *
 * Direction B, unchanged (`docs/02-DESIGN-SOURCE-OF-TRUTH.md` Amendment 2).
 * The ads are dark and the site is dark, so the page is dark: there is no
 * transition to bridge, which is the whole reason the light experiment was
 * reversed.
 *
 * ## The form is NOT over the photograph, and that is deliberate
 *
 * `PageHero`'s docblock records the reason: "A CTA panel and body copy over a
 * photograph is where WCAG 2.2 AA quietly fails at some viewport nobody
 * tested." The band carries the eyebrow, the h1, one line and one anchor CTA;
 * everything that has to be read or typed into sits below it on solid ink. The
 * band is 62svh rather than `PageHero`'s 70svh so the panel below is already
 * breaking the fold on a laptop.
 *
 * Deliberately NOT indexable and not in the nav or the sitemap — it is a paid
 * destination, not a page of the site. `Seo` is therefore rendered with
 * `noindex` and **no JSON-LD nodes**: `scripts/validate-seo.mjs` requires zero
 * `ld+json` blocks on a non-indexable page.
 *
 * Every claim here is one the site already makes elsewhere. SAMA3 and the four
 * LitHome finishes are the strongest differentiators available and are
 * deliberately absent until Muneeb confirms them for publication (CLAUDE.md
 * rule 4) — they appear nowhere on the 124-page site, so a campaign page must
 * not be the first place they ship.
 */
export function Consultation() {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const meta = consultationMeta();

  /*
   * Which creative sent this visitor. The page is prerendered without a query
   * string, so this starts empty and adopts the campaign context after mount —
   * identical first render either side of hydration. It never affects what is
   * rendered, only what the notification email says, so a visitor arriving with
   * no UTMs simply produces an enquiry with no source line.
   */
  const [sourceNote, setSourceNote] = useState('');
  useEffect(() => {
    const ad = params.get('utm_content');
    const campaign = params.get('utm_campaign');
    if (!ad && !campaign) return;
    setSourceNote(
      ['via the consultation page', campaign && `campaign: ${campaign}`, ad && `ad: ${ad}`]
        .filter(Boolean)
        .join(' · '),
    );
  }, [params]);

  const email = t('contact.email');
  const { status, errorKind, reference, formTs, liveEndpoint, resultRef, handleSubmit } =
    useEnquiryForm({ formName: 'consultation', fallbackEmail: email, sourceNote });

  const errorBody =
    errorKind === 'rate_limited'
      ? t('contact.formRateLimitedBody')
      : errorKind === 'stale'
        ? t('contact.formStaleBody')
        : errorKind === 'captcha'
          ? t('contact.formCaptchaBody')
          : errorKind === 'invalid'
            ? t('contact.formInvalidBody')
            : t('contact.formErrorBody');

  const liveMessage =
    status === 'submitting'
      ? t('contact.formSubmitting')
      : status === 'sent'
        ? t('contact.formSentBody')
        : status === 'mailto'
          ? t('contact.formSuccessBody')
          : status === 'error'
            ? errorBody
            : '';

  const showForm = status === 'idle' || status === 'submitting' || status === 'error';
  const proofPoints = t('campaign.consultation.proof', { returnObjects: true }) as string[];
  const steps = t('campaign.consultation.steps', { returnObjects: true }) as string[];

  return (
    <>
      {/* Matches the lead frame of `CampaignHero` (`src`, `sizes`) — the only
          image above the fold and the LCP candidate. */}
      <Seo
        meta={meta}
        noindex
        lcpImage={buildLcpImagePreload(CAMPAIGN_HERO_LEAD, CAMPAIGN_HERO_SIZES)}
      />

      {/* Single source of submission status for assistive tech, mirroring the
          contact page: always present in the DOM so the region is registered
          before it ever has content. */}
      <div aria-live="polite" role="status" className="sr-only">
        {liveMessage}
      </div>

      <CampaignHero>
        {/*
          * Copy left, form right, both inside the hero.
          *
          * This departs from `PageHero`'s "never put a form over a photograph"
          * rule, and the departure is deliberate and narrow. That rule exists
          * because contrast over a photograph is non-deterministic — it fails at
          * some viewport nobody tested. Here the panel is **opaque** (`bg-ink-900`,
          * not the translucent `glass-panel`), so nothing inside it composites
          * against the image at all and its contrast is exactly the site's own.
          * The rule's hazard is removed rather than accepted.
          *
          * The reason to take it on: this is a paid destination whose only job is
          * the form. A form below the fold on the page you paid to send someone to
          * is a form most of them never see.
          */}
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_minmax(0,26rem)] lg:gap-20">
          {/* ------------------------------------------------------ the promise */}
          <div className="min-w-0 max-w-xl">
            <p className="eyebrow">{t('campaign.consultation.eyebrow')}</p>
            <h1 className="mt-6 font-serif text-hero text-bone-100">
              {t('campaign.consultation.headline')}
            </h1>
            <p className="mt-7 text-lg leading-relaxed text-bone-300">
              {t('campaign.consultation.sub')}
            </p>

            <ul className="mt-10 grid gap-4">
              {proofPoints.map((point) => (
                <li key={point} className="flex gap-4 text-sm text-bone-300">
                  {/* A gold hairline, not an icon — the shipped system's own restraint. */}
                  <span aria-hidden="true" className="mt-2.5 h-px w-5 shrink-0 bg-gold" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* --------------------------------------------------------- the form */}
          <div id="request" className="min-w-0 scroll-mt-8">
            {/*
              * Opaque, and full-bleed on mobile. The opacity is the contrast
              * argument above. The bleed is arithmetic: a 375px viewport minus
              * `container-luxe`'s 48px leaves 327, and Cloudflare pins
              * `.cf-turnstile` to a 300px minimum — so any padding above 13px
              * would overflow. Bleeding to the viewport edge restores 327 of
              * usable width. Inset again from `sm:` up.
              */}
            <div className="-mx-6 border border-white/10 bg-ink-900 p-6 shadow-glow sm:mx-0 sm:p-7">
              {status === 'sent' || status === 'mailto' ? (
                <div ref={resultRef} tabIndex={-1} className="py-4">
                  <h2 className="font-serif text-2xl text-bone-100">
                    {status === 'sent'
                      ? t('contact.formSentTitle')
                      : t('contact.formSuccessTitle')}
                  </h2>
                  <p className="mt-4 text-sm text-bone-300">
                    {status === 'sent'
                      ? t('campaign.consultation.sentBody')
                      : t('contact.formSuccessBody')}
                  </p>
                  {status === 'sent' && reference !== '' && (
                    <p className="mt-5 font-mono text-xs text-gold">
                      {t('contact.formSentReference', { reference })}
                    </p>
                  )}
                </div>
              ) : null}

              {showForm && (
                <>
                  <h2 className="font-serif text-2xl text-bone-100">
                    {t('campaign.consultation.formTitle')}
                  </h2>
                  <p className="mt-2 text-sm text-bone-500">
                    {t('campaign.consultation.formIntro')}
                  </p>

                  {/* `action`/`method` are never used by the JS path (handleSubmit
                      calls preventDefault). They exist so a native submit — JS
                      disabled, or a hydration failure — POSTs to the real endpoint
                      instead of a default GET that clears the fields and sends
                      nothing. */}
                  <form
                    onSubmit={handleSubmit}
                    action="/api/enquiry.php"
                    method="post"
                    className="mt-6 grid gap-5"
                  >
                    <input type="hidden" name="form_ts" value={formTs} readOnly />

                    <div>
                      <label htmlFor="c-name" className="field-label !mb-1.5">
                        {t('contact.formName')}
                      </label>
                      <input
                        id="c-name"
                        name="name"
                        type="text"
                        autoComplete="name"
                        required
                        className="input-luxe !py-2"
                      />
                    </div>

                    <div>
                      <label htmlFor="c-whatsapp" className="field-label !mb-1.5">
                        {t('contact.formWhatsapp')}
                      </label>
                      <input
                        id="c-whatsapp"
                        name="whatsapp"
                        type="tel"
                        inputMode="tel"
                        autoComplete="tel"
                        placeholder="+971 50 123 4567"
                        required
                        className="input-luxe !py-2"
                      />
                    </div>

                    <div>
                      <label htmlFor="c-email" className="field-label !mb-1.5">
                        {t('contact.formEmail')}
                      </label>
                      <input
                        id="c-email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        className="input-luxe !py-2"
                      />
                    </div>

                    <div>
                      <label htmlFor="c-message" className="field-label !mb-1.5">
                        {t('campaign.consultation.formMessage')}
                      </label>
                      <textarea
                        id="c-message"
                        name="message"
                        rows={2}
                        required
                        placeholder={t('campaign.consultation.formMessagePlaceholder')}
                        className="input-luxe resize-none !py-2"
                      />
                    </div>

                    {/* Honeypot. Off-screen rather than display:none or
                        type="hidden" — both are trivially detected by scrapers
                        that read field types. aria-hidden + tabindex=-1 keep
                        assistive tech and keyboard users away from it. */}
                    <div
                      aria-hidden="true"
                      className="absolute -left-[9999px] top-0 h-0 w-0 overflow-hidden"
                    >
                      <label htmlFor="c-hp">Do not fill this in</label>
                      <input id="c-hp" name="hp_note" type="text" tabIndex={-1} autoComplete="off" />
                    </div>

                    {liveEndpoint && (
                      <div
                        className="cf-turnstile"
                        data-sitekey={TURNSTILE_SITE_KEY}
                        data-theme="dark"
                      />
                    )}

                    {status === 'error' && <p className="text-sm text-gold">{errorBody}</p>}

                    <button type="submit" className="btn-gold w-full justify-center">
                      <span>
                        {status === 'submitting'
                          ? t('contact.formSubmitting')
                          : t('campaign.consultation.formSubmit')}
                      </span>
                    </button>

                    <p className="text-xs text-bone-500">
                      {t('campaign.consultation.heroNote')}
                    </p>
                  </form>
                </>
              )}

              {/* The fast channel, offered on every state including success —
                  somebody who has just sent an enquiry and wants to talk now
                  should not have to go looking. */}
              <div className="mt-6 border-t border-white/10 pt-5">
                <a
                  href={whatsappHref(SITE_PREFILLS.consultation)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackWhatsAppClick({ placement: 'contact-section' })}
                  className="btn-ghost"
                >
                  {t('contact.whatsappCta')}
                </a>
              </div>
            </div>
          </div>
        </div>
      </CampaignHero>

      {/*
        * `ink-900`, not `ink-950`. This section used to be the page's pure-black
        * floor and it is what the page was being judged on. One step up the ramp
        * separates it from the hero's bottom stop and keeps the page from
        * bottoming out.
        */}
      <section className="bg-ink-900 py-20 lg:py-24">
        <div className="container-luxe">
          <div className="max-w-2xl">
            <h2 className="font-serif text-3xl text-bone-100">
              {t('campaign.consultation.stepsTitle')}
            </h2>
            <ol className="mt-8 grid gap-5">
              {steps.map((step, i) => (
                <li key={step} className="flex gap-5 text-bone-300">
                  <span className="font-mono text-sm text-gold pt-1">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
            <p className="mt-10 text-sm text-bone-500">
              {t('campaign.consultation.showroomNote', { policy: SHOWROOM_VISIT_POLICY })}
            </p>
          </div>
        </div>
      </section>

    </>
  );
}
