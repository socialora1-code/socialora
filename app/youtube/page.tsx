import type { Metadata } from 'next'
import { PlatformPage } from '@/components/services/platform-page'

export const metadata: Metadata = {
  title: 'YouTube Subscribers & Views',
  description:
    'Order YouTube subscribers in High-Quality, Premium and VIP tiers, plus YouTube views for your videos. Transparent USD pricing and dedicated support.',
  alternates: { canonical: '/youtube' },
  openGraph: { url: '/youtube', title: 'YouTube Subscribers & Views · Socialora' },
}

export default function YouTubePage() {
  return <PlatformPage platformId="youtube" />
}
