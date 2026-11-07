import type { Metadata } from 'next'
import { PlatformPage } from '@/components/services/platform-page'

export const metadata: Metadata = {
  title: 'Buy TikTok Followers, Likes & Views — 30-Day Refill & No Login (2026)',
  description:
    'Buy high-quality TikTok followers, views and auto likes to unlock TikTok Live (1,000 followers) and boost FYP reach. 30-day refill, clear USD pricing, no password required.',
  alternates: { canonical: '/tiktok' },
  openGraph: { url: '/tiktok', title: 'Buy TikTok Followers, Likes & Views — No Login · Socialora' },
}

export default function TikTokPage() {
  return <PlatformPage platformId="tiktok" />
}
