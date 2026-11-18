import { NextResponse } from 'next/server'
import { buildApprovalUrl, createApprovalToken } from '@/lib/approval'
import { getInboxAddress, renderTableEmail, sendEmail } from '@/lib/email'
import { sendInProgressEmail, sendOrderToPanel, sendReferralMails } from '@/lib/fulfil'
import { verify402paySignature } from '@/lib/pay402'
import {
  claimNotification,
  claimPanel,
  getOrder,
  releaseNotification,
  releasePanel,
  setPanelOrder,
} from '@/lib/pay-store'
import { SITE } from '@/lib/site'
import { saveTrack } from '@/lib/track'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const APPROVAL_VALID_MS = 14 * 24 * 60 * 60 * 1000

export async function POST(request: Request) {
  let rawBody: string
  try {
    rawBody = await request.text()
  } catch {
    return NextResponse.json({ ok: false, error: 'Cannot read body' }, { status: 400 })
  }

  const id = request.headers.get('webhook-id')
  const timestamp = request.headers.get('webhook-timestamp')
  const signature = request.headers.get('webhook-signature')

  if (!verify402paySignature({ id, timestamp, signature }, rawBody)) {
    console.error('[402pay webhook] Invalid signature')
    return NextResponse.json({ ok: false, error: 'Invalid signature' }, { status: 401 })
  }

  let event: Record<string, unknown>
  try {
    event = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400 })
  }

  const eventType = String(event.event || event.type || '')
  if (eventType !== 'payment.succeeded') {
    return NextResponse.json({ ok: true })
  }

  const payment = (event.data || event) as Record<string, unknown>
  const meta = (payment.metadata && typeof payment.metadata === 'object' ? payment.metadata : {}) as Record<string, unknown>
  const reference = String(payment.reference || meta.reference || meta.ref || '')

  if (!reference || !/^SO-[A-Z2-9]{8}$/.test(reference)) {
    console.error('[402pay webhook] Missing or invalid reference:', reference)
    return NextResponse.json({ ok: false, error: 'Invalid reference' }, { status: 400 })
  }

  const order = await getOrder(reference)
  if (!order) {
    console.error('[402pay webhook] Order not found in store:', reference)
    return NextResponse.json({ ok: true })
  }

  const paymentId = String(payment.id || 'succeeded')
  const notificationKey = `${reference}:402pay:${paymentId}`
  const claimed = await claimNotification(notificationKey)
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
      if (gotPanel) {
        const result = await sendOrderToPanel({
          service: order.panelServiceId,
          link: order.link,
          quantity: order.quantity,
          panel: order.panel,
        })
        if (result.ok) {
          panelOrder = result.order
          await setPanelOrder(reference, result.order).catch(() => undefined)
        } else {
          panelError = result.error
          await releasePanel(reference).catch(() => undefined)
        }
      }
    }

    if (panelOrder) {
      await saveTrack({
        reference: order.reference,
        email: order.email,
        panelOrder,
        serviceName: order.serviceName,
        quantity: order.quantity,
        link: order.link,
        panel: order.panel,
      })

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
        `Paid & sent ${order.reference}`,
        [
          ['Order reference', order.reference],
          ['Status', 'Payment confirmed (402pay), sent to panel automatically'],
          ['402pay Payment ID', paymentId],
          ['Panel order number', panelOrder],
          ['Service', order.serviceName],
          ['Package', order.packageName],
          ['Quantity', String(order.quantity)],
          ['Profile / post URL', order.link],
          ['Customer email', order.email],
          ['Order total', `${order.amount} USD`],
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

    const token = order.panelServiceId
      ? createApprovalToken({
          ref: order.reference,
          service: order.panelServiceId,
          link: order.link,
          quantity: order.quantity,
          email: order.email,
          name: order.serviceName,
          amount: order.amount,
          panel: order.panel,
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
      `PAID (402pay) but NOT sent ${order.reference}`,
      [
        ['Order reference', order.reference],
        ['Status', 'Payment confirmed via 402pay, NOT sent to panel'],
        ['Reason', panelError ?? 'Panel submission needs manual action'],
        ['402pay Payment ID', paymentId],
        ['Service', order.serviceName],
        ['Package', order.packageName],
        ['Quantity', String(order.quantity)],
        ['Profile / post URL', order.link],
        ['Customer email', order.email],
        ['Order total', `${order.amount} USD`],
      ],
      'Payment was received and verified through 402pay. The panel rejected or was not configured for this service. Review and click below to send to panel manually.',
      approvalUrl ? { label: 'Approve & send to panel', url: approvalUrl } : undefined,
    )
    await sendEmail({
      to: getInboxAddress(),
      subject: `PAID (402pay) ACTION REQUIRED: ${order.reference} — ${order.amount} USD`,
      html: fallback.html,
      text: fallback.text,
      replyTo: order.email,
      idempotencyKey: `paid-action-${order.reference}`,
    })
    return NextResponse.json({ ok: true })
  } catch (error) {
    await releaseNotification(notificationKey).catch(() => undefined)
    console.error('[402pay webhook] Processing error:', error instanceof Error ? error.message : error)
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 })
  }
}
