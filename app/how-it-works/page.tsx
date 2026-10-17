import type { Metadata } from 'next'
import { HowItWorksSteps } from '@/components/home/how-it-works-steps'
import { ComplianceNotice } from '@/components/site/compliance-notice'
import { CtaSection } from '@/components/site/cta-section'
import { PageHero, SectionHeading } from '@/components/site/page-hero'

export const metadata: Metadata = {
  title: 'How It Works',
  description:
    'See how ordering Instagram, TikTok, YouTube, X and Telegram growth services with Socialora works, from choosing a service to paying with crypto and tracking your order.',
  alternates: { canonical: '/how-it-works' },
  openGraph: { url: '/how-it-works', title: 'How It Works · Socialora' },
}

const DETAILS = [
  {
    title: 'Pick a platform and service',
    body: 'Browse Instagram, TikTok, YouTube, X or Telegram and choose followers, subscribers, members, likes or views. Each service lists its start time, speed and refill terms before you order.',
  },
  {
    title: 'Choose a quantity',
    body: 'Select from the available quantities. The price updates immediately and is always shown in USD before you continue. Larger orders get a lower price per 1,000.',
  },
  {
    title: 'Enter your link or username',
    body: 'Paste the public profile, post, video or channel link, or your username, depending on the service. Keep the account public while your order is processed. We never ask for your password.',
  },
  {
    title: 'Add your email',
    body: 'We send your order updates to this address. No account is created.',
  },
  {
    title: 'Pay with crypto',
    body: 'Choose automatic payment to pay on a secure checkout page in the coin you prefer, or choose manual payment and send USDT (TRC20, BNB Smart Chain or Solana), USDC (Ethereum ERC20) or Bitcoin to the wallet address shown, with a copy button and the exact amount. Always use the network shown.',
  },
  {
    title: 'Start and track your order',
    body: 'You receive an order reference (SO-XXXXXXXX). With automatic payment, your order starts as soon as the payment is confirmed. With manual payment, it starts after we verify the transaction on the blockchain. You can follow progress any time on the Track page with your order reference and email.',
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
