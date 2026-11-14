'use client'

import { useState } from 'react'
import { AssumptionSelect, NumberControl, boundedNumber, controlClass, maxCount } from '@/components/tools/simulator-controls'
import Link from 'next/link'
import { SmartMomentumOffer } from '@/components/tools/smart-momentum-offer'
import { AUDIENCE_REGIONS, EARNINGS_SIMULATORS, projectEarnings, type EarningsSimulatorId } from '@/lib/earnings-simulator'

const maxRate = 100000
const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 })
const cardClass = 'min-w-0 rounded-2xl border border-border bg-background p-4 sm:p-5'
const moneyClass = 'break-words text-xl font-semibold tracking-tight tabular-nums sm:text-2xl'

function GrowthGap({ current, momentum }: { current: number; momentum: number }) {
  const bars = [
    { label: 'Current estimated annual income', amount: current, color: 'bg-primary' },
    { label: '2x reach and social proof', amount: momentum, color: 'bg-emerald-400' },
  ]

  return (
    <section className="mt-5 rounded-2xl border border-primary/40 bg-accent/40 p-4 sm:p-6">
      <h3 className="text-lg font-semibold">2x Momentum &amp; Growth Gap</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Double your reach and engaged audience at the same rates and publishing pace. Fixed monthly income stays constant.
      </p>
      <dl className="mt-4 grid gap-3">
        {bars.map(({ label, amount, color }) => (
          <div key={label}>
            <dt className="text-sm text-muted-foreground">{label}</dt>
            <dd className="mt-1 font-semibold tabular-nums">
              {usd.format(amount)}/yr
              <div aria-hidden="true" className="mt-1 h-2 overflow-hidden rounded-full bg-background">
                <div className={'h-full rounded-full ' + color} style={{ width: (momentum ? amount / momentum * 100 : 0) + '%' }} />
              </div>
            </dd>
          </div>
        ))}
      </dl>
      <p className="mt-4 break-words text-2xl font-bold tracking-tight text-emerald-300 tabular-nums sm:text-3xl">
        +{usd.format(momentum - current)}/yr
      </p>
      <p className="mt-1 text-sm font-medium">Potential annual revenue gap</p>
      <p className="mt-4 text-sm text-muted-foreground">
        The forecast uses eligible reach and your own rates. Use the Instagram trial to see how the service delivers views.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Link href="/free-instagram-views" className="inline-flex min-h-11 items-center rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring">
          Test Free Views &amp; Reach Before Scaling
        </Link>
        <Link href="/order?platform=instagram&service=followers-365" className="inline-flex min-h-11 items-center rounded-full border border-border bg-background px-4 py-2 text-sm font-semibold hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring">
          Explore 365-Day Refill Growth Packages
        </Link>
      </div>
    </section>
  )
}

export function EarningsSimulator({ id }: { id: EarningsSimulatorId }) {
  const config = EARNINGS_SIMULATORS[id]
  const additional = config.additionalIncome
  const [basis, setBasis] = useState<'month' | 'item'>(additional ? 'item' : 'month')
  const [period, setPeriod] = useState<'week' | 'month'>(additional ? 'week' : 'month')
  const [region, setRegion] = useState(0)
  const [selections, setSelections] = useState(() => config.selectors.map(() => 0))
  const [values, setValues] = useState(() => ({
    volume: String(config.defaultVolume),
    followers: String(config.followers),
    audienceRate: '2',
    conversionRate: '0',
    lowRate: String(config.defaultRates[0]),
    highRate: String(config.defaultRates[1]),
    sideRate: '0',
    sponsoredShare: '0',
    affiliateConversion: '0',
    commission: '0',
    fixedMonthlyIncome: '0',
    cadence: additional ? '1' : '4',
  }))

  function updateValue(key: keyof typeof values, value: string) {
    setValues((previous) => ({ ...previous, [key]: value }))
  }

  const rateStep = config.rateUnit === 1 ? 0.0001 : 0.01
  const selectedOptions = config.selectors.map((selector, index) => selector.options[selections[index]])
  const rateMultiplier = selectedOptions.reduce(
    (combined, option) => combined * option.multiplier,
    AUDIENCE_REGIONS[region].multiplier,
  )
  const sponsorMultiplier = selectedOptions.reduce((combined, option) => combined * (option.sponsorMultiplier ?? 1), 1)
  const scenario = {
    volume: boundedNumber(values.volume, maxCount),
    followers: boundedNumber(values.followers, maxCount),
    audienceRate: boundedNumber(values.audienceRate, 100, 0.1),
    conversionRate: config.conversionLabel ? boundedNumber(values.conversionRate, 100, 0.1) : 100,
    lowRate: boundedNumber(values.lowRate, maxRate, rateStep),
    highRate: boundedNumber(values.highRate, maxRate, rateStep),
    sideRate: boundedNumber(values.sideRate, maxRate, 0.01),
    sponsoredShare: additional ? boundedNumber(values.sponsoredShare, 100, 0.1) : 100,
    sponsorMultiplier,
    excludesSponsoredViews: selectedOptions.some((option) => option.excludesSponsoredViews),
    affiliateConversion: boundedNumber(values.affiliateConversion, 100, 0.1),
    commission: boundedNumber(values.commission, maxRate, 0.01),
    fixedMonthlyIncome: boundedNumber(values.fixedMonthlyIncome, maxRate, 0.01),
    cadence: boundedNumber(values.cadence, 100),
    rateMultiplier,
    basis,
    period,
  }
  const current = projectEarnings(config, scenario)
  const momentum = projectEarnings(config, { ...scenario, volume: scenario.volume * 2, followers: scenario.followers * 2 })
  const volume = selectedOptions.find((option) => option.volume)?.volume ?? config.volume
  const volumeLabel = basis === 'month'
    ? 'Monthly ' + volume
    : 'Average ' + volume + ' per ' + config.release

  return (
    <div className="rounded-3xl border border-border bg-card p-4 sm:p-7">
      <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">{config.platform} income simulator</h2>
      <p className="mt-1 text-sm text-muted-foreground">Edit your audience and rates to model platform payouts, additional income and growth.</p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium">
          Revenue input
          <select value={basis} onChange={(event) => setBasis(event.target.value === 'item' ? 'item' : 'month')} className={controlClass}>
            <option value="month">Monthly total</option>
            <option value="item">Per {config.release} with publishing frequency</option>
          </select>
        </label>
        <AssumptionSelect label="Audience region" options={AUDIENCE_REGIONS} index={region} onChange={setRegion} />
        <NumberControl label={volumeLabel} value={values.volume} onChange={(value) => updateValue('volume', value)} max={maxCount} sliderMax={1000000} showPresets />
        <NumberControl label="Followers" value={values.followers} onChange={(value) => updateValue('followers', value)} max={maxCount} sliderMax={1000000} showPresets />
        <NumberControl label={config.engagementLabel} value={values.audienceRate} onChange={(value) => updateValue('audienceRate', value)} max={100} step={0.1} sliderMax={100} />
        {config.selectors.map((selector, index) => (
          <AssumptionSelect
            key={selector.label}
            label={selector.label}
            options={selector.options}
            index={selections[index]}
            onChange={(selected) => setSelections((previous) => previous.map((value, position) => position === index ? selected : value))}
          />
        ))}
      </div>

      {basis === 'item' ? (
        <fieldset className="mt-4 grid gap-3 rounded-xl border border-border p-3 sm:grid-cols-2">
          <legend className="px-1 text-sm font-semibold">Publishing frequency</legend>
          <NumberControl label={'Number of ' + config.release + 's per ' + period} value={values.cadence} onChange={(value) => updateValue('cadence', value)} max={100} sliderMax={12} />
          <label className="block text-sm font-medium">
            Frequency period
            <select value={period} onChange={(event) => setPeriod(event.target.value === 'week' ? 'week' : 'month')} className={controlClass}>
              <option value="month">Per month</option>
              <option value="week">Per week</option>
            </select>
          </label>
        </fieldset>
      ) : null}

      <fieldset className="mt-4 grid gap-3 rounded-xl border border-border p-3 sm:grid-cols-2">
        <legend className="px-1 text-sm font-semibold">Baseline rates (USD)</legend>
        <NumberControl label={'Low ' + config.rateLabel + ' ($)'} value={values.lowRate} onChange={(value) => updateValue('lowRate', value)} max={maxRate} step={rateStep} />
        <NumberControl label={'High ' + config.rateLabel + ' ($)'} value={values.highRate} onChange={(value) => updateValue('highRate', value)} max={maxRate} step={rateStep} />
        {!additional ? <NumberControl label={config.sideRateLabel} value={values.sideRate} onChange={(value) => updateValue('sideRate', value)} max={maxRate} step={0.01} /> : null}
        {config.conversionLabel ? (
          <NumberControl label={config.conversionLabel} value={values.conversionRate} onChange={(value) => updateValue('conversionRate', value)} max={100} step={0.1} sliderMax={100} />
        ) : null}
        <p className="self-center text-sm text-muted-foreground sm:col-span-2">Rates and multipliers are planning assumptions in USD. Check your dashboard for the eligible views and rates to use.</p>
      </fieldset>

      {additional ? (
        <details className="mt-4 rounded-xl border border-border p-3">
          <summary className="cursor-pointer text-sm font-semibold">Set sponsorship and other income assumptions</summary>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <NumberControl label={config.sideRateLabel} value={values.sideRate} onChange={(value) => updateValue('sideRate', value)} max={maxRate} step={0.01} />
            <NumberControl label="Sponsored share of content (%)" value={values.sponsoredShare} onChange={(value) => updateValue('sponsoredShare', value)} max={100} step={0.1} sliderMax={100} />
            <NumberControl label="Engaged audience that orders (%)" value={values.affiliateConversion} onChange={(value) => updateValue('affiliateConversion', value)} max={100} step={0.1} sliderMax={100} />
            <NumberControl label={additional.commissionLabel} value={values.commission} onChange={(value) => updateValue('commission', value)} max={maxRate} step={0.01} />
            {additional.fixedMonthlyLabel ? (
              <NumberControl label={'Monthly ' + additional.fixedMonthlyLabel + ' ($)'} value={values.fixedMonthlyIncome} onChange={(value) => updateValue('fixedMonthlyIncome', value)} max={maxRate} step={0.01} />
            ) : null}
            <p className="self-center text-sm text-muted-foreground">Estimates apply the engagement rate to the smaller of views and followers. Add your own fees and conversion assumptions.</p>
          </div>
        </details>
      ) : null}

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <section className={cardClass + ' sm:col-span-2'}>
          <h3 className="text-sm font-semibold">{config.payoutTitle} / 30 days</h3>
          <dl className="mt-3 grid gap-3 sm:grid-cols-3">
            {Object.entries(current.platform).map(([label, amount]) => (
              <div key={label} className="min-w-0 rounded-xl bg-muted/65 p-3">
                <dt className="text-xs font-medium capitalize text-muted-foreground">{label}</dt>
                <dd className={moneyClass}>{usd.format(amount)}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-sm text-muted-foreground">
            {config.payoutNote}{' '}
            <a href={config.source} target="_blank" rel="noreferrer" className="underline underline-offset-2">Platform payout details</a>
          </p>
        </section>
        <section className={cardClass}>
          <h3 className="text-sm font-semibold">{additional ? 'Additional income / 30 days' : config.sideTitle + ' / 30 days'}</h3>
          {additional ? (
            <dl className="mt-2 grid gap-2">
              <div>
                <dt className="text-xs text-muted-foreground">{config.sideTitle}</dt>
                <dd className={moneyClass}>{usd.format(current.sideIncome)}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">{additional.affiliateTitle}</dt>
                <dd className={moneyClass}>{usd.format(current.affiliateIncome)}</dd>
              </div>
              {additional.fixedMonthlyLabel ? (
                <div>
                  <dt className="text-xs text-muted-foreground">{additional.fixedMonthlyLabel}</dt>
                  <dd className={moneyClass}>{usd.format(current.fixedMonthlyIncome)}</dd>
                </div>
              ) : null}
            </dl>
          ) : <p className={moneyClass + ' mt-2'}>{usd.format(current.sideIncome)}</p>}
          <p className="mt-2 text-sm text-muted-foreground">{config.sideNote}</p>
        </section>
        <section className={cardClass}>
          <h3 className="text-sm font-semibold">Combined income projection</h3>
          <dl className="mt-2 grid gap-2">
            <div>
              <dt className="text-xs text-muted-foreground">30 days</dt>
              <dd className={moneyClass}>{usd.format(current.total30Days)}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">12 months</dt>
              <dd className={moneyClass}>{usd.format(current.totalYear)}</dd>
            </div>
          </dl>
          <p className="mt-2 text-sm text-muted-foreground">
            {basis === 'month'
              ? 'Uses your monthly volume at a steady pace for 12 months.'
              : 'Each item uses the same volume and rates. Weekly schedules use 30/7 weeks per 30 days and 52 weeks per year.'}
          </p>
        </section>
      </div>
      <p className="sr-only" role="status">
        Estimated 30-day income {usd.format(current.total30Days)}. Annual income {usd.format(current.totalYear)}. Annual growth gap {usd.format(momentum.totalYear - current.totalYear)}.
      </p>
      <GrowthGap current={current.totalYear} momentum={momentum.totalYear} />
      <SmartMomentumOffer />
    </div>
  )
}
