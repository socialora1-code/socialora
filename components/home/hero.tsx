import { ArrowRight, KeyRound, Mail, Receipt } from 'lucide-react'
import Link from 'next/link'
import { FreeViewsForm } from '@/components/home/free-views-form'
import { PlatformIcon } from '@/components/site/platform-icon'
import { buttonVariants } from '@/components/ui/button'
import { getStartingPriceCents, PLATFORMS } from '@/lib/catalog'
import { formatUSD } from '@/lib/format'
import { cn } from '@/lib/utils'

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="animate-drift absolute -top-32 -left-24 size-[28rem] rounded-full bg-primary/30 blur-3xl" />
        <div
          className="animate-drift absolute top-0 -right-24 size-[24rem] rounded-full bg-brand-warm/20 blur-3xl"
          style={{ animationDelay: '-6s' }}
        />
      </div>
      <div className="relative mx-auto grid max-w-6xl grid-cols-1 gap-12 px-4 pt-14 pb-16 sm:px-6 sm:pt-20 sm:pb-24 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:items-center">
        <div className="animate-fade-up min-w-0">
          <p className="inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
            <span className="size-1.5 rounded-full bg-primary" aria-hidden="true" />
            Instagram · TikTok · YouTube · X
          </p>
          <h1 className="mt-6 text-5xl leading-[1.05] font-semibold tracking-tight text-balance sm:text-6xl">
            Buy <span className="text-gradient">Instagram Followers</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground text-pretty">
            Buy Instagram followers from the USA, Spain, Brazil and more, plus TikTok followers, YouTube views and X
            followers. Clear USD pricing, no password needed and refill guarantees on selected services.
          </p>
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

          <FreeViewsForm />

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/order"
              className={cn(buttonVariants(), 'brand-gradient glow h-12 rounded-full border-0 px-7 text-base text-white')}
            >
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
        </div>

        <div className="animate-fade-up relative min-w-0" style={{ animationDelay: '0.15s' }}>
          <div className="rounded-3xl border border-border bg-card/80 p-3 shadow-[0_30px_80px_-40px_oklch(0.63_0.22_295/.55)] backdrop-blur">
            <div className="flex items-center justify-between px-3 pt-2 pb-3">
              <p className="text-sm font-medium">Starting prices</p>
              <p className="text-xs text-muted-foreground">USD</p>
            </div>
            <ul className="flex flex-col gap-2">
              {PLATFORMS.map((platform) => (
                <li key={platform.id}>
                  <Link
                    href={platform.path}
                    className="group flex items-center gap-4 rounded-2xl border border-border bg-background/60 p-4 transition-all hover:-translate-y-0.5 hover:border-primary/60"
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
