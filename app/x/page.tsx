import type { Metadata } from 'next'
import { PlatformPage } from '@/components/services/platform-page'

export const metadata: Metadata = {
  title: 'X (Twitter) Followers',
  description:
    'Order X (Twitter) followers with three options to fit your goals. Clear USD pricing, refill guarantee on selected options and dedicated support.',
  alternates: { canonical: '/x' },
  openGraph: { url: '/x', title: 'X (Twitter) Followers · Socialora' },
}

export default function XPage() {
  return <PlatformPage platformId="x" />
}
