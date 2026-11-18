import { timingSafeEqual } from 'node:crypto'
import { NextResponse } from 'next/server'
import { buildApprovalUrl, createApprovalToken } from '@/lib/approval'
import { getInboxAddress, renderTableEmail, sendEmail } from '@/lib/email'
import { claimNotification, getOrder, releaseNotification } from '@/lib/pay-store'
import { SITE } from '@/lib/site'

const APPROVAL_VALID_MS = 14 * 24 * 60 * 60 * 1000

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams
  const reference = query.get('ref') ?? ''
  const token = query.get('token') ?? ''
  if (!/^SO-[A-Z2-9]{8}$/.test(reference) || !/^[0-9a-f]{64}$/.test(token)) {
    return NextResponse.json({ ok: false }, { status: 400 })
  }

  const order = await getOrder(reference)
  const card = order?.cardPayment
  if (!order || !card || !card.callbackToken || !card.payoutWallet || !timingSafeEqual(Buffer.from(token, 'hex'), Buffer.from(card.callbackToken, 'hex'))) {
    return NextResponse.json({ ok: false }, { status: 403 })
  }

  const transaction = query.get('txid_out') ?? ''
  const currency = query.get('coin') ?? ''
  const amount = query.get('value_coin') ?? ''
  if (!/^0x[0-9a-f]{64}$/i.test(transaction) || !/^[a-z0-9_/-]{2,24}$/i.test(currency) ||
      !/^\d{1,16}(?:\.\d{1,18})?$/.test(amount) || Number(amount) <= 0) {
    return NextResponse.json({ ok: false }, { status: 400 })
  }

  const notification = `${reference}:card:${transaction.toLowerCase()}`
  if (!(await claimNotification(notification))) return NextResponse.json({ ok: true })

  try {
    const approvalToken = order.panelServiceId
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
    const review = renderTableEmail(
      `Verify card payment ${reference}`,
      [
        ['Order reference', reference],
        ['Service', order.serviceName],
        ['Package', order.packageName],
        ['Quantity', String(order.quantity)],
        ['Profile / post URL', order.link],
        ['Customer email', order.email],
        ['Order total', `${order.amount} USD`],
        ['Reported payout', `${amount} ${currency}`],
        ['Payout transaction', transaction],
        ['Payout wallet', card.payoutWallet],
        ['Card2Crypto tracking ID', card.trackingId ?? 'Unavailable'],
      ],
      'Match this order with the Card2Crypto payment record. Confirm the full order amount and verify the on-chain payout to your wallet before approving. Do not approve a partial or unverified payment.',
      approvalToken ? { label: 'Approve after verification', url: buildApprovalUrl(SITE.url, approvalToken) } : undefined,
    )
    const sent = await sendEmail({
      to: getInboxAddress(),
      subject: `VERIFY CARD PAYMENT ${reference} — ${order.amount} USD`,
      html: review.html,
      text: review.text,
      replyTo: order.email,
      idempotencyKey: notification,
    })
    if (!sent.ok) throw new Error('Card payment review could not be sent')
    return NextResponse.json({ ok: true })
  } catch (error) {
    await releaseNotification(notification).catch(() => undefined)
    console.error('[card2crypto] Payment review notification failed', error instanceof Error ? error.message : error)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
