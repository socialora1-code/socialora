import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { SectionHeading } from '@/components/site/page-hero'
import { PlatformIcon } from '@/components/site/platform-icon'
import { getStartingPriceCents, PLATFORMS } from '@/lib/catalog'
import { formatUSD } from '@/lib/format'

const VISIBLE_SERVICES = 4

export function PlatformCards() {
  return (
    <section id="services" aria-labelledby="services-title" className="scroll-mt-20 border-t border-border">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <SectionHeading
          id="services-title"
          eyebrow="Services"
          title="Choose your platform"
          description="Pick a platform to see every service, package and price in one place."
        />
        <ul className="mt-10 grid gap-4 md:grid-cols-3">
          {PLATFORMS.map((platform) => {
            const shown = platform.services.slice(0, VISIBLE_SERVICES)
            const more = platform.services.length - shown.length
            return (
              <li key={platform.id}>
                <Link
                  href={platform.path}
                  className="group flex h-full flex-col rounded-3xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:border-primary/60 hover:shadow-[0_24px_60px_-30px_oklch(0.63_0.22_295/.7)]"
                >
                  <PlatformIcon platform={platform.id} size="lg" />
                  <h3 className="mt-6 text-2xl font-semibold tracking-tight">{platform.name}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{platform.description}</p>
                  <ul className="mt-6 flex flex-col divide-y divide-border border-y border-border">
                    {shown.map((service) => (
                      <li key={service.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                        <span>
                          {platform.name} {service.label}
                        </span>
                        <span className="shrink-0 text-muted-foreground tabular-nums">
                          from {formatUSD(getStartingPriceCents(service))}
                        </span>
                      </li>
                    ))}
                    {more > 0 && (
                      <li className="py-3 text-sm text-muted-foreground">
                        + {more} more {more === 1 ? 'service' : 'services'}
                      </li>
                    )}
                  </ul>
                  <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                    View {platform.name} services
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
