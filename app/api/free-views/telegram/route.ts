import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { telegramEnabled, inviteCookieName, inviteSecret, hasInviteReceipt, isTelegramInviteOffer } from '@/lib/telegram-free-views'

export const dynamic = 'force-dynamic'
export async function GET(request: Request) {
  const choice = new URL(request.url).searchParams.get('offer')
  const offer = isTelegramInviteOffer(choice) ? choice : undefined
  if (choice !== null && !offer) return NextResponse.json({ error: 'Unknown offer.' }, { status: 400 })
  const enabled = telegramEnabled()
  const configured = Boolean(process.env.FREE_VIEWS_TELEGRAM_BOT_TOKEN)
  const invited = enabled && configured
    ? hasInviteReceipt((await cookies()).get(inviteCookieName(offer))?.value, inviteSecret(offer)) : false
  return NextResponse.json({ enabled, configured, invited }, { headers: { 'Cache-Control': 'no-store' } })
}
