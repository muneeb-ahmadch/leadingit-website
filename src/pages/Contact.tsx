import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { MapPin, Mail, MessageCircle } from 'lucide-react';
import { Reveal } from '@/components/primitives/Reveal';
import { Eyebrow } from '@/components/primitives/Eyebrow';
import { Button } from '@/components/primitives/Button';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { Seo } from '@/seo/Seo';
import { contactMeta } from '@/seo/meta';
import { simplePageCrumbs } from '@/seo/breadcrumbs';
import { buildWebPage } from '@/seo/jsonld/webpage';
import { buildBreadcrumbList } from '@/seo/jsonld/breadcrumbList';
import { breadcrumbNodeId } from '@/seo/jsonld/ids';
import { whatsappHref } from '@/lib/site';
import { NAP_ADDRESS_LINE, SHOWROOM_VISIT_POLICY } from '@/data/nap';
import { SITE_PREFILLS } from '@/lib/prefill';
import { trackWhatsAppClick, trackEmailClick } from '@/lib/analytics';
import { TURNSTILE_SITE_KEY } from '@/lib/turnstile';
import { useEnquiryForm } from '@/features/enquiry/useEnquiryForm';

export function Contact() {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const email = t('contact.email');

  /*
   * The whole submission pipeline — states, the time trap, the Turnstile script,
   * the honest `mailto` fallback — lives in one shared hook so this page and the
   * campaign landing pages cannot drift apart on the endpoint's contract.
   * `src/features/enquiry/useEnquiryForm.ts`.
   */
  const { status, errorKind, reference, formTs, liveEndpoint, resultRef, handleSubmit } =
    useEnquiryForm({ formName: 'contact', fallbackEmail: email });

  // A design serialised from the keypad designer arrives here as ?message=… .
  // The page is prerendered without a query string, so the field starts empty and
  // adopts the incoming message after mount — identical first render either side
  // of hydration.
  const [message, setMessage] = useState('');
  useEffect(() => {
    const incoming = params.get('message');
    if (incoming) setMessage(incoming);
  }, [params]);

  const meta = contactMeta();
  const crumbs = simplePageCrumbs(t('nav.contact'), meta.path);

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

  /** What the aria-live region announces. Empty while idle so it stays quiet. */
  const liveMessage =
    status === 'submitting'
      ? t('contact.formSubmitting')
      : status === 'sent'
        ? `${t('contact.formSentTitle')} ${t('contact.formSentBody')}`
        : status === 'mailto'
          ? `${t('contact.formSuccessTitle')} ${t('contact.formSuccessBody')}`
          : status === 'error'
            ? `${t('contact.formErrorTitle')} ${errorBody}`
            : '';

  const showForm = status === 'idle' || status === 'submitting' || status === 'error';

  return (
    <section className="relative pt-44 pb-32 container-luxe">
      <Seo
        meta={meta}
        jsonLd={[
          buildWebPage({
            path: meta.path,
            name: meta.title,
            type: 'ContactPage',
            description: meta.description,
            breadcrumbId: breadcrumbNodeId(meta.path),
          }),
          buildBreadcrumbList(crumbs, meta.path),
        ]}
      />

      <Reveal>
        <Breadcrumbs crumbs={crumbs} className="mb-8" />
        <Eyebrow>{t('contact.eyebrow')}</Eyebrow>
        <h1 className="mt-5 font-serif text-display max-w-3xl">{t('contact.title')}</h1>
      </Reveal>
      <Reveal delay={0.2}>
        <p className="mt-8 text-lg leading-relaxed text-bone-300 max-w-2xl">
          {t('contact.subtitle')}
        </p>
      </Reveal>

      {/* Single source of submission status for assistive tech. Always present in
          the DOM (never conditionally mounted) so screen readers observe the
          region from first paint and actually announce later changes. */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        aria-label={t('contact.formStatusLabel')}
        className="sr-only"
      >
        {liveMessage}
      </div>

      <div className="mt-20 grid lg:grid-cols-[1.4fr_1fr] gap-16 lg:gap-24">
        {/* form */}
        <Reveal>
          <div className="relative min-h-[420px]">
            {status === 'sent' || status === 'mailto' ? (
              <motion.div
                ref={resultRef}
                tabIndex={-1}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="border border-gold/30 bg-ink-900 p-12 h-full flex flex-col justify-center"
              >
                <div className="font-serif text-4xl text-gold">
                  {status === 'sent' ? t('contact.formSentTitle') : t('contact.formSuccessTitle')}
                </div>
                <p className="mt-5 text-lg leading-relaxed text-bone-300 max-w-md">
                  {status === 'sent' ? t('contact.formSentBody') : t('contact.formSuccessBody')}
                </p>
                {status === 'sent' && reference !== '' && (
                  <p className="mt-4 font-mono text-sm text-bone-500">
                    {t('contact.formSentReference', { reference })}
                  </p>
                )}
              </motion.div>
            ) : null}

            {showForm && (
              // `action`/`method` are never used by the JS path (handleSubmit
              // calls preventDefault). They exist so that a native submit —
              // JS disabled, or a hydration failure — POSTs to the real endpoint
              // instead of doing a default GET back to /contact/, which on a
              // static host returned the same page with the fields cleared and
              // nothing sent: an enquiry lost silently, with no error shown.
              <form
                onSubmit={handleSubmit}
                action="/api/enquiry.php"
                method="post"
                className="grid gap-10"
              >
                {/* Really in the form, not just described in a comment. Empty in
                    the prerendered HTML by necessity; the server treats a missing
                    value as a 400, never as a pass. */}
                <input type="hidden" name="form_ts" value={formTs} readOnly />
                <div className="grid sm:grid-cols-2 gap-10">
                  <div>
                    <label htmlFor="name" className="field-label">{t('contact.formName')}</label>
                    <input id="name" name="name" type="text" required className="input-luxe" />
                  </div>
                  <div>
                    <label htmlFor="email" className="field-label">{t('contact.formEmail')}</label>
                    <input id="email" name="email" type="email" required className="input-luxe" />
                  </div>
                </div>
                {/* Required, and deliberately so. The 124 pages of this site
                    all push visitors to WhatsApp because that is how business is
                    actually conducted in this market — yet the form used to collect
                    only email, the slowest channel we have. An enquiry without a
                    number cannot be answered in thirty seconds. `type="tel"` +
                    `inputMode` raise the numeric keypad on the phones most of this
                    traffic arrives on. The placeholder steers to international
                    format because a local "050…" cannot be resolved to a country
                    without guessing (see Mailer::whatsappLink). */}
                <div>
                  <label htmlFor="whatsapp" className="field-label">{t('contact.formWhatsapp')}</label>
                  <input
                    id="whatsapp"
                    name="whatsapp"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="+971 50 123 4567"
                    required
                    className="input-luxe"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="field-label">{t('contact.formMessage')}</label>
                  <textarea
                    id="message"
                    name="message"
                    rows={message ? 10 : 4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="input-luxe resize-none"
                  />
                </div>

                {/* Honeypot. Positioned off-screen rather than display:none or
                    type="hidden" — both of those are trivially detected by
                    scrapers that read field types. aria-hidden + tabindex="-1"
                    keep assistive tech and keyboard users away from it, and the
                    name matches no browser autofill heuristic. */}
                <div aria-hidden="true" className="absolute -left-[9999px] top-0 h-0 w-0 overflow-hidden">
                  <label htmlFor="hp_note">Do not fill this in</label>
                  <input id="hp_note" name="hp_note" type="text" tabIndex={-1} autoComplete="off" />
                </div>

                {liveEndpoint && (
                  <div className="cf-turnstile" data-sitekey={TURNSTILE_SITE_KEY} data-theme="dark" />
                )}

                {/* Every other route on this site works fully with JavaScript
                    disabled — that is the hard gate. This form cannot: the
                    endpoint requires a Turnstile token, which requires script.
                    Rather than let it fail confusingly, say so and give the two
                    channels that do work without script. Both are plain anchors
                    in the prerendered HTML. */}
                <noscript>
                  <div className="border-s-2 border-gold/60 ps-5">
                    <p className="text-bone-300 leading-relaxed max-w-md">
                      {t('contact.noScriptBody')}
                    </p>
                    <p className="mt-3">
                      <a href={`mailto:${email}`} className="text-gold hover:underline">
                        {email}
                      </a>
                      {' · '}
                      <a
                        href={whatsappHref(SITE_PREFILLS.contact)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gold hover:underline"
                      >
                        {t('contact.whatsappCta')}
                      </a>
                    </p>
                  </div>
                </noscript>

                {status === 'error' && (
                  <div className="border-s-2 border-gold/60 ps-5">
                    <p className="font-serif text-2xl text-bone-100">
                      {t('contact.formErrorTitle')}
                    </p>
                    <p className="mt-2 text-bone-300 leading-relaxed max-w-md">{errorBody}</p>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                  <Button type="submit">
                    {status === 'submitting' ? t('contact.formSubmitting') : t('contact.formSubmit')}
                  </Button>
                  <a
                    href={whatsappHref(SITE_PREFILLS.contact)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-bone-300 hover:text-gold transition-colors"
                    onClick={() => trackWhatsAppClick({ placement: 'contact-section' })}
                  >
                    <MessageCircle size={16} />
                    <span>{t('contact.whatsappCta')}</span>
                  </a>
                </div>
              </form>
            )}
          </div>
        </Reveal>

        {/* details */}
        <Reveal delay={0.15}>
          <div className="border-s border-white/5 ps-10 lg:ps-16 space-y-12">
            <div className="eyebrow">{t('contact.detailsEyebrow')}</div>

            <div className="flex gap-4">
              <MapPin size={18} className="mt-1 shrink-0 text-gold" />
              <div>
                <div className="text-sm uppercase tracking-luxe text-bone-500">{t('contact.officeGulfLabel')}</div>
                {/* Rendered from `src/data/nap.ts` (confirmed 2026-08-05,
                    OQ #1/#8) — never retyped, so footer, this page, the
                    location page and the JSON-LD stay character-identical. */}
                <address className="mt-2 not-italic font-serif text-2xl leading-snug">
                  {NAP_ADDRESS_LINE}
                </address>
                <div className="mt-2 text-sm text-bone-500">{SHOWROOM_VISIT_POLICY}</div>
              </div>
            </div>

            <div className="flex gap-4">
              <Mail size={18} className="mt-1 shrink-0 text-gold" />
              <div>
                <div className="text-sm uppercase tracking-luxe text-bone-500">{t('contact.emailLabel')}</div>
                <a
                  href={`mailto:${email}`}
                  className="mt-2 block font-serif text-2xl hover:text-gold transition-colors"
                  onClick={() => trackEmailClick({ placement: 'contact-section', destination: email })}
                >
                  {email}
                </a>
              </div>
            </div>

            <div className="flex gap-4">
              <MessageCircle size={18} className="mt-1 shrink-0 text-gold" />
              <div>
                <div className="text-sm uppercase tracking-luxe text-bone-500">WhatsApp</div>
                <a
                  href={whatsappHref(SITE_PREFILLS.contact)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 block font-serif text-2xl hover:text-gold transition-colors"
                  onClick={() => trackWhatsAppClick({ placement: 'contact-section' })}
                >
                  {t('contact.whatsappCta')}
                </a>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
