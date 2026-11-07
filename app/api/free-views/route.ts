import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { TELEGRAM_COOKIE, telegramEnabled, inviteSecret, hasInviteReceipt, sameOrigin } from '@/lib/telegram-free-views'

export const runtime = 'nodejs'

const PANEL_URL = 'https://smmwiz.com/api/v2'
const PANEL_SERVICE_ID = 19639
const MIN_QUANTITY = 100
const MAX_QUANTITY = 1000
const MAX_PER_IP_PER_DAY = 3
const DAY_SECONDS = 24 * 60 * 60
const LINK_BLOCK_SECONDS = 30 * DAY_SECONDS

async function redis(command: (string | number)[]): Promise<unknown> {
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) throw new Error('Redis is not configured')
  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(command),
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`Redis error ${res.status}`)
  const data = await res.json()
  if (data.error) throw new Error('Redis command failed')
  return data.result
}

function clientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  return forwarded?.split(',')[0]?.trim() || 'unknown'
}

function normalizeLink(raw: string): string | null {
  let url: URL
  try {
    url = new URL(raw.trim())
  } catch {
    return null
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return null
  const host = url.hostname.toLowerCase().replace(/^www\./, '')
  if (host !== 'instagram.com' && host !== 'instagr.am') return null
  const match = url.pathname.match(/^\/(?:[A-Za-z0-9._]+\/)?(reel|reels|p|tv)\/([A-Za-z0-9_-]+)/)
  if (!match) return null
  const kind = match[1] === 'reels' ? 'reel' : match[1]
  return `https://www.instagram.com/${kind}/${match[2]}/`
}

function fail(message: string, status: number) {
  return NextResponse.json({ ok: false, error: message }, { status })
}

async function placeOrder(apiKey: string, link: string, quantity: number): Promise<'placed' | 'rejected' | 'unknown'> {
  const params = new URLSearchParams({
    key: apiKey,
    action: 'add',
    service: String(PANEL_SERVICE_ID),
    link,
    quantity: String(quantity),
  })
  try {
    const res = await fetch(PANEL_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params,
      cache: 'no-store',
      signal: AbortSignal.timeout(15000),
    })
    const data = await res.json()
    if (res.ok && data && data.order) return 'placed'
    console.error('Free views panel error:', data?.error ?? 'unknown error')
    return data?.error ? 'rejected' : 'unknown'
  } catch {
    console.error('Free views request outcome could not be confirmed')
    return 'unknown'
  }
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return fail('Please try again from our website.', 403)
  let body: { link?: unknown; quantity?: unknown; website?: unknown }
  try {
    body = await request.json()
  } catch {
    return fail('Invalid request.', 400)
  }

  // Hidden field that only bots fill in. Pretend it worked.
  if (typeof body.website === 'string' && body.website.length > 0) {
    return NextResponse.json({ ok: true })
  }

  const link = typeof body.link === 'string' ? normalizeLink(body.link) : null
  if (!link) {
    return fail('Please enter a valid Instagram reel or post link.', 400)
  }

  const quantity = Number(body.quantity)
  if (!Number.isInteger(quantity) || quantity < MIN_QUANTITY || quantity > MAX_QUANTITY) {
    return fail(`Enter a quantity between ${MIN_QUANTITY} and ${MAX_QUANTITY}.`, 400)
  }

  const apiKey = process.env.SMMWIZ_API_KEY
  if (!apiKey) {
    return fail('Free views are unavailable right now.', 500)
  }

  if (telegramEnabled()) {
    if (!process.env.FREE_VIEWS_TELEGRAM_BOT_TOKEN) return fail('Free views are unavailable right now. Please try again later.', 503)
    const invited = hasInviteReceipt((await cookies()).get(TELEGRAM_COOKIE)?.value, inviteSecret())
    if (!invited) {
      return NextResponse.json({ ok: false, code: 'TELEGRAM_INVITE_REQUIRED', error: 'Open our Telegram group to continue.' }, { status: 403 })
    }
  }

  const ipKey = `fv:ip:${clientIp(request)}`
  const linkKey = `fv:link:${link}`

  try {
    // Reserve quota and the post in one operation, including concurrent clicks.
    const quotaKeys = [ipKey]
    const reservation = Number(await redis(['EVAL', `
      for i = 2, #KEYS do
        if tonumber(redis.call('GET', KEYS[i]) or '0') >= tonumber(ARGV[1]) then return 1 end
      end
      if redis.call('EXISTS', KEYS[1]) == 1 then return 2 end
      redis.call('SET', KEYS[1], 'pending', 'EX', ARGV[3])
      for i = 2, #KEYS do
        local count = redis.call('INCR', KEYS[i])
        if count == 1 then redis.call('EXPIRE', KEYS[i], ARGV[2]) end
      end
      return 0
    `, 1 + quotaKeys.length, linkKey, ...quotaKeys, MAX_PER_IP_PER_DAY, DAY_SECONDS, LINK_BLOCK_SECONDS]))
    if (reservation === 1) return fail('Daily free limit reached. Please try again tomorrow.', 429)
    if (reservation === 2) return fail('This post already received free views or has a request in progress.', 429)
    if (reservation !== 0) throw new Error('Unexpected quota result')

    const placed = await placeOrder(apiKey, link, quantity)
    if (placed === 'rejected') {
      await redis(['EVAL', `
        redis.call('DEL', KEYS[1])
        for i = 2, #KEYS do
          if tonumber(redis.call('GET', KEYS[i]) or '0') > 0 then redis.call('DECR', KEYS[i]) end
        end
        return 1
      `, 1 + quotaKeys.length, linkKey, ...quotaKeys])
      return fail('We could not place this order right now. Please try again later.', 502)
    }
    if (placed === 'unknown') {
      // Keep the reservation: the panel may have accepted a timed-out request.
      return fail('We could not confirm this request. Please contact support before trying this post again.', 503)
    }
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Free views error:', error)
    return fail('Free views are unavailable right now. Please try again later.', 503)
  }
}

