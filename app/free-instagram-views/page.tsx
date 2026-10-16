import type { Metadata } from 'next'
import Link from 'next/link'
import { FreeViewsForm } from '@/components/home/free-views-form'
import { ComplianceNotice } from '@/components/site/compliance-notice'
import { CtaSection } from '@/components/site/cta-section'
import { PageHero } from '@/components/site/page-hero'

export const metadata: Metadata = {
  title: 'Free Instagram Views',
  description:
    'Get up to 1,000 free Instagram views on any public reel or post. No password, no email and no sign-up needed. Limited-time offer.',
  alternates: { canonical: '/free-instagram-views' },
  openGraph: { url: '/free-instagram-views', title: 'Free Instagram Views · Socialora' },
}

const STEPS = [
  {
    title: 'Paste your link',
    body: 'Copy the link of a public Instagram reel or post and paste it into the form.',
  },
  {
    title: 'Choose the amount',
    body: 'Pick any amount from 100 to 1,000 views. 1,000 is the maximum for each post.',
  },
  {
    title: 'Send the order',
    body: 'Press the button. No password, no email and no account are needed.',
  },
]

const FAQS = [
  {
    q: 'Are the Instagram views really free?',
    a: 'Yes. Right now you can get up to 1,000 free views per reel or post. This is a limited-time offer and we may change or end it at any time.',
  },
  {
    q: 'Do you need my Instagram password?',
    a: 'No. We only need the link of a public reel or post. Never share your password with anyone.',
  },
  {
    q: 'How many free views can I get?',
    a: 'Up to 1,000 views per reel or post. To keep the offer available for everyone, the same post cannot receive free views twice and each person can place a limited number of free orders per day.',
  },
  {
    q: 'How long does delivery take?',
    a: 'Views are added after your order is sent. Delivery time can vary, so please allow some time before you check your post.',
  },
  {
    q: 'Do the free views come with a refill guarantee?',
    a: 'No. Free views are a trial and are not covered by a refill guarantee.',
  },
  {
    q: 'Is it safe for my account?',
    a: "We never ask for login details and the post only needs to stay public. Instagram's terms do not allow purchased engagement, so nobody can promise how the platform will treat an account.",
  },
  {
    q: 'Do you offer more than free views?',
    a: 'Yes. We sell Instagram followers from different countries and likes. See our Instagram services for prices.',
  },
]

export default function FreeInstagramViewsPage() {
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd).replace(/</g, '\\u003c') }}
      />
      <PageHero
        eyebrow="Limited-time offer"
        title="Free Instagram Views"
        description="Get up to 1,000 free views on your Instagram reel or post. No password, no email and no sign-up."
      />
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="-mt-4">
          <FreeViewsForm />
        </div>

        <div className="mt-16">
          <h2 className="text-2xl font-semibold tracking-tight">How it works</h2>
          <ol className="mt-6 grid gap-4 sm:grid-cols-3">
            {STEPS.map((step, i) => (
              <li key={step.title} className="rounded-3xl border border-border bg-card p-6">
                <p className="text-sm font-medium text-primary">Step {i + 1}</p>
                <h3 className="mt-1 font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-16 grid gap-6 lg:grid-cols-[1fr_1.6fr]">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Frequently asked questions</h2>
            <p className="mt-2 leading-relaxed text-muted-foreground">Quick answers about the free views offer.</p>
          </div>
          <div className="grid gap-3">
            {FAQS.map((f) => (
              <details key={f.q} className="group rounded-2xl border border-border bg-card p-4">
                <summary className="cursor-pointer list-none font-medium">{f.q}</summary>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
              </details>
            ))}
          </div>
        </div>

        <div className="mt-16">
          <h2 className="text-2xl font-semibold tracking-tight">Want more growth?</h2>
          <ul className="mt-4 flex flex-wrap gap-2">
            {[
              { href: '/instagram', label: 'Buy Instagram Followers' },
              { href: '/buy-usa-instagram-followers', label: 'Buy USA Followers' },
              { href: '/tiktok', label: 'Buy TikTok Followers' },
              { href: '/youtube', label: 'YouTube Views' },
            ].map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="inline-flex h-11 items-center rounded-full border border-border bg-card px-4 text-sm font-medium transition-colors hover:border-foreground/30"
                >
                  {link.label}
                </Link>
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
