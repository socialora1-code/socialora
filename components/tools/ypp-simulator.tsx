'use client'

import Link from 'next/link'
import { useState } from 'react'
import { estimateYpp, YPP_PATHS, YPP_SUBSCRIBERS, type YppPath } from '@/lib/ypp-estimate'

const numbers = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 })
const count = (value: number) => numbers.format(value)
const fieldClass = 'h-10 w-28 rounded-lg border border-border bg-background px-3 text-right text-sm tabular-nums outline-none focus-visible:ring-2 focus-visible:ring-ring sm:w-36'
const actionClass = 'inline-flex min-h-11 items-center justify-center rounded-full border border-border bg-background px-4 py-2 text-sm font-semibold hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring'
const actions = [
  { href: '/tools/youtube-money-calculator', label: 'YouTube Money Calculator' },
  { href: '/tools/youtube-engagement-rate-calculator', label: 'YouTube Engagement Rate Calculator' },
  { href: '/youtube', label: 'YouTube Growth Packages' },
  { href: '/free-instagram-views', label: 'Try Free Instagram Views' },
]

type PublishingInputs = { activity: number; uploads: number; average: number }

function NumericControl({ id, label, value, onChange, range, step = 1, suffix }: {
  id: string
  label: string
  value: number
  onChange: (value: number) => void
  range: number
  step?: number
  suffix?: string
}) {
  return (
    <div className="min-w-0">
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={id} className="text-sm font-medium">{label}</label>
        <input
          id={id} type="number" min={0} max={suffix ? range : 1_000_000_000} step={1} value={value} aria-describedby={suffix ? `${id}-unit` : undefined}
          onChange={(event) => onChange(Math.max(0, Math.min(suffix ? range : 1_000_000_000, Math.floor(Number(event.target.value) || 0))))}
          className={fieldClass}
        />
      </div>
      <input
        type="range" min={0} max={Math.max(range, value)} step={step} value={value}
        aria-label={`${label} slider`} aria-valuetext={`${count(value)}${suffix ?? ''}`}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-2 h-7 w-full cursor-pointer accent-primary"
      />
    </div>
  )
}

function Progress({ label, current, target, gap }: { label: string; current: number; target: number; gap: number }) {
  const percent = Math.min(100, current / target * 100)
  return (
    <div className="rounded-xl border border-border bg-background/60 p-3">
      <div className="flex flex-wrap justify-between gap-1 text-sm font-medium">
        <span>{label}</span>
        <span>{count(percent)}%</span>
      </div>
      <progress aria-label={label} max={target} value={Math.min(current, target)} className="mt-2 block h-2 w-full overflow-hidden rounded-full accent-primary" />
      <p className="mt-2 text-xs text-muted-foreground">{count(current)} of {count(target)} · {count(gap)} remaining</p>
    </div>
  )
}

function formatTime(days: number | null) {
  if (days === null) return 'Not reached at this pace'
  if (days === 0) return 'Thresholds met today'
  const weeks = Math.max(1, Math.ceil(days / 7 - 1e-9))
  return `About ${count(weeks)} ${weeks === 1 ? 'week' : 'weeks'}`
}

export function YppSimulator() {
  const [path, setPath] = useState<YppPath>('long')
  const [subscribers, setSubscribers] = useState(600)
  const [weeklySubscribers, setWeeklySubscribers] = useState(40)
  const [settings, setSettings] = useState<Record<YppPath, PublishingInputs>>({ long: YPP_PATHS.long.defaults, shorts: YPP_PATHS.shorts.defaults })
  const [lift, setLift] = useState(25)
  const config = YPP_PATHS[path]
  const inputs = settings[path]
  const base = estimateYpp({ path, subscribers, weeklySubscribers, ...inputs })
  const scenario = estimateYpp({ path, subscribers, weeklySubscribers, ...inputs, average: inputs.average * (1 + lift / 100) })
  const daysSaved = base.days !== null && scenario.days !== null ? Math.max(0, base.days - scenario.days) : 0

  function setInput(key: keyof typeof inputs, value: number) {
    setSettings((previous) => ({ ...previous, [path]: { ...previous[path], [key]: value } }))
  }

  return (
    <section id="ypp-calculator" className="mt-8 scroll-mt-24 rounded-3xl border border-primary/30 bg-card p-5 sm:p-7" aria-labelledby="ypp-title">
      <h2 id="ypp-title" className="text-xl font-semibold tracking-tight sm:text-2xl">YouTube YPP Threshold &amp; Time Calculator</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        Replace these example values with the qualified totals from YouTube Studio&apos;s Earn tab and your recent publishing pace.
      </p>
      <fieldset className="mt-5 min-w-0">
        <legend className="text-sm font-semibold">Ad revenue path</legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {(Object.keys(YPP_PATHS) as YppPath[]).map((option) => {
            const choice = YPP_PATHS[option]
            return (
              <label key={option} className="flex cursor-pointer items-start gap-2 rounded-xl border border-border bg-background px-3 py-3 has-checked:border-primary has-checked:bg-primary/10">
                <input name="ypp-path" type="radio" checked={path === option} onChange={() => setPath(option)} className="mt-1 shrink-0 accent-primary" />
                <span>
                  <span className="block text-sm font-semibold">{choice.label}</span>
                  <span className="block text-xs text-muted-foreground">1,000 subscribers + {count(choice.target)} {choice.metric}</span>
                </span>
              </label>
            )
          })}
        </div>
      </fieldset>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <NumericControl id="ypp-subscribers" label="Current subscribers" value={subscribers} onChange={setSubscribers} range={2_000} />
        <NumericControl id="ypp-activity" label={`Current ${config.metric}`} value={inputs.activity} onChange={(value) => setInput('activity', value)} range={config.target} step={config.activityStep} />
        <NumericControl id="ypp-uploads" label={config.uploadLabel} value={inputs.uploads} onChange={(value) => setInput('uploads', value)} range={14} />
        <NumericControl id="ypp-average" label={config.averageLabel} value={inputs.average} onChange={(value) => setInput('average', value)} range={config.averageRange} step={config.averageStep} />
        <NumericControl id="ypp-weekly-subs" label="Net new subscribers per week" value={weeklySubscribers} onChange={setWeeklySubscribers} range={200} />
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <Progress label="Subscribers" current={subscribers} target={YPP_SUBSCRIBERS} gap={base.subscriberGap} />
        <Progress label={path === 'long' ? 'Qualified watch hours' : 'Qualified Shorts views'} current={inputs.activity} target={config.target} gap={base.activityGap} />
      </div>
      <div className="mt-5 rounded-2xl border border-border bg-background/60 p-4">
        <NumericControl id="ypp-lift" label="What if each upload earned more?" value={lift} onChange={setLift} range={200} suffix="%" />
        <p id="ypp-lift-unit" className="text-xs text-muted-foreground">+{lift}% {config.metric} per upload, with the same posting and subscriber pace.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2" role="status" aria-live="polite" aria-atomic="true">
          <div>
            <p className="text-xs text-muted-foreground">Current pace</p>
            <p className="font-semibold">{formatTime(base.days)}</p>
            <p className="mt-1 text-xs text-muted-foreground">{count(base.weeklyActivity)} new {config.metric} per week</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Higher performance scenario</p>
            <p className="font-semibold">{formatTime(scenario.days)}</p>
            <p className="mt-1 text-xs text-muted-foreground">{count(scenario.weeklyActivity)} new {config.metric} per week</p>
          </div>
          <p className="text-sm text-muted-foreground sm:col-span-2">
            {daysSaved >= 1 ? `About ${count(daysSaved / 7)} weeks sooner.`
              : base.days === null && scenario.days !== null ? 'The higher performance scenario reaches both thresholds.'
              : base.days === null && base.limitingFactor === 'subscribers' ? 'Enter a positive subscriber pace to estimate when you can reach 1,000.'
              : base.days === null ? `At this pace, you do not reach both thresholds at the same time within the rolling ${config.windowLabel} activity window.`
              : base.days > 0 && base.limitingFactor === 'subscribers' && lift > 0 ? 'Subscriber growth sets the timeline at these settings.'
              : 'Change the publishing pace or average performance to compare scenarios.'}
          </p>
        </div>
      </div>
      <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
        The estimate assumes steady weekly gains and that your current activity expires evenly over {config.windowLabel}
        {path === 'long' && ' (modeled as 365 days)'}. Past uploads may keep earning activity, and actual expiration depends on your daily history.
        Meeting both thresholds lets you apply for ad revenue sharing. YouTube reviews your channel before approval.
      </p>
      <a href="https://support.google.com/youtube/answer/72851" className="mt-2 inline-block text-sm font-medium underline underline-offset-4">YouTube&apos;s official YPP eligibility rules</a>
      <nav aria-label="YouTube creator tools and next steps" className="mt-5 flex flex-wrap gap-2">
        {actions.map((action) => <Link key={action.href} href={action.href} className={actionClass}>{action.label}</Link>)}
      </nav>
    </section>
  )
}
