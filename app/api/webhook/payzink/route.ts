import { NextResponse } from 'next/server'
import { buildApprovalUrl, createApprovalToken } from '@/lib/approval'
import { getInboxAddress, renderTableEmail, sendEmail } from '@/lib/email'
import { claimNotification, getOrder, releaseNotification } from '@/lib/pay-store'
import { isPayzinkPaymentConfirmed, verifyPayzinkSignature } from '@/lib/payzink'
import { SITE } from '@/lib/site'

const APPROVAL_VALID_MS = 14 * 24 * 60 * 60 * 1000

export async function POST(request: Request) {
  const body = await request.text()
  if (!verifyPayzinkSignature(body, request.headers)) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }

  let payload
  try {
    payload = JSON.parse(body)
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 })
  }

  if (payload?.event !== 'PAYMENT.PURCHASED') return NextResponse.json({ ok: true })

  const reference = new URL(request.url).searchParams.get('ref') ?? payload.data?.extra?.orderId
  const paymentReference = payload.data?.reference
  if (typeof reference !== 'string' || !/^SO-[A-Z2-9]{8}$/.test(reference) ||
      typeof paymentReference !== 'string') {
    return NextResponse.json({ ok: false }, { status: 400 })
  }

  const notification = `payzink-paid-${reference}`
  let claimed = false
  try {
    const order = await getOrder(reference)
    if (!order || order.payzinkReference !== paymentReference) {
      return NextResponse.json({ ok: false }, { status: 404 })
    }
    if (!(await isPayzinkPaymentConfirmed(paymentReference, order.priceCents))) {
      return NextResponse.json({ ok: false }, { status: 503 })
    }
    claimed = await claimNotification(notification)
    if (!claimed) return NextResponse.json({ ok: true })

    const token = order.panelServiceId
      ? createApprovalToken({
          ref: reference,
          service: order.panelServiceId,
          link: order.link,
          quantity: order.quantity,
          email: order.email,
          name: order.serviceName,
          amount: order.amount,
          panel: order.panel,
          exp: Date.now() + APPROVAL_VALID_MS,
          ...(order.referral
            ? { rc: order.referral.code, rm: order.referral.email, rs: order.referral.self, cents: order.priceCents }
            : {}),
        })
      : null
    const message = renderTableEmail(
      `Payzink payment confirmed ${reference}`,
      [
        ['Order reference', reference],
        ['Payzink reference', paymentReference],
        ['Service', order.serviceName],
        ['Package', order.packageName],
        ['Quantity', String(order.quantity)],
        ['Profile / post URL', order.link],
        ['Customer email', order.email],
        ['Paid amount', `${order.amount} USD`],
      ],
      'Payzink confirmed the full payment. Review the order and approve it to start delivery.',
      token ? { label: 'Approve & send to panel', url: buildApprovalUrl(SITE.url, token) } : undefined,
    )
    const sent = await sendEmail({
      to: getInboxAddress(),
      subject: `PAYZINK PAID ${reference} — ${order.amount} USD`,
      html: message.html,
      text: message.text,
      replyTo: order.email,
      idempotencyKey: notification,
    })
    if (!sent.ok) throw new Error('Payzink payment notification could not be sent')
    return NextResponse.json({ ok: true })
  } catch (error) {
    if (claimed) await releaseNotification(notification).catch(() => undefined)
    console.error('[payzink] Payment notification failed:', error instanceof Error ? error.message : error)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
