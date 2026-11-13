import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ToolPageView } from '@/components/tools/tool-page-view'
import { buildToolsMetadata } from '@/components/tools/tool-seo'
import { getNicheToolPage, NICHE_TOOL_PAGES } from '@/lib/tool-data/niche-tools'
import { getTool } from '@/lib/tool-list'

type Params = { slug: string; niche: string }
type PageProps = { params: Promise<Params> }

export const dynamicParams = false

export function generateStaticParams() {
  return NICHE_TOOL_PAGES.map(({ toolSlug: slug, niche }) => ({ slug, niche }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, niche } = await params
  const entry = getNicheToolPage(slug, niche)
  if (!entry) notFound()

  return buildToolsMetadata({
    title: entry.name,
    absoluteTitle: `Free ${entry.name}`,
    description: entry.description,
    canonicalPath: entry.path,
  })
}

export default async function NicheToolPage({ params }: PageProps) {
  const { slug, niche } = await params
  const entry = getNicheToolPage(slug, niche)
  const tool = getTool(slug)
  if (!entry || !tool) notFound()

  return <ToolPageView niche={entry} tool={{
    ...tool,
    name: entry.name,
    title: entry.name,
    h1: entry.name,
    description: entry.description,
    intro: `${entry.description} Start with the example below or replace it with your own details.`,
    tips: [entry.nextStep, ...tool.tips],
    faqs: [entry.faq, {
      q: `Is the ${entry.name} free?`,
      a: 'Yes. It runs in your browser and does not ask for an account. Edit and verify the result before you publish.',
    }],
    about: undefined,
  }} />
}
