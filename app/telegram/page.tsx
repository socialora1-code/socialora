import type { Metadata } from 'next'
import { PlatformPage } from '@/components/services/platform-page'

export const metadata: Metadata = {
  title: 'Buy Telegram Members & Premium Channel Subscribers',
  description:
    'Order Telegram members for your channel or group, or premium channel subscribers with views. Clear USD pricing, volume discounts and dedicated support.',
  alternates: { canonical: '/telegram' },
  openGraph: { url: '/telegram', title: 'Buy Telegram Members & Premium Channel Subscribers · Socialora' },
}

export default function TelegramPage() {
  return <PlatformPage platformId="telegram" />
}
