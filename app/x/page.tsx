import type { Metadata } from 'next'
import { PlatformPage } from '@/components/services/platform-page'

export const metadata: Metadata = {
  title: 'X (Twitter) Followers, Likes & Views',
  description:
    'Buy X (Twitter) followers in High-Quality and Premium tiers, plus X likes and views. Transparent USD pricing and simple checkout.',
  alternates: { canonical: '/x' },
  openGraph: { url: '/x', title: 'X (Twitter) Followers, Likes & Views · Socialora' },
}

export default function XPage() {
  return <PlatformPage platformId="x" />
}
