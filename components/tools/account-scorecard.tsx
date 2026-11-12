'use client'

import { useEffect, useRef, useState } from 'react'
import { SmartMomentumOffer } from '@/components/tools/smart-momentum-offer'

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
  g.addColorStop(0, '#090D16')
  g.addColorStop(0.55, '#111827')
  g.addColorStop(1, '#1E1B4B')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, W, H)

  // Subtle ambient editorial glow
  const glow = ctx.createRadialGradient(W / 2, 560, 40, W / 2, 560, 520)
  glow.addColorStop(0, 'rgba(99, 102, 241, 0.24)')
  glow.addColorStop(1, 'rgba(99, 102, 241, 0)')
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, W, H)

  ctx.textAlign = 'center'
  ctx.fillStyle = '#94A3B8'
  ctx.font = 'bold 34px sans-serif'
  ctx.fillText('SOCIALORA CREATOR AUDIT', W / 2, 165)

  ctx.fillStyle = '#F8FAFC'
  ctx.font = 'bold 54px sans-serif'
  ctx.fillText('INSTAGRAM ACCOUNT SCORECARD', W / 2, 235)

  if (username) {
    ctx.fillStyle = '#A5B4FC'
    ctx.font = '600 48px sans-serif'
    ctx.fillText(username, W / 2, 315)
  }

  const cx = W / 2
  const cy = 640
  const r = 250
  ctx.lineWidth = 40
  ctx.lineCap = 'round'
  ctx.strokeStyle = 'rgba(255,255,255,0.1)'
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.stroke()

  const ringGrad = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r)
  ringGrad.addColorStop(0, '#818CF8')
  ringGrad.addColorStop(1, '#34D399')
  ctx.strokeStyle = ringGrad
  ctx.beginPath()
  ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * total) / 100)
  ctx.stroke()

  ctx.fillStyle = '#FFFFFF'
  ctx.font = 'bold 215px sans-serif'
  ctx.fillText(String(total), cx, cy + 72)
  ctx.fillStyle = '#A5B4FC'
  ctx.font = '600 42px sans-serif'
  ctx.fillText('OUT OF 100', cx, cy + 146)

  ctx.fillStyle = '#F8FAFC'
  ctx.font = 'bold 78px sans-serif'
  ctx.fillText(labelFor(total), cx, 1020)

  // Breakdown card container
  const cardX = 96
  const cardY = 1090
  const cardW = W - 192
  const cardH = 600
  ctx.fillStyle = 'rgba(255,255,255,0.04)'
  ctx.strokeStyle = 'rgba(255,255,255,0.12)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.roundRect(cardX, cardY, cardW, cardH, 32)
  ctx.fill()
  ctx.stroke()

  const left = 148
  const barW = W - 296
  parts.forEach((p, i) => {
    const y = 1175 + i * 135
    ctx.textAlign = 'left'
    ctx.fillStyle = '#E2E8F0'
    ctx.font = '600 38px sans-serif'
    ctx.fillText(p.label, left, y)
    ctx.textAlign = 'right'
    ctx.fillStyle = '#94A3B8'
    ctx.fillText(`${Math.round(p.points)}/${p.max}`, left + barW, y)
    ctx.fillStyle = 'rgba(255,255,255,0.1)'
    ctx.beginPath()
    ctx.roundRect(left, y + 24, barW, 24, 12)
    ctx.fill()
    ctx.fillStyle = '#818CF8'
    const fillW = Math.max(24, barW * (p.points / p.max))
    ctx.beginPath()
    ctx.roundRect(left, y + 24, fillW, 24, 12)
    ctx.fill()
  })

  ctx.textAlign = 'center'
  ctx.fillStyle = '#E2E8F0'
  ctx.font = '600 38px sans-serif'
  ctx.fillText('Free Profile Audit: getsocialora.com/tools', W / 2, 1805)
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
        <p className="text-sm font-medium">Your shareable Story scorecard</p>
        <canvas
          ref={canvasRef}
          className="mx-auto mt-3 max-h-[480px] max-w-full rounded-xl border border-border"
          style={{ height: 'auto', width: 'auto' }}
        />
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={download}
            className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground"
          >
            Download My Creator Scorecard (Story PNG)
          </button>
          {result && (
            <a
              href={`https://www.threads.net/intent/post?text=${encodeURIComponent(
                `My Instagram Account Scorecard is ${result.total}/100 (${labelFor(result.total)}, ${result.rate.toFixed(2)}% engagement rate). Run your free profile audit on getsocialora.com/tools`,
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center justify-center rounded-full border border-border bg-background px-6 text-sm font-medium hover:bg-muted/60"
            >
              Share Score on Threads
            </a>
          )}
        </div>
      </div>

      {result && <SmartMomentumOffer />}
    </div>
  )
}
