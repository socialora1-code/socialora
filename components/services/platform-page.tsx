import { KeyRound, Mail, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import { FlatServiceSection } from '@/components/services/flat-service-section'
import { TieredServiceSection } from '@/components/services/tiered-service-section'
import { ComplianceNotice } from '@/components/site/compliance-notice'
import { PlatformIcon } from '@/components/site/platform-icon'
import { getPlatform, getStartingPriceCents, isTiered, type PlatformId } from '@/lib/catalog'
import { formatUSD } from '@/lib/format'

const PAGE_HEADINGS: Partial<Record<PlatformId, string>> = {
  instagram: 'Buy Instagram Followers',
  youtube: 'Buy YouTube Views, Watch Time & Subscribers',
  x: 'Buy X (Twitter) Followers',
}

export function PlatformPage({ platformId }: { platformId: PlatformId }) {
  const platform = getPlatform(platformId)!
  const heading = PAGE_HEADINGS[platform.id] ?? `${platform.name} growth services`

  return (
    <>
      <section className="relative overflow-hidden border-b border-border">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_90%_at_20%_0%,oklch(0.93_0.05_285/.75),transparent_70%)]"
        />
        <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <PlatformIcon platform={platform.id} size="lg" />
          <h1 className="mt-5 text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            {heading}
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground text-pretty">
            {platform.description}
          </p>

          <nav aria-label={`${platform.name} services`} className="mt-8">
            <ul className="flex flex-wrap gap-2">
              {platform.services.map((service) => (
                <li key={service.id}>
                  <Link
                    href={`#${service.id}`}
                    className="inline-flex h-11 items-center gap-2 rounded-full border border-border bg-card px-4 text-sm font-medium transition-colors hover:border-foreground/30"
                  >
                    {service.label}
                    <span className="text-muted-foreground">from {formatUSD(getStartingPriceCents(service))}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </section>

      <div className="mx-auto flex max-w-6xl flex-col gap-20 px-4 py-14 sm:px-6 sm:py-20">
        {platform.services.map((service) => (
          <section key={service.id} id={service.id} aria-labelledby={`${service.id}-title`} className="scroll-mt-24">
            <div className="mb-6 max-w-2xl">
              <h2 id={`${service.id}-title`} className="text-3xl font-semibold tracking-tight">
                {platform.name} {service.label}
              </h2>
              <p className="mt-2 leading-relaxed text-muted-foreground">{service.summary}</p>
            </div>
            {isTiered(service) ? (
              <TieredServiceSection platformId={platform.id} serviceId={service.id} />
            ) : (
              <FlatServiceSection platformId={platform.id} serviceId={service.id} />
            )}
          </section>
        ))}

        <section aria-labelledby="ordering-notes" className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <h2 id="ordering-notes" className="text-2xl font-semibold tracking-tight">
              Before you order
            </h2>
            <p className="mt-2 leading-relaxed text-muted-foreground">
              A few things to keep in mind so your order goes smoothly.
            </p>
          </div>
          <ul className="grid gap-3">
            {[
              {
                icon: KeyRound,
                title: 'No password required',
                body: `We only need the public ${platform.name} URL or username. Never share your login details with anyone.`,
              },
              {
                icon: ShieldCheck,
                title: 'Keep your account public',
                body: 'Your profile or post must stay public while the order is being processed.',
              },
              {
                icon: Mail,
                title: 'Use an email you check',
                body: 'Order updates and payment instructions are sent to the email address you enter at checkout.',
              },
            ].map((item) => (
              <li key={item.title} className="flex gap-4 rounded-2xl border border-border bg-card p-4">
                <item.icon className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
                <div>
                  <h3 className="font-medium">{item.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <ComplianceNotice />
      </div>
    </>
  )
}
