import { NextResponse } from 'next/server'
import { SESSION_SECONDS, GROUP_URL, telegramEnabled, inviteCookieName, inviteSecret, createInviteReceipt, isTelegramInviteOffer } from '@/lib/telegram-free-views'

export const dynamic = 'force-dynamic'
export async function GET(request: Request) {
  const choice = new URL(request.url).searchParams.get('offer')
  const offer = isTelegramInviteOffer(choice) ? choice : undefined
  if (choice !== null && !offer) return NextResponse.json({ error: 'Unknown offer.' }, { status: 400 })
  if (!telegramEnabled() || !process.env.FREE_VIEWS_TELEGRAM_BOT_TOKEN) {
    return NextResponse.json({ error: 'Please try again shortly.' }, { status: 503 })
  }
  const response = NextResponse.redirect(GROUP_URL, 303)
  response.cookies.set(inviteCookieName(offer), createInviteReceipt(inviteSecret(offer)), {
    httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: SESSION_SECONDS,
  })
  response.headers.set('Cache-Control', 'no-store')
  return response
}
