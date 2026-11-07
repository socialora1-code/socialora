import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { TELEGRAM_COOKIE, telegramEnabled, inviteSecret, hasInviteReceipt } from '@/lib/telegram-free-views'

export const dynamic = 'force-dynamic'
export async function GET() {
  const enabled = telegramEnabled()
  const configured = Boolean(process.env.FREE_VIEWS_TELEGRAM_BOT_TOKEN)
  const invited = enabled && configured
    ? hasInviteReceipt((await cookies()).get(TELEGRAM_COOKIE)?.value, inviteSecret()) : false
  return NextResponse.json({ enabled, configured, invited }, { headers: { 'Cache-Control': 'no-store' } })
}
