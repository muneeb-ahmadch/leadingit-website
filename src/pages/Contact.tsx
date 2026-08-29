import { useEffect, useRef, useState, type FormEvent } from 'react';
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
import { trackFormSubmit, trackWhatsAppClick, trackEmailClick } from '@/lib/analytics';
import {
  TURNSTILE_SITE_KEY,
  TURNSTILE_SCRIPT_SRC,
  isTurnstileConfigured,
} from '@/lib/turnstile';

/**
 * Submission outcome. `mailto` is its own terminal state and is NOT a success:
 * it means a draft was handed to the user's mail client and they still have to
 * press send. Collapsing it into `sent` is the exact dishonesty this page has
 * always refused (see below).
 */
type FormStatus = 'idle' | 'submitting' | 'sent' | 'mailto' | 'error';

/** Machine-readable failure kinds, mirroring /api/enquiry.php's `status` field. */
type ErrorKind = 'error' | 'rate_limited' | 'stale' | 'captcha' | 'invalid';

export function Contact() {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const [status, setStatus] = useState<FormStatus>('idle');
  const [errorKind, setErrorKind] = useState<ErrorKind>('error');
  const [reference, setReference] = useState('');

  // A design serialised from the keypad designer arrives here as ?message=… .
  // The page is prerendered without a query string, so the field starts empty and
  // adopts the incoming message after mount — identical first render either side
  // of hydration.
  const [message, setMessage] = useState('');
  useEffect(() => {
    const incoming = params.get('message');
    if (incoming) setMessage(incoming);
  }, [params]);

  // Time-trap: captured once on mount and submitted unchanged, so the server can
  // reject a submission that arrives faster than a human could type one
  // (public/api/lib/Spam.php owns the bounds).
  //
  // Held in state AND rendered as a hidden input below. The state drives the
  // JSON payload; the input exists so the field is really in the form rather
  // than only in a comment claiming it is. It is necessarily empty in the
  // prerendered HTML — `Date.now()` has no meaning at build time — which the
  // server handles: a missing `form_ts` returns 400 `invalid`, not a silent pass.
  const [formTs, setFormTs] = useState('');
  useEffect(() => {
    setFormTs(String(Date.now()));
  }, []);

  // Submitting unmounts the form, including the button that had focus, which
  // would drop focus to <body> and leave a keyboard or screen-reader user with
  // no position on the page. Focus moves to the result panel instead. The
  // aria-live region announces the outcome either way; this is about where the
  // user *is* afterwards, which live regions do not fix.
  const resultRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (status === 'sent' || status === 'mailto') resultRef.current?.focus();
  }, [status]);

  const liveEndpoint = isTurnstileConfigured();

  // Turnstile's script is loaded only when a key exists, so the page makes no
  // third-party request while the widget is unconfigured.
  useEffect(() => {
    if (!liveEndpoint) return;
    if (document.querySelector(`script[src^="${TURNSTILE_SCRIPT_SRC}"]`)) return;
    const script = document.createElement('script');
    script.src = TURNSTILE_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }, [liveEndpoint]);

  const meta = contactMeta();
  const crumbs = simplePageCrumbs(t('nav.contact'), meta.path);
  const email = t('contact.email');

  /**
   * Composes a real email draft in the visitor's own mail client. This is the
   * pre-Phase-5 behaviour and it is kept deliberately: `/api/enquiry.php`
   * REQUIRES a Turnstile token, so until a site key exists every POST would be
   * rejected. Shipping a form guaranteed to fail would be worse than shipping
   * one that works differently. It never claims the message was sent — the
   * success copy says "One more step" and tells the visitor to press send.
   */
  const submitViaMailto = (data: FormData) => {
    const name = String(data.get('name') ?? '').trim();
    const company = String(data.get('company') ?? '').trim();
    const body = String(data.get('message') ?? '').trim();
    const subject = `Website enquiry${name ? ` — ${name}` : ''}${company ? ` (${company})` : ''}`;
    const composed = `${body}\n\n— ${name}${company ? `, ${company}` : ''}`;
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(composed)}`;
    setStatus('mailto');
  };

  /**
   * Posts to the hardened endpoint. The success state is set ONLY after the
   * server has answered 200 — never optimistically, never on click. If the
   * server could not deliver the enquiry it answers 502 and this shows the
   * failure plus the two channels that do work, because a submission sitting in
   * a log file nobody watches is not a delivered enquiry.
   */
  const submitViaEndpoint = async (form: HTMLFormElement, data: FormData) => {
    setStatus('submitting');

    const payload = {
      name: String(data.get('name') ?? ''),
      email: String(data.get('email') ?? ''),
      company: String(data.get('company') ?? ''),
      message: String(data.get('message') ?? ''),
      hp_note: String(data.get('hp_note') ?? ''),
      form_ts: Number(formTs),
      'cf-turnstile-response': String(data.get('cf-turnstile-response') ?? ''),
    };

    try {
      const res = await fetch('/api/enquiry.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      let body: { status?: string; reference?: string } = {};
      try {
        body = await res.json();
      } catch {
        // A non-JSON body means something upstream of the endpoint answered
        // (a proxy error page, a WAF block). Treated as a generic failure
        // rather than guessed at.
      }

      if (res.ok && body.status === 'success') {
        setReference(body.reference ?? '');
        setStatus('sent');
        trackFormSubmit({ form_name: 'contact', status: 'success' });
        form.reset();
        return;
      }

      const kind: ErrorKind =
        body.status === 'rate_limited' ||
        body.status === 'stale' ||
        body.status === 'captcha' ||
        body.status === 'invalid'
          ? body.status
          : 'error';

      setErrorKind(kind);
      setStatus('error');
      trackFormSubmit({
        form_name: 'contact',
        status: kind === 'rate_limited' ? 'rate_limited' : 'error',
      });
    } catch {
      // Network failure, offline, request blocked. The enquiry did not reach us
      // and the visitor is told so.
      setErrorKind('error');
      setStatus('error');
      trackFormSubmit({ form_name: 'contact', status: 'error' });
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Guard rather than disabling the button: the `Button` primitive takes no
    // `disabled` prop, and adding one to a shared primitive mid-phase is a wider
    // change than this needs. A double-click therefore cannot fire two POSTs.
    if (status === 'submitting') return;
    const form = e.currentTarget;
    const data = new FormData(form);
    if (liveEndpoint) {
      void submitViaEndpoint(form, data);
    } else {
      submitViaMailto(data);
    }
  };

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
                <div>
                  <label htmlFor="company" className="field-label">{t('contact.formCompany')}</label>
                  <input id="company" name="company" type="text" className="input-luxe" />
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
