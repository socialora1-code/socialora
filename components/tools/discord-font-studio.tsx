'use client'

import { useState } from 'react'
import { SmartMomentumOffer } from '@/components/tools/smart-momentum-offer'
import { useStudioCopy } from '@/components/tools/studio-copy'
import { StudioMomentumBridge } from '@/components/tools/studio-momentum-bridge'
import { orderFontStyles } from '@/lib/font-styles'
import { FONT_CONFIGS } from '@/lib/tool-data/font-configs'

const modes = {
  channel: { label: 'Channel Name', example: '・general' },
  role: { label: 'Server Role', example: 'VIP' },
  announcement: { label: 'Announcement Heading', example: 'Community update' },
  profile: { label: 'Profile / Bio', example: 'Night Owl' },
}

type Mode = keyof typeof modes
type Placement = 'start' | 'end'
type Favorite = { value: string; style: string; mode: Mode }

const symbols = [
  { name: 'Middle dot', value: '・' },
  { name: 'Vertical bar', value: '｜' },
  { name: 'Star', value: '✦' },
  { name: 'Lightning', value: '⚡' },
  { name: 'Flame', value: '🔥' },
  { name: 'Crown', value: '👑' },
  { name: 'Corner brackets', value: '『 』' },
]

const config = FONT_CONFIGS['discord-font-generator']
const { ordered } = orderFontStyles(config.featured, config.only)
const actionClass = 'inline-flex min-h-11 items-center justify-center rounded-full border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50'
const primaryClass = 'inline-flex min-h-11 items-center justify-center rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring'
const activeClass = 'rounded-md bg-[#3b3d44] ring-1 ring-[#a5acff]'

function DiscordPreview({ mode, output }: { mode: Mode; output: string }) {
  return (
    <section className="mt-4 overflow-hidden rounded-2xl border border-[#4b4d56] bg-[#313338] text-[#f2f3f5]" aria-labelledby="discord-preview-title">
      <div className="flex flex-wrap items-center justify-between gap-1 border-b border-[#202127] px-4 py-3">
        <h3 id="discord-preview-title" className="text-sm font-semibold">Live Discord Preview</h3>
        <p className="text-xs text-[#c6c8cd]">Dark theme mockup</p>
      </div>
      <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <div aria-label="Channel sidebar" role="group" className="min-w-0 bg-[#2b2d31] p-3 sm:p-4">
          <p className="text-sm font-semibold">Creator Hub</p>
          <p className="mt-4 text-xs font-medium text-[#c6c8cd]">Text channels</p>
          <p className={`mt-2 flex items-start gap-1 px-2 py-1 text-sm ${mode === 'channel' ? activeClass : ''}`}>
            <span aria-hidden="true" className="shrink-0 text-[#c6c8cd]">#</span>
            <span className="min-w-0 wrap-anywhere">{mode === 'channel' ? output : 'general'}</span>
          </p>
          <p className="mt-1 px-2 py-1 text-sm text-[#c6c8cd]"># ideas</p>
        </div>
        <div aria-label="Message and member preview" role="group" className="min-w-0 space-y-3 p-3 sm:p-4">
          <div className={`p-2 ${mode === 'announcement' ? activeClass : ''}`}>
            <p className="text-xs text-[#c6c8cd]">Message preview</p>
            <div className="mt-1 flex items-center gap-2">
              <span aria-hidden="true" className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#5865f2] text-xs font-semibold">C</span>
              <p className="text-xs font-semibold">Creator</p>
            </div>
            <p className="mt-1 whitespace-pre-wrap text-sm font-semibold wrap-anywhere">{mode === 'announcement' ? output : 'Community update'}</p>
          </div>
          <div className={`p-2 ${mode === 'role' ? activeClass : ''}`}>
            <p className="text-xs text-[#c6c8cd]">Role badge</p>
            <span className="mt-1 inline-flex max-w-full items-center gap-1.5 rounded-full bg-[#202127] px-2 py-1 text-xs">
              <span aria-hidden="true" className="h-2 w-2 shrink-0 rounded-full bg-[#a5acff]" />
              <span className="min-w-0 wrap-anywhere">{mode === 'role' ? output : 'VIP'}</span>
            </span>
          </div>
          {mode === 'profile' && (
            <div className={`p-2 ${activeClass}`}>
              <p className="text-xs text-[#c6c8cd]">About me</p>
              <p className="mt-1 whitespace-pre-wrap text-sm wrap-anywhere">{output}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

function styleOutput(text: string, mode: Mode, style: (value: string) => string) {
  const value = text.replace(/[\u2013\u2014]/g, '-')
  if (mode === 'channel') return style(value.toLowerCase()).trim().replace(/\s+/g, '-')
  if (mode === 'role') return style(value.replace(/\s+/g, ' ').trim())
  return style(value)
}

export function DiscordFontStudio() {
  const [mode, setMode] = useState<Mode>('channel')
  const [text, setText] = useState('')
  const [selectedId, setSelectedId] = useState(ordered[0].id)
  const [placement, setPlacement] = useState<Placement>('start')
  const [favorites, setFavorites] = useState<Favorite[]>([])
  const { lastCopy, copy, clearCopy } = useStudioCopy()

  const source = text.trim() ? text : modes[mode].example
  const options = ordered.map((style) => ({ ...style, output: styleOutput(source, mode, style.convert) }))
  const selected = options.find((style) => style.id === selectedId) ?? options[0]

  function insertSymbol(symbol: string) {
    const value = symbol === '『 』' ? `『${source}』` : placement === 'start' ? symbol + source : source + symbol
    if (value.length > 300) return
    setText(value)
    clearCopy()
  }

  async function copyStyle(style: typeof selected) {
    setSelectedId(style.id)
    if (await copy(style.id, style.output)) {
      setFavorites((previous) => [
        { value: style.output, style: style.name, mode },
        ...previous.filter((favorite) => favorite.value !== style.output),
      ].slice(0, 5))
    }
  }

  return (
    <div>
      <section className="rounded-3xl border border-border bg-card p-5 sm:p-7" aria-labelledby="discord-studio-title">
        <h2 id="discord-studio-title" className="text-xl font-semibold tracking-tight">Discord Font Studio</h2>
        <fieldset className="mt-4 min-w-0">
          <legend className="text-sm font-medium">Use Mode</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {(Object.keys(modes) as Mode[]).map((option) => (
              <button key={option} type="button" aria-pressed={mode === option} className={`${actionClass} aria-pressed:border-primary aria-pressed:bg-primary/20`} onClick={() => { setMode(option); clearCopy() }}>
                {modes[option].label}
              </button>
            ))}
          </div>
        </fieldset>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
          <label htmlFor="discord-font-input" className="text-sm font-medium">Your text</label>
          <button type="button" className="min-h-11 text-sm font-medium underline underline-offset-4" onClick={() => { setText(modes[mode].example); clearCopy() }}>Try an example</button>
        </div>
        <textarea id="discord-font-input" value={text} rows={2} maxLength={300} placeholder={modes[mode].example} onChange={(event) => { setText(event.target.value); clearCopy() }} className="w-full rounded-xl border border-border bg-background p-3 text-base outline-none focus-visible:ring-2 focus-visible:ring-ring" />
        <fieldset className="mt-4 min-w-0">
          <legend className="text-sm font-medium">Symbols and Separators</legend>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <label htmlFor="discord-symbol-placement" className="text-sm text-muted-foreground">Insert at</label>
            <select id="discord-symbol-placement" value={placement} onChange={(event) => setPlacement(event.target.value as Placement)} className="min-h-11 rounded-xl border border-border bg-background px-3 text-sm">
              <option value="start">Start</option>
              <option value="end">End</option>
            </select>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {symbols.map((symbol) => (
              <button key={symbol.name} type="button" aria-label={symbol.name === 'Corner brackets' ? 'Wrap in corner brackets' : `Add ${symbol.name.toLowerCase()}`} className={actionClass} disabled={source.length + (symbol.value === '『 』' ? 2 : symbol.value.length) > 300} onClick={() => insertSymbol(symbol.value)}>
                {symbol.value}
              </button>
            ))}
          </div>
        </fieldset>
      </section>

      <DiscordPreview mode={mode} output={selected.output} />
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button type="button" className={primaryClass} onClick={() => copyStyle(selected)}>
          {lastCopy.key === selected.id ? 'Copied Selected Style' : 'Copy Selected Style'}
        </button>
        <p className="text-sm text-muted-foreground" role="status">{lastCopy.message}</p>
      </div>
      {mode === 'profile' && config.limit && (
        <p className="mt-2 text-sm text-muted-foreground">{Array.from(selected.output).length} characters. Discord display names allow up to {config.limit.max}. This preview shows your About Me.</p>
      )}

      <section className="mt-4 rounded-2xl border border-border bg-card p-4 sm:p-5" aria-labelledby="discord-favorites-title">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 id="discord-favorites-title" className="font-semibold">My Copied Favorites</h3>
          {favorites.length > 0 && <button type="button" className="min-h-11 px-2 text-sm underline underline-offset-4" onClick={() => { setFavorites([]); clearCopy() }}>Clear favorites</button>}
        </div>
        {favorites.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">Your last five copied styles appear here while this page is open.</p>
        ) : (
          <ul className="mt-2 grid gap-2">
            {favorites.map((favorite, index) => (
              <li key={favorite.value} className="flex min-w-0 items-center justify-between gap-2 rounded-xl bg-background px-3 py-2">
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">{modes[favorite.mode].label} · {favorite.style}</p>
                  <p className="whitespace-pre-wrap text-sm wrap-anywhere">{favorite.value}</p>
                </div>
                <button type="button" aria-label={`Copy favorite ${index + 1}`} className={`${actionClass} shrink-0`} onClick={() => copy(`favorite-${index}`, favorite.value)}>{lastCopy.key === `favorite-${index}` ? 'Copied' : 'Copy'}</button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <StudioMomentumBridge id="discord-momentum" title="From Discord to Your Social Channels" highlighted={Boolean(lastCopy.key)}>
        <p>Use a Discord announcement to point members to one useful next step. Share a clip on Instagram or TikTok, link the full walkthrough on YouTube, or post a recap on Telegram.</p>
        <p>Use a distinct link for each channel. Compare link clicks, early views and meaningful replies to see what members find useful. Pin real examples or feedback shared with permission as social proof.</p>
      </StudioMomentumBridge>

      <section className="mt-6" aria-labelledby="discord-styles-title">
        <h3 id="discord-styles-title" className="font-semibold">Text Styles</h3>
        <ul className="mt-3 grid gap-2">
          {options.map((style) => (
            <li key={style.id} className={`flex min-w-0 items-center gap-2 rounded-xl border bg-card p-3 ${style.id === selected.id ? 'border-primary' : 'border-border'}`}>
              <button type="button" aria-label={`Preview ${style.name}`} aria-pressed={style.id === selected.id} className="min-h-11 min-w-0 flex-1 text-left focus-visible:ring-2 focus-visible:ring-ring" onClick={() => { setSelectedId(style.id); clearCopy() }}>
                <span className="block text-xs text-muted-foreground">{style.name}</span>
                <span className="mt-1 block whitespace-pre-wrap wrap-anywhere">{style.output}</span>
              </button>
              <button type="button" aria-label={`Copy ${style.name}`} className={`${actionClass} shrink-0`} onClick={() => copyStyle(style)}>{lastCopy.key === style.id ? 'Copied' : 'Copy'}</button>
            </li>
          ))}
        </ul>
      </section>

      {(text.trim() || favorites.length > 0 || selectedId !== ordered[0].id) && <SmartMomentumOffer />}
      {config.cheat && (
        <section className="mt-6 rounded-2xl border border-border bg-card p-5" aria-labelledby="discord-formatting-title">
          <h3 id="discord-formatting-title" className="font-semibold">{config.cheat.title}</h3>
          <dl className="mt-3 grid gap-2 text-sm">
            {config.cheat.rows.map(([label, syntax]) => (
              <div key={label} className="flex justify-between gap-4 border-t border-border pt-2">
                <dt className="text-muted-foreground">{label}</dt>
                <dd className="font-mono">{syntax}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}
    </div>
  )
}
