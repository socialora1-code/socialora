import { createHmac, timingSafeEqual } from 'node:crypto'

export interface ApprovalPayload {
  ref: string
  service: number
  link: string
  quantity: number
  email: string
  name: string
  amount: string
  exp: number
}

function getSecret(): string | null {
  return process.env.APPROVAL_SECRET || null
}

function sign(data: string, secret: string): string {
  return createHmac('sha256', secret).update(data).digest('base64url')
}

export function createApprovalToken(payload: ApprovalPayload): string | null {
  const secret = getSecret()
  if (!secret) return null
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url')
  return `${data}.${sign(data, secret)}`
}

export function verifyApprovalToken(token: string): ApprovalPayload | null {
  const secret = getSecret()
  if (!secret) return null
  const parts = token.split('.')
  if (parts.length !== 2) return null
  const [data, signature] = parts
  const expected = sign(data, secret)
  const a = Buffer.from(signature)
  const b = Buffer.from(expected)
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null
  try {
    const payload = JSON.parse(Buffer.from(data, 'base64url').toString('utf8')) as ApprovalPayload
    if (typeof payload.exp !== 'number' || Date.now() > payload.exp) return null
    if (!payload.ref || !payload.link) return null
    if (!Number.isInteger(payload.service) || !Number.isInteger(payload.quantity)) return null
    return payload
  } catch {
    return null
  }
}

export function buildApprovalUrl(baseUrl: string, token: string): string {
  return `${baseUrl}/approve?token=${encodeURIComponent(token)}`
}

/** Panels need a link. Turns a plain @username into a profile URL. */
export function profileToLink(platformId: string, profile: string): string {
  if (!profile.startsWith('@')) return profile
  const user = profile.slice(1)
  switch (platformId) {
    case 'instagram':
      return `https://instagram.com/${user}`
    case 'x':
      return `https://x.com/${user}`
    case 'tiktok':
      return `https://tiktok.com/@${user}`
    case 'youtube':
      return `https://youtube.com/@${user}`
    default:
      return profile
  }
}
