import Link from 'next/link'
import { SectionHeading } from '@/components/site/page-hero'
import { getTool } from '@/lib/tool-list'
import type { ToolDef } from '@/lib/tool-data/types'

const FEATURED = [
  'instagram-giveaway-picker',
  'instagram-grid-maker',
  'instagram-bio-generator',
  'instagram-content-ideas-generator',
  'twitter-bio-generator',
  'tiktok-bio-generator',
  'facebook-bio-generator',
  'snapchat-caption-generator',
  'spotify-royalty-calculator',
  'youtube-money-calculator',
  'instagram-font-generator',
  'instagram-hashtag-generator',
]

export function ToolsSection() {
  const tools = FEATURED.map((slug) => getTool(slug)).filter((t): t is ToolDef => t !== undefined)

  return (
    <section aria-labelledby="tools-title" className="border-t border-border">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <SectionHeading id="tools-title" eyebrow="Free tools" title="Free tools for creators" />
          <Link href="/tools" className="text-sm font-medium text-primary underline-offset-4 hover:underline">
            See all free tools
          </Link>
        </div>
        <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => (
            <li key={tool.slug}>
              <Link
                href={`/tools/${tool.slug}`}
                className="block h-full rounded-2xl border border-border bg-card p-4 transition-colors hover:bg-muted"
              >
                <span className="text-xs font-medium text-primary">{tool.platform}</span>
                <span className="mt-1 block font-semibold">{tool.name}</span>
                <span className="mt-1 line-clamp-2 block text-sm text-muted-foreground">{tool.description}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
