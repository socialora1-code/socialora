import { NextResponse } from 'next/server'
import { getInboxAddress, renderTableEmail, sendEmail } from '@/lib/email'
import { validateContact } from '@/lib/validation'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const SEND_FAILED = "We couldn't send your message right now. Please try again or email us directly."

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request.' }, { status: 400 })
  }

  if (body && typeof body === 'object' && (body as Record<string, unknown>).website) {
    return NextResponse.json({ ok: false, error: SEND_FAILED }, { status: 400 })
  }

  const result = validateContact(body)
  if (!result.ok) {
    return NextResponse.json(
      { ok: false, error: 'Please review the highlighted fields.', fieldErrors: result.errors },
      { status: 422 },
    )
  }

  const { name, email, subject, message } = result.value
  const now = new Date()

  const content = renderTableEmail(`Support request: ${subject}`, [
    ['Name', name],
    ['Email', email],
    ['Subject', subject],
    ['Received', `${now.toLocaleString('en-US', { timeZone: 'America/New_York', dateStyle: 'medium', timeStyle: 'long' })}`],
    ['Message', message],
  ])

  const sent = await sendEmail({
    to: getInboxAddress(),
    subject: `[Support] ${subject}`,
    html: content.html,
    text: content.text,
    replyTo: email,
  })

  if (!sent.ok) {
    return NextResponse.json({ ok: false, error: SEND_FAILED }, { status: 503 })
  }

  return NextResponse.json({ ok: true })
}
