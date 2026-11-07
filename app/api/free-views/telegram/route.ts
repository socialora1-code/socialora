import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import {
  BOT_USERNAME, GROUP_URL, TELEGRAM_COOKIE, SESSION_SECONDS, botToken,
  telegramEnabled, readTelegramSession, createTelegramSession, verifyTelegramLogin, sameOrigin,
} from '@/lib/telegram-free-views'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const enabled = telegramEnabled()
  const configured = Boolean(process.env.FREE_VIEWS_TELEGRAM_BOT_TOKEN)
  const userId = enabled && configured
    ? readTelegramSession((await cookies()).get(TELEGRAM_COOKIE)?.value, botToken())
    : null
  return NextResponse.json({ enabled, configured, connected: Boolean(userId), botUsername: BOT_USERNAME, groupUrl: GROUP_URL }, {
    headers: { 'Cache-Control': 'no-store' },
  })
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ ok: false, error: 'Please try again from our website.' }, { status: 403 })
  if (!telegramEnabled() || !process.env.FREE_VIEWS_TELEGRAM_BOT_TOKEN) {
    return NextResponse.json({ ok: false, error: 'Telegram connection is unavailable right now.' }, { status: 503 })
  }
  let data: unknown
  try { data = await request.json() } catch { return NextResponse.json({ ok: false }, { status: 400 }) }
  const userId = verifyTelegramLogin(data, botToken())
  if (!userId) return NextResponse.json({ ok: false, error: 'Please connect with Telegram again.' }, { status: 401 })
  const response = NextResponse.json({ ok: true })
  response.cookies.set(TELEGRAM_COOKIE, createTelegramSession(userId, botToken()), {
    httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: SESSION_SECONDS,
  })
  response.headers.set('Cache-Control', 'no-store')
  return response
}
