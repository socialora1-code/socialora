const ONE_YEAR = 365 * 24 * 60 * 60
const PANEL_API_URL = 'https://smmwiz.com/api/v2'

export interface TrackRecord {
  reference: string
  email: string
  panelOrder: string
  serviceName: string
  quantity: number
  link: string
}

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

// Never throws, so it can never break an order.
export async function saveTrack(record: TrackRecord) {
  try {
    const value = JSON.stringify({ ...record, email: record.email.trim().toLowerCase() })
    await redis(['SET', `track:${record.reference}`, value, 'EX', ONE_YEAR])
  } catch (err) {
    console.error('[track] save failed:', err instanceof Error ? err.message : err)
  }
}

export async function getTrack(reference: string): Promise<TrackRecord | null> {
  try {
    const raw = await redis(['GET', `track:${reference}`])
    return typeof raw === 'string' ? (JSON.parse(raw) as TrackRecord) : null
  } catch {
    return null
  }
}

export type PanelStatus = { ok: true; status: string; remains: number | null } | { ok: false }

export async function getPanelStatus(panelOrder: string): Promise<PanelStatus> {
  const apiKey = process.env.SMMWIZ_API_KEY
  if (!apiKey) return { ok: false }
  try {
    const res = await fetch(PANEL_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ key: apiKey, action: 'status', order: panelOrder }),
      cache: 'no-store',
    })
    const data = (await res.json()) as { status?: string; remains?: string | number; error?: string }
    if (!data || data.error || !data.status) return { ok: false }
    const remains = Number(data.remains)
    return { ok: true, status: String(data.status), remains: Number.isFinite(remains) ? remains : null }
  } catch {
    return { ok: false }
  }
}
