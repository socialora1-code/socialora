import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { LandingPageView } from '@/components/services/landing-page-view'
import { getLandingPagesFor, getPlatformLandingPage } from '@/lib/landing-pages'

export const dynamicParams = false

export function generateStaticParams() {
  return getLandingPagesFor('x').map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const page = getPlatformLandingPage('x', slug)
  if (!page) return {}
  const url = `/x/${page.slug}`
  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: url },
    openGraph: { url, title: `${page.title} · Socialora` },
  }
}

export default async function XLandingPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const page = getPlatformLandingPage('x', slug)
  if (!page) notFound()
  return <LandingPageView page={page} />
}
