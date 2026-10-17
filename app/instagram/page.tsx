import type { Metadata } from 'next'
import { PlatformPage } from '@/components/services/platform-page'

export const metadata: Metadata = {
  title: 'Buy Instagram Followers, Likes & Views',
  description:
    'Buy Instagram followers, auto likes and views. Followers from the USA, Spain, Arabic countries and Brazil, with up to 365-day refill. Clear USD pricing, no password needed.',
  alternates: { canonical: '/instagram' },
  openGraph: { url: '/instagram', title: 'Buy Instagram Followers, Likes & Views · Socialora' },
}

export default function InstagramPage() {
  return <PlatformPage platformId="instagram" />
}
