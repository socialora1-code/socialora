'use client'

import { useEffect, useRef, useState } from 'react'
import { SITE } from '@/lib/site'

const W = 1080
const H = 1920

function toNumber(value: string): number {
  const cleaned = value.replace(/,/g, '').trim()
  if (cleaned === '') return NaN
  const n = Number(cleaned)
  return Number.isFinite(n) && n >= 0 ? n : NaN
}

type Part = { label: string; points: number; max: number; tip: string }

function targetRate(followers: number): number {
  if (followers < 10000) return 4
  if (followers < 100000) return 2.5
  if (followers < 1000000) return 1.5
  return 1
}

function calculate(followers: number, following: number, posts: number, likes: number, comments: number) {
  const rate = ((likes + comments) / followers) * 100
  const ratio = followers / Math.max(following, 1)
  const commentShare = likes > 0 ? (comments / likes) * 100 : 0

  const parts: Part[] = [
    {
      label: 'Engagement',
      points: Math.min(50, (rate / targetRate(followers)) * 50),
      max: 50,
      tip: 'Ask a question in your captions and reply to comments in the first hour.',
    },
    {
      label: 'Followers vs following',
      points: Math.min(20, (ratio / 5) * 20),
      max: 20,
      tip: 'Follow fewer accounts, or grow your followers before following more.',
    },
    {
      label: 'Posting activity',
      points: Math.min(15, (posts / 30) * 15),
      max: 15,
      tip: 'Post on a steady schedule so new visitors see an active profile.',
    },
    {
      label: 'Conversation',
      points: Math.min(15, (commentShare / 3) * 15),
      max: 15,
      tip: 'End posts with a question so people have a reason to comment.',
    },
  ]
  const total = Math.round(parts.reduce((sum, p) => sum + p.points, 0))
  return { total, parts, rate }
}

function labelFor(total: number): string {
  if (total >= 80) return 'Excellent'
  if (total >= 60) return 'Good'
  if (total >= 40) return 'Fair'
  return 'Needs work'
}

function drawCard(
  ctx: CanvasRenderingContext2D,
  total: number,
  parts: Part[],
  username: string,
) {
  const g = ctx.createLinearGradient(0, 0, W, H)
  g.addColorStop(0, '#2a1f6b')
  g.addColorStop(1, '#0e0e1f')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, W, H)

  ctx.textAlign = 'center'
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 56px sans-serif'
  ctx.fillText('INSTAGRAM ACCOUNT SCORECARD', W / 2, 220)

  if (username) {
    ctx.fillStyle = '#c4b5fd'
    ctx.font = '600 52px sans-serif'
    ctx.fillText(username, W / 2, 310)
  }

  const cx = W / 2
  const cy = 640
  const r = 260
  ctx.lineWidth = 44
  ctx.lineCap = 'round'
  ctx.strokeStyle = 'rgba(255,255,255,0.12)'
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.stroke()
  ctx.strokeStyle = '#a78bfa'
  ctx.beginPath()
  ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * total) / 100)
  ctx.stroke()

  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 220px sans-serif'
  ctx.fillText(String(total), cx, cy + 75)
  ctx.fillStyle = '#c4b5fd'
  ctx.font = '600 44px sans-serif'
  ctx.fillText('out of 100', cx, cy + 150)

  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 84px sans-serif'
  ctx.fillText(labelFor(total), cx, 1040)

  const left = 140
  const barW = W - 280
  parts.forEach((p, i) => {
    const y = 1180 + i * 140
    ctx.textAlign = 'left'
    ctx.fillStyle = '#e5e7eb'
    ctx.font = '600 40px sans-serif'
    ctx.fillText(p.label, left, y)
    ctx.textAlign = 'right'
    ctx.fillText(`${Math.round(p.points)}/${p.max}`, left + barW, y)
    ctx.fillStyle = 'rgba(255,255,255,0.12)'
    ctx.fillRect(left, y + 24, barW, 26)
    ctx.fillStyle = '#a78bfa'
    ctx.fillRect(left, y + 24, barW * (p.points / p.max), 26)
  })

  ctx.textAlign = 'center'
  ctx.fillStyle = 'rgba(255,255,255,0.6)'
  ctx.font = '34px sans-serif'
  ctx.fillText('Check your own score for free', W / 2, 1770)
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 44px sans-serif'
  ctx.fillText(SITE.url.replace(/^https?:\/\/(www\.)?/, ''), W / 2, 1835)
}

const inputClass =
  'mt-2 h-12 w-full rounded-xl border border-border bg-background px-4 text-base outline-none focus-visible:ring-3 focus-visible:ring-ring/40'

export function AccountScorecard() {
  const [username, setUsername] = useState('')
  const [followers, setFollowers] = useState('')
  const [following, setFollowing] = useState('')
  const [posts, setPosts] = useState('')
  const [likes, setLikes] = useState('')
  const [comments, setComments] = useState('')
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  const f = toNumber(followers)
  const fo = toNumber(following)
  const p = toNumber(posts)
  const l = toNumber(likes)
  const c = toNumber(comments)
  const ready = f > 0 && !Number.isNaN(fo) && !Number.isNaN(p) && !Number.isNaN(l) && !Number.isNaN(c)
  const result = ready ? calculate(f, fo, p, l, c) : null

  const cleanName = username.trim().replace(/^@+/, '')
  const shownName = cleanName ? `@${cleanName}` : ''

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !result) return
    canvas.width = W
    canvas.height = H
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    drawCard(ctx, result.total, result.parts, shownName)
  }, [result?.total, shownName]) // eslint-disable-line react-hooks/exhaustive-deps

  function download() {
    const canvas = canvasRef.current
    if (!canvas) return
    const a = document.createElement('a')
    a.href = canvas.toDataURL('image/png')
    a.download = 'instagram-account-scorecard.png'
    a.click()
  }

  const weakest = result
    ? [...result.parts]
        .filter((part) => part.points / part.max < 0.8)
        .sort((a, b) => a.points / a.max - b.points / b.max)
        .slice(0, 2)
    : []

  return (
    <div className="rounded-3xl border border-border bg-card p-6 sm:p-8">
      <div>
        <label htmlFor="sc-user" className="text-sm font-medium">
          Username (optional, shown on your card)
        </label>
        <input
          id="sc-user"
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
          <label htmlFor="sc-followers" className="text-sm font-medium">
            Followers
          </label>
          <input
            id="sc-followers"
            inputMode="numeric"
            placeholder="e.g. 5000"
            value={followers}
            onChange={(e) => setFollowers(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="sc-following" className="text-sm font-medium">
            Following
          </label>
          <input
            id="sc-following"
            inputMode="numeric"
            placeholder="e.g. 800"
            value={following}
            onChange={(e) => setFollowing(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="sc-posts" className="text-sm font-medium">
            Number of posts
          </label>
          <input
            id="sc-posts"
            inputMode="numeric"
            placeholder="e.g. 60"
            value={posts}
            onChange={(e) => setPosts(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="sc-likes" className="text-sm font-medium">
            Average likes per post
          </label>
          <input
            id="sc-likes"
            inputMode="numeric"
            placeholder="e.g. 150"
            value={likes}
            onChange={(e) => setLikes(e.target.value)}
            className={inputClass}
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="sc-comments" className="text-sm font-medium">
            Average comments per post
          </label>
          <input
            id="sc-comments"
            inputMode="numeric"
            placeholder="e.g. 10"
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <div className="mt-6 rounded-2xl bg-muted/70 p-5" aria-live="polite">
        {result ? (
          <>
            <p className="text-sm text-muted-foreground">Your account score</p>
            <p className="mt-1 text-5xl font-semibold tracking-tight tabular-nums">
              {result.total}
              <span className="ml-1 text-xl font-normal text-muted-foreground">/ 100</span>
            </p>
            <p className="mt-1 font-medium">{labelFor(result.total)}</p>
            <p className="mt-1 text-sm text-muted-foreground">Engagement rate: {result.rate.toFixed(2)}%</p>

            <dl className="mt-4 grid gap-3 text-sm">
              {result.parts.map((part) => (
                <div key={part.label}>
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">{part.label}</dt>
                    <dd className="font-medium tabular-nums">
                      {Math.round(part.points)}/{part.max}
                    </dd>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-background">
                    <div
                      className="h-2 rounded-full bg-primary"
                      style={{ width: `${(part.points / part.max) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </dl>

            {weakest.length > 0 && (
              <div className="mt-5 border-t border-border pt-4">
                <p className="text-sm font-medium">Your growth plan</p>
                <ul className="mt-2 grid list-disc gap-1.5 pl-5 text-sm text-muted-foreground">
                  {weakest.map((part) => (
                    <li key={part.label}>
                      <span className="font-medium text-foreground">{part.label}:</span> {part.tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
              The score is an evaluation based on average engagement rates for accounts of your size. It is not
              official Instagram data.
            </p>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            Fill in all the boxes to see your score. Use averages from your last 10 to 20 posts.
          </p>
        )}
      </div>

      <div className={result ? 'mt-6' : 'hidden'}>
        <p className="text-sm font-medium">Your shareable card</p>
        <canvas
          ref={canvasRef}
          className="mx-auto mt-3 max-h-[480px] max-w-full rounded-xl border border-border"
          style={{ height: 'auto', width: 'auto' }}
        />
        <button
          type="button"
          onClick={download}
          className="mt-4 inline-flex h-11 items-center justify-center rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground"
        >
          Download card (PNG)
        </button>
      </div>
    </div>
  )
}
