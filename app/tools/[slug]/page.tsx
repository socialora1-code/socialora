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
  return {
    title: tool.title,
    description: tool.description,
    alternates: { canonical: `/tools/${tool.slug}` },
  }
}

export default async function ToolPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const tool = getTool(slug)
  if (!tool) notFound()
  return <ToolPageView tool={tool} />
}
