import type { Metadata } from 'next'
import { PlatformPage } from '@/components/services/platform-page'

export const metadata: Metadata = {
  title: 'Buy YouTube Views, 4,000h Watch Time & Subscribers (No Login — 2026)',
  description:
    'Order high-retention YouTube views, watch hours and subscribers to reach monetization faster. Refill protection on selected packages, no password needed.',
  alternates: { canonical: '/youtube' },
  openGraph: { url: '/youtube', title: 'Buy YouTube Views, Watch Time & Subscribers · Socialora' },
}

export default function YouTubePage() {
  return <PlatformPage platformId="youtube" />
}
