import { verifyApprovalToken } from '@/lib/approval'
import { escapeHtml, getInboxAddress, renderTableEmail, sendEmail } from '@/lib/email'
import { formatQuantity } from '@/lib/format'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const PANEL_API_URL = 'https://smmwiz.com/api/v2'

// Best-effort duplicate guard. It resets when the server restarts, so it is not a guarantee.
const alreadySent = new Map<string, string>()

function page(title: string, message: string, status = 200): Response {
  const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex"><title>${escapeHtml(title)}</title></head><body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;max-width:520px;margin:40px auto;padding:0 20px;color:#16161f"><h1 style="font-size:22px">${escapeHtml(title)}</h1><p style="line-height:1.6;color:#4b4b5c">${escapeHtml(message)}</p></body></html>`
  return new Response(html, {
    status,
    headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' },
  })
}

export async function POST(request: Request) {
  const form = await request.formData().catch(() => null)
  const token = form?.get('token')
  const payload = typeof token === 'string' ? verifyApprovalToken(token) : null

  if (!payload) {
    return page('Link not valid', 'This approval link is invalid or has expired.', 400)
  }

  const apiKey = process.env.SMMWIZ_API_KEY
  if (!apiKey) {
    return page('Panel not configured', 'SMMWIZ_API_KEY is missing in the server settings.', 503)
  }

  const previous = alreadySent.get(payload.ref)
  if (previous) {
    return page(
      'Already sent',
      `Order ${payload.ref} was already sent to the panel (panel order ${previous}). It was not sent again.`,
    )
  }

  let result: { order?: number | string; error?: string } | null = null
  try {
    const response = await fetch(PANEL_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        key: apiKey,
        action: 'add',
        service: String(payload.service),
        link: payload.link,
        quantity: String(payload.quantity),
      }),
      cache: 'no-store',
    })
    result = (await response.json()) as { order?: number | string; error?: string }
  } catch {
    return page('Panel not reachable', 'Could not reach the panel. Nothing was ordered. Please try again.', 502)
  }

  if (!result || result.error || !result.order) {
    return page('Panel rejected the order', String(result?.error ?? 'Unknown error. Nothing was ordered.'), 502)
  }

  const panelOrder = String(result.order)
  alreadySent.set(payload.ref, panelOrder)

  const customerEmail = renderTableEmail(
    `Your order ${payload.ref} is in progress`,
    [
      ['Order reference', payload.ref],
      ['Service', payload.name],
      ['Quantity', formatQuantity(payload.quantity)],
      ['Profile / post URL', payload.link],
      ['Status', 'In progress'],
    ],
    'Your payment has been confirmed and your order has been sent for delivery. Reply to this email if you have any questions, and include your order reference.',
  )

  const emailResult = await sendEmail({
    to: payload.email,
    subject: `Socialora order ${payload.ref} is in progress`,
    html: customerEmail.html,
    text: customerEmail.text,
    replyTo: getInboxAddress(),
    idempotencyKey: `order-started-${payload.ref}`,
  })

  return page(
    'Order sent to panel',
    `Order ${payload.ref} was sent. Panel order number: ${panelOrder}. ${
      emailResult.ok ? 'The customer was emailed.' : 'The customer email could not be sent, please write to them yourself.'
    } Do not press the button again.`,
  )
}
