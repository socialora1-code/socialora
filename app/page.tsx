import Link from 'next/link'
import { Hero } from '@/components/home/hero'
import { HowItWorksSteps } from '@/components/home/how-it-works-steps'
import { PlatformCards } from '@/components/home/platform-cards'
import { TransparencySection } from '@/components/home/transparency-section'
import { ComplianceNotice } from '@/components/site/compliance-notice'
import { CtaSection } from '@/components/site/cta-section'
import { SectionHeading } from '@/components/site/page-hero'
import { POSTS } from '@/lib/blog'

const GUIDES = POSTS.slice(0, 3)

export default function HomePage() {
  return (
    <>
      <Hero />
      <PlatformCards />
      <section aria-labelledby="how-title" className="border-t border-border">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <SectionHeading id="how-title" eyebrow="How it works" title="Three simple steps" />
            <Link
              href="/how-it-works"
              className="text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              Learn more about the process
            </Link>
          </div>
          <div className="mt-10">
            <HowItWorksSteps />
          </div>
        </div>
      </section>
      <TransparencySection />
      <section aria-labelledby="guides-title" className="border-t border-border">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <SectionHeading id="guides-title" eyebrow="Guides" title="Social media growth guides" />
            <Link href="/blog" className="text-sm font-medium text-primary underline-offset-4 hover:underline">
              See all guides
            </Link>
          </div>
          <ul className="mt-10 grid gap-4 md:grid-cols-3">
            {GUIDES.map((post) => (
              <li key={post.slug}>
                <Link
                  href={`/blog/${post.slug}`}
                  className="flex h-full flex-col rounded-3xl border border-border bg-card p-6 transition-colors hover:border-foreground/25"
                >
                  <p className="text-xs font-medium text-primary">{post.category}</p>
                  <h3 className="mt-2 leading-snug font-semibold">{post.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{post.description}</p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <div className="mx-auto max-w-6xl px-4 pt-16 sm:px-6">
        <ComplianceNotice />
      </div>
      <CtaSection />
    </>
  )
}
