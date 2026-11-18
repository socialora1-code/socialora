import { createHmac, timingSafeEqual } from 'node:crypto'

const TRANSACTION_REFERENCE = /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i

function credentials() {
  const publishableKey = process.env.PAYZINK_PUBLISHABLE_KEY?.trim()
  const secretKey = process.env.PAYZINK_SECRET_KEY?.trim()
  if (!publishableKey || !secretKey) return null

  const sandbox = process.env.PAYZINK_SANDBOX === 'true'
  const mode = sandbox ? 'test' : 'live'
  if (!publishableKey.startsWith(`pk_${mode}_`) || !secretKey.startsWith(`sk_${mode}_`)) return null
  return {
    publishableKey,
    secretKey,
    merchant: sandbox ? 'https://merchant-dev.payzink.com' : 'https://merchant.payzink.com',
    checkout: sandbox ? 'https://payment-dev.payzink.com' : 'https://payment.payzink.com',
  }
}

export function payzinkEnabled(): boolean {
  return process.env.PAYZINK_ENABLED === 'true' &&
    !(process.env.VERCEL_ENV === 'production' && process.env.PAYZINK_SANDBOX === 'true') &&
    credentials() !== null
}

async function payzinkRequest(origin: string, path: string, init: RequestInit) {
  const response = await fetch(new URL(path, origin), {
    ...init,
    cache: 'no-store',
    redirect: 'error',
    signal: AbortSignal.timeout(10_000),
  })
  if (!response.ok) throw new Error(`Payzink request failed (${response.status})`)
  return (await response.json()).result
}

async function authenticatedRequest(path: string, body?: object) {
  const config = credentials()
  if (!config) throw new Error('Payzink credentials are missing')
  const { merchant, publishableKey, secretKey } = config
  const auth = await payzinkRequest(merchant, '/api/v1/auth/access-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ publishableKey, secretKey }),
  })
  if (typeof auth?.accessToken !== 'string' || !auth.accessToken) throw new Error('Payzink did not return an access token')

  return payzinkRequest(merchant, path, {
    method: body ? 'POST' : 'GET',
    headers: { Authorization: `Bearer ${auth.accessToken}`, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
}

export async function createPayzinkCheckout(params: {
  reference: string
  priceCents: number
  email: string
  notificationUrl: string
  callbackUrl: string
}): Promise<{ reference: string; url: string }> {
  const result = await authenticatedRequest('/api/v1/payment/hosted', {
    order: { action: 'PURCHASE', amount: { currencyCode: 'USD', value: params.priceCents } },
    customer: { email: params.email },
    extra: { orderId: params.reference },
    _links: { notificationUrl: params.notificationUrl, callbackUrl: params.callbackUrl },
  })
  const reference = result?.reference
  const href = result?._links?.payment?.href
  if (typeof reference !== 'string' || !TRANSACTION_REFERENCE.test(reference) || typeof href !== 'string') {
    throw new Error('Payzink did not return a checkout reference')
  }
  const url = new URL(href)
  if (url.origin !== credentials()?.checkout || url.username || url.password ||
      url.pathname !== `/checkout/${reference}`) {
    throw new Error('Payzink returned an unexpected checkout URL')
  }
  return { reference, url: url.href }
}

export function verifyPayzinkSignature(body: string, headers: Headers): boolean {
  const secret = credentials()?.secretKey
  const timestamp = headers.get('x-payzink-timestamp') ?? ''
  const signature = headers.get('x-payzink-signature') ?? ''
  if (!secret || !/^\d{10}$/.test(timestamp) || !/^[0-9a-f]{64}$/i.test(signature) ||
      Math.abs(Math.floor(Date.now() / 1000) - Number(timestamp)) > 300) return false

  const expected = createHmac('sha256', secret).update(timestamp).update(body).digest()
  return timingSafeEqual(expected, Buffer.from(signature, 'hex'))
}

export async function isPayzinkPaymentConfirmed(reference: string, priceCents: number): Promise<boolean> {
  if (!TRANSACTION_REFERENCE.test(reference)) return false
  const result = await authenticatedRequest(`/api/v1/payment/transaction/${reference}/info`)
  return result?.reference === reference && result.state === 'PURCHASED' &&
    result.order?.action === 'PURCHASE' && result.order.amount?.currencyCode === 'USD' &&
    result.order.amount?.value === priceCents
}
