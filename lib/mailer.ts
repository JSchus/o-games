import "server-only";
import { env } from "@/lib/env";

/** Sends plain-text email through Resend's HTTPS API (no SDK). */
export interface Mailer {
  send(mail: { to: string[]; subject: string; text: string }): Promise<void>;
}

class ResendMailer implements Mailer {
  constructor(
    private readonly key: string,
    private readonly from: string,
  ) {}
  async send(mail: { to: string[]; subject: string; text: string }) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${this.key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: this.from, to: mail.to, subject: mail.subject, text: mail.text }),
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { message?: string };
      throw new Error(`Resend ${res.status}: ${body.message ?? "send failed"}`);
    }
  }
}

let override: Mailer | null | undefined;

/** The mailer, or null while RESEND_API_KEY isn't set. */
export function getMailer(): Mailer | null {
  if (override !== undefined) return override;
  const e = env();
  return e.RESEND_API_KEY ? new ResendMailer(e.RESEND_API_KEY, e.IDEAS_EMAIL_FROM) : null;
}

/** Tests only. */
export function setMailerForTests(m: Mailer | null | undefined) {
  override = m;
}
