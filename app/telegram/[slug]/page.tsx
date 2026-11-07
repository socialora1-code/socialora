import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { LandingPageView } from '@/components/services/landing-page-view'
import { getLandingPagesFor, getPlatformLandingPage } from '@/lib/landing-pages'

export const dynamicParams = false

export function generateStaticParams() {
  return getLandingPagesFor('telegram').map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const page = getPlatformLandingPage('telegram', slug)
  if (!page) return {}
  const url = `/telegram/${page.slug}`
  const ctrTitle = page.title.includes('2026') ? page.title : `${page.title} — Fast & No Login (2026)`
  return {
    title: ctrTitle,
    description: page.description,
    alternates: { canonical: url },
    openGraph: { url, title: `${ctrTitle} · Socialora` },
  }
}

export default async function TelegramLandingPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const page = getPlatformLandingPage('telegram', slug)
  if (!page) notFound()
  return <LandingPageView page={page} />
}
