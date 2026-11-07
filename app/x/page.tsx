import type { Metadata } from 'next'
import { PlatformPage } from '@/components/services/platform-page'

export const metadata: Metadata = {
  title: 'Buy X (Twitter) Followers & Views — Refill Protected & No Login (2026)',
  description:
    'Buy X (Twitter) followers and post views with three quality tiers. Refill guarantee on selected packages, clear USD pricing and no password required.',
  alternates: { canonical: '/x' },
  openGraph: { url: '/x', title: 'Buy X (Twitter) Followers & Views · Socialora' },
}

export default function XPage() {
  return <PlatformPage platformId="x" />
}
