import type { Metadata } from 'next'
import { PlatformPage } from '@/components/services/platform-page'

export const metadata: Metadata = {
  title: 'Buy TikTok Followers',
  description:
    'Buy TikTok followers with a 30-day refill guarantee. High-quality and minimal-drop options, clear USD pricing and no password needed.',
  alternates: { canonical: '/tiktok' },
  openGraph: { url: '/tiktok', title: 'Buy TikTok Followers · Socialora' },
}

export default function TikTokPage() {
  return <PlatformPage platformId="tiktok" />
}
