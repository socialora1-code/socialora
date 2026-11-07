import type { Metadata } from 'next'
import { PlatformPage } from '@/components/services/platform-page'

export const metadata: Metadata = {
  title: 'Buy Telegram Members & Premium Subscribers — Search Ranking Boost (2026)',
  description:
    'Buy active Telegram channel members, group members and Telegram Premium subscribers to rank higher in global search. No login required, fast delivery & clear USD pricing.',
  alternates: { canonical: '/telegram' },
  openGraph: { url: '/telegram', title: 'Buy Telegram Members & Premium Channel Subscribers · Socialora' },
}

export default function TelegramPage() {
  return <PlatformPage platformId="telegram" />
}
