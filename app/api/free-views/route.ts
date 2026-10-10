import { NextResponse } from 'next/server'

const PANEL_URL = 'https://smmwiz.com/api/v2'
const PANEL_SERVICE_ID = 21945
const MIN_QUANTITY = 100
const MAX_QUANTITY = 1000
const MAX_PER_IP_PER_DAY = 3
const DAY_MS = 24 * 60 * 60 * 1000
const LINK_BLOCK_MS = 30 * DAY_MS

// Best-effort limits kept in memory. They reset when the server restarts.
const ipHits = new Map<string, number[]>()
const linkHits = new Map<string, number>()

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

export async function POST(request: Request) {
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

  const now = Date.now()
  const ip = clientIp(request)
  const recent = (ipHits.get(ip) ?? []).filter((t) => now - t < DAY_MS)
  if (recent.length >= MAX_PER_IP_PER_DAY) {
    return fail('Daily free limit reached. Please try again tomorrow.', 429)
  }
  const lastForLink = linkHits.get(link)
  if (lastForLink && now - lastForLink < LINK_BLOCK_MS) {
    return fail('This post already received free views.', 429)
  }

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
    })
    const data = await res.json()
    if (data && data.order) {
      ipHits.set(ip, [...recent, now])
      linkHits.set(link, now)
      return NextResponse.json({ ok: true })
    }
    console.error('Free views panel error:', data?.error ?? 'unknown error')
    return fail('We could not place this order right now. Please try again later.', 502)
  } catch (error) {
    console.error('Free views request failed:', error)
    return fail('We could not place this order right now. Please try again later.', 502)
  }
}
