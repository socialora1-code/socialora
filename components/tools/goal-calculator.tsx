'use client'

import { useEffect, useState } from 'react'

function toNum(s: string): number {
  const n = Number(s.replace(/[^0-9]/g, ''))
  return Number.isFinite(n) ? n : 0
}

function fmt(n: number): string {
  return Math.round(n).toLocaleString('en-US')
}

export function GoalCalculator() {
  const [current, setCurrent] = useState('1000')
  const [goal, setGoal] = useState('10000')
  const [perWeek, setPerWeek] = useState('50')
  const [today, setToday] = useState<Date | null>(null)

  useEffect(() => {
    setToday(new Date())
  }, [])

  const c = toNum(current)
  const g = toNum(goal)
  const w = toNum(perWeek)

  let message = ''
  let weeks = 0
  if (g <= c) {
    message = 'You have already reached this goal. Set a bigger one.'
  } else if (w <= 0) {
    message = 'Enter how many followers you gain per week.'
  } else {
    weeks = Math.ceil((g - c) / w)
    if (weeks > 520) {
      message = 'At this pace it would take more than 10 years. Try a smaller goal or a higher weekly number.'
      weeks = 0
    }
  }

  let dateText = ''
  if (weeks > 0 && today) {
    const d = new Date(today.getTime() + weeks * 7 * 24 * 60 * 60 * 1000)
    dateText = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }

  const W = 600
  const H = 260
  const padL = 56
  const padR = 20
  const padT = 20
  const padB = 36
  const x = (t: number) => padL + (t / 1) * (W - padL - padR)
  const y = (t: number) => H - padB - t * (H - padT - padB)

  const marks = [0.25, 0.5, 0.75, 1]

  return (
    <div className="rounded-3xl border border-border bg-card p-5 sm:p-6">
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="grid gap-1 text-sm font-medium">
          Followers now
          <input
            inputMode="numeric"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            className="h-11 rounded-xl border border-border bg-background px-3 text-sm font-normal"
          />
        </label>
        <label className="grid gap-1 text-sm font-medium">
          Your goal
          <input
            inputMode="numeric"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            className="h-11 rounded-xl border border-border bg-background px-3 text-sm font-normal"
          />
        </label>
        <label className="grid gap-1 text-sm font-medium">
          Followers gained per week
          <input
            inputMode="numeric"
            value={perWeek}
            onChange={(e) => setPerWeek(e.target.value)}
            className="h-11 rounded-xl border border-border bg-background px-3 text-sm font-normal"
          />
        </label>
      </div>

      {message && <p className="mt-5 text-sm text-muted-foreground">{message}</p>}

      {weeks > 0 && (
        <div className="mt-6">
          <p className="text-2xl font-semibold tracking-tight">
            About {fmt(weeks)} {weeks === 1 ? 'week' : 'weeks'}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            to go from {fmt(c)} to {fmt(g)} followers
            {dateText ? `, around ${dateText}` : ''}.
          </p>

          <svg viewBox={`0 0 ${W} ${H}`} className="mt-5 w-full text-primary" role="img" aria-label="Follower growth chart">
            <line x1={padL} y1={y(0)} x2={W - padR} y2={y(0)} stroke="currentColor" strokeOpacity="0.2" />
            <line x1={padL} y1={y(1)} x2={W - padR} y2={y(1)} stroke="currentColor" strokeOpacity="0.2" />
            <polygon
              points={`${x(0)},${y(0)} ${x(0)},${y(0)} ${x(1)},${y(1)} ${x(1)},${y(0)}`}
              fill="currentColor"
              fillOpacity="0.1"
            />
            <line x1={x(0)} y1={y(0)} x2={x(1)} y2={y(1)} stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            {marks.map((m) => (
              <circle key={m} cx={x(m)} cy={y(m)} r="5" fill="currentColor" />
            ))}
            <circle cx={x(0)} cy={y(0)} r="5" fill="currentColor" />
            <text x={padL - 8} y={y(0) + 4} textAnchor="end" fontSize="12" fill="currentColor" fillOpacity="0.7">
              {fmt(c)}
            </text>
            <text x={padL - 8} y={y(1) + 4} textAnchor="end" fontSize="12" fill="currentColor" fillOpacity="0.7">
              {fmt(g)}
            </text>
            <text x={x(0)} y={H - 10} textAnchor="start" fontSize="12" fill="currentColor" fillOpacity="0.7">
              Now
            </text>
            <text x={x(1)} y={H - 10} textAnchor="end" fontSize="12" fill="currentColor" fillOpacity="0.7">
              Week {fmt(weeks)}
            </text>
          </svg>

          <ul className="mt-4 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
            {marks.map((m) => (
              <li key={m} className="rounded-xl border border-border bg-background px-4 py-3">
                <span className="font-medium text-foreground">{fmt(c + (g - c) * m)} followers</span>
                {' '}
                around week {fmt(Math.ceil(weeks * m))}
              </li>
            ))}
          </ul>

          <p className="mt-4 text-xs text-muted-foreground">
            This is an estimate based on steady growth. Real growth goes up and down.
          </p>
        </div>
      )}
    </div>
  )
}
