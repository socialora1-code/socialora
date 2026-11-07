import { NextResponse } from 'next/server'
import { TELEGRAM_COOKIE, SESSION_SECONDS, GROUP_URL, telegramEnabled, inviteSecret, createInviteReceipt } from '@/lib/telegram-free-views'

export const dynamic = 'force-dynamic'
export async function GET() {
  if (!telegramEnabled() || !process.env.FREE_VIEWS_TELEGRAM_BOT_TOKEN) {
    return NextResponse.json({ error: 'Please try again shortly.' }, { status: 503 })
  }
  const response = NextResponse.redirect(GROUP_URL, 303)
  response.cookies.set(TELEGRAM_COOKIE, createInviteReceipt(inviteSecret()), {
    httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: SESSION_SECONDS,
  })
  response.headers.set('Cache-Control', 'no-store')
  return response
}
