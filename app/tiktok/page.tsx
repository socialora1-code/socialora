import type { Metadata } from 'next'
import { PlatformPage } from '@/components/services/platform-page'

export const metadata: Metadata = {
  title: 'Buy TikTok Followers, Likes & Views',
  description:
    'Buy TikTok followers, auto likes and auto views. 30-day refill on followers, clear USD pricing and no password needed. Pay with crypto.',
  alternates: { canonical: '/tiktok' },
  openGraph: { url: '/tiktok', title: 'Buy TikTok Followers, Likes & Views · Socialora' },
}

export default function TikTokPage() {
  return <PlatformPage platformId="tiktok" />
}
