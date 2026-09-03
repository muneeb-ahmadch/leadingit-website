import { useEffect, useRef, useState, type FormEvent } from 'react';
import { trackFormSubmit } from '@/lib/analytics';
import {
  TURNSTILE_SCRIPT_SRC,
  isTurnstileConfigured,
} from '@/lib/turnstile';

/**
 * The enquiry submission pipeline, shared by every surface that posts to
 * `/api/enquiry.php`.
 *
 * Extracted from `Contact.tsx` when the first campaign landing page needed the
 * identical behaviour. Two copies of this logic would have been two places to
 * fix a spam-guard bug, and the endpoint's contract (the time trap, the
 * Turnstile token name, the honest `mailto` fallback, the rule that success is
 * set only after the server says so) is exactly the kind of thing that drifts
 * when duplicated. The *markup* is deliberately NOT here — the dark contact
 * page and the light campaign pages look nothing alike and should not be
 * forced through one component.
 */

/**
 * Submission outcome. `mailto` is its own terminal state and is NOT a success:
 * it means a draft was handed to the visitor's mail client and they still have
 * to press send. Collapsing it into `sent` is the exact dishonesty the contact
 * page has always refused.
 */
export type EnquiryStatus = 'idle' | 'submitting' | 'sent' | 'mailto' | 'error';

/** Machine-readable failure kinds, mirroring /api/enquiry.php's `status` field. */
export type EnquiryErrorKind = 'error' | 'rate_limited' | 'stale' | 'captcha' | 'invalid';

export type UseEnquiryFormOptions = {
  /** Reported to GA4 as `form_name`. One value per surface, so the funnel is separable. */
  formName: string;
  /** Address the `mailto` fallback composes to when Turnstile is unconfigured. */
  fallbackEmail: string;
  /**
   * Campaign context, e.g. `via the consultation page · ad: T2-07`. Sent as its
   * OWN field and never mixed into the message.
   *
   * It used to be appended to the message body to avoid a server-side schema
   * change. That was wrong, and a live end-to-end test is what exposed it: the
   * acknowledgement email quotes the visitor's message back to them, so every
   * enquirer was shown our internal ad tracking — "campaign: consultation ·
   * ad: T2-07". Internal attribution must never be visible to the person who
   * filled in the form.
   */
  sourceNote?: string;
};

export function useEnquiryForm({ formName, fallbackEmail, sourceNote }: UseEnquiryFormOptions) {
  const [status, setStatus] = useState<EnquiryStatus>('idle');
  const [errorKind, setErrorKind] = useState<EnquiryErrorKind>('error');
  const [reference, setReference] = useState('');

  /*
   * Time-trap: captured once on mount and submitted unchanged, so the server can
   * reject a submission that arrives faster than a human could type one
   * (public/api/lib/Spam.php owns the bounds). Necessarily empty in prerendered
   * HTML — `Date.now()` has no meaning at build time — which the server handles:
   * a missing `form_ts` is a 400 `invalid`, never a silent pass.
   */
  const [formTs, setFormTs] = useState('');
  useEffect(() => {
    setFormTs(String(Date.now()));
  }, []);

  /*
   * Submitting unmounts the form, including the button that had focus, which
   * would drop focus to <body> and leave a keyboard or screen-reader user with
   * no position on the page. Focus moves to the result panel instead. The
   * aria-live region announces the outcome either way; this is about where the
   * user *is* afterwards, which live regions do not fix.
   */
  const resultRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (status === 'sent' || status === 'mailto') resultRef.current?.focus();
  }, [status]);

  const liveEndpoint = isTurnstileConfigured();

  // Turnstile's script is loaded only when a key exists, so a page makes no
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

  /**
   * Composes a real email draft in the visitor's own mail client. Kept
   * deliberately: `/api/enquiry.php` REQUIRES a Turnstile token, so with no site
   * key every POST would be rejected, and a form guaranteed to fail is worse
   * than one that works differently. It never claims the message was sent.
   */
  const submitViaMailto = (data: FormData) => {
    const name = String(data.get('name') ?? '').trim();
    const whatsapp = String(data.get('whatsapp') ?? '').trim();
    const body = String(data.get('message') ?? '').trim();
    const subject = `Website enquiry${name ? ` — ${name}` : ''}${whatsapp ? ` (${whatsapp})` : ''}`;
    // No campaign context here on purpose: this composes a draft in the
    // VISITOR'S own mail client, so anything added is something they read.
    const composed = `${body}\n\n— ${name}${whatsapp ? `\nWhatsApp: ${whatsapp}` : ''}`;
    window.location.href =
      `mailto:${fallbackEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(composed)}`;
    setStatus('mailto');
  };

  /**
   * Posts to the hardened endpoint. The success state is set ONLY after the
   * server has answered 200 — never optimistically, never on click. If the
   * server could not deliver the enquiry it answers 502 and the caller shows the
   * failure plus the channels that do work, because a submission sitting in a
   * log file nobody watches is not a delivered enquiry.
   */
  const submitViaEndpoint = async (form: HTMLFormElement, data: FormData) => {
    setStatus('submitting');

    const payload = {
      name: String(data.get('name') ?? ''),
      email: String(data.get('email') ?? ''),
      whatsapp: String(data.get('whatsapp') ?? ''),
      message: String(data.get('message') ?? ''),
      source: sourceNote ?? '',
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
        trackFormSubmit({ form_name: formName, status: 'success' });
        form.reset();
        return;
      }

      const kind: EnquiryErrorKind =
        body.status === 'rate_limited' ||
        body.status === 'stale' ||
        body.status === 'captcha' ||
        body.status === 'invalid'
          ? body.status
          : 'error';

      setErrorKind(kind);
      setStatus('error');
      trackFormSubmit({
        form_name: formName,
        status: kind === 'rate_limited' ? 'rate_limited' : 'error',
      });
    } catch {
      // Network failure, offline, request blocked. The enquiry did not reach us
      // and the visitor is told so.
      setErrorKind('error');
      setStatus('error');
      trackFormSubmit({ form_name: formName, status: 'error' });
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Guard rather than disabling the button: the `Button` primitive takes no
    // `disabled` prop, and adding one to a shared primitive is a wider change
    // than this needs. A double-click therefore cannot fire two POSTs.
    if (status === 'submitting') return;
    const form = e.currentTarget;
    const data = new FormData(form);
    if (liveEndpoint) {
      void submitViaEndpoint(form, data);
    } else {
      submitViaMailto(data);
    }
  };

  return { status, errorKind, reference, formTs, liveEndpoint, resultRef, handleSubmit };
}
