import type { Metadata } from 'next'
import { PlatformPage } from '@/components/services/platform-page'

export const metadata: Metadata = {
  title: 'Buy Instagram Followers',
  description:
    'Buy Instagram followers from the USA, Spain, Arabic countries and Brazil, or choose high-quality followers with a 365-day refill guarantee. Clear USD pricing, no password needed.',
  alternates: { canonical: '/instagram' },
  openGraph: { url: '/instagram', title: 'Buy Instagram Followers · Socialora' },
}

export default function InstagramPage() {
  return <PlatformPage platformId="instagram" />
}
