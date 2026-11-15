import type { Metadata } from 'next'
import { PlatformPage } from '@/components/services/platform-page'

export const metadata: Metadata = {
  title: 'Buy Facebook Followers with Refill',
  description: 'Choose 5,000 Facebook followers for $18 with a 365 day refill or $15 with lifetime refill. Order up to 100,000 or 300,000, respectively.',
  alternates: { canonical: '/facebook' },
  openGraph: { url: '/facebook' },
}

export default function FacebookPage() {
  return <PlatformPage platformId="facebook" />
}
