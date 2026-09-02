import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Seo } from '@/seo/Seo';
import { consultationMeta } from '@/seo/meta';
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
 * Design: light campaign surface, `docs/02-DESIGN-SOURCE-OF-TRUTH.md`
 * Amendment 1. Ratified 2026-09-02.
 *
 * Deliberately NOT indexable and not in the nav or the sitemap — it is a paid
 * destination, not a page of the site. That is what keeps the amendment bounded
 * and the URL taxonomy untouched. `Seo` is therefore rendered with `noindex` and
 * **no JSON-LD nodes**: `scripts/validate-seo.mjs` requires exactly zero
 * `ld+json` blocks on a non-indexable page.
 *
 * Every claim on this page is one the site already makes elsewhere. SAMA3 and
 * the four LitHome finishes are the strongest differentiators available and are
 * deliberately absent until Muneeb confirms them for publication (CLAUDE.md
 * rule 4) — they appear nowhere on the 124-page site today, so nothing here can
 * be the first place they ship.
 */
export function Consultation() {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const meta = consultationMeta();

  /*
   * Which creative sent this visitor. The page is prerendered without a query
   * string, so this starts empty and adopts the campaign context after mount —
   * identical first render either side of hydration. It never affects what is
   * rendered, only what the notification email says, so a visitor who arrives
   * without UTMs simply produces an enquiry with no source line.
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
      <Seo meta={meta} noindex />

      {/* Single source of submission status for assistive tech, mirroring the
          contact page: always present in the DOM so the region is registered
          before it ever has content. */}
      <div aria-live="polite" role="status" className="sr-only">
        {liveMessage}
      </div>

      <section className="container-luxe pt-10 pb-24 lg:pt-16">
        <div className="grid gap-16 lg:grid-cols-[1fr_minmax(0,30rem)] lg:gap-24">
          {/* ---------------------------------------------------- the promise */}
          <div className="max-w-2xl">
            <p className="text-eyebrow uppercase tracking-luxe text-copper-700 font-sans font-medium">
              {t('campaign.consultation.eyebrow')}
            </p>

            <h1 className="mt-6 font-serif text-hero text-ink-950">
              {t('campaign.consultation.headline')}
            </h1>

            <p className="mt-8 text-lg leading-relaxed text-ink-800/85">
              {t('campaign.consultation.sub')}
            </p>

            <div className="rule-copper mt-12" />

            <ul className="mt-12 grid gap-6">
              {proofPoints.map((point) => (
                <li key={point} className="flex gap-4 text-ink-800/85">
                  {/* A copper rule, not an icon: the light surface adds no new
                      primitives, and a hairline reads quieter than a tick. */}
                  <span aria-hidden="true" className="mt-3 h-px w-6 shrink-0 bg-copper-500" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>

            <div className="mt-16">
              <h2 className="font-serif text-2xl text-ink-950">
                {t('campaign.consultation.stepsTitle')}
              </h2>
              <ol className="mt-6 grid gap-4">
                {steps.map((step, i) => (
                  <li key={step} className="flex gap-5 text-ink-800/85">
                    <span className="font-mono text-sm text-copper-700 pt-1">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
              <p className="mt-8 text-sm text-ink-800/60">
                {t('campaign.consultation.showroomNote', { policy: SHOWROOM_VISIT_POLICY })}
              </p>
            </div>
          </div>

          {/* ------------------------------------------------------- the form */}
          <div className="lg:sticky lg:top-12 lg:self-start">
            <div className="border border-ink-800/15 bg-white/40 p-8 md:p-10">
              {status === 'sent' || status === 'mailto' ? (
                <div ref={resultRef} tabIndex={-1} className="py-6">
                  <h2 className="font-serif text-3xl text-ink-950">
                    {status === 'sent'
                      ? t('contact.formSentTitle')
                      : t('contact.formSuccessTitle')}
                  </h2>
                  <p className="mt-5 text-ink-800/85">
                    {status === 'sent'
                      ? t('campaign.consultation.sentBody')
                      : t('contact.formSuccessBody')}
                  </p>
                  {status === 'sent' && reference !== '' && (
                    <p className="mt-6 font-mono text-sm text-copper-700">
                      {t('contact.formSentReference', { reference })}
                    </p>
                  )}
                </div>
              ) : null}

              {showForm && (
                <>
                  <h2 className="font-serif text-3xl text-ink-950">
                    {t('campaign.consultation.formTitle')}
                  </h2>
                  <p className="mt-4 text-sm text-ink-800/70">
                    {t('campaign.consultation.formIntro')}
                  </p>

                  {/* `action`/`method` are never used by the JS path
                      (handleSubmit calls preventDefault). They exist so a native
                      submit — JS disabled, or a hydration failure — POSTs to the
                      real endpoint instead of doing a default GET that clears
                      the fields and sends nothing. */}
                  <form
                    onSubmit={handleSubmit}
                    action="/api/enquiry.php"
                    method="post"
                    className="mt-10 grid gap-8"
                  >
                    <input type="hidden" name="form_ts" value={formTs} readOnly />

                    <div>
                      <label htmlFor="c-name" className="field-label-light">
                        {t('contact.formName')}
                      </label>
                      <input
                        id="c-name"
                        name="name"
                        type="text"
                        autoComplete="name"
                        required
                        className="input-luxe-light"
                      />
                    </div>

                    <div>
                      <label htmlFor="c-whatsapp" className="field-label-light">
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
                        className="input-luxe-light"
                      />
                    </div>

                    <div>
                      <label htmlFor="c-email" className="field-label-light">
                        {t('contact.formEmail')}
                      </label>
                      <input
                        id="c-email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        className="input-luxe-light"
                      />
                    </div>

                    <div>
                      <label htmlFor="c-message" className="field-label-light">
                        {t('campaign.consultation.formMessage')}
                      </label>
                      <textarea
                        id="c-message"
                        name="message"
                        rows={4}
                        required
                        placeholder={t('campaign.consultation.formMessagePlaceholder')}
                        className="input-luxe-light resize-none"
                      />
                    </div>

                    {/* Honeypot. Positioned off-screen rather than display:none
                        or type="hidden" — both are trivially detected by
                        scrapers that read field types. aria-hidden + tabindex=-1
                        keep assistive tech and keyboard users away from it. */}
                    <div
                      aria-hidden="true"
                      className="absolute -left-[9999px] top-0 h-0 w-0 overflow-hidden"
                    >
                      <label htmlFor="c-hp">Do not fill this in</label>
                      <input id="c-hp" name="hp_note" type="text" tabIndex={-1} autoComplete="off" />
                    </div>

                    {liveEndpoint && (
                      <div className="cf-turnstile" data-sitekey={TURNSTILE_SITE_KEY} data-theme="light" />
                    )}

                    {status === 'error' && (
                      <p className="text-sm text-copper-700">{errorBody}</p>
                    )}

                    <button type="submit" className="btn-ink w-full">
                      {status === 'submitting'
                        ? t('contact.formSubmitting')
                        : t('campaign.consultation.formSubmit')}
                    </button>
                  </form>
                </>
              )}

              {/* The fast channel, offered on every state including success —
                  somebody who has just sent an enquiry and wants to talk now
                  should not have to go looking. */}
              <div className="mt-10 border-t border-ink-800/15 pt-8">
                <a
                  href={whatsappHref(SITE_PREFILLS.consultation)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackWhatsAppClick({ placement: 'contact-section' })}
                  className="text-sm uppercase tracking-luxe text-ink-800
                    underline underline-offset-8 decoration-copper-500
                    transition-colors duration-300 hover:text-copper-700"
                >
                  {t('contact.whatsappCta')}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
