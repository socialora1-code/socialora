'use client'

import Link from 'next/link'
import { useState } from 'react'
import { SmartMomentumOffer } from '@/components/tools/smart-momentum-offer'

type Status = 'ok' | 'watch' | 'warn' | 'na'
type Signal = { label: string; status: Status; detail: string }

const STATUS_TEXT: Record<Status, string> = {
  ok: 'Strong signal',
  watch: 'Moderate',
  warn: 'Hidden activity',
  na: 'Optional',
}

const STATUS_CLASS: Record<Status, string> = {
  ok: 'bg-success/15 text-success',
  watch: 'bg-warning text-warning-foreground',
  warn: 'bg-destructive/15 text-destructive',
  na: 'bg-muted text-muted-foreground',
}

function toNumber(value: string): number {
  const cleaned = value.replace(/,/g, '').trim()
  if (cleaned === '') return NaN
  const n = Number(cleaned)
  return Number.isFinite(n) && n >= 0 ? n : NaN
}

const inputClass =
  'mt-2 h-12 w-full rounded-xl border border-border bg-background px-4 text-base outline-none focus-visible:ring-3 focus-visible:ring-ring/40'

function analyzeProfileViewers(
  followers: number,
  profileVisits: number,
  storyViews: number,
  nonFollowerReachPct: number,
  savesShares: number,
) {
  const signals: Signal[] = []

  const visitRate = followers > 0 ? (profileVisits / followers) * 100 : 0
  const estimatedSilentRatio =
    storyViews > 0 ? Math.max(0, Math.round(((profileVisits - storyViews * 0.35) / Math.max(profileVisits, 1)) * 100)) : 55

  signals.push({
    label: 'Profile visit-to-follower ratio (7 days)',
    status: visitRate >= 8 ? 'ok' : visitRate >= 3 ? 'watch' : 'warn',
    detail: `Your profile received ${profileVisits.toLocaleString('en-US')} visits (${visitRate.toFixed(1)}% of your follower count). Note: Instagram does not publish a list of individual profile visitors — only total visit counts in Professional Insights.`,
  })

  if (!Number.isNaN(storyViews) && storyViews > 0) {
    const storyRate = (storyViews / followers) * 100
    signals.push({
      label: 'Visible Story viewer list (24h–48h)',
      status: storyRate >= 10 ? 'ok' : 'watch',
      detail: `Around ${storyViews.toLocaleString('en-US')} accounts open your Stories (${storyRate.toFixed(1)}% of followers). Stories and Highlights are the ONLY place where Instagram reveals exact usernames of people watching your content without liking.`,
    })
  } else {
    signals.push({
      label: 'Visible Story viewer list (24h–48h)',
      status: 'na',
      detail: 'Add your average 24-hour Story views to compare visible Story viewers against anonymous profile visits.',
    })
  }

  if (!Number.isNaN(nonFollowerReachPct)) {
    signals.push({
      label: 'Outside-follower curiosity (Silent lurkers)',
      status: nonFollowerReachPct >= 40 ? 'warn' : nonFollowerReachPct >= 20 ? 'watch' : 'ok',
      detail: `${nonFollowerReachPct}% of your recent reach comes from non-followers. When non-follower reach is high, many visitors check your bio and grid without tapping Follow or Like.`,
    })
  } else {
    signals.push({
      label: 'Outside-follower curiosity (Silent lurkers)',
      status: 'na',
      detail: 'Enter your non-follower reach % from Instagram Insights to estimate how many strangers check your profile.',
    })
  }

  if (!Number.isNaN(savesShares)) {
    signals.push({
      label: 'Private shares & saves (DM forwards)',
      status: savesShares >= 20 ? 'ok' : savesShares >= 5 ? 'watch' : 'warn',
      detail: `${savesShares.toLocaleString('en-US')} saves/shares per post show people bookmarking or forwarding your profile in DMs — a major source of repeat profile visits that never show up in public likes.`,
    })
  }

  return {
    signals,
    visitRate,
    estimatedSilentRatio: Math.min(90, Math.max(15, estimatedSilentRatio)),
  }
}

export function ProfileViewerCheck() {
  const [accountType, setAccountType] = useState<'creator' | 'personal'>('creator')
  const [followers, setFollowers] = useState('')
  const [profileVisits, setProfileVisits] = useState('')
  const [storyViews, setStoryViews] = useState('')
  const [nonFollowerPct, setNonFollowerPct] = useState('')
  const [savesShares, setSavesShares] = useState('')

  const f = toNumber(followers)
  const pv = toNumber(profileVisits)
  const sv = toNumber(storyViews)
  const nf = toNumber(nonFollowerPct)
  const ss = toNumber(savesShares)

  const ready = f > 0 && !Number.isNaN(pv)
  const result = ready ? analyzeProfileViewers(f, pv, sv, nf, ss) : null

  return (
    <div className="rounded-3xl border border-border bg-card p-6 sm:p-8">
      <div className="rounded-2xl border border-border bg-muted/60 p-4 text-sm leading-relaxed">
        <p className="font-semibold text-foreground">
          Privacy warning: Never give your Instagram password to &ldquo;Who Viewed My Profile&rdquo; apps
        </p>
        <p className="mt-1 text-muted-foreground">
          Instagram&apos;s API does <strong>not</strong> share the usernames of people who only open your profile grid.
          Any third-party app or site promising a secret visitor list is guessing from public likes or trying to steal
          your login. Below, you can safely analyze your real profile traffic and see the <strong>4 places</strong>{' '}
          where Instagram actually reveals viewer identities.
        </p>
      </div>

      <fieldset className="mt-6">
        <legend className="text-sm font-medium">Your Instagram account type</legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {[
            { id: 'creator', label: 'Creator / Business (Insights enabled)' },
            { id: 'personal', label: 'Personal / Private account' },
          ].map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setAccountType(m.id as 'creator' | 'personal')}
              aria-pressed={accountType === m.id}
              className={`rounded-full border px-4 py-2 text-sm font-medium ${
                accountType === m.id
                  ? 'border-foreground bg-foreground text-background'
                  : 'border-border bg-background hover:border-foreground/30'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </fieldset>

      {accountType === 'personal' && (
        <p className="mt-4 rounded-xl border border-border bg-background p-3.5 text-sm text-muted-foreground">
          On a Personal account, Instagram only shows exact viewer names on your <strong>24-hour Stories</strong>. To
          see total 7-day profile visits for free, switch to a Creator account in{' '}
          <strong>Settings → Account type and tools</strong> (note: switching makes a private account public).
        </p>
      )}

      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="pv-followers" className="text-sm font-medium">
            Total followers
          </label>
          <input
            id="pv-followers"
            inputMode="numeric"
            placeholder="e.g. 5000"
            value={followers}
            onChange={(e) => setFollowers(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="pv-visits" className="text-sm font-medium">
            Profile visits in last 7 days (from Insights)
          </label>
          <input
            id="pv-visits"
            inputMode="numeric"
            placeholder="e.g. 420"
            value={profileVisits}
            onChange={(e) => setProfileVisits(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="pv-stories" className="text-sm font-medium">
            Average 24h Story viewers (optional)
          </label>
          <input
            id="pv-stories"
            inputMode="numeric"
            placeholder="e.g. 350"
            value={storyViews}
            onChange={(e) => setStoryViews(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="pv-nonfollower" className="text-sm font-medium">
            Non-follower reach % (optional)
          </label>
          <input
            id="pv-nonfollower"
            inputMode="numeric"
            placeholder="e.g. 45"
            value={nonFollowerPct}
            onChange={(e) => setNonFollowerPct(e.target.value)}
            className={inputClass}
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="pv-saves" className="text-sm font-medium">
            Average saves + shares per post (optional)
          </label>
          <input
            id="pv-saves"
            inputMode="numeric"
            placeholder="e.g. 18"
            value={savesShares}
            onChange={(e) => setSavesShares(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <div className="mt-6 rounded-2xl bg-muted/70 p-5" aria-live="polite">
        {result ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">7-day profile visit rate</p>
                <p className="mt-1 text-3xl font-semibold tracking-tight">{result.visitRate.toFixed(1)}%</p>
                <p className="mt-1 text-xs text-muted-foreground">of your follower size visited your profile</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Estimated silent profile checks</p>
                <p className="mt-1 text-3xl font-semibold tracking-tight">~{result.estimatedSilentRatio}%</p>
                <p className="mt-1 text-xs text-muted-foreground">visits that leave no public like or comment</p>
              </div>
            </div>

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
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            Enter your followers and 7-day profile visits (found at the top of your Professional Dashboard) to analyze
            your silent profile traffic.
          </p>
        )}
      </div>

      {result && <SmartMomentumOffer />}

      <div className="mt-6 rounded-2xl border border-border bg-background p-5">
        <h3 className="text-base font-semibold">4 real ways to see who is checking your Instagram</h3>
        <ul className="mt-3 grid list-disc gap-2 pl-5 text-sm leading-relaxed text-muted-foreground">
          <li>
            <strong>24-Hour Story Viewers:</strong> Swipe up on any active Story (up to 48 hours in Archive). Accounts
            near the top that never like your feed posts are your most frequent silent viewers.
          </li>
          <li>
            <strong>Fresh Pinned Highlight Trick:</strong> Create a new Story with a poll or slider sticker and add it
            to a Highlight. While the Story is under 48 hours old, you can see every username that taps through your
            profile Highlight.
          </li>
          <li>
            <strong>Professional Dashboard → Profile Visits:</strong> Shows exact how many times your profile was opened
            from Reels, Explore, search or bio links in the last 7 or 30 days.
          </li>
          <li>
            <strong>Turn Silent Visitors into Followers:</strong> Most visitors leave in 3 seconds if your bio is vague
            or your top posts have low social proof. Pin your 3 best Reels and test our{' '}
            <Link href="/free-instagram-views" className="font-medium text-foreground underline underline-offset-4">
              free Instagram views
            </Link>{' '}
            or{' '}
            <Link href="/instagram" className="font-medium text-foreground underline underline-offset-4">
              Instagram growth services
            </Link>
            .
          </li>
        </ul>
      </div>
    </div>
  )
}
