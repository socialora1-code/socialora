import Link from 'next/link'
import { FlatServiceSection } from '@/components/services/flat-service-section'
import { ComplianceNotice } from '@/components/site/compliance-notice'
import { PlatformIcon } from '@/components/site/platform-icon'
import { getPlatform, getService, getStartingPriceCents, type PlatformId, type ServiceId } from '@/lib/catalog'
import { formatUSD } from '@/lib/format'

export interface LandingContent {
  platformId: PlatformId
  serviceId: ServiceId
  h1: string
  intro: string
  highlights: string[]
  whoFor: string
  faqs: { q: string; a: string }[]
  related: { href: string; label: string }[]
}

export function ServiceLandingPage({ content }: { content: LandingContent }) {
  const platform = getPlatform(content.platformId)!
  const service = getService(platform, content.serviceId)!

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: content.faqs.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema).replace(/</g, '\\u003c') }}
      />

      <section className="relative overflow-hidden border-b border-border">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_90%_at_20%_0%,oklch(0.93_0.05_285/.75),transparent_70%)]"
        />
        <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <PlatformIcon platform={platform.id} size="lg" />
          <h1 className="mt-5 text-4xl font-semibold tracking-tight text-balance sm:text-5xl">{content.h1}</h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground text-pretty">{content.intro}</p>
          <p className="mt-4 text-sm font-medium">
            Starting at {formatUSD(getStartingPriceCents(service))}
            {service.refill ? ` · ${service.refill}` : ''}
          </p>
        </div>
      </section>

      <div className="mx-auto flex max-w-6xl flex-col gap-16 px-4 py-14 sm:px-6 sm:py-20">
        <section aria-labelledby="order-title" className="scroll-mt-24">
          <div className="mb-6 max-w-2xl">
            <h2 id="order-title" className="text-3xl font-semibold tracking-tight">
              Choose your quantity
            </h2>
            <p className="mt-2 leading-relaxed text-muted-foreground">{service.summary}</p>
          </div>
          <FlatServiceSection platformId={platform.id} serviceId={service.id} />
        </section>

        <section aria-labelledby="highlights-title" className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <h2 id="highlights-title" className="text-2xl font-semibold tracking-tight">
              What you get
            </h2>
            <p className="mt-2 leading-relaxed text-muted-foreground">{content.whoFor}</p>
          </div>
          <ul className="grid gap-3">
            {content.highlights.map((text) => (
              <li key={text} className="rounded-2xl border border-border bg-card p-4 text-sm leading-relaxed">
                {text}
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="compare-title">
          <h2 id="compare-title" className="text-2xl font-semibold tracking-tight">
            Compare {platform.name} options
          </h2>
          <div className="mt-6 overflow-x-auto rounded-2xl border border-border">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 font-medium">Option</th>
                  <th className="px-4 py-3 font-medium">Starting price</th>
                  <th className="px-4 py-3 font-medium">Refill</th>
                </tr>
              </thead>
              <tbody>
                {platform.services.map((item) => (
                  <tr key={item.id} className="border-t border-border">
                    <td className="px-4 py-3 font-medium">
                      {platform.name} {item.label}
                    </td>
                    <td className="px-4 py-3">{formatUSD(getStartingPriceCents(item))}</td>
                    <td className="px-4 py-3 text-muted-foreground">{item.refill ?? 'None'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section aria-labelledby="faq-title" className="max-w-3xl">
          <h2 id="faq-title" className="text-2xl font-semibold tracking-tight">
            Frequently asked questions
          </h2>
          <div className="mt-6 grid gap-3">
            {content.faqs.map((item) => (
              <details key={item.q} className="rounded-2xl border border-border bg-card p-4">
                <summary className="cursor-pointer font-medium">{item.q}</summary>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section aria-labelledby="related-title">
          <h2 id="related-title" className="text-2xl font-semibold tracking-tight">
            More {platform.name} services
          </h2>
          <ul className="mt-4 flex flex-wrap gap-2">
            {content.related.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="inline-flex h-11 items-center rounded-full border border-border bg-card px-4 text-sm font-medium transition-colors hover:border-foreground/30"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <ComplianceNotice />
      </div>
    </>
  )
}
