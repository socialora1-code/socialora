import Link from 'next/link'
import { SectionHeading } from '@/components/site/page-hero'
import { getTool } from '@/lib/tool-list'
import type { ToolDef } from '@/lib/tool-data/types'

const STUDIO_GROUPS = [
  {
    id: 'revenue',
    title: 'Revenue & Engagement Simulators',
    studios: [
      ['spotify-royalty-calculator', 'Live royalty scenarios'],
      ['youtube-money-calculator', 'Live RPM simulator'],
      ['tiktok-money-coins-calculator', 'Live earnings and Coins'],
      ['facebook-money-calculator', 'Live Reels revenue model'],
      ['instagram-sponsorship-rate-calculator', 'Sponsorship rate simulator'],
    ],
  },
  {
    id: 'content',
    title: 'Content & Hook Studios',
    studios: [
      ['facebook-hashtag-generator', '15-tag custom set'],
      ['facebook-caption-generator', 'Hook, context and question'],
      ['snapchat-caption-generator', 'Story and Spotlight drafts'],
      ['instagram-hook-generator', 'Reels opening lines'],
    ],
  },
  {
    id: 'community',
    title: 'Community & Giveaway Tools',
    studios: [
      ['instagram-giveaway-picker', 'Primary and backup draw'],
      ['discord-font-generator', 'Live Discord dark preview'],
    ],
  },
] as const

const MORE_TOOLS = [
  'who-viewed-my-instagram-profile',
  'tiktok-shadowban-checker',
  'instagram-shadowban-checker',
  'tiktok-money-coins-calculator',
  'instagram-sponsorship-rate-calculator',
  'telegram-channel-money-calculator',
  'instagram-fake-follower-checker',
  'instagram-grid-maker',
  'instagram-bio-generator',
  'instagram-font-generator',
]

export function ToolsSection() {
  const tools = MORE_TOOLS.map((slug) => getTool(slug)).filter((tool): tool is ToolDef => tool !== undefined)

  return (
    <section aria-labelledby="tools-title" className="border-t border-border">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <SectionHeading id="tools-title" title="Popular Interactive Growth Studios" />
          <Link href="/tools" className="text-sm font-medium text-primary underline-offset-4 hover:underline">
            See all free tools
          </Link>
        </div>
        <div className="mt-8 grid gap-8">
          {STUDIO_GROUPS.map((group) => (
            <section key={group.id} aria-labelledby={`home-studios-${group.id}`}>
              <h3 id={`home-studios-${group.id}`} className="text-lg font-semibold tracking-tight">{group.title}</h3>
              <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {group.studios.map(([slug, feature]) => {
                  const tool = getTool(slug)
                  if (!tool) return null
                  return (
                    <li key={slug} className="flex h-full flex-col rounded-2xl border border-border bg-card p-4 transition-colors hover:border-primary/50">
                      <h4 className="font-semibold">
                        <Link href={`/tools/${slug}`} className="inline-block py-1 underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-ring">
                          {tool.name}
                        </Link>
                      </h4>
                      <span className="mt-2 mb-3 w-fit rounded-full border border-primary/25 bg-primary/10 px-2.5 py-1 text-xs font-medium text-foreground">{feature}</span>
                      <div className="mt-auto flex flex-wrap gap-x-4 border-t border-border/70 pt-2 text-sm text-muted-foreground">
                        <Link href="/free-instagram-views" className="inline-flex min-h-11 items-center underline-offset-4 hover:text-foreground hover:underline focus-visible:ring-2 focus-visible:ring-ring">Free Instagram Views</Link>
                        <Link href="/order" className="inline-flex min-h-11 items-center underline-offset-4 hover:text-foreground hover:underline focus-visible:ring-2 focus-visible:ring-ring">Growth packages</Link>
                      </div>
                    </li>
                  )
                })}
              </ul>
            </section>
          ))}
        </div>
        <h3 className="mt-10 text-lg font-semibold tracking-tight">More free creator tools</h3>
        <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
