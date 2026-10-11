import { NextResponse } from 'next/server'
import { buildApprovalUrl, createApprovalToken, profileToLink } from '@/lib/approval'
import { STANDARD_PACKAGE_NAME } from '@/lib/catalog'
import { getInboxAddress, renderTableEmail, sendEmail } from '@/lib/email'
import { formatQuantity, formatUSD } from '@/lib/format'
import { createInvoice, saveOrder } from '@/lib/pay-store'
import { COMMISSION_PERCENT, MIN_PAYOUT_USD, normalizeRefCode } from '@/lib/referral'
import { SITE } from '@/lib/site'
import { validateOrder } from '@/lib/validation'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const REFERENCE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
const APPROVAL_VALID_MS = 14 * 24 * 60 * 60 * 1000

function generateReference(): string {
  const bytes = new Uint8Array(8)
  crypto.getRandomValues(bytes)
  let ref = ''
  for (const b of bytes) ref += REFERENCE_ALPHABET[b % REFERENCE_ALPHABET.length]
  return `SO-${ref}`
}

const SUBMIT_FAILED = "We couldn't submit your order right now. Please try again or contact support."

type Referrer = { code: string; email: string; self: boolean }

async function redisGet(key: string): Promise<string | null> {
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return null
  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(['GET', key]),
    cache: 'no-store',
  })
  if (!res.ok) return null
  const data = await res.json()
  return typeof data.result === 'string' ? data.result : null
}

// Never lets a referral problem block an order.
async function lookupReferrer(body: unknown, customerEmail: string): Promise<Referrer | null> {
  try {
    const raw = body && typeof body === 'object' ? (body as Record<string, unknown>).ref : null
    const code = typeof raw === 'string' ? normalizeRefCode(raw) : null
    if (!code) return null
    const email = await redisGet(`ref:code:${code}`)
    if (!email) return null
    return { code, email, self: email.toLowerCase() === customerEmail.trim().toLowerCase() }
  } catch {
    return null
  }
}

async function notifyReferral(
  referrer: Referrer,
  details: { reference: string; serviceName: string; amount: string; priceCents: number; payment: string },
) {
  try {
    const commission = referrer.self
      ? 'None (customer used their own referral code)'
      : `${COMMISSION_PERCENT}% = ${formatUSD(Math.round((details.priceCents * COMMISSION_PERCENT) / 100))} USD`
    const email = renderTableEmail(
      `Referral order ${details.reference}`,
      [
        ['Order reference', details.reference],
        ['Referral code', referrer.code],
        ['Referrer email', referrer.email],
        ['Service', details.serviceName],
        ['Order amount', `${details.amount} USD`],
        ['Commission', commission],
        ['Payment', details.payment],
      ],
      'Pay the commission only after this order is paid and completed.',
    )
    await sendEmail({
      to: getInboxAddress(),
      subject: `Referral order ${details.reference} — code ${referrer.code} · ${details.amount}`,
      html: email.html,
      text: email.text,
      idempotencyKey: `order-referral-${details.reference}`,
    })
  } catch (err) {
    console.error('[order] referral notice failed:', err instanceof Error ? err.message : err)
  }
}

async function notifyReferrer(
  referrer: Referrer,
  details: { reference: string; amount: string; priceCents: number },
) {
  if (referrer.self) return
  try {
    const commissionCents = Math.round((details.priceCents * COMMISSION_PERCENT) / 100)
    const email = renderTableEmail(
      'You have a new referral order',
      [
        ['Referral code', referrer.code],
        ['Order amount', `${details.amount} USD`],
        ['Your commission', `${COMMISSION_PERCENT}% = ${formatUSD(commissionCents)} USD`],
        ['Status', 'Pending payment'],
      ],
      `Someone placed an order using your referral link. Your commission is confirmed once the order is paid and completed. When your total confirmed commission reaches ${formatUSD(MIN_PAYOUT_USD * 100)} USD, email ${SITE.supportEmail} from the email address you registered with to request a payout. Thank you for sharing Socialora.`,
    )
    await sendEmail({
      to: referrer.email,
      subject: `New referral order: ${formatUSD(commissionCents)} commission pending`,
      html: email.html,
      text: email.text,
      replyTo: getInboxAddress(),
      idempotencyKey: `order-referrer-${details.reference}`,
    })
  } catch (err) {
    console.error('[order] referrer email failed:', err instanceof Error ? err.message : err)
  }
}

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request.' }, { status: 400 })
  }

  // Honeypot: real users never fill this hidden field.
  if (body && typeof body === 'object' && (body as Record<string, unknown>).website) {
    return NextResponse.json({ ok: false, error: SUBMIT_FAILED }, { status: 400 })
  }

  const result = validateOrder(body)
  if (!result.ok) {
    return NextResponse.json(
      { ok: false, error: 'Please review the highlighted fields.', fieldErrors: result.errors },
      { status: 422 },
    )
  }

  const order = result.value
  const referrer = await lookupReferrer(body, order.email)
  const reference = generateReference()
  const now = new Date()
  const submittedAt = `${now.toLocaleString('en-US', {
    timeZone: 'America/New_York',
    dateStyle: 'medium',
    timeStyle: 'long',
  })} (${now.toISOString()})`

  const amount = formatUSD(order.priceCents)
  const packageName = order.tier?.name ?? STANDARD_PACKAGE_NAME
  const serviceName = `${order.platform.name} ${order.service.label}`
  const panelServiceId = order.service.panelServiceId
  const link = profileToLink(order.platform.id, order.profile)

  // Automatic crypto payment (NOWPayments)
  if (order.paymentMethod.id === 'nowpayments') {
    try {
      await saveOrder({
        reference,
        panelServiceId: panelServiceId ?? null,
        link,
        quantity: order.quantity,
        email: order.email,
        serviceName,
        packageName,
        amount,
        priceCents: order.priceCents,
      })
      const invoiceUrl = await createInvoice({
        priceCents: order.priceCents,
        reference,
        description: `${serviceName} x ${formatQuantity(order.quantity)}`,
        ipnUrl: `${SITE.url}/api/webhook`,
        successUrl: `${SITE.url}/payment-success`,
        cancelUrl: SITE.url,
      })
      if (!invoiceUrl) {
        return NextResponse.json({ ok: false, error: SUBMIT_FAILED }, { status: 503 })
      }
      if (referrer) {
        await notifyReferral(referrer, {
          reference,
          serviceName,
          amount,
          priceCents: order.priceCents,
          payment: 'Awaiting payment (automatic). Wait for the payment confirmed email.',
        })
        await notifyReferrer(referrer, { reference, amount, priceCents: order.priceCents })
      }
      return NextResponse.json({
        ok: true,
        reference,
        status: 'Awaiting Payment',
        amountCents: order.priceCents,
        paymentMethodId: order.paymentMethod.id,
        invoiceUrl,
        customerEmailSent: false,
      })
    } catch (err) {
      console.error('[order] NOWPayments flow failed:', err instanceof Error ? err.message : err)
      return NextResponse.json({ ok: false, error: SUBMIT_FAILED }, { status: 503 })
    }
  }

  // Manual wallet payment (unchanged)
  const token = panelServiceId
    ? createApprovalToken({
        ref: reference,
        service: panelServiceId,
        link,
        quantity: order.quantity,
        email: order.email,
        name: serviceName,
        amount,
        exp: Date.now() + APPROVAL_VALID_MS,
      })
    : null
  const approvalUrl = token ? buildApprovalUrl(SITE.url, token) : null

  const adminEmail = renderTableEmail(
    `New order ${reference}`,
    [
      ['Order reference', reference],
      ['Status', 'Pending Manual Verification'],
      ['Date / time', submittedAt],
      ['Platform', order.platform.name],
      ['Service', order.service.label],
      ['Package / tier', packageName],
      ['Quantity', formatQuantity(order.quantity)],
      ['Profile / post URL', order.profile],
      ['Customer email', order.email],
      ['Payment method', `${order.paymentMethod.label} (${order.paymentMethod.network})`],
      ['Wallet address', order.paymentMethod.address],
      ['Order amount', `${amount} USD`],
      ['Transaction ID / hash', order.transactionId ?? 'Not provided'],
      ...(referrer
        ? [
            [
              'Referral code',
              `${referrer.code} (${referrer.email})${
                referrer.self
                  ? ' - SELF REFERRAL, no commission'
                  : ` - commission ${COMMISSION_PERCENT}% = ${formatUSD(
                      Math.round((order.priceCents * COMMISSION_PERCENT) / 100),
                    )} USD after payment is confirmed`
              }`,
            ] as [string, string],
          ]
        : []),
    ],
    'Price recalculated server-side from the catalog. Verify the payment on-chain before approving. Use the button only after the payment is confirmed. Reply to this email to contact the customer.',
    approvalUrl ? { label: 'Approve & send to panel', url: approvalUrl } : undefined,
  )

  const adminSend = await sendEmail({
    to: getInboxAddress(),
    subject: `New order ${reference} — ${serviceName} · ${amount}`,
    html: adminEmail.html,
    text: adminEmail.text,
    replyTo: order.email,
    idempotencyKey: `order-${reference}`,
  })

  if (!adminSend.ok) {
    return NextResponse.json({ ok: false, error: SUBMIT_FAILED }, { status: 503 })
  }

  if (referrer) {
    await notifyReferrer(referrer, { reference, amount, priceCents: order.priceCents })
  }

  const customerEmail = renderTableEmail(
    `Your order ${reference} has been submitted`,
    [
      ['Order reference', reference],
      ['Status', 'Pending Manual Verification'],
      ['Service', serviceName],
      ['Package', packageName],
      ['Quantity', formatQuantity(order.quantity)],
      ['Profile / post URL', order.profile],
      ['Order total', `${amount} USD`],
      ['Payment method', order.paymentMethod.label],
      ['Network', order.paymentMethod.network],
      ['Wallet address', order.paymentMethod.address],
      ['Transaction ID / hash', order.transactionId ?? 'Not provided'],
    ],
    `Send the exact order amount to the wallet address above using the ${order.paymentMethod.network} network only. Your order will be reviewed manually after your payment is confirmed. Reply to this email if you have any questions, and include your order reference.`,
  )

  const customerSend = await sendEmail({
    to: order.email,
    subject: `Socialora order ${reference} — payment instructions`,
    html: customerEmail.html,
    text: customerEmail.text,
    replyTo: getInboxAddress(),
    idempotencyKey: `order-customer-${reference}`,
  })

  return NextResponse.json({
    ok: true,
    reference,
    status: 'Pending Manual Verification',
    amountCents: order.priceCents,
    paymentMethodId: order.paymentMethod.id,
    customerEmailSent: customerSend.ok,
  })
}
