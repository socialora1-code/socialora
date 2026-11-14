'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AssumptionSelect, NumberControl, boundedNumber, maxCount } from '@/components/tools/simulator-controls'
import { SmartMomentumOffer } from '@/components/tools/smart-momentum-offer'
import { assessEngagement, BENCHMARKS, BENCHMARK_NICHES, BENCHMARK_TIERS, type BenchmarkId } from '@/lib/engagement-benchmark'

const count = new Intl.NumberFormat('en-US')
const percent = new Intl.NumberFormat('en-US', { maximumFractionDigits: 3 })
const card = 'min-w-0 rounded-2xl border border-border bg-background p-4 sm:p-5'
const valueClass = 'break-words text-2xl font-semibold tracking-tight tabular-nums'

const readiness = [
  'Build a sample of posts with similar formats and compare reach and deeper interactions before quoting a rate.',
  'Collect consistent results and share the mix of comments and distribution actions in your media kit.',
  'Use recent reach, audience fit and deeper interactions to support a sponsor pitch.',
  'Use the metrics in a sponsor pitch and validate audience fit, consistency and conversion separately.',
]

export function EngagementBenchmark({ id }: { id: BenchmarkId }) {
  const config = BENCHMARKS[id]
  const viewsLabel = id === 'x-engagement' ? 'Impressions' : id === 'telegram-earnings' ? '24-hour views' : 'Views'
  const [niche, setNiche] = useState(0)
  const [values, setValues] = useState({ audience: '10000', views: '2500', likes: '180', comments: '25', distribution: '20' })
  const metrics = {
    audience: boundedNumber(values.audience, maxCount),
    views: boundedNumber(values.views, maxCount),
    likes: boundedNumber(values.likes, maxCount),
    comments: boundedNumber(values.comments, maxCount),
    distribution: boundedNumber(values.distribution, maxCount),
  }
  const result = assessEngagement(id, niche, metrics)
  const tier = result.tier === null ? 'Add your audience size' : BENCHMARK_TIERS[result.tier]
  const fields = [
    { key: 'audience', label: config.audience, ceiling: 1_000_000, presets: true },
    { key: 'views', label: viewsLabel, ceiling: 1_000_000, presets: true },
    { key: 'likes', label: config.likes, ceiling: 1000 },
    { key: 'comments', label: config.comments, ceiling: 500 },
    { key: 'distribution', label: config.distribution, ceiling: 500 },
  ] as const
  const mix = [
    { label: config.likes, amount: metrics.likes, color: 'bg-primary', meaning: 'Quick response' },
    { label: config.comments, amount: metrics.comments, color: 'bg-sky-400', meaning: 'Conversation' },
    { label: config.distribution, amount: metrics.distribution, color: 'bg-emerald-400', meaning: 'Redistribution or repeat interest' },
  ]
  const nextTier = result.nextTier === null ? null : BENCHMARK_TIERS[result.nextTier]

  return (
    <div className="rounded-3xl border border-border bg-card p-4 sm:p-7">
      <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">{config.platform} performance benchmark</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Enter your audience size and averages from comparable {config.item}s. Leave untracked interactions at zero.
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {fields.map(({ key, label, ceiling, ...field }) => (
          <NumberControl
            key={key}
            label={label}
            value={values[key]}
            onChange={(value) => setValues((previous) => ({ ...previous, [key]: value }))}
            max={maxCount}
            sliderMax={ceiling}
            showPresets={'presets' in field}
          />
        ))}
        <AssumptionSelect label="Content niche" options={BENCHMARK_NICHES} index={niche} onChange={setNiche} />
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <section className={card}>
          <h3 className="text-sm font-semibold">Live performance score</h3>
          <p className={valueClass + ' mt-2'}>
            {result.rate === null ? 'Add audience size' : percent.format(result.rate) + '%'}
          </p>
          <p className="text-sm text-muted-foreground">Interactions per 100 {config.audience.toLowerCase()}</p>
          <p className="mt-3 inline-flex rounded-full border border-primary/40 bg-primary/15 px-3 py-1 text-xs font-semibold">
            {tier}
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            {BENCHMARK_NICHES[niche].label} planning reference: {percent.format(result.reference)} interactions and {percent.format(result.reachReference)} {viewsLabel.toLowerCase()} per 100 {config.audience.toLowerCase()}. Status requires both targets.
          </p>
          {result.byView === null ? null : (
            <p className="mt-2 text-sm text-muted-foreground">{percent.format(result.byView)} interactions per 100 {viewsLabel.toLowerCase()}.</p>
          )}
        </section>
        <section className={card}>
          <h3 className="text-sm font-semibold">Engagement mix</h3>
          <dl className="mt-3 grid gap-3">
            {mix.map(({ label, amount, color, meaning }) => {
              const share = result.total > 0 ? amount / result.total * 100 : 0
              return (
                <div key={label}>
                  <dt className="text-sm font-medium">{label} <span className="font-normal text-muted-foreground">({meaning})</span></dt>
                  <dd className="text-sm tabular-nums">
                    {count.format(amount)} / {percent.format(share)}%
                    <div aria-hidden="true" className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                      <div className={'h-full rounded-full ' + color} style={{ width: share + '%' }} />
                    </div>
                  </dd>
                </div>
              )
            })}
          </dl>
          <p className="mt-3 text-sm text-muted-foreground">
            {config.note}{' '}
            {'source' in config ? <a className="underline underline-offset-2" href={config.source} target="_blank" rel="noreferrer">Platform details</a> : null}
          </p>
          {result.tier === null ? null : (
            <p className="mt-2 text-sm text-muted-foreground">
              <strong className="text-foreground">Sponsor readiness:</strong>{' '}
              {metrics.comments + metrics.distribution > 0 ? readiness[result.tier] : 'Add conversation and distribution metrics when available to show how people respond beyond likes or reactions.'}
            </p>
          )}
        </section>
      </div>

      <section className="mt-4 rounded-2xl border border-primary/35 bg-accent/40 p-4 sm:p-6">
        <h3 className="text-lg font-semibold">Next Tier Momentum Gap</h3>
        {result.gap ? (
          <>
            <p className="mt-1 text-sm text-muted-foreground">
              {result.tier === 3 ? 'Highest planning tier reached.' : 'Next goal: ' + nextTier}
            </p>
            <dl className="mt-3 grid grid-cols-2 gap-3">
              <div>
                <dt className="text-sm text-muted-foreground">Extra {viewsLabel.toLowerCase()} per {config.item}</dt>
                <dd className={valueClass}>+{count.format(result.gap.views)}</dd>
                <dd className="text-xs text-muted-foreground">Target {count.format(result.gap.target.views)}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Extra interactions per {config.item}</dt>
                <dd className={valueClass}>+{count.format(result.gap.interactions)}</dd>
                <dd className="text-xs text-muted-foreground">Target {count.format(result.gap.target.interactions)}</dd>
              </div>
            </dl>
          </>
        ) : <p className="mt-2 text-sm text-muted-foreground">Enter a positive audience size to see the targets.</p>}
        <p className="mt-4 text-sm text-muted-foreground">
          Compare progress using organic analytics. These targets are illustrative planning estimates. Platform distribution and sponsorship decisions depend on other signals, too.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link href="/free-instagram-views" className="inline-flex min-h-11 items-center rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring">
            Test Free Views to Boost Post Velocity
          </Link>
          <Link href="/order?platform=instagram&service=followers-365" className="inline-flex min-h-11 items-center rounded-full border border-border bg-background px-4 py-2 text-sm font-semibold hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring">
            Explore 365-Day Refill Growth Packages
          </Link>
        </div>
      </section>
      <p role="status" className="sr-only">
        {tier}. {result.gap ? 'Extra views ' + count.format(result.gap.views) + '. Extra interactions ' + count.format(result.gap.interactions) + '.' : ''}
      </p>
      <SmartMomentumOffer />
    </div>
  )
}
