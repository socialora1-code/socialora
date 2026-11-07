import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto'

export const TELEGRAM_COOKIE = 'socialora_telegram_invite'
export const SESSION_SECONDS = 90 * 24 * 60 * 60
export const GROUP_URL = 'https://t.me/+Rl8KWCbkQoJiODQ0'

export function telegramEnabled() {
  return process.env.FREE_VIEWS_TELEGRAM_ENABLED === 'true'
}

export function inviteSecret() {
  const secret = process.env.FREE_VIEWS_TELEGRAM_BOT_TOKEN
  if (!secret) throw new Error('Telegram invitation is not configured')
  return secret
}

// This receipt records an invitation click, NOT Telegram identity or membership.
export function createInviteReceipt(secret: string, now = Math.floor(Date.now() / 1000)) {
  const value = `${randomBytes(16).toString('hex')}.${now + SESSION_SECONDS}`
  return `${value}.${createHmac('sha256', secret).update(`invite:${value}`).digest('hex')}`
}

export function hasInviteReceipt(cookie: string | undefined, secret: string, now = Math.floor(Date.now() / 1000)) {
  if (!cookie || cookie.length > 160) return false
  const [nonce, expiry, signature, extra] = cookie.split('.')
  if (extra || !/^[a-f0-9]{32}$/.test(nonce ?? '') || !/^\d{10}$/.test(expiry ?? '') || !/^[a-f0-9]{64}$/.test(signature ?? '')) return false
  if (Number(expiry) <= now || Number(expiry) > now + SESSION_SECONDS + 30) return false
  const expected = createHmac('sha256', secret).update(`invite:${nonce}.${expiry}`).digest()
  return timingSafeEqual(expected, Buffer.from(signature, 'hex'))
}

export function sameOrigin(request: Request) {
  return request.headers.get('origin') === new URL(request.url).origin
}
