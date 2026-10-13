import { getInboxAddress, renderTableEmail, sendEmail } from '@/lib/email'
import { formatQuantity, formatUSD } from '@/lib/format'
import { getPanelKey, PANELS, type PanelId } from '@/lib/panels'
import { COMMISSION_PERCENT, MIN_PAYOUT_USD } from '@/lib/referral'
import { SITE } from '@/lib/site'

export type ReferralInfo = { code: string; email: string; self: boolean }

export type PanelResult = { ok: true; order: string } | { ok: false; error: string }

export async function sendOrderToPanel(params: {
  service: number
  link: string
  quantity: number
  panel?: PanelId
}): Promise<PanelResult> {
  const panel = params.panel ?? 'smmwiz'
  const apiKey = getPanelKey(panel)
  if (!apiKey) return { ok: false, error: `The API key for ${panel} is missing` }
  try {
    const response = await fetch(PANELS[panel].url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        key: apiKey,
        action: 'add',
        service: String(params.service),
        link: params.link,
        quantity: String(params.quantity),
      }),
      cache: 'no-store',
    })
    const result = (await response.json()) as { order?: number | string; error?: string }
    if (!result || result.error || !result.order) {
      return { ok: false, error: String(result?.error ?? 'Unknown error') }
    }
    return { ok: true, order: String(result.order) }
  } catch {
    return { ok: false, error: 'Panel not reachable' }
  }
}

export async function sendInProgressEmail(details: {
  reference: string
  name: string
  quantity: number
  link: string
  email: string
}) {
  const mail = renderTableEmail(
    `Your order ${details.reference} is in progress`,
    [
      ['Order reference', details.reference],
      ['Service', details.name],
      ['Quantity', formatQuantity(details.quantity)],
      ['Profile / post URL', details.link],
      ['Status', 'In progress'],
    ],
    'Your payment has been confirmed and your order has been sent for delivery. Reply to this email if you have any questions, and include your order reference.',
  )
  return sendEmail({
    to: details.email,
    subject: `Socialora order ${details.reference} is in progress`,
    html: mail.html,
    text: mail.text,
    replyTo: getInboxAddress(),
    idempotencyKey: `order-started-${details.reference}`,
  })
}

// Called only AFTER the payment is confirmed. Never throws.
export async function sendReferralMails(
  referral: ReferralInfo,
  details: { reference: string; serviceName: string; amount: string; priceCents: number },
) {
  const commissionCents = Math.round((details.priceCents * COMMISSION_PERCENT) / 100)
  try {
    const adminMail = renderTableEmail(
      `Referral order ${details.reference}`,
      [
        ['Order reference', details.reference],
        ['Referral code', referral.code],
        ['Referrer email', referral.email],
        ['Service', details.serviceName],
        ['Order amount', `${details.amount} USD`],
        [
          'Commission',
          referral.self
            ? 'None (customer used their own referral code)'
            : `${COMMISSION_PERCENT}% = ${formatUSD(commissionCents)} USD`,
        ],
        ['Payment', 'Confirmed'],
      ],
      'Payment is confirmed. The commission can be paid out once the referrer reaches the minimum payout.',
    )
    await sendEmail({
      to: getInboxAddress(),
      subject: `Referral order ${details.reference} — code ${referral.code} · ${details.amount}`,
      html: adminMail.html,
      text: adminMail.text,
      idempotencyKey: `paid-referral-${details.reference}`,
    })
  } catch (err) {
    console.error('[referral] admin mail failed:', err instanceof Error ? err.message : err)
  }

  if (referral.self) return
  try {
    const referrerMail = renderTableEmail(
      'You have a new referral order',
      [
        ['Referral code', referral.code],
        ['Order amount', `${details.amount} USD`],
        ['Your commission', `${COMMISSION_PERCENT}% = ${formatUSD(commissionCents)} USD`],
        ['Status', 'Payment confirmed'],
      ],
      `Someone placed an order using your referral link and the payment is confirmed. When your total commission reaches ${formatUSD(MIN_PAYOUT_USD * 100)} USD, email ${SITE.supportEmail} from the email address you registered with to request a payout. Thank you for sharing Socialora.`,
    )
    await sendEmail({
      to: referral.email,
      subject: `New referral order: ${formatUSD(commissionCents)} commission earned`,
      html: referrerMail.html,
      text: referrerMail.text,
      replyTo: getInboxAddress(),
      idempotencyKey: `paid-referrer-${details.reference}`,
    })
  } catch (err) {
    console.error('[referral] referrer mail failed:', err instanceof Error ? err.message : err)
  }
}
