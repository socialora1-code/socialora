import type { Metadata } from 'next'
import Link from 'next/link'
import { EngagementRateCalculator } from '@/components/tools/engagement-rate-calculator'

export const metadata: Metadata = {
  title: 'Instagram Engagement Rate Calculator (Free)',
  description:
    'Free Instagram engagement rate calculator. Enter your followers, average likes and comments to see your engagement rate and what it means.',
  alternates: { canonical: '/tools/instagram-engagement-rate-calculator' },
}

const FAQS = [
  {
    q: 'Does this include saves and shares?',
    a: 'No. This calculator uses likes and comments, the most common method. Saves and shares are not public, but you can add them to the likes box yourself if you want a wider number.',
  },
  {
    q: 'Can I check someone else’s account?',
    a: 'Yes. Likes and comments are public, so you can check any public account. Use the average of the last 10 to 20 posts for a more accurate result.',
  },
  {
    q: 'Why is my engagement rate falling as I grow?',
    a: 'Engagement rates usually get lower as accounts get bigger, because a larger share of followers are less active. A lower rate on a bigger account is common.',
  },
]

export default function EngagementCalculatorPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
      <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
        Instagram Engagement Rate Calculator
      </h1>
      <p className="mt-3 leading-relaxed text-muted-foreground">
        Find out how much your audience interacts with your posts. Enter your follower count and the average likes and
        comments per post. It is free and needs no sign-up.
      </p>

      <div className="mt-8">
        <EngagementRateCalculator />
      </div>

      <section className="mt-12" aria-labelledby="how-title">
        <h2 id="how-title" className="text-2xl font-semibold tracking-tight">
          How engagement rate is calculated
        </h2>
        <p className="mt-3 leading-relaxed text-muted-foreground">
          Engagement rate = (average likes + average comments) ÷ followers × 100. For a more accurate number, use the
          average of your last 10 to 20 posts instead of a single post.
        </p>
      </section>

      <section className="mt-10" aria-labelledby="good-title">
        <h2 id="good-title" className="text-2xl font-semibold tracking-tight">
          What is a good Instagram engagement rate?
        </h2>
        <ul className="mt-3 grid gap-2 text-muted-foreground">
          <li>Below 1%: low</li>
          <li>1% to 3%: average</li>
          <li>3% to 6%: good</li>
          <li>Above 6%: high</li>
        </ul>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          These ranges are rules of thumb. Rates vary by niche and usually fall as accounts get bigger.
        </p>
      </section>

      <section className="mt-10" aria-labelledby="improve-title">
        <h2 id="improve-title" className="text-2xl font-semibold tracking-tight">
          How to improve your engagement rate
        </h2>
        <ul className="mt-3 grid list-disc gap-2 pl-5 text-muted-foreground">
          <li>Hook people in the first seconds of your reels.</li>
          <li>Ask a question in your caption so people have a reason to comment.</li>
          <li>Reply to comments quickly, especially in the first hour.</li>
          <li>Post when your audience is online. Check your Insights for the best times.</li>
          <li>Make more of what already works. Compare your best and worst posts.</li>
        </ul>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Want more ideas? Read our guide on{' '}
          <Link
            href="/blog/how-to-grow-instagram-account"
            className="font-medium text-foreground underline underline-offset-4"
          >
            how to grow an Instagram account
          </Link>
          .
        </p>
      </section>

      <section className="mt-10" aria-labelledby="faq-title">
        <h2 id="faq-title" className="text-2xl font-semibold tracking-tight">
          Frequently asked questions
        </h2>
        <div className="mt-4 grid gap-3">
          {FAQS.map((f) => (
            <details key={f.q} className="rounded-2xl border border-border bg-card p-4">
              <summary className="cursor-pointer list-none font-medium">{f.q}</summary>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="mt-12 rounded-3xl border border-border bg-card p-6" aria-labelledby="cta-title">
        <h2 id="cta-title" className="text-xl font-semibold tracking-tight">
          Want more people to see your content?
        </h2>
        <p className="mt-2 leading-relaxed text-muted-foreground">
          Try our free Instagram views on one of your reels, or see our Instagram services.
        </p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/free-instagram-views"
            className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground"
          >
            Get free Instagram views
          </Link>
          <Link
            href="/instagram"
            className="inline-flex h-11 items-center justify-center rounded-full border border-border px-6 text-sm font-medium"
          >
            See Instagram services
          </Link>
        </div>
      </section>
    </div>
  )
}
