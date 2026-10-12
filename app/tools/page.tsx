import type { Metadata } from 'next'
import { type ExplorerItem, ToolsExplorer } from '@/components/tools/tools-explorer'
import { TOOLS } from '@/lib/tool-list'

export const metadata: Metadata = {
  title: 'Free Social Media Tools',
  description:
    'Free tools for Instagram, TikTok, YouTube, X and more: font generators, calculators and generators. No sign-up needed.',
  alternates: { canonical: '/tools' },
}

const ITEMS: ExplorerItem[] = [
  ...TOOLS.map((tool) => ({
    href: `/tools/${tool.slug}`,
    name: tool.name,
    group: tool.group,
    platform: tool.platform,
    blurb: tool.description,
  })),
  {
    href: '/tools/instagram-engagement-rate-calculator',
    name: 'Instagram Engagement Rate Calculator',
    group: 'Calculators',
    platform: 'Instagram',
    blurb:
      'Free Instagram engagement rate calculator. Enter your followers, average likes and comments to see your engagement rate.',
  },
]

export default function ToolsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:py-16">
      <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">Free Social Media Tools</h1>
      <p className="mb-8 mt-3 leading-relaxed text-muted-foreground">
        Simple tools for creators and brands. They are free, work in your browser and need no sign-up.
      </p>
      <ToolsExplorer items={ITEMS} />
    </div>
  )
}
