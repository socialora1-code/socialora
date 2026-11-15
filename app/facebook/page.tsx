import type { Metadata } from 'next'
import { PlatformPage } from '@/components/services/platform-page'

export const metadata: Metadata = {
  title: 'Buy Facebook Followers with Lifetime Refill',
  description: 'Choose a Facebook followers package from 5,000 to 300,000 with lifetime refill. Packages start at $15.',
  alternates: { canonical: '/facebook' },
  openGraph: { url: '/facebook' },
}

export default function FacebookPage() {
  return <PlatformPage platformId="facebook" />
}
