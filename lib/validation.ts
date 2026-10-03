import {
  getPaymentMethod,
  getPlatform,
  getPriceCents,
  getService,
  getTier,
  isTiered,
  type PaymentMethod,
  type Platform,
  type Service,
  type Tier,
} from '@/lib/catalog'

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export function isValidEmail(value: string): boolean {
  return value.length <= 254 && EMAIL_PATTERN.test(value)
}

const USERNAME_PATTERN = /^@?[A-Za-z0-9._-]{1,60}$/
const LOOKS_LIKE_URL = /^(https?:\/\/|www\.)|\/|(instagram|instagr|tiktok|youtube|youtu)\.(com|am|be)/i

/**
 * Accepts either a full public URL on the platform's domain or a plain
 * username / handle. Returns a normalized value or null when invalid.
 */
export function normalizeProfile(platform: Platform, raw: string): string | null {
  const value = raw.trim()
  if (value.length < 2 || value.length > 300) return null

  if (!LOOKS_LIKE_URL.test(value)) {
    return USERNAME_PATTERN.test(value) ? (value.startsWith('@') ? value : `@${value}`) : null
  }

  let url: URL
  try {
    url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`)
  } catch {
    return null
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return null
  if (url.username || url.password) return null

  const host = url.hostname.toLowerCase()
  const allowed = platform.allowedHosts.some((h) => host === h || host.endsWith(`.${h}`))
  if (!allowed) return null

  url.protocol = 'https:'
  return url.toString()
}

export interface ValidatedOrder {
  platform: Platform
  service: Service
  tier: Tier | null
  quantity: number
  priceCents: number
  profile: string
  email: string
  paymentMethod: PaymentMethod
  transactionId: string | null
}

export type FieldErrors = Partial<
  Record<
    | 'platform'
    | 'service'
    | 'tier'
    | 'quantity'
    | 'profile'
    | 'email'
    | 'paymentMethod'
    | 'transactionId'
    | 'acceptTerms',
    string
  >
>

type Result<T> = { ok: true; value: T } | { ok: false; errors: FieldErrors }

function str(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

export function validateOrder(input: unknown): Result<ValidatedOrder> {
  const body = (input && typeof input === 'object' ? input : {}) as Record<string, unknown>
  const errors: FieldErrors = {}

  const platform = getPlatform(str(body.platform))
  if (!platform) {
    return { ok: false, errors: { platform: 'Please choose a valid platform.' } }
  }

  const service = getService(platform, str(body.service))
  if (!service) {
    return { ok: false, errors: { service: 'Please choose a valid service for this platform.' } }
  }

  let tier: Tier | null = null
  if (isTiered(service)) {
    tier = getTier(str(body.tier)) ?? null
    if (!tier) errors.tier = 'Please choose a package.'
  } else if (body.tier !== null && body.tier !== undefined && body.tier !== '') {
    errors.tier = 'This service does not use packages.'
  }

  const quantity = typeof body.quantity === 'number' ? body.quantity : Number(str(body.quantity))
  let priceCents: number | null = null
  if (!Number.isInteger(quantity) || quantity <= 0) {
    errors.quantity = 'Please choose a valid quantity.'
  } else if (!errors.tier) {
    priceCents = getPriceCents(service, tier?.id ?? null, quantity)
    if (priceCents === null) errors.quantity = 'This quantity is not available for the selected service.'
  }

  const profile = normalizeProfile(platform, str(body.profile))
  if (!profile) {
    errors.profile = `Please enter a valid public ${platform.name} URL or username.`
  }

  const email = str(body.email).trim().toLowerCase()
  if (!isValidEmail(email)) errors.email = 'Please enter a valid email address.'

  const paymentMethod = getPaymentMethod(str(body.paymentMethod))
  if (!paymentMethod) errors.paymentMethod = 'Please choose a payment method.'

  const rawTx = str(body.transactionId).trim()
  if (rawTx.length > 200 || (rawTx && !/^[A-Za-z0-9:_\-./]+$/.test(rawTx))) {
    errors.transactionId = 'Transaction ID can only contain letters, numbers and common separators.'
  }

  if (body.acceptTerms !== true) {
    errors.acceptTerms = 'Please accept the Terms of Service and Refund Policy.'
  }

  if (Object.keys(errors).length > 0 || priceCents === null || !profile || !paymentMethod) {
    return { ok: false, errors }
  }

  return {
    ok: true,
    value: {
      platform,
      service,
      tier,
      quantity,
      priceCents,
      profile,
      email,
      paymentMethod,
      transactionId: rawTx || null,
    },
  }
}

export interface ValidatedContact {
  name: string
  email: string
  subject: string
  message: string
}

export type ContactFieldErrors = Partial<Record<keyof ValidatedContact, string>>

export function validateContact(
  input: unknown,
): { ok: true; value: ValidatedContact } | { ok: false; errors: ContactFieldErrors } {
  const body = (input && typeof input === 'object' ? input : {}) as Record<string, unknown>
  const errors: ContactFieldErrors = {}

  const name = str(body.name).trim()
  const email = str(body.email).trim().toLowerCase()
  const subject = str(body.subject).trim()
  const message = str(body.message).trim()

  if (name.length < 1 || name.length > 100) errors.name = 'Please enter your name (up to 100 characters).'
  if (!isValidEmail(email)) errors.email = 'Please enter a valid email address.'
  if (subject.length < 2 || subject.length > 150) errors.subject = 'Please enter a subject (up to 150 characters).'
  if (message.length < 10 || message.length > 5000)
    errors.message = 'Please enter a message between 10 and 5,000 characters.'

  if (Object.keys(errors).length > 0) return { ok: false, errors }
  return { ok: true, value: { name, email, subject, message } }
}
