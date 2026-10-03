import { Resend } from 'resend'
import { SITE } from '@/lib/site'

/**
 * Server-only email helper. Never import this from a client component —
 * it reads RESEND_API_KEY from the server environment.
 */

export type SendResult = { ok: true; id: string } | { ok: false; reason: 'not_configured' | 'send_failed' }

interface SendEmailInput {
  to: string
  subject: string
  html: string
  text: string
  replyTo?: string
  idempotencyKey?: string
}

let client: Resend | null = null

function getClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return null
  client ??= new Resend(apiKey)
  return client
}

export function getInboxAddress(): string {
  return process.env.ORDER_EMAIL_TO || SITE.supportEmail
}

function getFromAddress(): string {
  return process.env.ORDER_EMAIL_FROM || 'Socialora <onboarding@resend.dev>'
}

export async function sendEmail(input: SendEmailInput): Promise<SendResult> {
  const resend = getClient()
  if (!resend) {
    console.error('[email] RESEND_API_KEY is not configured.')
    return { ok: false, reason: 'not_configured' }
  }

  try {
    const { data, error } = await resend.emails.send(
      {
        from: getFromAddress(),
        to: input.to,
        subject: input.subject,
        html: input.html,
        text: input.text,
        replyTo: input.replyTo,
      },
      input.idempotencyKey ? { idempotencyKey: input.idempotencyKey } : undefined,
    )
    if (error || !data?.id) {
      console.error('[email] Resend rejected the message:', error?.name, error?.message)
      return { ok: false, reason: 'send_failed' }
    }
    return { ok: true, id: data.id }
  } catch (err) {
    console.error('[email] Unexpected error while sending:', err instanceof Error ? err.message : err)
    return { ok: false, reason: 'send_failed' }
  }
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/** Renders a simple, email-client-safe key/value table. */
export function renderTableEmail(title: string, rows: [string, string][], footer?: string): {
  html: string
  text: string
} {
  const htmlRows = rows
    .map(
      ([label, value]) =>
        `<tr><td style="padding:10px 12px;border-bottom:1px solid #e7e7ef;color:#6b6b80;font-size:13px;white-space:nowrap;vertical-align:top">${escapeHtml(label)}</td><td style="padding:10px 12px;border-bottom:1px solid #e7e7ef;color:#16161f;font-size:14px;word-break:break-all">${escapeHtml(value).replace(/\n/g, '<br>')}</td></tr>`,
    )
    .join('')

  const html = `<!doctype html><html><body style="margin:0;padding:24px;background:#f6f6fa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif"><div style="max-width:600px;margin:0 auto;background:#ffffff;border:1px solid #e7e7ef;border-radius:12px;overflow:hidden"><div style="padding:20px 24px;border-bottom:1px solid #e7e7ef"><div style="font-size:13px;color:#5b4fd6;font-weight:600;letter-spacing:.02em">SOCIALORA</div><h1 style="margin:6px 0 0;font-size:18px;color:#16161f">${escapeHtml(title)}</h1></div><table role="presentation" style="width:100%;border-collapse:collapse">${htmlRows}</table>${footer ? `<p style="padding:16px 24px;margin:0;color:#6b6b80;font-size:13px;line-height:1.5">${escapeHtml(footer)}</p>` : ''}</div></body></html>`

  const text = `${title}\n\n${rows.map(([l, v]) => `${l}: ${v}`).join('\n')}${footer ? `\n\n${footer}` : ''}`

  return { html, text }
}
