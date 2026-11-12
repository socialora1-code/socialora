import type { Metadata } from 'next'

const TOOLKIT_NAME = 'Socialora Free Creator Toolkit'

const TOOLS_OG_IMAGE = {
  url: '/tools-og-card.png',
  width: 1200,
  height: 630,
  alt: 'Socialora Free Creator Toolkit - Browser Utilities With No Login Required',
}

export function buildToolsMetadata({
  title,
  description,
  canonicalPath,
  fullOgTitle,
  absoluteTitle,
}: {
  title: string
  description: string
  canonicalPath: string
  fullOgTitle?: string
  absoluteTitle?: string
}): Metadata {
  const ogTitle = fullOgTitle ?? `${title} · ${TOOLKIT_NAME}`
  return {
    title: absoluteTitle ? { absolute: absoluteTitle } : title,
    description,
    alternates: { canonical: canonicalPath },
    openGraph: {
      type: 'website',
      siteName: TOOLKIT_NAME,
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
