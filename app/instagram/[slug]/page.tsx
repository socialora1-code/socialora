import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { LandingPageView } from '@/components/services/landing-page-view'
import { LANDING_PAGES, getLandingPage } from '@/lib/landing-pages'

export const dynamicParams = false

export function generateStaticParams() {
  return LANDING_PAGES.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const page = getLandingPage(slug)
  if (!page) return {}
  const url = `/instagram/${page.slug}`
  const ctrTitle = page.title.includes('2026') ? page.title : `${page.title} — No Password & Refill Protected (2026)`
  return {
    title: ctrTitle,
    description: page.description,
    alternates: { canonical: url },
    openGraph: { url, title: `${ctrTitle} · Socialora` },
  }
}

export default async function InstagramLandingPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const page = getLandingPage(slug)
  if (!page) notFound()
  return <LandingPageView page={page} />
}
