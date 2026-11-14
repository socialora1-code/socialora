'use client'

import Link from 'next/link'
import { useState, type ReactNode } from 'react'
import { SmartMomentumOffer } from '@/components/tools/smart-momentum-offer'
import {
  CAPTION_TONES,
  CONTENT_GOALS,
  QUICK_NICHES,
  makeCaptionDrafts,
  makeHashtagBuckets,
  type CaptionPlatform,
  type CaptionTone,
  type ContentGoal,
} from '@/lib/post-studio'

const fieldClass = 'mt-2 h-12 w-full rounded-xl border border-border bg-background px-4 text-base outline-none focus-visible:ring-2 focus-visible:ring-ring'
const buttonClass = 'inline-flex min-h-11 items-center justify-center rounded-full border px-4 py-2 text-sm font-medium focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50'
const secondaryClass = `${buttonClass} border-border bg-background hover:bg-muted`
const primaryClass = `${buttonClass} border-primary bg-primary text-primary-foreground hover:opacity-90`
const panelClass = 'rounded-2xl border border-border bg-card p-4 sm:p-5'
const tagLimit = 15

function chipClass(pressed: boolean) {
  return `${buttonClass} ${pressed ? 'border-primary bg-primary/20 text-foreground' : 'border-border bg-background hover:bg-muted'}`
}

function Choices({ label, children }: { label: string; children: ReactNode }) {
  return (
    <fieldset className="mt-4 min-w-0">
      <legend className="text-sm font-medium">{label}</legend>
      <div className="mt-2 flex flex-wrap gap-2">{children}</div>
    </fieldset>
  )
}

function StudioPanel({ children }: { children: ReactNode }) {
  return (
    <section className="rounded-3xl border border-border bg-card p-5 sm:p-7" aria-labelledby="post-studio-title">
      <h2 id="post-studio-title" className="text-xl font-semibold tracking-tight">Post Prep &amp; Momentum Studio</h2>
      <div className="mt-4">{children}</div>
    </section>
  )
}

function useStudioCopy() {
  const [lastCopy, setLastCopy] = useState({ key: '', message: '' })

  async function copy(key: string, text: string) {
    let succeeded = false
    try {
      await navigator.clipboard.writeText(text)
      succeeded = true
    } catch {
      const active = document.activeElement
      const field = document.createElement('textarea')
      field.value = text
      field.style.position = 'fixed'
      field.style.insetInlineStart = '-9999px'
      document.body.appendChild(field)
      try {
        field.select()
        succeeded = document.execCommand('copy')
      } catch {
        succeeded = false
      } finally {
        field.remove()
        if (active instanceof HTMLElement) active.focus()
      }
    }
    setLastCopy({ key: succeeded ? key : '', message: succeeded ? 'Copied to clipboard.' : 'Copy failed. Select the text to copy it manually.' })
  }

  return { lastCopy, copy, clearCopy: () => setLastCopy({ key: '', message: '' }) }
}

function FirstHourMomentum({ copied }: { copied: boolean }) {
  return (
    <aside
      aria-labelledby="first-hour-title"
      className={`mt-6 rounded-2xl border border-primary/40 p-5 ${copied ? 'bg-primary/15 ring-1 ring-primary/50' : 'bg-primary/5'}`}
    >
      <h3 id="first-hour-title" className="text-lg font-semibold tracking-tight">First Hour Momentum</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        Relevant tags help describe your post&apos;s topic. A clear hook helps viewers decide whether to keep watching or reading.
        Watch behavior and interactions can inform recommendations. Use 60 minutes as your first measurement checkpoint.
      </p>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        Record views, watch time where available, and meaningful replies or shares. Compare the first hour with a recent post in the same format to gauge how quickly views and interactions accumulated.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link href="/free-instagram-views" className={primaryClass}>Try Free Instagram Views</Link>
        <Link href="/order?platform=instagram&service=followers-365" className={secondaryClass}>Explore 365-Day Refill Growth Packages</Link>
      </div>
    </aside>
  )
}

export function HashtagStudio({ initialValues, showOffer }: { initialValues?: Record<string, string>; showOffer: boolean }) {
  const [topic, setTopic] = useState(initialValues?.keyword ?? '')
  const [detail, setDetail] = useState(initialValues?.second ?? '')
  const [goal, setGoal] = useState<ContentGoal>('reels')
  const [round, setRound] = useState(0)
  const [selected, setSelected] = useState<string[]>([])
  const { lastCopy, copy, clearCopy } = useStudioCopy()
  const buckets = makeHashtagBuckets(topic, detail, goal, round)
  const pack = buckets.flatMap((bucket) => bucket.tags)

  function updateTopic(nextTopic: string, nextDetail: string) {
    setTopic(nextTopic)
    setDetail(nextDetail)
    setRound(0)
    setSelected([])
    clearCopy()
  }

  function toggleTag(tag: string) {
    clearCopy()
    setSelected((previous) => {
      if (previous.includes(tag)) return previous.filter((item) => item !== tag)
      return previous.length < tagLimit ? [...previous, tag] : previous
    })
  }

  return (
    <div>
      <StudioPanel>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-medium">
            Your topic or keyword
            <input value={topic} onChange={(event) => updateTopic(event.target.value, detail)} placeholder="e.g. baking" maxLength={60} className={fieldClass} />
          </label>
          <label className="text-sm font-medium">
            Second keyword (optional)
            <input value={detail} onChange={(event) => updateTopic(topic, event.target.value)} placeholder="e.g. sourdough" maxLength={60} className={fieldClass} />
          </label>
        </div>
        <Choices label="Quick Niches">
          {QUICK_NICHES.map((niche) => (
            <button key={niche.label} type="button" aria-pressed={topic === niche.label && detail === niche.detail} className={chipClass(topic === niche.label && detail === niche.detail)} onClick={() => updateTopic(niche.label, niche.detail)}>
              {niche.label}
            </button>
          ))}
        </Choices>
        <Choices label="Content Goal">
          {(Object.keys(CONTENT_GOALS) as ContentGoal[]).map((option) => (
            <button key={option} type="button" aria-pressed={goal === option} className={chipClass(goal === option)} onClick={() => { setGoal(option); setRound(0); clearCopy() }}>
              {CONTENT_GOALS[option].label}
            </button>
          ))}
        </Choices>
      </StudioPanel>

      {pack.length === 0 ? <p className="mt-4 text-sm text-muted-foreground">Enter a topic or pick a niche to get hashtag ideas.</p> : (
        <>
          <div className="mt-4 grid gap-3" aria-label="Hashtag buckets">
            {buckets.map((bucket) => (
              <section key={bucket.label} aria-label={bucket.label} className={panelClass}>
                <h3 className="text-base font-semibold">{bucket.label}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{bucket.hint}</p>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {bucket.tags.map((tag) => (
                    <li key={tag} className="min-w-0 max-w-full">
                      <button type="button" aria-pressed={selected.includes(tag)} disabled={selected.length >= tagLimit && !selected.includes(tag)} className={`${chipClass(selected.includes(tag))} max-w-full text-left wrap-anywhere`} onClick={() => toggleTag(tag)}>
                        {tag}
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>

          <section className={`${panelClass} mt-4 border-primary/40`} aria-labelledby="selected-tags-title">
            <h3 id="selected-tags-title" className="text-base font-semibold" aria-live="polite">My Selected Hashtag Set: {selected.length} / {tagLimit}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{selected.length >= tagLimit ? 'Set full. Remove a tag to add another.' : 'Pick a few that fit your post.'}</p>
            {selected.length > 0 && (
              <ul className="mt-3 flex flex-wrap gap-2">
                {selected.map((tag) => (
                  <li key={tag} className="min-w-0 max-w-full">
                    <button type="button" aria-label={`Remove ${tag}`} className={`${secondaryClass} max-w-full text-left wrap-anywhere`} onClick={() => toggleTag(tag)}>{tag} ×</button>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" disabled={selected.length === 0} className={primaryClass} onClick={() => copy('selected', selected.join(' '))}>Copy Selected Set</button>
              <button type="button" className={secondaryClass} onClick={() => copy('pack', pack.join(' '))}>Copy Entire Pack</button>
              <button type="button" className={secondaryClass} onClick={() => { setRound((previous) => previous + 1); clearCopy() }}>More ideas</button>
            </div>
            <p className="mt-2 text-sm text-muted-foreground" role="status">{lastCopy.message}</p>
          </section>
          <p className="mt-3 text-sm text-muted-foreground">Search for each tag in Facebook before posting. These suggestions use your topic and goal.</p>
          <FirstHourMomentum copied={Boolean(lastCopy.key)} />
          {showOffer && <SmartMomentumOffer />}
        </>
      )}
    </div>
  )
}

export function CaptionStudio({ platform, initialValues, showOffer }: { platform: CaptionPlatform; initialValues?: Record<string, string>; showOffer: boolean }) {
  const [topic, setTopic] = useState(initialValues?.topic ?? '')
  const [tone, setTone] = useState<CaptionTone>(platform === 'snapchat' ? 'short' : 'curiosity')
  const [round, setRound] = useState(0)
  const { lastCopy, copy, clearCopy } = useStudioCopy()
  const drafts = makeCaptionDrafts(topic, platform, tone, round)

  function resetDrafts() {
    setRound(0)
    clearCopy()
  }

  return (
    <div>
      <StudioPanel>
        <label className="block text-sm font-medium">
          {platform === 'facebook' ? 'What is your post about?' : 'What are you posting about?'}
          <input value={topic} onChange={(event) => { setTopic(event.target.value); resetDrafts() }} placeholder={platform === 'facebook' ? 'e.g. my new garden' : 'e.g. beach day'} maxLength={60} className={fieldClass} />
        </label>
        <Choices label="Format and Tone">
          {(Object.keys(CAPTION_TONES) as CaptionTone[]).map((option) => (
            <button key={option} type="button" aria-pressed={tone === option} className={chipClass(tone === option)} onClick={() => { setTone(option); resetDrafts() }}>
              {CAPTION_TONES[option]}
            </button>
          ))}
        </Choices>
      </StudioPanel>

      {drafts.length === 0 ? <p className="mt-4 text-sm text-muted-foreground">Enter a topic to get caption ideas.</p> : (
        <>
          <ul className="mt-4 grid gap-3" aria-label="Caption drafts">
            {drafts.map((draft, index) => (
              <li key={draft.hook} className={panelClass}>
                <div className="flex flex-wrap gap-2 text-xs font-medium text-muted-foreground">
                  {[`${draft.characters} characters`, `~${draft.seconds}s read`, `${draft.format} fit`].map((badge) => (
                    <span key={badge} className="rounded-full bg-muted px-3 py-1">{badge}</span>
                  ))}
                </div>
                <dl className="mt-4 grid gap-3 wrap-anywhere">
                  <div><dt className="text-xs font-medium text-muted-foreground">Hook</dt><dd className="mt-1 font-semibold">{draft.hook}</dd></div>
                  <div><dt className="text-xs font-medium text-muted-foreground">Value / Context</dt><dd className="mt-1">{draft.context}</dd></div>
                  <div><dt className="text-xs font-medium text-muted-foreground">Engagement Question</dt><dd className="mt-1">{draft.question}</dd></div>
                </dl>
                {draft.tags && <p className="mt-3 text-sm text-muted-foreground wrap-anywhere">{draft.tags}</p>}
                <div className="mt-4 flex flex-wrap gap-2">
                  <button type="button" className={secondaryClass} onClick={() => copy(`caption-${index}`, draft.text)}>{lastCopy.key === `caption-${index}` ? 'Copied Caption' : 'Copy Caption'}</button>
                  {platform === 'snapchat' && <button type="button" className={secondaryClass} onClick={() => copy(`hook-${index}`, draft.hook)}>{lastCopy.key === `hook-${index}` ? 'Copied Hook' : 'Copy Hook'}</button>}
                  {draft.tags && <button type="button" className={primaryClass} onClick={() => copy(`details-${index}`, `${draft.text}\n\n${draft.tags}`)}>{lastCopy.key === `details-${index}` ? 'Copied Caption + Hashtags' : 'Copy Caption + Matching Hashtags'}</button>}
                </div>
              </li>
            ))}
          </ul>
          <button type="button" className={`${secondaryClass} mt-4`} onClick={() => { setRound((previous) => previous + 1); clearCopy() }}>More ideas</button>
          <p className="mt-2 text-sm text-muted-foreground" role="status">{lastCopy.message}</p>
          <p className="mt-3 text-sm text-muted-foreground">
            Match the draft to what your audience can see. Reading time is estimated at 200 words per minute. {platform === 'snapchat' && 'Use Copy Hook for a short text overlay.'}
          </p>
          <FirstHourMomentum copied={Boolean(lastCopy.key)} />
          {showOffer && <SmartMomentumOffer />}
        </>
      )}
    </div>
  )
}
