import type { Metadata } from 'next'
import { PlatformPage } from '@/components/services/platform-page'

export const metadata: Metadata = {
  title: 'TikTok Followers, Likes & Views',
  description:
    'Order TikTok followers in High-Quality, Premium and VIP tiers, plus TikTok likes and TikTok views. Clear USD pricing and a simple ordering process.',
  alternates: { canonical: '/tiktok' },
  openGraph: { url: '/tiktok', title: 'TikTok Followers, Likes & Views · Socialora' },
}

export default function TikTokPage() {
  return <PlatformPage platformId="tiktok" />
}
