import { NextResponse } from 'next/server'
import { getPanelStatus, getTrack } from '@/lib/track'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const LABELS: Record<string, string> = {
  pending: 'Waiting to start',
  processing: 'In progress',
  'in progress': 'In progress',
  completed: 'Completed',
  partial: 'Partially completed',
  canceled: 'Canceled',
  cancelled: 'Canceled',
  refunded: 'Canceled',
}

const NOT_FOUND = 'We could not find an order with these details. Check the order reference and the email you used.'

export async function POST(request: Request) {
  let body: Record<string, unknown>
  try {
    body = (await request.json()) as Record<string, unknown>
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request.' }, { status: 400 })
  }

  const reference = typeof body.reference === 'string' ? body.reference.trim().toUpperCase() : ''
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''

  if (!/^SO-[A-Z2-9]{8}$/.test(reference) || !email) {
    return NextResponse.json({ ok: false, error: NOT_FOUND }, { status: 404 })
  }

  const record = await getTrack(reference)
  if (!record || record.email !== email) {
    return NextResponse.json({ ok: false, error: NOT_FOUND }, { status: 404 })
  }

  const panel = await getPanelStatus(record.panelOrder, record.panel)
  if (!panel.ok) {
    return NextResponse.json(
      { ok: false, error: 'Status is not available right now. Please try again in a few minutes.' },
      { status: 503 },
    )
  }

  const key = panel.status.trim().toLowerCase()
  const label = LABELS[key] ?? panel.status
  let progress: number | null = null
  if (key === 'completed') {
    progress = 100
  } else if (panel.remains !== null && record.quantity > 0) {
    progress = Math.max(0, Math.min(100, Math.round(((record.quantity - panel.remains) / record.quantity) * 100)))
  }

  const needsHelp = key === 'partial' || key === 'canceled' || key === 'cancelled' || key === 'refunded'

  return NextResponse.json({
    ok: true,
    service: record.serviceName,
    quantity: record.quantity,
    status: label,
    progress,
    note: needsHelp ? 'Please contact support and include your order reference.' : '',
  })
}
