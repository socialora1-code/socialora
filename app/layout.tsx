import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { ReferralCapture } from '@/components/site/referral-capture'
import { SiteFooter } from '@/components/site/site-footer'
import { SiteHeader } from '@/components/site/site-header'
import { TelegramButton } from '@/components/site/telegram-button'
import { SITE } from '@/lib/site'
import './globals.css'

const geistSans = Geist({ subsets: ['latin'], variable: '--font-geist-sans', display: 'swap' })
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono', display: 'swap' })

const HOME_TITLE = 'Buy Instagram Followers, TikTok & YouTube Views'
const HOME_DESCRIPTION =
  'Buy Instagram, TikTok, YouTube and X (Twitter) followers and views. Clear USD pricing, refill guarantees on selected services and no password needed.'

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${HOME_TITLE} · Socialora`,
    template: '%s · Socialora',
  },
  description: HOME_DESCRIPTION,
  applicationName: SITE.name,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName: SITE.name,
    locale: 'en_US',
    url: '/',
    title: `${HOME_TITLE} · Socialora`,
    description: HOME_DESCRIPTION,
  },
  twitter: {
    card: 'summary_large_image',
    title: `${HOME_TITLE} · Socialora`,
    description: HOME_DESCRIPTION,
  },
  icons: { icon: [{ url: '/icon.svg', type: 'image/svg+xml' }], apple: '/apple-icon.png' },
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#0e0e1f',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en-US" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-dvh antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:rounded-md focus:bg-foreground focus:px-4 focus:py-2 focus:text-background"
        >
          Skip to content
        </a>
        <ReferralCapture />
        <SiteHeader />
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter />
        <TelegramButton />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
