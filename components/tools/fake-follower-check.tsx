'use client'

import { useState } from 'react'

type Status = 'ok' | 'watch' | 'warn' | 'na'
type Signal = { label: string; status: Status; detail: string }

const STATUS_TEXT: Record<Status, string> = {
  ok: 'Looks normal',
  watch: 'Worth a look',
  warn: 'Unusual',
  na: 'Not enough data',
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

function expectedRate(followers: number): number {
  if (followers < 10000) return 3
  if (followers < 100000) return 1.5
  if (followers < 1000000) return 1
  return 0.7
}

function analyze(
  followers: number,
  following: number,
  posts: number,
  likes: number,
  comments: number,
  gained: number,
) {
  const signals: Signal[] = []

  const rate = ((likes + comments) / followers) * 100
  const expected = expectedRate(followers)
  const rel = rate / expected
  signals.push({
    label: 'Engagement for this size',
    status: rel < 0.2 ? 'warn' : rel < 0.5 ? 'watch' : 'ok',
    detail: `Engagement is ${rate.toFixed(2)}%. Accounts of this size often see around ${expected}%. Very low engagement can mean many followers are inactive or not real.`,
  })

  if (likes < 20) {
    signals.push({
      label: 'Comments compared with likes',
      status: 'na',
      detail: 'Average likes are too low to judge this signal.',
    })
  } else {
    const share = (comments / likes) * 100
    signals.push({
      label: 'Comments compared with likes',
      status: share < 0.5 ? 'warn' : share < 1 ? 'watch' : 'ok',
      detail: `Comments are ${share.toFixed(1)}% of likes. Real audiences usually leave at least a few comments. Many likes with almost no comments is a common sign of bought or automated likes.`,
    })
  }

  const ratio = followers / Math.max(following, 1)
  signals.push({
    label: 'Followers versus following',
    status: following >= 1000 && ratio < 0.2 ? 'warn' : following >= 1000 && ratio < 0.5 ? 'watch' : 'ok',
    detail: `The account has ${ratio.toFixed(1)} followers for every account it follows. A very low number with a high following count often points to follow-for-follow growth.`,
  })

  const perPost = followers / Math.max(posts, 1)
  signals.push({
    label: 'Followers per post',
    status:
      followers >= 5000 && perPost > 5000 ? 'warn' : followers >= 5000 && perPost > 1000 ? 'watch' : 'ok',
    detail: `That is about ${Math.round(perPost).toLocaleString('en-US')} followers for each post. A big audience built on very few posts can happen, but it is worth a closer look.`,
  })

  if (Number.isNaN(gained)) {
    signals.push({
      label: 'Growth in the last 30 days',
      status: 'na',
      detail: 'Add how many followers were gained in the last 30 days to check for sudden jumps.',
    })
  } else {
    const growth = (gained / followers) * 100
    signals.push({
      label: 'Growth in the last 30 days',
      status: growth > 40 ? 'warn' : growth > 20 ? 'watch' : 'ok',
      detail: `The account grew ${growth.toFixed(1)}% in 30 days. A sudden jump without a viral post or a promotion can be a sign of bought followers.`,
    })
  }

  const points = signals.reduce((sum, s) => sum + (s.status === 'warn' ? 2 : s.status === 'watch' ? 1 : 0), 0)
  const risk = points >= 4 ? 'High' : points >= 2 ? 'Medium' : 'Low'
  return { signals, risk, rate }
}

const inputClass =
  'mt-2 h-12 w-full rounded-xl border border-border bg-background px-4 text-base outline-none focus-visible:ring-3 focus-visible:ring-ring/40'

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text)
  } catch {
    const area = document.createElement('textarea')
    area.value = text
    document.body.appendChild(area)
    area.select()
    document.execCommand('copy')
    document.body.removeChild(area)
  }
}

export function FakeFollowerCheck() {
  const [mode, setMode] = useState<'mine' | 'other'>('mine')
  const [username, setUsername] = useState('')
  const [followers, setFollowers] = useState('')
  const [following, setFollowing] = useState('')
  const [posts, setPosts] = useState('')
  const [likes, setLikes] = useState('')
  const [comments, setComments] = useState('')
  const [gained, setGained] = useState('')
  const [copied, setCopied] = useState(false)

  const f = toNumber(followers)
  const fo = toNumber(following)
  const p = toNumber(posts)
  const l = toNumber(likes)
  const c = toNumber(comments)
  const g = toNumber(gained)
  const ready = f > 0 && !Number.isNaN(fo) && !Number.isNaN(p) && !Number.isNaN(l) && !Number.isNaN(c)
  const result = ready ? analyze(f, fo, p, l, c, g) : null

  const name = username.trim().replace(/^@+/, '')

  async function copyReport() {
    if (!result) return
    const lines = [
      `Instagram authenticity check${name ? ` for @${name}` : ''}`,
      `Risk of looking inauthentic: ${result.risk}`,
      '',
      ...result.signals.map((s) => `- ${s.label}: ${STATUS_TEXT[s.status]}. ${s.detail}`),
      '',
      'Based on public numbers only. It cannot confirm whether any single follower is real.',
    ]
    await copyText(lines.join('\n'))
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="rounded-3xl border border-border bg-card p-6 sm:p-8">
      <fieldset>
        <legend className="text-sm font-medium">Whose account is it?</legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {[
            { id: 'mine', label: 'My account' },
            { id: 'other', label: 'Another account' },
          ].map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setMode(m.id as 'mine' | 'other')}
              aria-pressed={mode === m.id}
              className={`rounded-full border px-4 py-2 text-sm font-medium ${
                mode === m.id
                  ? 'border-foreground bg-foreground text-background'
                  : 'border-border bg-background hover:border-foreground/30'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="mt-5">
        <label htmlFor="ff-user" className="text-sm font-medium">
          Username (optional)
        </label>
        <input
          id="ff-user"
          maxLength={30}
          autoCapitalize="off"
          autoComplete="off"
          spellCheck={false}
          placeholder="e.g. maya"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className={inputClass}
        />
      </div>

      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="ff-followers" className="text-sm font-medium">
            Followers
          </label>
          <input
            id="ff-followers"
            inputMode="numeric"
            placeholder="e.g. 20000"
            value={followers}
            onChange={(e) => setFollowers(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="ff-following" className="text-sm font-medium">
            Following
          </label>
          <input
            id="ff-following"
            inputMode="numeric"
            placeholder="e.g. 900"
            value={following}
            onChange={(e) => setFollowing(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="ff-posts" className="text-sm font-medium">
            Number of posts
          </label>
          <input
            id="ff-posts"
            inputMode="numeric"
            placeholder="e.g. 120"
            value={posts}
            onChange={(e) => setPosts(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="ff-likes" className="text-sm font-medium">
            Average likes per post
          </label>
          <input
            id="ff-likes"
            inputMode="numeric"
            placeholder="e.g. 400"
            value={likes}
            onChange={(e) => setLikes(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="ff-comments" className="text-sm font-medium">
            Average comments per post
          </label>
          <input
            id="ff-comments"
            inputMode="numeric"
            placeholder="e.g. 12"
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="ff-gained" className="text-sm font-medium">
            Followers gained in the last 30 days (optional)
          </label>
          <input
            id="ff-gained"
            inputMode="numeric"
            placeholder="e.g. 800"
            value={gained}
            onChange={(e) => setGained(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <div className="mt-6 rounded-2xl bg-muted/70 p-5" aria-live="polite">
        {result ? (
          <>
            <p className="text-sm text-muted-foreground">Risk of looking inauthentic</p>
            <p className="mt-1 text-4xl font-semibold tracking-tight">{result.risk}</p>
            <p className="mt-1 text-sm text-muted-foreground">Engagement rate: {result.rate.toFixed(2)}%</p>

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

            <div className="mt-5 border-t border-border pt-4">
              <p className="text-sm font-medium">{mode === 'mine' ? 'What you can do' : 'How to use this result'}</p>
              {mode === 'mine' ? (
                <ul className="mt-2 grid list-disc gap-1.5 pl-5 text-sm text-muted-foreground">
                  <li>Post Reels and carousels that give followers a reason to comment, such as a question at the end.</li>
                  <li>Reply to every comment in the first hour, so your real audience stays active.</li>
                  <li>Check your Insights for where your followers come from. Unexpected countries are worth a look.</li>
                </ul>
              ) : (
                <ul className="mt-2 grid list-disc gap-1.5 pl-5 text-sm text-muted-foreground">
                  <li>Treat the result as a first filter, not a final answer.</li>
                  <li>Open the last posts yourself and read the comments. Real comments mention the content.</li>
                  <li>Ask the creator for a screenshot of their audience countries and age from Insights.</li>
                </ul>
              )}
            </div>

            <button
              type="button"
              onClick={copyReport}
              className="mt-5 inline-flex h-11 items-center justify-center rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground"
            >
              {copied ? 'Copied' : 'Copy report'}
            </button>

            <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
              This is an evaluation of public numbers. It cannot confirm whether any single follower is real, and a
              low score is not proof of bought followers.
            </p>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            Fill in the boxes to see your result. Use averages from the last 10 to 20 posts.
          </p>
        )}
      </div>
    </div>
  )
            }
