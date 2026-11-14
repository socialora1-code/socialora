import { Check } from 'lucide-react'
import Link from 'next/link'
import { FlatServiceSection } from '@/components/services/flat-service-section'
import { ComplianceNotice } from '@/components/site/compliance-notice'
import { PlatformIcon } from '@/components/site/platform-icon'
import { getPlatform, getService, getStartingPriceCents } from '@/lib/catalog'
import { formatUSD } from '@/lib/format'
import { getLandingPagesFor, type LandingPage } from '@/lib/landing-pages'
import { serviceSchema } from '@/lib/service-schema'

export function LandingPageView({ page }: { page: LandingPage }) {
  const platform = getPlatform(page.platformId ?? 'instagram')!
  const service = getService(platform, page.serviceId)!
  const others = getLandingPagesFor(platform.id).filter((p) => p.slug !== page.slug)

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      ...serviceSchema(platform, service, { name: page.title, description: page.description }),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: page.faqs.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    },
  ]

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />

      <section className="relative overflow-hidden border-b border-border">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_90%_at_20%_0%,oklch(0.93_0.05_285/.75),transparent_70%)]"
        />
        <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <nav aria-label="Breadcrumb" className="mb-5 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground">
              Home
            </Link>
            {' / '}
            <Link href={platform.path} className="hover:text-foreground">
              {platform.name}
            </Link>
            {' / '}
            <span className="text-foreground">{page.title}</span>
          </nav>
          <PlatformIcon platform={platform.id} size="lg" />
          <h1 className="mt-5 text-4xl font-semibold tracking-tight text-balance sm:text-5xl">{page.h1}</h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground text-pretty">{page.intro}</p>

          <ul className="mt-6 grid gap-2">
            {page.points.map((point) => (
              <li key={point} className="flex items-start gap-2 text-sm sm:text-base">
                <Check className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
                <span>{point}</span>
              </li>
            ))}
          </ul>

          <Link
            href="#order"
            className="mt-8 inline-flex h-12 items-center rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            See prices · from {formatUSD(getStartingPriceCents(service))}
          </Link>
        </div>
      </section>

      <div className="mx-auto flex max-w-6xl flex-col gap-20 px-4 py-14 sm:px-6 sm:py-20">
        <section id="order" aria-labelledby="order-title" className="scroll-mt-24">
          <div className="mb-6 max-w-2xl">
            <h2 id="order-title" className="text-3xl font-semibold tracking-tight">
              Choose your amount
            </h2>
            <p className="mt-2 leading-relaxed text-muted-foreground">{service.summary}</p>
          </div>
          <FlatServiceSection platformId={platform.id} serviceId={service.id} />
        </section>

        <section aria-labelledby="faq-title" className="grid gap-6 lg:grid-cols-[1fr_1.6fr]">
          <div>
            <h2 id="faq-title" className="text-2xl font-semibold tracking-tight">
              Frequently asked questions
            </h2>
            <p className="mt-2 leading-relaxed text-muted-foreground">
              Quick answers before you order. Need more help? Contact us anytime.
            </p>
          </div>
          <div className="grid gap-3">
            {page.faqs.map((f) => (
              <details key={f.q} className="group rounded-2xl border border-border bg-card p-4">
                <summary className="cursor-pointer list-none font-medium">{f.q}</summary>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section aria-labelledby="more-title">
          <h2 id="more-title" className="text-2xl font-semibold tracking-tight">
            More {platform.name} options
          </h2>
          <ul className="mt-4 flex flex-wrap gap-2">
            {others.map((p) => (
              <li key={p.slug}>
                <Link
                  href={`${platform.path}/${p.slug}`}
                  className="inline-flex h-11 items-center rounded-full border border-border bg-card px-4 text-sm font-medium transition-colors hover:border-foreground/30"
                >
                  {p.title}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href={platform.path}
                className="inline-flex h-11 items-center rounded-full border border-border bg-card px-4 text-sm font-medium transition-colors hover:border-foreground/30"
              >
                All {platform.name} services
              </Link>
            </li>
          </ul>
        </section>

        <ComplianceNotice />
      </div>
    </>
  )
}
