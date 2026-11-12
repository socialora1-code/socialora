import Link from 'next/link'
import { TOOLS } from '@/lib/tool-list'

interface ToolLinkItem {
  slug: string
  href: string
  name: string
  group: string
  platform: string
  description: string
}

const STANDALONE_CALCULATOR: ToolLinkItem = {
  slug: 'instagram-engagement-rate-calculator',
  href: '/tools/instagram-engagement-rate-calculator',
  name: 'Instagram Engagement Rate Calculator',
  group: 'Calculators',
  platform: 'Instagram',
  description:
    'Free Instagram engagement rate calculator. Enter followers, average likes and comments to measure your interaction rate.',
}

const ALL_51_TOOLS: ToolLinkItem[] = [
  ...TOOLS.map((t) => ({
    slug: t.slug,
    href: `/tools/${t.slug}`,
    name: t.name,
    group: t.group,
    platform: t.platform,
    description: t.description,
  })),
  STANDALONE_CALCULATOR,
]

export function getRelatedTools(currentSlug: string, count = 4): ToolLinkItem[] {
  const current = ALL_51_TOOLS.find((t) => t.slug === currentSlug)
  const currentGroup = current?.group || ''
  const currentPlatform = current?.platform || ''

  // 1. Same category first
  const sameGroup = ALL_51_TOOLS.filter((t) => t.slug !== currentSlug && t.group === currentGroup)

  // 2. Same platform second
  const samePlatform = ALL_51_TOOLS.filter(
    (t) => t.slug !== currentSlug && t.group !== currentGroup && t.platform === currentPlatform,
  )

  // 3. Fallback popular tools
  const others = ALL_51_TOOLS.filter(
    (t) => t.slug !== currentSlug && t.group !== currentGroup && t.platform !== currentPlatform,
  )

  return [...sameGroup, ...samePlatform, ...others].slice(0, count)
}

interface RelatedCreatorToolsProps {
  currentSlug: string
  heading?: string
  subheading?: string
}

export function RelatedCreatorTools({
  currentSlug,
  heading = 'Related Creator Tools',
  subheading = 'Explore complementary free creator utilities to grow your audience and refine your content workflow.',
}: RelatedCreatorToolsProps) {
  const related = getRelatedTools(currentSlug, 4)

  return (
    <section className="mt-14 border-t border-border pt-12" aria-labelledby="related-tools-heading">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 id="related-tools-heading" className="text-2xl font-semibold tracking-tight text-foreground">
            {heading}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{subheading}</p>
        </div>
        <Link
          href="/tools"
          className="shrink-0 text-sm font-medium text-primary underline underline-offset-4 hover:no-underline"
        >
          Browse All 51 Free Tools
        </Link>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {related.map((item) => (
          <Link
            key={item.slug}
            href={item.href}
            className="group relative flex flex-col justify-between rounded-2xl border border-border bg-card p-5 transition-all hover:border-primary/40 hover:shadow-sm"
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                  {item.group}
                </span>
                <span className="text-xs text-muted-foreground">{item.platform}</span>
              </div>
              <h3 className="mt-3 text-base font-semibold text-foreground group-hover:text-primary transition-colors">
                {item.name}
              </h3>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground line-clamp-2">
                {item.description}
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-xs font-medium text-primary">
              <span>Use Free Tool</span>
              <span aria-hidden="true">&rarr;</span>
            </div>
          </Link>
        ))}
      </div>

      {/* Internal SEO Hub Link: Free Instagram Views */}
      <div className="mt-6 rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/5 via-card to-primary/5 p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-xl">
            <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              Organic Reach Accelerator
            </span>
            <h3 className="mt-2 text-lg font-semibold tracking-tight text-foreground">
              <Link
                href="/free-instagram-views"
                className="hover:underline hover:text-primary transition-colors"
              >
                Free Instagram Views (Instant Reel Boost)
              </Link>
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Test real video momentum on your latest Reel. Boost early watch signals and Explore distribution with our 100% free creator trial. No password or card required.
            </p>
          </div>
          <Link
            href="/free-instagram-views"
            className="inline-flex h-10 shrink-0 items-center justify-center rounded-full bg-primary px-5 text-xs font-medium text-primary-foreground shadow-sm hover:opacity-95 transition-opacity"
          >
            Claim Free Instagram Views
          </Link>
        </div>
      </div>
    </section>
  )
}
