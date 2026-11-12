'use client'

import Link from 'next/link'
import { useState } from 'react'
import { SmartMomentumOffer } from '@/components/tools/smart-momentum-offer'

type Status = 'ok' | 'watch' | 'warn'
type Signal = { label: string; status: Status; detail: string }

const STATUS_TEXT: Record<Status, string> = {
  ok: 'Healthy',
  watch: 'Throttled',
  warn: 'Restricted signal',
}

const STATUS_CLASS: Record<Status, string> = {
  ok: 'bg-success/15 text-success',
  watch: 'bg-warning text-warning-foreground',
  warn: 'bg-destructive/15 text-destructive',
}

function toNumber(value: string): number {
  const cleaned = value.replace(/,/g, '').trim()
  if (cleaned === '') return NaN
  const n = Number(cleaned)
  return Number.isFinite(n) && n >= 0 ? n : NaN
}

const inputClass =
  'mt-2 h-12 w-full rounded-xl border border-border bg-background px-4 text-base outline-none focus-visible:ring-3 focus-visible:ring-ring/40'

export function ShadowbanCheck({ defaultPlatform = 'instagram' }: { defaultPlatform?: 'instagram' | 'tiktok' }) {
  const [platform, setPlatform] = useState<'instagram' | 'tiktok'>(defaultPlatform)
  const [usualViews, setUsualViews] = useState('')
  const [recentViews, setRecentViews] = useState('')
  const [nonFollowerPct, setNonFollowerPct] = useState('')
  const [accountStatusIssue, setAccountStatusIssue] = useState<'none' | 'warning' | 'removed'>('none')
  const [hashtagVisible, setHashtagVisible] = useState<'yes' | 'no' | 'unsure'>('unsure')

  const uv = toNumber(usualViews)
  const rv = toNumber(recentViews)
  const nf = toNumber(nonFollowerPct)

  const ready = uv > 0 && !Number.isNaN(rv)

  let result: { verdict: string; signals: Signal[] } | null = null
  if (ready) {
    const signals: Signal[] = []
    const dropPct = Math.round(((uv - rv) / uv) * 100)

    signals.push({
      label: 'Recent view velocity vs. baseline',
      status: dropPct >= 75 ? 'warn' : dropPct >= 40 ? 'watch' : 'ok',
      detail:
        dropPct > 0
          ? `Your recent posts average ${rv.toLocaleString('en-US')} views (${dropPct}% below your ${uv.toLocaleString('en-US')} baseline). A sudden >75% drop across multiple uploads often points to reduced algorithmic distribution.`
          : `Your recent views (${rv.toLocaleString('en-US')}) match or exceed your normal baseline (${uv.toLocaleString('en-US')}). No view-cap restriction detected.`,
    })

    if (!Number.isNaN(nf)) {
      signals.push({
        label: platform === 'tiktok' ? 'For You Page (FYP) traffic share' : 'Explore & Reels non-follower reach',
        status: nf < 5 ? 'warn' : nf < 20 ? 'watch' : 'ok',
        detail: `${nf}% of your reach comes from non-followers / FYP. When this drops below 5%, your content is only being shown to existing followers.`,
      })
    }

    signals.push({
      label: platform === 'tiktok' ? 'Account Status & Community Guidelines' : 'Instagram Account Status & Recommendations',
      status: accountStatusIssue === 'removed' ? 'warn' : accountStatusIssue === 'warning' ? 'watch' : 'ok',
      detail:
        accountStatusIssue === 'none'
          ? 'Your Account Status shows no strikes or recommendation blocks.'
          : 'A recent post removal or guideline flag can pause non-follower recommendations for 7 to 14 days.',
    })

    if (hashtagVisible !== 'unsure') {
      signals.push({
        label: 'Search & niche hashtag visibility',
        status: hashtagVisible === 'no' ? 'warn' : 'ok',
        detail:
          hashtagVisible === 'no'
            ? 'Your recent post did not appear under a specific niche hashtag or search query from a secondary account.'
            : 'Your posts appear normally in search and hashtag feeds.',
      })
    }

    const score = signals.reduce((s, x) => s + (x.status === 'warn' ? 2 : x.status === 'watch' ? 1 : 0), 0)
    const verdict =
      score >= 4
        ? 'High Likelihood of Recommendation Restriction (Shadowban)'
        : score >= 2
          ? 'Mild Reach Throttling / Algorithm Cooldown'
          : 'No Shadowban Detected: Healthy Distribution'

    result = { verdict, signals }
  }

  return (
    <div className="rounded-3xl border border-border bg-card p-6 sm:p-8">
      <fieldset>
        <legend className="text-sm font-medium">Platform to test</legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {[
            { id: 'instagram', label: 'Instagram (Reels & Explore)' },
            { id: 'tiktok', label: 'TikTok (For You Page / FYP)' },
          ].map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setPlatform(m.id as 'instagram' | 'tiktok')}
              aria-pressed={platform === m.id}
              className={`rounded-full border px-4 py-2 text-sm font-medium ${
                platform === m.id
                  ? 'border-foreground bg-foreground text-background'
                  : 'border-border bg-background hover:border-foreground/30'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="sb-usual" className="text-sm font-medium">
            Your normal average views per video/post
          </label>
          <input
            id="sb-usual"
            inputMode="numeric"
            placeholder="e.g. 2500"
            value={usualViews}
            onChange={(e) => setUsualViews(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="sb-recent" className="text-sm font-medium">
            Average views on your last 3-5 uploads
          </label>
          <input
            id="sb-recent"
            inputMode="numeric"
            placeholder="e.g. 180"
            value={recentViews}
            onChange={(e) => setRecentViews(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="sb-nf" className="text-sm font-medium">
            {platform === 'tiktok' ? 'For You Page (FYP) % in Analytics' : 'Non-follower reach % in Insights'} (optional)
          </label>
          <input
            id="sb-nf"
            inputMode="numeric"
            placeholder="e.g. 12"
            value={nonFollowerPct}
            onChange={(e) => setNonFollowerPct(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="sb-status" className="text-sm font-medium">
            Any recent post removals or guideline warnings?
          </label>
          <select
            id="sb-status"
            value={accountStatusIssue}
            onChange={(e) => setAccountStatusIssue(e.target.value as 'none' | 'warning' | 'removed')}
            className={inputClass}
          >
            <option value="none">No, Account Status is all green</option>
            <option value="warning">1 warning or flagged audio/caption</option>
            <option value="removed">Yes, post removed or strike in last 14 days</option>
          </select>
        </div>
      </div>

      <fieldset className="mt-5">
        <legend className="text-sm font-medium">
          Does your latest post show up under a niche hashtag from another account?
        </legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {[
            { id: 'unsure', label: 'Not tested yet' },
            { id: 'yes', label: 'Yes, visible' },
            { id: 'no', label: 'No, hidden' },
          ].map((h) => (
            <button
              key={h.id}
              type="button"
              onClick={() => setHashtagVisible(h.id as 'yes' | 'no' | 'unsure')}
              aria-pressed={hashtagVisible === h.id}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-medium ${
                hashtagVisible === h.id
                  ? 'border-foreground bg-foreground text-background'
                  : 'border-border bg-background hover:border-foreground/30'
              }`}
            >
              {h.label}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="mt-6 rounded-2xl bg-muted/70 p-5" aria-live="polite">
        {result ? (
          <>
            <p className="text-sm text-muted-foreground">Diagnostic result</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight">{result.verdict}</p>

            <ul className="mt-5 grid gap-3">
              {result.signals.map((s) => (
                <li key={s.label} className="rounded-xl border border-border bg-background p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-medium">{s.label}</p>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_CLASS[s.status]}`}>
                      {STATUS_TEXT[s.status]}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.detail}</p>
                </li>
              ))}
            </ul>

            <div className="mt-5 border-t border-border pt-4 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">3-Step Reach Reset Protocol (48-72 Hours)</p>
              <ol className="mt-2 grid list-decimal gap-1.5 pl-5">
                <li>
                  Open{' '}
                  <strong>
                    {platform === 'tiktok'
                      ? 'Profile > Settings > Support > Safety Center > Account Status'
                      : 'Settings > Account Status > What cannot be recommended'}
                  </strong>{' '}
                  and appeal or remove any flagged clip before uploading again.
                </li>
                <li>
                  Avoid bulk-deleting or re-uploading identical video files (algorithms suppress duplicate media hashes
                  and third-party watermarks).
                </li>
                <li>
                  Reset your non-follower test pool by shipping one clean native post with a fresh hook in the first 1.5
                  seconds and giving it strong first-hour velocity.
                </li>
              </ol>

              <div className="mt-4 flex flex-wrap gap-3">
                <Link
                  href="/free-instagram-views"
                  className="inline-flex h-10 items-center justify-center rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground"
                >
                  Boost Next Upload&apos;s First-Hour Velocity (Free Views Trial)
                </Link>
                <Link
                  href={platform === 'tiktok' ? '/tiktok' : '/instagram'}
                  className="inline-flex h-10 items-center justify-center rounded-full border border-border bg-background px-5 text-sm font-medium text-foreground hover:bg-muted/60"
                >
                  {platform === 'tiktok' ? 'TikTok Reach & Velocity Packages' : 'Instagram Reach & Auto-Likes'}
                </Link>
              </div>
            </div>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            Enter your normal view average and your recent 3-5 video average to check if your account is being throttled
            from Explore or the For You Page.
          </p>
        )}
      </div>

      {result && <SmartMomentumOffer />}
    </div>
  )
}
