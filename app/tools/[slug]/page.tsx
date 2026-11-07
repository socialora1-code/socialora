import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ToolPageView } from '@/components/tools/tool-page-view'
import { getTool, TOOLS } from '@/lib/tool-list'

export const dynamicParams = false

export function generateStaticParams() {
  return TOOLS.map((tool) => ({ slug: tool.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const tool = getTool(slug)
  if (!tool) return {}
  const rawTitle = tool.title
  const ctrTitle =
    rawTitle.includes('2026') || rawTitle.includes('No Login')
      ? rawTitle
      : rawTitle.includes('(Free)')
        ? rawTitle.replace('(Free)', '(Free & No Login — 2026)')
        : `${rawTitle} (Free & No Login)`
  const rawDesc = tool.description
  const ctrDesc =
    rawDesc.toLowerCase().includes('no login') || rawDesc.toLowerCase().includes('no password')
      ? rawDesc
      : `${rawDesc} 100% free, instant results, no login or sign-up required.`
  return {
    title: ctrTitle,
    description: ctrDesc,
    alternates: { canonical: `/tools/${tool.slug}` },
  }
}

export default async function ToolPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const tool = getTool(slug)
  if (!tool) notFound()
  return <ToolPageView tool={tool} />
}
