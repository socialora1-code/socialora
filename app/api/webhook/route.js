import { NextResponse } from 'next/server'
import { buildApprovalUrl, createApprovalToken } from '@/lib/approval'
import { getInboxAddress, renderTableEmail, sendEmail } from '@/lib/email'
import { sendInProgressEmail, sendOrderToPanel, sendReferralMails } from '@/lib/fulfil'
import {
  claimNotification,
  claimPanel,
  getOrder,
  releaseNotification,
  releasePanel,
  setPanelOrder,
  verifyIpnSignature,
} from '@/lib/pay-store'
import { SITE } from '@/lib/site'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const APPROVAL_VALID_MS = 14 * 24 * 60 * 60 * 1000

export async function POST(request: Request) {
  let body: Record<string, unknown>
  try {
    body = (await request.json()) as Record<string, unknown>
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
    let panelOrder: string | null = null
    let panelError: string | null = null

    if (!order.panelServiceId) {
      panelError = 'This service has no panel service ID'
    } else {
      const gotPanel = await claimPanel(reference)
      if (!gotPanel) {
        // Already sent (or being sent) earlier, for example by a retry.
        return NextResponse.json({ ok: true })
      }
      const result = await sendOrderToPanel({
        service: order.panelServiceId,
        link: order.link,
        quantity: order.quantity,
      })
      if (result.ok) {
        panelOrder = result.order
        await setPanelOrder(reference, result.order).catch(() => undefined)
      } else {
        panelError = result.error
        await releasePanel(reference).catch(() => undefined)
      }
    }

    if (panelOrder) {
      // Order is on its way. Mail problems below must never cause a second panel order.
      await sendInProgressEmail({
        reference: order.reference,
        name: order.serviceName,
        quantity: order.quantity,
        link: order.link,
        email: order.email,
      })

      if (order.referral) {
        await sendReferralMails(order.referral, {
          reference: order.reference,
          serviceName: order.serviceName,
          amount: order.amount,
          priceCents: order.priceCents,
        })
      }

      const info = renderTableEmail(
        `Paid and sent ${order.reference}`,
        [
          ['Order reference', order.reference],
          ['Status', 'Payment confirmed (NOWPayments), sent to panel automatically'],
          ['Panel order number', panelOrder],
          ['Service', order.serviceName],
          ['Package', order.packageName],
          ['Quantity', String(order.quantity)],
          ['Profile / post URL', order.link],
          ['Customer email', order.email],
          ['Order amount', `${order.amount} USD`],
        ],
        'No action needed. The customer was emailed that the order is in progress.',
      )
      await sendEmail({
        to: getInboxAddress(),
        subject: `PAID & SENT ${order.reference} — ${order.serviceName} · ${order.amount}`,
        html: info.html,
        text: info.text,
        replyTo: order.email,
        idempotencyKey: `paid-${order.reference}`,
      })
      return NextResponse.json({ ok: true })
    }

    // Panel did not accept the order: fall back to the manual approve button.
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
          ...(order.referral
            ? {
                rc: order.referral.code,
                rm: order.referral.email,
                rs: order.referral.self,
                cents: order.priceCents,
              }
            : {}),
        })
      : null
    const approvalUrl = token ? buildApprovalUrl(SITE.url, token) : null

    const fallback = renderTableEmail(
      `PAID but NOT sent ${order.reference}`,
      [
        ['Order reference', order.reference],
        ['Status', 'Payment confirmed, but the panel did not accept the order'],
        ['Panel message', panelError ?? 'Unknown'],
        ['Service', order.serviceName],
        ['Package', order.packageName],
        ['Quantity', String(order.quantity)],
        ['Profile / post URL', order.link],
        ['Customer email', order.email],
        ['Order amount', `${order.amount} USD`],
      ],
      'Payment is confirmed. Check the panel balance, then use the button to send the order.',
      approvalUrl ? { label: 'Approve & send to panel', url: approvalUrl } : undefined,
    )
    const sent = await sendEmail({
      to: getInboxAddress(),
      subject: `PAID - ACTION NEEDED ${order.reference} — ${order.serviceName} · ${order.amount}`,
      html: fallback.html,
      text: fallback.text,
      replyTo: order.email,
      idempotencyKey: `paid-${order.reference}`,
    })
    if (!sent.ok) {
      await releaseNotification(reference)
      return NextResponse.json({ ok: false }, { status: 500 })
    }
  } catch (err) {
    console.error('[webhook] Failed:', err instanceof Error ? err.message : err)
    await releaseNotification(reference).catch(() => undefined)
    return NextResponse.json({ ok: false }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
