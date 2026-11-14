import type { Metadata } from 'next'
import Link from 'next/link'
import { ComplianceNotice } from '@/components/site/compliance-notice'
import { CtaSection } from '@/components/site/cta-section'
import { PageHero } from '@/components/site/page-hero'

const title = 'About Socialora | Free Creator Tools and Order Support'
const description = 'Learn what Socialora offers, how to use its free creator tools without logging in, and how pricing, payment and support work for paid services.'

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: '/about' },
  openGraph: { url: '/about', title, description },
  twitter: { card: 'summary_large_image', title, description },
}

const PRINCIPLES = [
  {
    title: 'Straightforward',
    body: 'A short, clear ordering process without accounts, subscriptions or hidden steps.',
  },
  {
    title: 'Transparent',
    body: 'Prices are listed upfront in USD and each package explains what it offers in plain language.',
  },
  {
    title: 'Respectful of your accounts',
    body: 'We only work with public URLs and usernames. We never request passwords or login details.',
  },
  {
    title: 'Supportive',
    body: 'Every order is reviewed by a person, and our support team is available by email for any question.',
  },
] as const

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About"
        title="Social growth, made straightforward"
        description="Socialora provides straightforward social media growth services for creators, brands and businesses."
      />
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr]">
          <div className="flex flex-col gap-4 leading-relaxed text-muted-foreground">
            <p>
              We offer followers, likes, views and subscribers for Instagram, TikTok and YouTube through a simple,
              guided checkout. Choose a service, enter the public profile or post you want to grow and complete your
              order without creating an account.
            </p>
            <p>
              Our goal is to keep things clear: fixed packages, visible prices and honest information about how orders
              are processed. Payments are made in cryptocurrency and reviewed manually by our team before an order
              begins.
            </p>
            <h2 className="text-lg font-semibold text-foreground">What is Socialora?</h2>
            <p>
              Socialora offers paid social media services and a{' '}
              <Link href="/tools" className="font-medium text-primary underline underline-offset-4">free creator toolkit</Link>.
              You can generate captions, resize photos and run calculators in your browser without a login.
            </p>
          </div>
          <ul className="grid gap-4 sm:grid-cols-2">
            {PRINCIPLES.map((p) => (
              <li key={p.title} className="rounded-3xl border border-border bg-card p-6">
                <h2 className="font-semibold">{p.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
              </li>
            ))}
          </ul>
        </div>
        <ComplianceNotice className="mt-16" />
      </section>
      <CtaSection />
    </>
  )
}
