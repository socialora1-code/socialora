import type { Metadata } from 'next'
import { Gift, Mail, MessageCircle, Wallet, Zap } from 'lucide-react'
import { HowItWorksSteps } from '@/components/home/how-it-works-steps'
import { ComplianceNotice } from '@/components/site/compliance-notice'
import { CtaSection } from '@/components/site/cta-section'
import { PageHero, SectionHeading } from '@/components/site/page-hero'
import { SITE } from '@/lib/site'

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
    title: 'Pay with crypto (+20% Bonus on Manual Crypto)',
    body: 'Choose Automatic Crypto (NOWPayments) to pay on a hosted checkout page in 100+ coins (orders $10+), or choose Manual Crypto (+20% Bonus) for any order amount with no minimum limit. Send USDT (TRC20, BNB Smart Chain BEP20 or Solana), USDC (Ethereum ERC20) or Bitcoin to the wallet address shown, then reply to your confirmation email with your order reference to receive +20% extra quantity free!',
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

      <section aria-labelledby="payment-guide-title" className="border-t border-border">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <SectionHeading
            id="payment-guide-title"
            eyebrow="Step-by-Step Payment Guide"
            title="How to pay with crypto (and claim your +20% bonus)"
            description="Never paid with crypto before? Follow these simple steps or reach out to our team if you need a hand at any point."
          />

          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border border-emerald-500/35 bg-emerald-500/[0.05] p-6 sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="inline-flex items-center gap-2 text-lg font-semibold text-foreground">
                  <Wallet className="size-5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                  1. Manual Crypto (+20% Bonus)
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                  <Gift className="size-3.5" aria-hidden="true" />
                  +20% EXTRA FREE · NO MINIMUM
                </span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Works for <strong>any order amount</strong> (including orders under $10 USD) and gives you <strong>+20% extra followers, likes, views or members free</strong>.
              </p>
              <ol className="mt-4 flex flex-col gap-3 text-sm leading-relaxed text-muted-foreground">
                <li>
                  <strong className="text-foreground">Step 1:</strong> At checkout, select <strong>Manual crypto (+20% Bonus)</strong> and pick your coin &amp; network: USDT (TRC20, BNB Smart Chain BEP20 or Solana), USDC (Ethereum ERC20) or Bitcoin.
                </li>
                <li>
                  <strong className="text-foreground">Step 2:</strong> Click <strong>Copy address</strong> and open your crypto exchange (Binance, Coinbase, Bybit, OKX, Kraken) or wallet app (Trust Wallet, MetaMask, Phantom) &rarr; tap <strong>Withdraw / Send</strong>.
                </li>
                <li>
                  <strong className="text-foreground">Step 3:</strong> Select the <strong>exact matching network</strong> (for example, <em>TRON TRC20</em> for USDT — TRC20) and send the exact USD order amount.
                </li>
                <li>
                  <strong className="text-foreground">Step 4:</strong> Paste your Transaction ID / Hash (optional), click <strong>Submit order</strong>, then reply to your confirmation email or write to{' '}
                  <a href={`mailto:${SITE.supportEmail}`} className="font-semibold text-foreground underline underline-offset-4">
                    {SITE.supportEmail}
                  </a>{' '}
                  with your order reference (<code className="font-mono">SO-XXXXXXXX</code>) to get your <strong>+20% bonus</strong> added!
                </li>
              </ol>
            </div>

            <div className="rounded-3xl border border-border bg-card p-6 sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="inline-flex items-center gap-2 text-lg font-semibold text-foreground">
                  <Zap className="size-5 text-primary" aria-hidden="true" />
                  2. Automatic Crypto (NOWPayments)
                </span>
                <span className="rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
                  Orders $10+ USD
                </span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Automated hosted checkout supporting 100+ cryptocurrencies. Your order starts automatically as soon as the blockchain confirms your transfer.
              </p>
              <ol className="mt-4 flex flex-col gap-3 text-sm leading-relaxed text-muted-foreground">
                <li>
                  <strong className="text-foreground">Step 1:</strong> At checkout, select <strong>Automatic crypto</strong> and click <strong>Continue to payment</strong>.
                </li>
                <li>
                  <strong className="text-foreground">Step 2:</strong> On the NOWPayments screen, choose your preferred coin and network (USDT, USDC, BTC, SOL, ETH, TRX, LTC and more).
                </li>
                <li>
                  <strong className="text-foreground">Step 3:</strong> Copy the one-time deposit address or scan the QR code from your wallet/exchange and send the exact amount shown.
                </li>
                <li>
                  <strong className="text-foreground">Step 4:</strong> Keep the page open for a moment — once confirmed on-chain, your order starts automatically and we email you an in-progress confirmation!
                </li>
              </ol>
            </div>
          </div>

          <div className="mt-6 rounded-3xl border border-border bg-card p-6 sm:p-8">
            <h3 className="text-base font-semibold text-foreground">
              First time buying crypto or stuck on any payment step? We&apos;ll help you live!
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              If you don&apos;t have crypto yet, the easiest way is to open <strong>Trust Wallet</strong>, <strong>Phantom</strong>, <strong>Binance</strong>, <strong>Coinbase</strong> or <strong>Bybit</strong>, buy <strong>USDT</strong> with your card, and send it via <strong>Manual Crypto (+20% Bonus)</strong> on the <strong>BNB Smart Chain (BEP20)</strong>, <strong>Solana</strong> or <strong>TRON (TRC20)</strong> network. If you get stuck at any step, need help choosing a network, or want to claim your <strong>+20% bonus</strong>, message us directly:
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <a
                href={`mailto:${SITE.supportEmail}?subject=Help%20with%20Socialora%20Payment`}
                className="inline-flex h-10 items-center gap-2 rounded-full bg-primary px-5 text-xs font-semibold text-primary-foreground hover:opacity-90"
              >
                <Mail className="size-4" aria-hidden="true" />
                Email Support ({SITE.supportEmail})
              </a>
              <a
                href="https://t.me/SocialoraChat"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-10 items-center gap-2 rounded-full border border-border bg-background px-5 text-xs font-semibold text-foreground hover:bg-accent"
              >
                <MessageCircle className="size-4 text-primary" aria-hidden="true" />
                Telegram Support (@SocialoraChat)
              </a>
            </div>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-6xl px-4 pt-16 sm:px-6">
        <ComplianceNotice />
      </div>
      <CtaSection />
    </>
  )
}
