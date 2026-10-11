import type { Metadata } from 'next'
import Link from 'next/link'
import { TOOLS } from '@/lib/tool-list'

export const metadata: Metadata = {
  title: 'Free Social Media Tools',
  description:
    'Free tools for Instagram, TikTok, YouTube, X and more: font generators, calculators and generators. No sign-up needed.',
  alternates: { canonical: '/tools' },
}

const ITEMS = [
  ...TOOLS.map((tool) => ({ href: `/tools/${tool.slug}`, name: tool.name, group: tool.group })),
  {
    href: '/tools/instagram-engagement-rate-calculator',
    name: 'Instagram Engagement Rate Calculator',
    group: 'Calculators',
  },
]

export default function ToolsPage() {
  const groups = Array.from(new Set(ITEMS.map((item) => item.group)))

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:py-16">
      <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">Free Social Media Tools</h1>
      <p className="mt-3 leading-relaxed text-muted-foreground">
        Simple tools for creators and brands. They are free, work in your browser and need no sign-up.
      </p>

      {groups.map((group) => (
        <section key={group} className="mt-10" aria-labelledby={`group-${group}`}>
          <h2 id={`group-${group}`} className="text-2xl font-semibold tracking-tight">
            {group}
          </h2>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {ITEMS.filter((item) => item.group === group).map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="block rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium hover:bg-muted"
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
