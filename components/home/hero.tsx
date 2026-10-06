import { ArrowRight, KeyRound, Mail, Receipt } from 'lucide-react'
import Link from 'next/link'
import { PlatformIcon } from '@/components/site/platform-icon'
import { buttonVariants } from '@/components/ui/button'
import { getStartingPriceCents, PLATFORMS } from '@/lib/catalog'
import { formatUSD } from '@/lib/format'
import { cn } from '@/lib/utils'

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(55%_60%_at_15%_0%,oklch(0.92_0.06_285/.9),transparent_70%),radial-gradient(40%_50%_at_95%_10%,oklch(0.94_0.05_40/.8),transparent_70%)]"
      />
      <div className="relative mx-auto grid max-w-6xl grid-cols-1 gap-12 px-4 pt-14 pb-16 sm:px-6 sm:pt-20 sm:pb-24 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:items-center">
        <div className="min-w-0">
          <p className="inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
            <span className="size-1.5 rounded-full bg-primary" aria-hidden="true" />
            Instagram · YouTube · X
          </p>
          <h1 className="mt-6 text-5xl leading-[1.05] font-semibold tracking-tight text-balance sm:text-6xl">
            Grow Your <span className="text-gradient">Social Presence</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground text-pretty">
            Social media growth services for Instagram, YouTube and X. Simple ordering, transparent pricing and
            dedicated support.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/order" className={cn(buttonVariants(), 'h-12 rounded-full px-7 text-base')}>
              Get Started
              <ArrowRight data-icon="inline-end" />
            </Link>
            <Link
              href="#services"
              className={cn(buttonVariants({ variant: 'outline' }), 'h-12 rounded-full bg-card px-7 text-base')}
            >
              View Services
            </Link>
          </div>
          <ul className="mt-10 grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
            {[
              { icon: KeyRound, label: 'No password needed' },
              { icon: Mail, label: 'No account required' },
              { icon: Receipt, label: 'Prices shown upfront' },
            ].map((item) => (
              <li key={item.label} className="flex items-center gap-2">
                <item.icon className="size-4 shrink-0 text-primary" aria-hidden="true" />
                {item.label}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative min-w-0">
          <div className="rounded-3xl border border-border bg-card/90 p-3 shadow-[0_30px_80px_-40px_oklch(0.3_0.1_280/.45)] backdrop-blur">
            <div className="flex items-center justify-between px-3 pt-2 pb-3">
              <p className="text-sm font-medium">Starting prices</p>
              <p className="text-xs text-muted-foreground">USD</p>
            </div>
            <ul className="flex flex-col gap-2">
              {PLATFORMS.map((platform) => (
                <li key={platform.id}>
                  <Link
                    href={platform.path}
                    className="group flex items-center gap-4 rounded-2xl border border-border bg-background p-4 transition-colors hover:border-foreground/25"
                  >
                    <PlatformIcon platform={platform.id} />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{platform.name}</p>
                      <p className="truncate text-sm text-muted-foreground">{platform.tagline}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-xs text-muted-foreground">from</p>
                      <p className="font-semibold tabular-nums">
                        {formatUSD(Math.min(...platform.services.map(getStartingPriceCents)))}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
