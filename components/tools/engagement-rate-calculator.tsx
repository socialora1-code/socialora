'use client'

import { useState } from 'react'

function toNumber(value: string): number {
  const cleaned = value.replace(/,/g, '').trim()
  if (cleaned === '') return NaN
  const n = Number(cleaned)
  return Number.isFinite(n) && n >= 0 ? n : NaN
}

function verdict(rate: number): { label: string; note: string } {
  if (rate < 1) {
    return { label: 'Low', note: 'Most of your followers are not interacting with your posts yet.' }
  }
  if (rate < 3) {
    return { label: 'Average', note: 'A fairly typical rate for many accounts.' }
  }
  if (rate < 6) {
    return { label: 'Good', note: 'Your audience interacts with your posts well.' }
  }
  return { label: 'High', note: 'Your audience is very active compared with its size.' }
}

const inputClass =
  'mt-2 h-12 w-full rounded-xl border border-border bg-background px-4 text-base outline-none focus-visible:ring-3 focus-visible:ring-ring/40'

export function EngagementRateCalculator() {
  const [followers, setFollowers] = useState('')
  const [likes, setLikes] = useState('')
  const [comments, setComments] = useState('')

  const f = toNumber(followers)
  const l = toNumber(likes)
  const c = toNumber(comments === '' ? '0' : comments)
  const ready = f > 0 && !Number.isNaN(l) && !Number.isNaN(c)
  const rate = ready ? ((l + c) / f) * 100 : null
  const result = rate !== null ? verdict(rate) : null

  return (
    <div className="rounded-3xl border border-border bg-card p-6 sm:p-8">
      <div className="grid gap-5 sm:grid-cols-3">
        <div>
          <label htmlFor="followers" className="text-sm font-medium">
            Followers
          </label>
          <input
            id="followers"
            inputMode="numeric"
            placeholder="e.g. 5000"
            value={followers}
            onChange={(e) => setFollowers(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="likes" className="text-sm font-medium">
            Average likes per post
          </label>
          <input
            id="likes"
            inputMode="numeric"
            placeholder="e.g. 150"
            value={likes}
            onChange={(e) => setLikes(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="comments" className="text-sm font-medium">
            Average comments per post
          </label>
          <input
            id="comments"
            inputMode="numeric"
            placeholder="e.g. 10"
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <div className="mt-6 rounded-2xl bg-muted/70 p-5" aria-live="polite">
        {rate !== null && result ? (
          <>
            <p className="text-sm text-muted-foreground">Your engagement rate</p>
            <p className="mt-1 text-4xl font-semibold tracking-tight tabular-nums">{rate.toFixed(2)}%</p>
            <p className="mt-2 font-medium">{result.label}</p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{result.note}</p>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            Enter your followers and your average likes to see your engagement rate.
          </p>
        )}
      </div>
    </div>
  )
}
