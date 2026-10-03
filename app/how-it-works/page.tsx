import type { Metadata } from 'next'
import { HowItWorksSteps } from '@/components/home/how-it-works-steps'
import { ComplianceNotice } from '@/components/site/compliance-notice'
import { CtaSection } from '@/components/site/cta-section'
import { PageHero, SectionHeading } from '@/components/site/page-hero'

export const metadata: Metadata = {
  title: 'How It Works',
  description:
    'See how ordering Instagram, TikTok and YouTube growth services with Socialora works — from choosing a package to manual crypto payment and order review.',
  alternates: { canonical: '/how-it-works' },
  openGraph: { url: '/how-it-works', title: 'How It Works · Socialora' },
}

const DETAILS = [
  {
    title: 'Pick a platform and service',
    body: 'Browse Instagram, TikTok or YouTube and choose followers, subscribers, likes or views. Follower and subscriber orders come in three packages — High-Quality, Premium and VIP — so you can pick the one that fits.',
  },
  {
    title: 'Choose a quantity',
    body: 'Select from fixed quantities. The price updates immediately and is always shown in USD before you continue.',
  },
  {
    title: 'Enter a public URL',
    body: 'Paste the public profile, post or video URL you want to grow, or your username. Keep the account public while your order is processed. We never ask for your password.',
  },
  {
    title: 'Add your email',
    body: 'We send your order confirmation and payment instructions to this address. No account is created.',
  },
  {
    title: 'Pay with crypto',
    body: 'Choose USDT (TRC20, BNB Smart Chain or Solana), USDC (Ethereum ERC20) or Bitcoin. You will see the full wallet address with a copy button and the exact amount to send. Always use the network shown.',
  },
  {
    title: 'Submit and wait for review',
    body: 'After sending your payment, submit your order. You will receive an order reference (SO-XXXXXXXX). Your order status is Pending Manual Verification until our team confirms the payment on the blockchain, after which processing begins.',
  },
] as const

export default function HowItWorksPage() {
  return (
    <>
      <PageHero
        eyebrow="How it works"
        title="Simple ordering, start to finish"
        description="No account, no password and no surprises. Here is exactly what happens when you place an order with Socialora."
      />
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <HowItWorksSteps />
      </section>
      <section aria-labelledby="details-title" className="border-t border-border bg-card">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[1fr_1.4fr]">
          <SectionHeading
            id="details-title"
            eyebrow="In detail"
            title="What to expect"
            description="Every order follows the same transparent process."
          />
          <ol className="flex flex-col gap-6">
            {DETAILS.map((item, index) => (
              <li key={item.title} className="flex gap-4">
                <span
                  aria-hidden="true"
                  className="inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-border font-mono text-xs"
                >
                  {index + 1}
                </span>
                <div>
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>
      <div className="mx-auto max-w-6xl px-4 pt-16 sm:px-6">
        <ComplianceNotice />
      </div>
      <CtaSection />
    </>
  )
}
