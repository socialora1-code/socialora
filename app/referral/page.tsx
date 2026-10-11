import type { Metadata } from 'next'
import { ReferralForm } from '@/components/referral/referral-form'
import { COMMISSION_PERCENT, MIN_PAYOUT_USD, REF_TTL_DAYS } from '@/lib/referral'
import { SITE } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Referral Program',
  description: `Earn ${COMMISSION_PERCENT}% commission when people you refer place an order on Socialora. Get your free referral link in a minute.`,
  alternates: { canonical: '/referral' },
}

const STEPS = [
  { title: 'Get your link', body: 'Enter your email and choose a code. Your personal link is ready right away.' },
  { title: 'Share it', body: 'Post it on your profile, send it to friends or add it to your content.' },
  {
    title: 'Earn commission',
    body: `You earn ${COMMISSION_PERCENT}% of every paid and completed order placed through your link.`,
  },
]

const RULES = [
  `Referrals are tracked for ${REF_TTL_DAYS} days in the visitor's browser after they click your link.`,
  'Commission is counted after the order is paid and completed.',
  'Orders you place yourself (same email) do not earn commission.',
  'Please do not spam or make misleading claims when sharing your link.',
  `Payouts are made in crypto (USDT) on request once your balance reaches $${MIN_PAYOUT_USD}.`,
  'We may refuse commission if we find abuse.',
]

export default function ReferralPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
      <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
        Earn {COMMISSION_PERCENT}% for every customer you refer
      </h1>
      <p className="mt-3 leading-relaxed text-muted-foreground">
        Share your personal link. When someone you refer places an order, you earn a commission. It is free and takes
        a minute to start.
      </p>

      <ol className="mt-8 grid gap-3 sm:grid-cols-3">
        {STEPS.map((step, index) => (
          <li key={step.title} className="rounded-2xl border border-border bg-card p-4">
            <p className="text-xs font-medium text-primary">Step {index + 1}</p>
            <h2 className="mt-1 font-semibold">{step.title}</h2>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
          </li>
        ))}
      </ol>

      <div className="mt-10">
        <ReferralForm />
      </div>

      <section className="mt-12" aria-labelledby="rules-title">
        <h2 id="rules-title" className="text-2xl font-semibold tracking-tight">
          Program rules
        </h2>
        <ul className="mt-3 grid list-disc gap-2 pl-5 text-muted-foreground">
          {RULES.map((rule) => (
            <li key={rule}>{rule}</li>
          ))}
        </ul>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          Questions or want to check your balance? Email{' '}
          <a
            href={`mailto:${SITE.supportEmail}`}
            className="font-medium text-foreground underline underline-offset-4"
          >
            {SITE.supportEmail}
          </a>{' '}
          with your referral code.
        </p>
      </section>
    </div>
  )
}
