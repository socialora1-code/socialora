import { NextResponse } from 'next/server'
import { normalizeRefCode } from '@/lib/referral'
import { isValidEmail } from '@/lib/validation'

const MAX_PER_IP_PER_DAY = 5
const DAY_SECONDS = 24 * 60 * 60
const RESERVED = ['admin', 'support', 'socialora', 'free', 'order', 'test', 'instagram', 'tiktok', 'youtube', 'x']

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
  return data.result
}

function clientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  return forwarded?.split(',')[0]?.trim() || 'unknown'
}

function fail(message: string, status: number) {
  return NextResponse.json({ ok: false, error: message }, { status })
}

export async function POST(request: Request) {
  let body: { email?: unknown; code?: unknown; website?: unknown }
  try {
    body = await request.json()
  } catch {
    return fail('Invalid request.', 400)
  }

  if (typeof body.website === 'string' && body.website.length > 0) {
    return NextResponse.json({ ok: true, code: 'thanks' })
  }

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  if (!isValidEmail(email)) {
    return fail('Please enter a valid email address.', 400)
  }

  const code = typeof body.code === 'string' ? normalizeRefCode(body.code) : null
  if (!code) {
    return fail('Choose a code with 3 to 20 letters or numbers (no spaces or symbols).', 400)
  }
  if (RESERVED.includes(code)) {
    return fail('This code is not available. Please choose another one.', 409)
  }

  const ipKey = `ref:ip:${clientIp(request)}`

  try {
    const count = Number(await redis(['INCR', ipKey]))
    if (count === 1) await redis(['EXPIRE', ipKey, DAY_SECONDS])
    if (count > MAX_PER_IP_PER_DAY) {
      return fail('Too many attempts today. Please try again tomorrow.', 429)
    }

    const emailKey = `ref:email:${email}`
    const existing = await redis(['GET', emailKey])
    if (typeof existing === 'string' && existing) {
      return NextResponse.json({ ok: true, code: existing, existing: true })
    }

    const claimed = await redis(['SET', `ref:code:${code}`, email, 'NX'])
    if (claimed !== 'OK') {
      return fail('This code is already taken. Please choose another one.', 409)
    }
    await redis(['SET', emailKey, code])
    return NextResponse.json({ ok: true, code })
  } catch (error) {
    console.error('Referral error:', error)
    return fail('Something went wrong. Please try again later.', 503)
  }
}
