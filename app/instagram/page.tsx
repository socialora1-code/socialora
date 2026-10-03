import type { Metadata } from 'next'
import { PlatformPage } from '@/components/services/platform-page'

export const metadata: Metadata = {
  title: 'Instagram Followers, Likes & Views',
  description:
    'Buy Instagram followers in High-Quality, Premium and VIP tiers, plus Instagram likes and Instagram views. Transparent USD pricing and simple checkout.',
  alternates: { canonical: '/instagram' },
  openGraph: { url: '/instagram', title: 'Instagram Followers, Likes & Views · Socialora' },
}

export default function InstagramPage() {
  return <PlatformPage platformId="instagram" />
}
