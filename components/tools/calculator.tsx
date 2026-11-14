'use client'

import { useState } from 'react'
import { CALCULATORS } from '@/lib/calculators'
import { isEarningsSimulator } from '@/lib/earnings-simulator'
import { EarningsSimulator } from '@/components/tools/earnings-simulator'
import { SmartMomentumOffer } from '@/components/tools/smart-momentum-offer'

function toNumber(value: string): number {
  const cleaned = value.replace(/,/g, '').trim()
  if (cleaned === '') return NaN
  const n = Number(cleaned)
  return Number.isFinite(n) && n >= 0 ? n : NaN
}

function getCreatorTier(followers: number): string {
  if (followers < 10000) return 'Nano Creator (<10K)'
  if (followers < 50000) return 'Micro Creator (10K-50K)'
  if (followers < 250000) return 'Mid-Tier Creator (50K-250K)'
  return 'Macro Creator (250K+)'
}

const inputClass =
  'mt-2 h-12 w-full rounded-xl border border-border bg-background px-4 text-base outline-none focus-visible:ring-3 focus-visible:ring-ring/40'

export function Calculator({ id }: { id: string }) {
  if (!isEarningsSimulator(id)) return <StandardCalculator key={id} id={id} />

  const originalTool = id === 'tiktok-coins'
    ? 'TikTok Coins & Diamonds converter'
    : id === 'instagram-sponsorship'
      ? 'Instagram sponsorship rate calculator'
      : null

  return (
    <>
      {originalTool ? (
        <details className="mb-4 rounded-2xl border border-border bg-card">
          <summary className="cursor-pointer px-4 py-3 text-sm font-semibold">{originalTool}</summary>
          <StandardCalculator key={id} id={id} showOffer={false} />
        </details>
      ) : null}
      <EarningsSimulator key={id} id={id} />
    </>
  )
}

function StandardCalculator({ id, showOffer = true }: { id: string; showOffer?: boolean }) {
  const config = CALCULATORS[id]
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries((config?.fields ?? []).map((f) => [f.id, f.defaultValue ?? ''])),
  )
  const [copiedPitch, setCopiedPitch] = useState(false)

  if (!config) return null

  const numbers: Record<string, number> = {}
  for (const field of config.fields) numbers[field.id] = toNumber(values[field.id] ?? '')
  const result = config.compute(numbers)

  const isSponsorship = id === 'instagram-sponsorship' && result !== null
  const sponsorshipFollowers = numbers.followers > 0 ? Math.round(numbers.followers) : 0
  const sponsorshipComments = Number.isFinite(numbers.comments) ? numbers.comments : 0
  const sponsorshipEr =
    sponsorshipFollowers > 0 && Number.isFinite(numbers.likes)
      ? (((numbers.likes + sponsorshipComments) / sponsorshipFollowers) * 100).toFixed(2)
      : '0.00'
  const cleanHeadline = (result?.headline ?? '')
  const cleanBundle = (result?.lines?.[2]?.[1] ?? result?.headline ?? '')
  const tierLabel = getCreatorTier(sponsorshipFollowers)

  function copyPitchEmail() {
    if (!result) return
    const pitch = [
      'Subject: Brand Partnership Idea: [Your Niche] Instagram Reel + Story',
      '',
      'Hi [Brand Team],',
      '',
      `I create [Your Niche] content on Instagram for an audience of ${sponsorshipFollowers.toLocaleString('en-US')} followers with an average ${sponsorshipEr}% engagement rate per post.`,
      '',
      `My current sponsored rate card starts at ${cleanHeadline} for a dedicated Feed post or Reel (${cleanBundle} for a Reel + 3-frame Story bundle with link sticker).`,
      '',
      'I would love to send over recent audience demographics and 3 tailored content concepts for an upcoming launch. Would next week work for a brief call?',
      '',
      'Best,',
      '[Your Name]',
      '@[YourHandle]',
    ].join('\n')
    navigator.clipboard?.writeText(pitch).then(() => {
      setCopiedPitch(true)
      setTimeout(() => setCopiedPitch(false), 2500)
    })
  }

  return (
    <div className="rounded-3xl border border-border bg-card p-6 sm:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        {config.fields.map((field) => (
          <div key={field.id}>
            <label htmlFor={`calc-${field.id}`} className="text-sm font-medium">
              {field.label}
            </label>
            <input
              id={`calc-${field.id}`}
              inputMode="decimal"
              placeholder={field.placeholder}
              value={values[field.id] ?? ''}
              onChange={(e) => setValues((prev) => ({ ...prev, [field.id]: e.target.value }))}
              className={inputClass}
            />
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-2xl bg-muted/70 p-5" aria-live="polite">
        {result ? (
          <>
            <p className="text-3xl font-semibold tracking-tight tabular-nums sm:text-4xl">{result.headline}</p>
            {result.sub && <p className="mt-1 font-medium">{result.sub}</p>}
            {result.lines && (
              <dl className="mt-4 grid gap-2 text-sm">
                {result.lines.map(([label, value]) => (
                  <div key={label} className="flex justify-between gap-4 border-t border-border pt-2">
                    <dt className="text-muted-foreground">{label}</dt>
                    <dd className="font-medium tabular-nums">{value}</dd>
                  </div>
                ))}
              </dl>
            )}
            {result.note && <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{result.note}</p>}

            {isSponsorship && (
              <div className="mt-5 flex flex-wrap gap-3 border-t border-border pt-4">
                <button
                  type="button"
                  onClick={copyPitchEmail}
                  className="inline-flex h-10 items-center justify-center rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground"
                >
                  {copiedPitch ? 'Copied Pitch Email!' : 'Copy Brand Deal Pitch Email'}
                </button>
                <a
                  href={`https://www.threads.net/intent/post?text=${encodeURIComponent(
                    `Checked my Instagram creator rate card: ${tierLabel} (${cleanHeadline} per sponsored post/Reel at ${sponsorshipEr}% engagement). Run your own estimate free at getsocialora.com/tools`,
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-10 items-center justify-center rounded-full border border-border bg-background px-5 text-sm font-medium hover:bg-muted/60"
                >
                  Share My Creator Tier on Threads
                </a>
              </div>
            )}
          </>
        ) : (
          <p className="text-sm text-muted-foreground">{config.empty}</p>
        )}
      </div>

      {result && showOffer && <SmartMomentumOffer />}
    </div>
  )
}
