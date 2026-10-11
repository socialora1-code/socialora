import { createHmac, timingSafeEqual } from 'crypto'

export interface PendingOrder {
  reference: string
  panelServiceId: number | null
  link: string
  quantity: number
  email: string
  serviceName: string
  packageName: string
  amount: string
  priceCents: number
  referral?: { code: string; email: string; self: boolean } | null
}

const TWO_WEEKS = 14 * 24 * 60 * 60

async function redis(command: (string | number)[]) {
  const url = process.env.KV_REST_API_URL
  const token = process.env.KV_REST_API_TOKEN
  if (!url || !token) throw new Error('Redis settings missing')
  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(command),
    cache: 'no-store',
  })
  const data = await res.json()
  if (!res.ok || data.error) throw new Error(data.error ?? 'Redis error')
  return data.result
}

export async function saveOrder(order: PendingOrder) {
  await redis(['SET', `order:${order.reference}`, JSON.stringify(order), 'EX', TWO_WEEKS])
}

export async function getOrder(reference: string): Promise<PendingOrder | null> {
  const raw = await redis(['GET', `order:${reference}`])
  return raw ? (JSON.parse(raw) as PendingOrder) : null
}

export async function claimNotification(reference: string): Promise<boolean> {
  const result = await redis(['SET', `notified:${reference}`, '1', 'NX', 'EX', TWO_WEEKS])
  return result === 'OK'
}

export async function releaseNotification(reference: string) {
  await redis(['DEL', `notified:${reference}`])
}

// Panel duplicate guard: makes sure one order is sent to the panel only once.
export async function claimPanel(reference: string): Promise<boolean> {
  const result = await redis(['SET', `panel:${reference}`, 'pending', 'NX', 'EX', TWO_WEEKS])
  return result === 'OK'
}

export async function setPanelOrder(reference: string, panelOrder: string) {
  await redis(['SET', `panel:${reference}`, panelOrder, 'EX', TWO_WEEKS])
}

export async function getPanelOrder(reference: string): Promise<string | null> {
  const raw = await redis(['GET', `panel:${reference}`])
  return typeof raw === 'string' ? raw : null
}

export async function releasePanel(reference: string) {
  await redis(['DEL', `panel:${reference}`])
}

export async function createInvoice(params: {
  priceCents: number
  reference: string
  description: string
  ipnUrl: string
  successUrl: string
  cancelUrl: string
}): Promise<string | null> {
  const apiKey = process.env.NOWPAYMENTS_API_KEY
  if (!apiKey) return null
  const res = await fetch('https://api.nowpayments.io/v1/invoice', {
    method: 'POST',
    headers: { 'x-api-key': apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      price_amount: params.priceCents / 100,
      price_currency: 'usd',
      order_id: params.reference,
      order_description: params.description,
      ipn_callback_url: params.ipnUrl,
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
    }),
    cache: 'no-store',
  })
  const data = await res.json().catch(() => null)
  return data && typeof data.invoice_url === 'string' ? data.invoice_url : null
}

function sortKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortKeys)
  if (value && typeof value === 'object') {
    const source = value as Record<string, unknown>
    return Object.keys(source)
      .sort()
      .reduce((acc: Record<string, unknown>, key) => {
        acc[key] = sortKeys(source[key])
        return acc
      }, {})
  }
  return value
}

export function verifyIpnSignature(body: unknown, signature: string | null): boolean {
  const secret = process.env.NOWPAYMENTS_IPN_SECRET
  if (!secret || !signature) return false
  const expected = createHmac('sha512', secret).update(JSON.stringify(sortKeys(body))).digest('hex')
  const a = Buffer.from(expected)
  const b = Buffer.from(signature.toLowerCase())
  return a.length === b.length && timingSafeEqual(a, b)
}
