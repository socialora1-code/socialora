import { createHash } from 'node:crypto'
import { isIP } from 'node:net'
import { getPanelKey, PANELS } from '@/lib/panels'
import { sameOrigin } from '@/lib/telegram-free-views'
import { normalizeTelegramChannel, FREE_TELEGRAM_QUANTITY } from '@/lib/free-telegram-members'

export const runtime = 'nodejs'
const SERVICE = '1159'
const unavailable = () => Response.json({ error: 'Free Telegram orders are temporarily unavailable. Please try again later.' }, { status: 503 })

async function redis(command: (string | number)[]) {
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) throw new Error('Redis unavailable')
  const response = await fetch(url, {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
    body: JSON.stringify(command),
    cache: 'no-store',
    signal: AbortSignal.timeout(5000),
  })
  const data = await response.json()
  if (!response.ok || data.error) throw new Error('Redis request failed')
  return data.result
}

async function panel(key: string, fields: Record<string, string>) {
  const response = await fetch(PANELS.reliablesmm.url, {
    method: 'POST',
    body: new URLSearchParams({ key, ...fields }),
    cache: 'no-store',
    signal: AbortSignal.timeout(10000),
  })
  if (!response.ok) throw new Error('Reliable SMM request failed')
  return response.json()
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return Response.json({ error: 'Submit your request from our website.' }, { status: 403 })
  const body: unknown = await request.json().catch(() => null)
  if (!body || typeof body !== 'object' || Array.isArray(body) || Object.keys(body).some(key => key !== 'link')) {
    return Response.json({ error: 'This offer is fixed at 10 members. Submit only a public Telegram link.' }, { status: 400 })
  }
  const channel = 'link' in body && typeof body.link === 'string' ? normalizeTelegramChannel(body.link) : null
  if (!channel) return Response.json({ error: 'Enter a public Telegram channel or group, such as @yourchannel.' }, { status: 400 })
  const ip = request.headers.get('x-vercel-forwarded-for')?.trim()
  const key = getPanelKey('reliablesmm')
  if (!key || !ip || !isIP(ip)) return unavailable()

  const channelKey = 'free:telegram:channel:' + channel
  const ipKey = 'free:telegram:ip:' + createHash('sha256').update(ip).digest('hex')
  try {
    const reservation = await redis(['EVAL', "if redis.call('EXISTS', KEYS[1], KEYS[2]) > 0 then return 0 end redis.call('MSET', KEYS[1], 'reserved', KEYS[2], 'reserved') return 1", 2, channelKey, ipKey])
    if (reservation === 0) return Response.json({ code: 'ALREADY_CLAIMED', error: 'A request already exists for this channel or connection. You can still explore our Telegram packages.' }, { status: 409 })
    if (reservation !== 1) return unavailable()

    const services: unknown = await panel(key, { action: 'services' }).catch(() => null)
    const service = Array.isArray(services) ? services.find(item => String(item?.service) === SERVICE) : null
    const min = Number(service?.min)
    const max = Number(service?.max)
    if (!Number.isInteger(min) || min < 1 || min > FREE_TELEGRAM_QUANTITY ||
        !Number.isInteger(max) || max < FREE_TELEGRAM_QUANTITY) {
      await redis(['DEL', channelKey, ipKey])
      return unavailable()
    }

    const result = await panel(key, {
      action: 'add',
      service: SERVICE,
      link: 'https://t.me/' + channel,
      quantity: String(FREE_TELEGRAM_QUANTITY),
    })
    if (/^[1-9]\d*$/.test(String(result?.order))) return Response.json({ ok: true })
    if (typeof result?.error === 'string' && result.error && !result.order) {
      await redis(['DEL', channelKey, ipKey])
    }
    // Keep locks on ambiguous outcomes to avoid sending the same order twice.
    return unavailable()
  } catch {
    return unavailable()
  }
}
