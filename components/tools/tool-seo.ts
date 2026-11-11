import type { Metadata } from 'next'

const TOOLS_OG_IMAGE = {
  url: '/tools-og-card.png',
  width: 1200,
  height: 630,
  alt: 'Socialora Free Creator Tools - Browser Utilities With No Login Required',
}

export function buildToolsMetadata({
  title,
  description,
  canonicalPath,
  fullOgTitle,
}: {
  title: string
  description: string
  canonicalPath: string
  fullOgTitle?: string
}): Metadata {
  const ogTitle = fullOgTitle ?? `${title} · Socialora`
  return {
    title,
    description,
    alternates: { canonical: canonicalPath },
    openGraph: {
      type: 'website',
      siteName: 'Socialora',
      locale: 'en_US',
      url: canonicalPath,
      title: ogTitle,
      description,
      images: [TOOLS_OG_IMAGE],
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description,
      images: [TOOLS_OG_IMAGE.url],
    },
  }
}
