import { createHash } from 'node:crypto'
import { isIP } from 'node:net'
import { getPanelKey } from '@/lib/panels'
import { reliableRequest, reliableSupportsQuantity } from '@/lib/reliable-smm'
import { sameOrigin } from '@/lib/telegram-free-views'

type Offer = {
  namespace: string
  service: string
  quantity: number
  normalize: (raw: string) => { id: string; link: string } | null
  invalidRequest: string
  invalidLink: string
  duplicate: string
  unavailable: string
}

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

export async function handleFreeReliableOrder(request: Request, offer: Offer) {
  const unavailable = () => Response.json({ error: offer.unavailable }, { status: 503 })
  if (!sameOrigin(request)) return Response.json({ error: 'Submit your request from our website.' }, { status: 403 })
  const body: unknown = await request.json().catch(() => null)
  if (!body || typeof body !== 'object' || Array.isArray(body) || Object.keys(body).some(key => key !== 'link')) {
    return Response.json({ error: offer.invalidRequest }, { status: 400 })
  }
  const channel = 'link' in body && typeof body.link === 'string' ? offer.normalize(body.link) : null
  if (!channel) return Response.json({ error: offer.invalidLink }, { status: 400 })
  const ip = request.headers.get('x-vercel-forwarded-for')?.trim()
  const key = getPanelKey('reliablesmm')
  if (!key || !ip || !isIP(ip)) return unavailable()

  const channelKey = 'free:' + offer.namespace + ':channel:' + channel.id
  const ipKey = 'free:' + offer.namespace + ':ip:' + createHash('sha256').update(ip).digest('hex')
  try {
    const reservation = await redis(['EVAL', "if redis.call('EXISTS', KEYS[1], KEYS[2]) > 0 then return 0 end redis.call('MSET', KEYS[1], 'reserved', KEYS[2], 'reserved') return 1", 2, channelKey, ipKey])
    if (reservation === 0) return Response.json({ code: 'ALREADY_CLAIMED', error: offer.duplicate }, { status: 409 })
    if (reservation !== 1) return unavailable()

    if (!(await reliableSupportsQuantity(key, offer.service, offer.quantity))) {
      await redis(['DEL', channelKey, ipKey])
      return unavailable()
    }

    const result = await reliableRequest(key, {
      action: 'add',
      service: offer.service,
      link: channel.link,
      quantity: String(offer.quantity),
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
