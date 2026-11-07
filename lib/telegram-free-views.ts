import { createHash, createHmac, timingSafeEqual } from 'node:crypto'

export const TELEGRAM_COOKIE = 'socialora_free_views'
export const SESSION_SECONDS = 90 * 24 * 60 * 60
export const GROUP_USERNAME = 'SocialoraChat'
export const GROUP_URL = 'https://t.me/+Rl8KWCbkQoJiODQ0'
export const BOT_USERNAME = 'socialora_publisher_2026_bot'

export function telegramEnabled() {
  return process.env.FREE_VIEWS_TELEGRAM_ENABLED === 'true'
}

export function botToken() {
  const token = process.env.FREE_VIEWS_TELEGRAM_BOT_TOKEN
  if (!token) throw new Error('Telegram membership check is not configured')
  return token
}

function equalHex(a: string, b: string) {
  return /^[a-f0-9]{64}$/.test(b) && timingSafeEqual(Buffer.from(a, 'hex'), Buffer.from(b, 'hex'))
}

/** Verify Telegram's signed login payload before trusting a user ID. */
export function verifyTelegramLogin(data: unknown, token: string, now = Math.floor(Date.now() / 1000)): string | null {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return null
  const fields = data as Record<string, unknown>
  const allowed = ['id', 'first_name', 'last_name', 'username', 'photo_url', 'auth_date', 'hash']
  if (Object.keys(fields).some(key => !allowed.includes(key))) return null
  if (typeof fields.hash !== 'string' || typeof fields.id !== 'number' || !Number.isSafeInteger(fields.id) || fields.id <= 0) return null
  if (typeof fields.auth_date !== 'number' || !Number.isInteger(fields.auth_date) || fields.auth_date > now + 30 || now - fields.auth_date > 300) return null
  const entries = Object.entries(fields).filter(([key]) => key !== 'hash')
  if (entries.some(([, value]) => typeof value !== 'string' && typeof value !== 'number')) return null
  const check = entries.sort(([a], [b]) => a.localeCompare(b)).map(([key, value]) => `${key}=${value}`).join('\n')
  const secret = createHash('sha256').update(token).digest()
  const expected = createHmac('sha256', secret).update(check).digest('hex')
  return equalHex(expected, fields.hash) ? String(fields.id) : null
}

export function createTelegramSession(userId: string, token: string, now = Math.floor(Date.now() / 1000)) {
  const value = `${userId}.${now + SESSION_SECONDS}`
  const signature = createHmac('sha256', token).update(`socialora-free-views:${value}`).digest('hex')
  return `${value}.${signature}`
}

export function readTelegramSession(cookie: string | undefined, token: string, now = Math.floor(Date.now() / 1000)): string | null {
  if (!cookie || cookie.length > 160) return null
  const [id, expiry, signature, extra] = cookie.split('.')
  if (extra || !/^[1-9][0-9]{0,15}$/.test(id ?? '') || !/^\d{10}$/.test(expiry ?? '') || !signature) return null
  const expiresAt = Number(expiry)
  if (expiresAt <= now || expiresAt > now + SESSION_SECONDS + 30) return null
  const expected = createHmac('sha256', token).update(`socialora-free-views:${id}.${expiry}`).digest('hex')
  return equalHex(expected, signature) ? id : null
}

export function sameOrigin(request: Request) {
  const origin = request.headers.get('origin')
  return Boolean(origin && origin === new URL(request.url).origin)
}

/** Membership is checked on every claim, independently of the remembered login. */
export async function isGroupMember(userId: string): Promise<boolean> {
  const response = await fetch(`https://api.telegram.org/bot${botToken()}/getChatMember`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: `@${GROUP_USERNAME}`, user_id: Number(userId) }),
    cache: 'no-store',
    signal: AbortSignal.timeout(8000),
  })
  const data = await response.json()
  if (!response.ok || data.ok !== true) throw new Error('Telegram membership check unavailable')
  const member = data.result
  return ['creator', 'administrator', 'member'].includes(member?.status) || (member?.status === 'restricted' && member.is_member === true)
}
