import type { Metadata } from 'next'
import { PlatformPage } from '@/components/services/platform-page'

export const metadata: Metadata = {
  title: 'YouTube Views, Watch Time & Subscribers',
  description:
    'Order YouTube views, watch time and subscribers for your channel. Clear USD pricing, refill guarantees on selected services and dedicated support.',
  alternates: { canonical: '/youtube' },
  openGraph: { url: '/youtube', title: 'YouTube Views, Watch Time & Subscribers · Socialora' },
}

export default function YouTubePage() {
  return <PlatformPage platformId="youtube" />
}
