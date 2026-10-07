import { NextResponse } from 'next/server'
import { buildApprovalUrl, createApprovalToken } from '@/lib/approval'
import { getInboxAddress, renderTableEmail, sendEmail } from '@/lib/email'
import { claimNotification, getOrder, releaseNotification, verifyIpnSignature } from '@/lib/pay-store'
import { SITE } from '@/lib/site'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const APPROVAL_VALID_MS = 14 * 24 * 60 * 60 * 1000

export async function POST(request) {
  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 })
  }

  const signature = request.headers.get('x-nowpayments-sig')
  if (!verifyIpnSignature(body, signature)) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }

  if (body.payment_status !== 'finished') {
    return NextResponse.json({ ok: true })
  }

  const reference = String(body.order_id || '')
  const order = await getOrder(reference)
  if (!order) {
    console.error('[webhook] Order not found:', reference)
    return NextResponse.json({ ok: true })
  }

  const claimed = await claimNotification(reference)
  if (!claimed) {
    return NextResponse.json({ ok: true })
  }

  try {
    const token = order.panelServiceId
      ? createApprovalToken({
          ref: order.reference,
          service: order.panelServiceId,
          link: order.link,
          quantity: order.quantity,
          email: order.email,
          name: order.serviceName,
          amount: order.amount,
          exp: Date.now() + APPROVAL_VALID_MS,
        })
      : null
    const approvalUrl = token ? buildApprovalUrl(SITE.url, token) : null

    const mail = renderTableEmail(
      `Payment confirmed ${order.reference}`,
      [
        ['Order reference', order.reference],
        ['Status', 'Payment confirmed (NOWPayments)'],
        ['Service', order.serviceName],
        ['Package', order.packageName],
        ['Quantity', String(order.quantity)],
        ['Profile / post URL', order.link],
        ['Customer email', order.email],
        ['Order amount', `${order.amount} USD`],
      ],
      'Payment was confirmed automatically. You can approve the order with the button.',
      approvalUrl ? { label: 'Approve & send to panel', url: approvalUrl } : undefined,
    )

    const sent = await sendEmail({
      to: getInboxAddress(),
      subject: `PAID ${order.reference} — ${order.serviceName} · ${order.amount}`,
      html: mail.html,
      text: mail.text,
      replyTo: order.email,
      idempotencyKey: `paid-${order.reference}`,
    })

    if (!sent.ok) {
      await releaseNotification(reference)
      return NextResponse.json({ ok: false }, { status: 500 })
    }
  } catch (err) {
    console.error('[webhook] Failed:', err instanceof Error ? err.message : err)
    await releaseNotification(reference)
    return NextResponse.json({ ok: false }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
