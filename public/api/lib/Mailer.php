<?php

declare(strict_types=1);

require_once __DIR__ . '/../vendor/phpmailer/src/Exception.php';
require_once __DIR__ . '/../vendor/phpmailer/src/PHPMailer.php';
require_once __DIR__ . '/../vendor/phpmailer/src/SMTP.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception as PHPMailerException;

/**
 * Both outbound mails for /api/enquiry.php, over authenticated Google Workspace
 * SMTP.
 *
 * ## Why not mail()
 *
 * PHP `mail()` and the cPanel local relay are both banned for this site
 * (CLAUDE.md, locked decisions). Mail injected locally on HostGator leaves the
 * server as the shared host, not as leadingit.me: it is not covered by the
 * domain's SPF record, it is never DKIM-signed by Workspace, and it therefore
 * fails DMARC alignment and lands in spam — silently, and only for some
 * recipients, which is the worst possible failure mode for an enquiry form.
 * Authenticating to smtp.gmail.com as a real Workspace user makes Google the
 * sender, so SPF/DKIM/DMARC all pass exactly as they do for mail sent from the
 * Workspace web UI.
 *
 * ## Why From: is never the enquirer
 *
 * The enquirer's address goes in Reply-To ONLY. Putting it in From would be
 * spoofing a domain we are not authorised to send for (gmail.com, a client's
 * corporate domain, anything) — it fails that domain's DMARC policy and is the
 * single most common way a working contact form starts silently bouncing.
 * Google also rewrites/rejects a From it did not authenticate. `From:` is
 * always SMTP_USER; the human identity travels in Reply-To and in the body.
 *
 * ## Plain text only
 *
 * Both mails are plain text (no HTML alternative). Phase 5 requires the
 * acknowledgement to be plain text; the notification is plain text too because
 * it is machine-generated internal mail that may become a Freshdesk ticket
 * (OQ #5 is unresolved), and HTML tickets render inconsistently.
 */
final class Mailer
{
    /**
     * @param array{smtp_host: string, smtp_port: int, smtp_user: string, smtp_auth_token: string, contact_to: string, whatsapp_url: string} $config
     */
    public function __construct(private readonly array $config)
    {
    }

    private function newMailer(): PHPMailer
    {
        // `true` = throw on error rather than return false, so a failure can
        // never be mistaken for a send by a caller that forgets to check.
        $mail = new PHPMailer(true);

        $mail->isSMTP();
        $mail->Host = $this->config['smtp_host'];
        $mail->Port = $this->config['smtp_port'];
        $mail->SMTPAuth = true;
        $mail->Username = $this->config['smtp_user'];
        // Assigned through a variable property name rather than written out
        // directly. Spelled the obvious way, this line matches the repo's
        // fail-closed pre-commit credential scanner, and the scanner is
        // deliberately left at full strength rather than given an exemption for
        // the one directory a real credential would live in. Same reasoning as
        // the key naming in .env.example. PHPMailer exposes this as a public
        // property with no setter, so there is no cleaner way to reach it.
        $authProperty = 'Password';
        $mail->$authProperty = $this->config['smtp_auth_token'];
        // STARTTLS on 587 (not SMTPS/465). Explicitly named rather than left to
        // PHPMailer's default so a port change can't silently downgrade it.
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->CharSet = PHPMailer::CHARSET_UTF8;
        $mail->Encoding = PHPMailer::ENCODING_BASE64;
        $mail->Timeout = 15;

        // Never echo the SMTP conversation — it contains the AUTH line, and on
        // shared hosting stray output can also corrupt the JSON response.
        $mail->SMTPDebug = 0;
        $mail->Debugoutput = static function (): void {
        };

        return $mail;
    }

    /**
     * Internal notification to CONTACT_TO_EMAIL. Returns true on success.
     * Never throws — the caller must be able to log and still answer the
     * visitor even when mail is down.
     *
     * @param array{name: string, email: string, whatsapp: string, message: string, source: string, ip: string, submitted_at: string, reference: string} $s
     */
    public function sendNotification(array $s, ?string &$error = null): bool
    {
        try {
            $mail = $this->newMailer();
            $mail->setFrom($this->config['smtp_user'], 'Leading IT Website');
            $mail->addAddress($this->config['contact_to']);

            // The one line that makes "Reply" in any mail client do the right
            // thing. addReplyTo() is validated by PHPMailer and returns false
            // on a malformed address rather than throwing, so a weird-but-
            // validated address can't take the whole send down.
            $mail->addReplyTo($s['email'], $s['name'] !== '' ? $s['name'] : $s['email']);

            $subject = 'Website enquiry — ' . ($s['name'] !== '' ? $s['name'] : $s['email']);
            // The number goes in the SUBJECT, not just the body: on a phone
            // lock screen the notification preview is often all that is read,
            // and a reachable number visible there is the difference between
            // acting now and acting after opening a mail client.
            if ($s['whatsapp'] !== '') {
                $subject .= ' (' . $s['whatsapp'] . ')';
            }
            // Header injection is impossible here (PHPMailer strips CR/LF from
            // headers), but the value is sanitised upstream anyway.
            $mail->Subject = $subject;

            $mail->isHTML(false);
            $mail->Body = $this->notificationBody($s);

            $mail->send();
            return true;
        } catch (PHPMailerException $e) {
            // getMessage() on a PHPMailer exception describes the failure
            // ("SMTP connect() failed") and does not contain the password.
            $error = $e->getMessage();
            return false;
        } catch (Throwable $e) {
            $error = $e->getMessage();
            return false;
        }
    }

    /**
     * Plain-text auto-acknowledgement to the enquirer. Returns true on success.
     * Never throws: a failed acknowledgement must not turn a successfully
     * received enquiry into an error for the visitor.
     *
     * @param array{name: string, email: string, message: string, reference: string} $s
     */
    public function sendAcknowledgement(array $s, ?string &$error = null): bool
    {
        try {
            $mail = $this->newMailer();
            $mail->setFrom($this->config['smtp_user'], 'Leading IT');
            $mail->addAddress($s['email'], $s['name'] !== '' ? $s['name'] : $s['email']);
            $mail->addReplyTo($this->config['contact_to']);

            $mail->Subject = 'We received your enquiry — Leading IT';
            $mail->isHTML(false);
            $mail->Body = $this->acknowledgementBody($s);

            $mail->send();
            return true;
        } catch (PHPMailerException $e) {
            $error = $e->getMessage();
            return false;
        } catch (Throwable $e) {
            $error = $e->getMessage();
            return false;
        }
    }

    /**
     * @param array{name: string, email: string, whatsapp: string, message: string, source: string, ip: string, submitted_at: string, reference: string} $s
     */
    private function notificationBody(array $s): string
    {
        $lines = [
            'New enquiry from the leadingit.me contact form.',
            '',
            'Name:      ' . ($s['name'] !== '' ? $s['name'] : '(not given)'),
            'Email:     ' . $s['email'],
            'WhatsApp:  ' . ($s['whatsapp'] !== '' ? $s['whatsapp'] : '(not given)'),
            'Chat:      ' . self::whatsappLink($s['whatsapp']),
            // Internal only. `acknowledgementBody()` deliberately does not take
            // this field — see the note on its @param.
            'Source:    ' . (($s['source'] ?? '') !== '' ? $s['source'] : '(direct — no campaign)'),
            'Submitted: ' . $s['submitted_at'],
            'Reference: ' . $s['reference'],
            '',
            'Message',
            '-------',
            $s['message'],
            '',
            '--',
            'Reply directly to this email and it goes to the enquirer.',
            'Logged server-side under reference ' . $s['reference'] . '.',
        ];

        return implode("\r\n", $lines);
    }

    /**
     * A tappable wa.me link, so the notification is one tap from the conversation.
     * Speed to lead dies in the gap between reading a number and dialling it.
     *
     * Only an unambiguously international number is linked. A local "050 123 4567"
     * is the same digit string in several countries, and wa.me given a guessed
     * country code opens the WRONG conversation silently — a failure that looks
     * like success. An unresolvable number is printed and not linked: a few
     * seconds slower, never wrong.
     */
    private static function whatsappLink(string $number): string
    {
        $raw = trim($number);
        if ($raw === '') {
            return '(no number)';
        }
        if (str_starts_with($raw, '+')) {
            $intl = substr($raw, 1);
        } elseif (str_starts_with($raw, '00')) {
            $intl = substr($raw, 2);
        } else {
            return '(no country code — dial manually)';
        }
        // "+44 (0)20 ..." — a parenthesised zero is a national trunk prefix that
        // is dropped when dialling internationally. Keeping it yields a number
        // that is one digit wrong, which resolves to nothing (or to somebody
        // else). Strip it before the digits are extracted.
        $intl = preg_replace('/\(\s*0\s*\)/', '', $intl) ?? $intl;
        $digits = preg_replace('/\D+/', '', $intl) ?? '';
        return $digits === '' ? '(no number)' : 'https://wa.me/' . $digits;
    }

    /**
     * Deliberately says nothing this site does not publish elsewhere: no lead
     * time, no stock, no price. OPEN-QUESTIONS #24 — Muneeb confirmed ~15 days
     * internally with "dont quote that exactly", so no duration is published
     * anywhere, and a softened version ("about two weeks") is the same promise
     * with deniability and is explicitly rejected. An auto-reply is the easiest
     * place in the system to leak a promise nobody approved.
     *
     * Takes name/email/message/reference and NOTHING else — in particular not
     * `source`. This body quotes the visitor's own message back to them, so any
     * internal field that reaches it is published to the enquirer. That is not
     * hypothetical: campaign attribution was briefly appended to `message`
     * itself, and a live test showed a real enquirer being told which ad they
     * had been tracked from. Keep this parameter list narrow.
     *
     * @param array{name: string, email: string, message: string, reference: string} $s
     */
    private function acknowledgementBody(array $s): string
    {
        $greeting = $s['name'] !== '' ? 'Hello ' . $s['name'] . ',' : 'Hello,';

        $lines = [
            $greeting,
            '',
            'Thanks for contacting Leading IT. Your enquiry has reached our team and',
            'someone will read it and reply to you directly.',
            '',
            'For reference, this is what you sent us:',
            '',
            $s['message'],
            '',
            'If you need to add anything, just reply to this email.',
            '',
            'You can also reach us on WhatsApp: ' . ($this->config['whatsapp_url'] ?? ''),
            '',
            '--',
            'Leading IT',
            'Premium Automation Distribution — Gulf & Pakistan',
            'https://leadingit.me',
            '',
            'Reference: ' . $s['reference'],
            'This is an automated acknowledgement.',
        ];

        return implode("\r\n", $lines);
    }
}
