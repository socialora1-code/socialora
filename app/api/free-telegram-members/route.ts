import { handleFreeReliableOrder } from '@/lib/free-reliable-order'
import { normalizeTelegramChannel, FREE_TELEGRAM_QUANTITY } from '@/lib/free-telegram-members'

export const runtime = 'nodejs'

export function POST(request: Request) {
  return handleFreeReliableOrder(request, {
    namespace: 'telegram',
    service: '1159',
    quantity: FREE_TELEGRAM_QUANTITY,
    normalize(raw) {
      const id = normalizeTelegramChannel(raw)
      return id ? { id, link: 'https://t.me/' + id } : null
    },
    invalidRequest: 'This offer is fixed at 10 members. Submit only a public Telegram link.',
    invalidLink: 'Enter a public Telegram channel or group, such as @yourchannel.',
    duplicate: 'A request already exists for this channel or connection. You can still explore our Telegram packages.',
    unavailable: 'Free Telegram orders are temporarily unavailable. Please try again later.',
  })
}
