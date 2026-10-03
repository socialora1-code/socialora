import { ChevronDown } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { CtaSection } from '@/components/site/cta-section'
import { PageHero } from '@/components/site/page-hero'
import { FAQ } from '@/lib/faq'

export const metadata: Metadata = {
  title: 'FAQ',
  description:
    'Answers to common questions about Socialora: ordering, passwords, delivery, refills, manual crypto payment, transaction IDs, cancellations and refunds.',
  alternates: { canonical: '/faq' },
  openGraph: { url: '/faq', title: 'Frequently Asked Questions · Socialora' },
}

export default function FaqPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer.join(' ') },
    })),
  }

  return (
    <>
      <PageHero
        eyebrow="FAQ"
        title="Frequently asked questions"
        description="Honest answers about how Socialora works. Can't find what you need? Contact our support team."
      />
      <section className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
        <div className="flex flex-col gap-3">
          {FAQ.map((item) => (
            <details key={item.question} className="group rounded-2xl border border-border bg-card open:shadow-sm">
              <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 font-medium [&::-webkit-details-marker]:hidden">
                <h2 className="text-base">{item.question}</h2>
                <ChevronDown
                  className="size-5 shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
                  aria-hidden="true"
                />
              </summary>
              <div className="flex flex-col gap-3 px-5 pb-5 text-sm leading-relaxed text-muted-foreground">
                {item.answer.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </details>
          ))}
        </div>
        <p className="mt-10 text-sm text-muted-foreground">
          Still have questions?{' '}
          <Link href="/contact" className="font-medium text-foreground underline underline-offset-4">
            Contact support
          </Link>
          .
        </p>
      </section>
      <CtaSection />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  )
}
