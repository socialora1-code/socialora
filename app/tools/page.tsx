import type { Metadata } from 'next'
import { type ExplorerItem, ToolsExplorer } from '@/components/tools/tools-explorer'
import { buildToolsMetadata } from '@/components/tools/tool-seo'
import { TOOLS } from '@/lib/tool-list'

export const metadata: Metadata = buildToolsMetadata({
  title: 'Free Social Media Tools',
  absoluteTitle: 'Free Social Media Tools · Socialora Free Creator Toolkit',
  fullOgTitle: 'Socialora Free Creator Toolkit',
  description:
    'Free creator toolkit for Instagram, TikTok, YouTube, X and more: font generators, calculators and editing utilities. No sign-up needed.',
  canonicalPath: '/tools',
})

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
      <p className="mt-3 leading-relaxed text-muted-foreground">
        Simple tools for creators and brands. They are free, work in your browser and need no sign-up.
      </p>
      <p className="mb-8 mt-3 text-sm text-muted-foreground">
        Want practical creator tips between projects?{' '}
        <a
          href="https://t.me/SocialoraOfficial"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-primary underline underline-offset-4 hover:no-underline"
        >
          Join our free Telegram channel
        </a>
        . No sign-up is required to use these tools.
      </p>
      <ToolsExplorer items={ITEMS} />
    </div>
  )
}
