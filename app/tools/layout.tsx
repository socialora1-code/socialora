import type { Metadata } from 'next'
import { TOOLS } from '@/lib/tool-list'

const TOOLKIT_TITLE = 'Socialora Free Creator Toolkit'
const TOOLKIT_DESCRIPTION =
  `${TOOLS.length + 1} free browser creator tools for Instagram, TikTok, YouTube, X and Telegram. Zero login, no password, and instant client-side results.`

export const metadata: Metadata = {
  title: {
    default: TOOLKIT_TITLE,
    template: `%s · ${TOOLKIT_TITLE}`,
  },
  description: TOOLKIT_DESCRIPTION,
  alternates: { canonical: '/tools' },
  openGraph: {
    type: 'website',
    siteName: TOOLKIT_TITLE,
    locale: 'en_US',
    url: '/tools',
    title: TOOLKIT_TITLE,
    description: TOOLKIT_DESCRIPTION,
    images: [
      {
        url: '/tools-og-card.png',
        width: 1200,
        height: 630,
        alt: 'Socialora Free Creator Toolkit - Free Browser Tools With No Login Required',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: TOOLKIT_TITLE,
    description: TOOLKIT_DESCRIPTION,
    images: ['/tools-og-card.png'],
  },
}

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  return children
}
