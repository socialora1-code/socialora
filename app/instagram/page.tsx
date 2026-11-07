import type { Metadata } from 'next'
import { PlatformPage } from '@/components/services/platform-page'

export const metadata: Metadata = {
  title: 'Buy Instagram Followers, Likes & Views — Instant & No Password (2026)',
  description:
    'Buy real-looking Instagram followers, Reels views and auto likes. Targeted USA, Spanish, Arabic & Brazilian options with up to 365-day refill, instant start and no password needed.',
  alternates: { canonical: '/instagram' },
  openGraph: { url: '/instagram', title: 'Buy Instagram Followers, Likes & Views — No Password Needed · Socialora' },
}

export default function InstagramPage() {
  return <PlatformPage platformId="instagram" />
}
