import { createHmac, timingSafeEqual } from 'node:crypto'

export function isPay402Enabled(): boolean {
  const key = process.env.PAY402_SECRET_KEY?.trim()
  return Boolean(key && key.startsWith('402s_'))
}

export interface Create402PaymentResult {
  id: string
  url: string
}

export async function create402Payment(params: {
  reference: string
  amountCents: number
  description: string
  customerEmail: string
  successUrl: string
  cancelUrl: string
  metadata?: Record<string, unknown>
}): Promise<Create402PaymentResult> {
  const secretKey = process.env.PAY402_SECRET_KEY?.trim()
  if (!secretKey) {
    throw new Error('402pay secret key is not configured')
  }

  const response = await fetch('https://api.402pay.co/api/v1/payments', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secretKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: (params.amountCents / 100).toFixed(2),
      currency: 'USD',
      reference: params.reference,
      description: params.description,
      customer_email: params.customerEmail,
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      metadata: params.metadata ?? { reference: params.reference },
    }),
    cache: 'no-store',
    signal: AbortSignal.timeout(15_000),
  })

  if (!response.ok) {
    const errorText = await response.text().catch(() => '')
    throw new Error(`402pay payment creation failed (${response.status}): ${errorText}`)
  }

  const result = (await response.json()) as {
    data?: {
      id?: string
      url?: string
    }
  }

  const id = result?.data?.id
  const url = result?.data?.url

  if (!id || !url) {
    throw new Error('402pay did not return a checkout URL')
  }

  return { id, url }
}

export function verify402paySignature(
  headers: {
    id?: string | null
    timestamp?: string | null
    signature?: string | null
  },
  rawBody: string,
  secret?: string,
): boolean {
  const webhookSecret = secret ?? process.env.PAY402_WEBHOOK_SECRET?.trim()
  const id = headers.id?.trim()
  const timestamp = headers.timestamp?.trim()
  const signature = headers.signature?.trim()

  if (!id || !timestamp || !signature || !webhookSecret) {
    return false
  }

  const now = Math.floor(Date.now() / 1000)
  const ts = parseInt(timestamp, 10)
  if (isNaN(ts) || Math.abs(now - ts) > 300) {
    return false
  }

  try {
    const secretKey = webhookSecret.startsWith('whsec_') ? webhookSecret.slice(6) : webhookSecret
    const secretBytes = Buffer.from(secretKey, 'base64')
    const signedPayload = `${id}.${timestamp}.${rawBody}`
    const expected = createHmac('sha256', secretBytes).update(signedPayload).digest('base64')

    const signatures = signature.split(' ')
    for (const item of signatures) {
      const parts = item.split(',')
      if (parts.length === 2 && parts[0] === 'v1') {
        const sigBuffer = Buffer.from(parts[1])
        const expBuffer = Buffer.from(expected)
        if (sigBuffer.length === expBuffer.length && timingSafeEqual(sigBuffer, expBuffer)) {
          return true
        }
      }
    }
  } catch {
    return false
  }

  return false
}
