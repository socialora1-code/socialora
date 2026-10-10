import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { LandingPageView } from '@/components/services/landing-page-view'
import { TIKTOK_LANDING_PAGES, getTikTokLandingPage } from '@/lib/landing-pages'

export const dynamicParams = false

export function generateStaticParams() {
  return TIKTOK_LANDING_PAGES.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const page = getTikTokLandingPage(slug)
  if (!page) return {}
  const url = `/tiktok/${page.slug}`
  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: url },
    openGraph: { url, title: `${page.title} · Socialora` },
  }
}

export default async function TikTokLandingPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const page = getTikTokLandingPage(slug)
  if (!page) notFound()
  return <LandingPageView page={page} />
}
