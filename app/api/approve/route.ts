import { verifyApprovalToken } from '@/lib/approval'
import { escapeHtml } from '@/lib/email'
import { sendInProgressEmail, sendOrderToPanel, sendReferralMails } from '@/lib/fulfil'
import { claimPanel, getPanelOrder, releasePanel, setPanelOrder } from '@/lib/pay-store'
import { saveTrack } from '@/lib/track'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

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

  if (!process.env.SMMWIZ_API_KEY) {
    return page('Panel not configured', 'SMMWIZ_API_KEY is missing in the server settings.', 503)
  }

  let claimed = false
  try {
    claimed = await claimPanel(payload.ref)
  } catch {
    return page('Storage not reachable', 'Could not check the order status. Nothing was ordered. Please try again.', 503)
  }

  if (!claimed) {
    const previous = await getPanelOrder(payload.ref).catch(() => null)
    if (previous && previous !== 'pending') {
      return page(
        'Already sent',
        `Order ${payload.ref} was already sent to the panel (panel order ${previous}). It was not sent again.`,
      )
    }
    return page(
      'Already being sent',
      `Order ${payload.ref} is already being sent to the panel. It was not sent again.`,
    )
  }

  const result = await sendOrderToPanel({
    service: payload.service,
    link: payload.link,
    quantity: payload.quantity,
  })

  if (!result.ok) {
    await releasePanel(payload.ref).catch(() => undefined)
    return page('Panel did not accept the order', `${result.error}. Nothing was ordered.`, 502)
  }

  await setPanelOrder(payload.ref, result.order).catch(() => undefined)

  await saveTrack({
    reference: payload.ref,
    email: payload.email,
    panelOrder: result.order,
    serviceName: payload.name,
    quantity: payload.quantity,
    link: payload.link,
  })

  const emailResult = await sendInProgressEmail({
    reference: payload.ref,
    name: payload.name,
    quantity: payload.quantity,
    link: payload.link,
    email: payload.email,
  })

  if (payload.rc && payload.rm && typeof payload.cents === 'number') {
    await sendReferralMails(
      { code: payload.rc, email: payload.rm, self: Boolean(payload.rs) },
      {
        reference: payload.ref,
        serviceName: payload.name,
        amount: payload.amount,
        priceCents: payload.cents,
      },
    )
  }

  return page(
    'Order sent to panel',
    `Order ${payload.ref} was sent. Panel order number: ${result.order}. ${
      emailResult.ok ? 'The customer was emailed.' : 'The customer email could not be sent, please write to them yourself.'
    } Do not press the button again.`,
  )
}
