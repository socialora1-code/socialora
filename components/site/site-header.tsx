import { ChevronDown } from 'lucide-react'
import Link from 'next/link'
import { Logo } from '@/components/site/logo'
import { MobileNav, type ToolMenuGroup } from '@/components/site/mobile-nav'
import { buttonVariants } from '@/components/ui/button'
import { MAIN_NAV } from '@/lib/site'
import { TOOLS } from '@/lib/tool-list'
import { cn } from '@/lib/utils'

// In these groups the group title already says what the tool is, so only the platform is shown.
const SHORT_GROUPS = new Set(['Font Generators', 'Bio Generators', 'Hashtag Generators', 'Caption Generators'])

function buildToolGroups(): ToolMenuGroup[] {
  const map = new Map<string, { href: string; label: string }[]>()
  for (const tool of TOOLS) {
    const list = map.get(tool.group) ?? []
    list.push({
      href: `/tools/${tool.slug}`,
      label: SHORT_GROUPS.has(tool.group) ? tool.platform : tool.name,
    })
    map.set(tool.group, list)
  }
  const calculators = map.get('Calculators') ?? []
  calculators.push({
    href: '/tools/instagram-engagement-rate-calculator',
    label: 'Instagram Engagement Rate',
  })
  map.set('Calculators', calculators)
  return Array.from(map, ([title, links]) => ({ title, links }))
}

export function SiteHeader() {
  const toolGroups = buildToolGroups()

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Logo />
        <nav aria-label="Main" className="hidden xl:block">
          <ul className="flex items-center gap-1">
            {MAIN_NAV.map((item) =>
              item.href === '/tools' ? (
                <li key={item.href} className="group relative">
                  <Link
                    href="/tools"
                    className="inline-flex items-center gap-1 rounded-full px-3.5 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    {item.label}
                    <ChevronDown className="h-3.5 w-3.5" />
                  </Link>
                  <div className="invisible absolute left-1/2 top-full z-50 w-[760px] -translate-x-1/2 pt-3 opacity-0 transition-opacity group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
                    <div className="max-h-[70vh] overflow-y-auto rounded-2xl border border-border bg-background p-5 shadow-xl">
                      <div className="grid grid-cols-3 gap-x-6 gap-y-5">
                        {toolGroups.map((group) => (
                          <div key={group.title}>
                            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                              {group.title}
                            </p>
                            <ul className="mt-2 grid gap-0.5">
                              {group.links.map((link) => (
                                <li key={link.href}>
                                  <Link
                                    href={link.href}
                                    className="block rounded-lg px-2 py-1.5 text-sm hover:bg-muted"
                                  >
                                    {link.label}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                      <Link
                        href="/tools"
                        className="mt-5 inline-flex text-sm font-medium underline underline-offset-4"
                      >
                        See all free tools
                      </Link>
                    </div>
                  </div>
                </li>
              ) : (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="rounded-full px-3.5 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    {item.label}
                  </Link>
                </li>
              ),
            )}
          </ul>
        </nav>
        <div className="flex items-center gap-2">
          <Link
            href="/contact"
            className="hidden rounded-full px-3.5 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground xl:inline-flex"
          >
            Support
          </Link>
          <Link
            href="/order"
            className={cn(buttonVariants(), 'brand-gradient hidden h-10 rounded-full border-0 px-5 text-white sm:inline-flex')}
          >
            Get Started
          </Link>
          <MobileNav toolGroups={toolGroups} />
        </div>
      </div>
    </header>
  )
}
