'use client'

import { useMemo, useState, type FormEvent } from 'react'
import { SmartMomentumOffer } from '@/components/tools/smart-momentum-offer'
import { useStudioCopy } from '@/components/tools/studio-copy'
import { StudioMomentumBridge } from '@/components/tools/studio-momentum-bridge'
import { SAMPLE_COMMENTS, drawGiveaway, getGiveawayEntries, giveawayAnnouncements, giveawayTerms } from '@/lib/giveaway'

const inputClass = 'mt-2 h-12 w-full rounded-xl border border-border bg-background px-4 text-base outline-none focus-visible:ring-2 focus-visible:ring-ring'
const actionClass = 'inline-flex min-h-11 items-center justify-center rounded-full border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50'
const cardClass = 'rounded-2xl border border-border bg-card p-5'
const defaultFields = { winners: '1', backups: '0', mentions: '0', keyword: '', dedupe: true }

type Draw = { winners: string[]; backups: string[]; sample: boolean }

const numberFields = [
  { id: 'winners', label: 'Primary winners', min: 1 },
  { id: 'backups', label: 'Backup winners', min: 0 },
  { id: 'mentions', label: 'Minimum distinct @mentions', min: 0 },
] as const

function WinnerList({ names, backup = false }: { names: string[]; backup?: boolean }) {
  return (
    <ol className="grid gap-2">
      {names.map((name, index) => (
        <li key={name} className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-background p-3">
          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${backup ? 'bg-muted text-muted-foreground' : 'bg-primary/25 text-foreground'}`}>
            {backup ? 'Backup' : 'Primary winner'} {index + 1}
          </span>
          <span className="min-w-0 font-semibold wrap-anywhere">{name}</span>
        </li>
      ))}
    </ol>
  )
}

export function GiveawayPicker() {
  const [text, setText] = useState('')
  const [fields, setFields] = useState(defaultFields)
  const [sample, setSample] = useState(false)
  const [draw, setDraw] = useState<Draw | null>(null)
  const [error, setError] = useState('')
  const { lastCopy, copy, clearCopy } = useStudioCopy()

  const valid = numberFields.every(({ id, min }) => /^\d+$/.test(fields[id]) && Number.isSafeInteger(Number(fields[id])) && Number(fields[id]) >= min)
  const rules = useMemo(() => ({
    winners: Number(fields.winners),
    backups: Number(fields.backups),
    mentions: Number(fields.mentions),
    keyword: fields.keyword.trim().replace(/[\u2013\u2014]/g, '-'),
    dedupe: fields.dedupe,
  }), [fields])
  const { entries, unique, excluded, duplicates } = useMemo(() => getGiveawayEntries(text, rules), [text, rules])
  const terms = valid ? giveawayTerms(rules) : ''
  const announcements = draw ? giveawayAnnouncements(draw.winners, draw.backups, draw.sample) : null

  function resetResult() {
    setDraw(null)
    setError('')
    clearCopy()
  }

  function updateField<K extends keyof typeof fields>(key: K, value: (typeof fields)[K]) {
    setFields((previous) => ({ ...previous, [key]: value }))
    resetResult()
  }

  function pick(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setDraw(null)
    clearCopy()
    if (!valid) {
      setError('Enter whole numbers. At least one primary winner is required.')
      return
    }
    if (!text.trim()) {
      setError('Paste at least one entrant or load the sample data.')
      return
    }
    const wanted = rules.winners + rules.backups
    if (wanted > unique) {
      setError(`You need ${wanted} distinct eligible entrants. The current rules leave ${unique}.`)
      return
    }
    const picked = drawGiveaway(entries, wanted)
    setError('')
    setDraw({ winners: picked.slice(0, rules.winners), backups: picked.slice(rules.winners), sample })
  }

  return (
    <div>
      <form onSubmit={pick} noValidate className="rounded-3xl border border-border bg-card p-5 sm:p-7" aria-labelledby="giveaway-studio-title">
        <h2 id="giveaway-studio-title" className="text-xl font-semibold tracking-tight">Giveaway Studio</h2>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <label htmlFor="picker-names" className="text-sm font-medium">Entrants or comments (one per line)</label>
          <button type="button" className={actionClass} disabled={Boolean(text.trim()) && !sample} onClick={() => {
            setText(SAMPLE_COMMENTS)
            setFields({ winners: '1', backups: '2', mentions: '2', keyword: '#studio', dedupe: true })
            setSample(true)
            resetResult()
          }}>
            Try Sample Giveaway Data
          </button>
        </div>
        <p id="picker-format" className="mt-2 text-sm text-muted-foreground">
          Paste names for a simple draw. Use <code>@username: comment text</code> on each line to filter by mentions or keywords.
        </p>
        {sample && <p className="mt-2 text-sm font-medium text-foreground">Sample mode. Replace the list with your real entries to run your giveaway.</p>}
        <textarea
          id="picker-names"
          aria-describedby="picker-format"
          value={text}
          onChange={(event) => {
            setText(event.target.value)
            if (!/^\s*@?sample_\w+\s*:/im.test(event.target.value)) setSample(false)
            resetResult()
          }}
          rows={6}
          placeholder={'@maya: Entering #studio @alex\n@sam: Count me in #studio @lee'}
          className="mt-2 w-full rounded-xl border border-border bg-background p-4 text-base outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />

        <fieldset className="mt-5 min-w-0 rounded-2xl border border-border p-4">
          <legend className="px-2 text-sm font-semibold">Advanced Giveaway Rules</legend>
          <div className="grid gap-4 sm:grid-cols-3">
            {numberFields.map(({ id, label, min }) => (
              <label key={id} className="text-sm font-medium">
                {label}
                <input inputMode="numeric" type="number" min={min} step={1} className={inputClass} value={fields[id]} onChange={(event) => updateField(id, event.target.value)} />
              </label>
            ))}
          </div>
          <label className="mt-4 block text-sm font-medium">
            Required keyword or hashtag (optional)
            <input value={fields.keyword} maxLength={100} onChange={(event) => updateField('keyword', event.target.value)} placeholder="e.g. #studio or my entry" className={inputClass} />
          </label>
          <label className="mt-4 flex min-h-11 items-center gap-3 text-sm font-medium">
            <input type="checkbox" checked={fields.dedupe} onChange={(event) => updateField('dedupe', event.target.checked)} className="h-5 w-5 shrink-0 accent-primary" />
            Count one eligible comment per user
          </label>
          <p className="text-sm text-muted-foreground">With this off, each eligible comment is an entry. One person can fill only one winner or backup spot.</p>
        </fieldset>

        <p className="mt-4 text-sm text-muted-foreground" aria-live="polite">
          {entries.length} eligible {entries.length === 1 ? 'entry' : 'entries'} · {unique} distinct {unique === 1 ? 'entrant' : 'entrants'} · {excluded} filtered out · {duplicates} duplicate {duplicates === 1 ? 'entry' : 'entries'} removed
        </p>
        <button type="submit" className="mt-4 inline-flex min-h-11 items-center justify-center rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring">
          {draw ? 'Pick again' : 'Pick winners'}
        </button>
        {error && <p role="alert" className="mt-3 text-sm text-foreground">{error}</p>}
      </form>

      <section className={`${cardClass} mt-4`} aria-labelledby="giveaway-terms-title">
        <h3 id="giveaway-terms-title" className="font-semibold">Ready-to-Copy Giveaway Rules</h3>
        <p className="mt-1 text-sm text-muted-foreground">Fill in the bracketed details before posting.</p>
        <textarea aria-label="Giveaway rules draft" readOnly value={terms} rows={6} placeholder="Enter valid draw rules to prepare a draft." className="mt-3 w-full rounded-xl border border-border bg-background p-3 text-sm focus-visible:ring-2 focus-visible:ring-ring" />
        <button type="button" className={`${actionClass} mt-3`} disabled={!terms} onClick={() => copy('terms', terms)}>Copy Giveaway Rules</button>
        {lastCopy.key === 'terms' && <span className="ml-3 text-sm text-muted-foreground">Copied</span>}
      </section>

      {draw && announcements && (
        <>
          <section className={`${cardClass} mt-4`} aria-labelledby="draw-results-title">
            <h3 id="draw-results-title" className="mb-3 text-lg font-semibold">{draw.sample ? 'Sample Draw Results' : 'Draw Results'}</h3>
            <div aria-live="polite" className="grid gap-3">
              <WinnerList names={draw.winners} />
              {draw.backups.length > 0 && <WinnerList names={draw.backups} backup />}
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {(['story', 'post'] as const).map((format) => {
                const label = format === 'story' ? 'Story Announcement' : 'Post Announcement'
                return (
                  <div key={format} className="min-w-0 rounded-xl border border-border bg-background p-4">
                    <h4 className="font-semibold">{label}</h4>
                    <p className="mt-2 whitespace-pre-line text-sm text-muted-foreground wrap-anywhere">{announcements[format]}</p>
                    <button type="button" className={`${actionClass} mt-3`} onClick={() => copy(format, announcements[format])}>
                      {lastCopy.key === format ? 'Copied' : `Copy ${label}`}
                    </button>
                  </div>
                )
              })}
            </div>
          </section>
          <StudioMomentumBridge id="giveaway-momentum" title="Post-Giveaway Momentum" highlighted>
            <p>Give new followers a reason to return in your next three posts.</p>
            <ol className="list-decimal space-y-1 pl-5">
              <li>Share a results recap and show the prize or what it helps someone do.</li>
              <li>Publish a short tutorial tied to the giveaway theme and check its watch time.</li>
              <li>Answer a real question from the giveaway comments and track replies and saves.</li>
            </ol>
            <p>Compare early views and interactions with recent posts in the same formats before choosing what to repeat.</p>
          </StudioMomentumBridge>
          <SmartMomentumOffer />
        </>
      )}
      <p className="mt-2 text-sm text-muted-foreground" role="status">{lastCopy.message}</p>
    </div>
  )
}
