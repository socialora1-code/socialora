import { NextResponse } from 'next/server'
import { STANDARD_PACKAGE_NAME } from '@/lib/catalog'
import { getInboxAddress, renderTableEmail, sendEmail } from '@/lib/email'
import { formatQuantity, formatUSD } from '@/lib/format'
import { validateOrder } from '@/lib/validation'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const REFERENCE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

function generateReference(): string {
  const bytes = new Uint8Array(8)
  crypto.getRandomValues(bytes)
  let ref = ''
  for (const b of bytes) ref += REFERENCE_ALPHABET[b % REFERENCE_ALPHABET.length]
  return `SO-${ref}`
}

const SUBMIT_FAILED = "We couldn't submit your order right now. Please try again or contact support."

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
    ],
    'Price recalculated server-side from the catalog. Verify the payment on-chain before fulfilling this order. Reply to this email to contact the customer.',
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
