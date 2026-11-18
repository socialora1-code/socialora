'use client'

import { Check, ChevronDown, Copy } from 'lucide-react'
import { useEffect, useState } from 'react'
import { DiscordFontPreview, wrapDiscordMessage, type DiscordChatFormat, type DiscordPreviewTab } from '@/components/tools/discord-font-preview'
import { SmartMomentumOffer } from '@/components/tools/smart-momentum-offer'
import { useStudioCopy } from '@/components/tools/studio-copy'
import { StudioMomentumBridge } from '@/components/tools/studio-momentum-bridge'
import { orderFontStyles } from '@/lib/font-styles'
import { FONT_CONFIGS } from '@/lib/tool-data/font-configs'

const symbols = [
  { name: 'Star', value: '✦' },
  { name: 'Chess queen', value: '♛' },
  { name: 'Cross', value: '✗' },
  { name: 'Lightning', value: '⚡' },
  { name: 'Wave kaomoji', value: '︵‿︵' },
  { name: 'Solid star', value: '★' },
  { name: 'Middle dot', value: '・' },
  { name: 'Vertical bar', value: '｜' },
  { name: 'Flame', value: '🔥' },
  { name: 'Crown', value: '👑' },
  { name: 'Corner brackets', value: '『 』' },
]

const categories = [
  { label: 'All', styles: null },
  { label: 'Gothic/Edgy', styles: ['gothic', 'bold-gothic', 'double-struck', 'strike', 'wings'] },
  { label: 'Aesthetic/Cute', styles: ['script', 'bold-script', 'bubble', 'bubble-filled', 'sparkle', 'brackets', 'wings'] },
  { label: 'Bold/Clean', styles: ['bold', 'italic', 'bold-italic', 'serif-bold', 'serif-italic', 'serif-bold-italic', 'sans', 'monospace'] },
  { label: 'Server Channels', styles: ['monospace', 'small-caps', 'wide', 'gothic', 'bold', 'square', 'square-filled', 'brackets'] },
  { label: 'Cursed/Glitch', styles: ['zalgo', 'upside-down', 'strike', 'underline', 'bold-gothic'] },
]

const config = FONT_CONFIGS['discord-font-generator']
const { ordered } = orderFontStyles(config.featured, config.only)
const initialStyle = 'gothic'
const examples = { channel: 'Gothic chat', profile: 'Night Owl', chat: 'Community update' }
const tabLabels = { channel: 'Channel', profile: 'Profile', chat: 'Chat' }
const inputLabels = { channel: 'Channel name', profile: 'Display name', chat: 'Chat message' }
const exampleBio = 'Here for the good vibes.'
const quickStyles = [
  { id: 'gothic', label: 'Gothic' },
  { id: 'bold', label: 'Bold' },
  { id: 'script', label: 'Script' },
  { id: 'zalgo', label: 'Glitch' },
]
const noSymbols = { start: '', end: '' }
const actionClass = 'inline-flex min-h-11 items-center justify-center rounded-lg border border-border bg-background px-3 text-sm font-medium hover:bg-muted aria-pressed:border-[#949cff] aria-pressed:bg-[#5865F2]/20 focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50'
const copyClass = 'inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#4752c4] px-4 text-sm font-semibold text-white hover:bg-[#535fd8] focus-visible:ring-2 focus-visible:ring-ring'
const editorClass = 'block w-full rounded-lg border border-border bg-background px-3 py-2 text-base outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring'
const previewActionClass = 'inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[#656871] px-3 text-sm font-medium text-white hover:bg-[#43454d] aria-pressed:border-[#a5acff] aria-pressed:bg-[#3b4180] focus-visible:outline-2 focus-visible:outline-[#c7cbff] disabled:opacity-50'
const zalgoMarks = ['\u030d', '\u033f', '\u0311', '\u035c', '\u0329', '\u0330', '\u031f', '\u0336', '\u0351', '\u0323', '\u0342', '\u030a']

type Placement = keyof typeof noSymbols
type HistoryEntry = { value: string; style: string; context: string }

function zalgo(text: string, intensity: number) {
  const count = Math.round(intensity / 10)
  return Array.from(text, (character, index) => {
    if (!/[\p{L}\p{N}]/u.test(character)) return character
    const marks = Array.from({ length: count }, (_, offset) => zalgoMarks[(index * 7 + offset * 5) % zalgoMarks.length])
    return character + marks.join('')
  }).join('')
}

export function DiscordFontStudio() {
  const [tab, setTab] = useState<DiscordPreviewTab>('profile')
  const [text, setText] = useState('')
  const [selectedId, setSelectedId] = useState(initialStyle)
  const [category, setCategory] = useState(categories[0].label)
  const [intensity, setIntensity] = useState(40)
  const [placement, setPlacement] = useState<Placement>('start')
  const [affixes, setAffixes] = useState(noSymbols)
  const [prefix, setPrefix] = useState('｜')
  const [bio, setBio] = useState('')
  const [styleBio, setStyleBio] = useState(true)
  const [roleMode, setRoleMode] = useState(false)
  const [format, setFormat] = useState<DiscordChatFormat>(null)
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [copyNotice, setCopyNotice] = useState(0)
  const { lastCopy, copy, clearCopy } = useStudioCopy()

  useEffect(() => {
    if (!copyNotice) return
    const timeout = window.setTimeout(() => setCopyNotice(0), 2600)
    return () => window.clearTimeout(timeout)
  }, [copyNotice])

  const example = tab === 'profile' && roleMode ? 'VIP' : examples[tab]
  const source = (text.trim() ? text : example).replace(/[\u2010-\u2015]/g, '-')
  const sample = tab === 'channel'
    ? source.trim().toLowerCase().replace(/\s+/g, '-')
    : tab === 'profile' && roleMode ? source.trim().replace(/\s+/g, ' ') : source
  const styles = [...ordered, { id: 'zalgo', name: 'Cursed Zalgo', convert: (value: string) => zalgo(value, intensity) }]
  const options = styles.map(style => ({
    ...style,
    output: (tab === 'channel' ? prefix : '') + affixes.start + style.convert(sample) + affixes.end,
  }))
  const selected = options.find(style => style.id === selectedId) ?? options[0]
  const activeCategory = categories.find(option => option.label === category) ?? categories[0]
  const visibleStyles = options.filter(style => !activeCategory.styles || activeCategory.styles.includes(style.id))
  const context = tab === 'profile' && roleMode ? 'Server Role' : tabLabels[tab]
  const inputLabel = tab === 'profile' && roleMode ? 'Server role' : inputLabels[tab]
  const copyLabel = tab === 'profile' && roleMode ? 'Copy role' : { channel: 'Copy channel', profile: 'Copy name', chat: 'Copy message' }[tab]
  const bioSource = (bio.trim() ? bio : exampleBio).replace(/[\u2010-\u2015]/g, '-')
  const bioPreview = styleBio ? selected.convert(bioSource) : bioSource
  const hasSymbols = Boolean(affixes.start || affixes.end)

  function selectStyle(id: string) {
    setSelectedId(id)
    clearCopy()
  }

  function insertSymbol(symbol: string) {
    setAffixes(previous => symbol === '『 』'
      ? { start: '『' + previous.start, end: previous.end + '』' }
      : { ...previous, [placement]: placement === 'start' ? symbol + previous.start : previous.end + symbol })
    clearCopy()
  }

  async function copyResult(key: string, entry: HistoryEntry) {
    if (!await copy(key, entry.value)) return
    setHistory(previous => [entry, ...previous.filter(item => item.value !== entry.value)].slice(0, 5))
    setCopyNotice(previous => previous + 1)
  }

  function copyStyle(style: typeof selected) {
    setSelectedId(style.id)
    return copyResult(style.id, {
      value: tab === 'chat' ? wrapDiscordMessage(style.output, format) : style.output,
      style: style.name,
      context,
    })
  }

  return (
    <div>
      <section className="rounded-2xl border border-border bg-card p-3 sm:p-5" aria-label="Discord Profile & Server Studio">
        <DiscordFontPreview tab={tab} onTab={value => { setTab(value); clearCopy() }} output={selected.output}
          prefix={prefix} onPrefix={value => { setPrefix(value); clearCopy() }} voice={selected.convert('VIP-Lounge')}
          bioPreview={bioPreview} roleMode={roleMode}
          format={format} onFormat={value => { setFormat(value); clearCopy() }}
          editor={
            <div className="min-w-0 space-y-2 md:space-y-3">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-x-2">
                  <label htmlFor="discord-font-input" className="text-sm font-semibold">{inputLabel}</label>
                  <button type="button" className="min-h-11 px-1 text-xs font-medium text-muted-foreground underline underline-offset-4 hover:text-foreground"
                    onClick={() => { setText(example); clearCopy() }}>Use example</button>
                </div>
                <textarea id="discord-font-input" value={text} rows={tab === 'chat' ? 2 : 1} maxLength={300} placeholder={example}
                  onChange={event => { setText(event.target.value); clearCopy() }} className={editorClass + ' min-h-11 resize-y'} />
              </div>
              {tab === 'profile' && (
                <div>
                  <div className="flex min-h-11 flex-wrap items-center justify-between gap-x-2">
                    <label htmlFor="discord-about-input" className="text-sm font-semibold">About Me</label>
                    <button type="button" className="inline-flex min-h-11 items-center gap-1.5 px-1 text-xs font-medium"
                      aria-pressed={styleBio} onClick={() => { setStyleBio(!styleBio); clearCopy() }}>
                      <span aria-hidden="true" className={'grid size-4 place-items-center rounded border ' + (styleBio ? 'border-[#4752c4] bg-[#4752c4] text-white' : 'border-muted-foreground')}>
                        {styleBio && <Check className="size-3" />}
                      </span>
                      Style bio
                    </button>
                  </div>
                  <textarea id="discord-about-input" value={bio} rows={1} maxLength={190} placeholder={exampleBio}
                    onChange={event => { setBio(event.target.value); clearCopy() }} className={editorClass + ' min-h-11 resize-y'} />
                </div>
              )}
            </div>
          }
          fontPicker={
            <select aria-label="Font" value={selected.id} onChange={event => selectStyle(event.target.value)}
              className="min-h-11 min-w-0 max-w-[57%] rounded-lg border border-[#656871] bg-[#232428] px-2 text-base text-white focus-visible:outline-2 focus-visible:outline-[#c7cbff] sm:text-sm">
              {styles.map(style => <option key={style.id} value={style.id}>{style.name}</option>)}
            </select>
          }
          actions={
            <div className="px-3 pb-3 sm:px-4 sm:pb-4">
              <div role="group" aria-label="Quick font choices" className="mb-2 grid grid-cols-4 gap-1.5">
                {quickStyles.map(style => (
                  <button key={style.id} type="button" className={previewActionClass + ' min-w-0 px-1 text-xs'}
                    aria-pressed={style.id === selected.id} onClick={() => selectStyle(style.id)}>{style.label}</button>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" className={copyClass + ' flex-1'} onClick={() => copyStyle(selected)}>
                  <Copy aria-hidden="true" className="size-4 shrink-0" />{copyLabel}
                </button>
                {tab === 'profile' && (
                  <button type="button" className={previewActionClass + ' flex-1'} disabled={!bio.trim()}
                    onClick={() => copyResult('bio', { value: bioPreview, style: styleBio ? selected.name : 'Plain text', context: 'Bio' })}>
                    <Copy aria-hidden="true" className="size-4 shrink-0" />Copy bio
                  </button>
                )}
              </div>
              {tab === 'profile' && (
                <button type="button" className="mt-1 min-h-11 px-1 text-xs font-medium text-[#dbdee1] underline underline-offset-4 hover:text-white aria-pressed:text-white"
                  aria-pressed={roleMode} onClick={() => { setRoleMode(!roleMode); clearCopy() }}>Preview as server role</button>
              )}
              {!lastCopy.key && lastCopy.message && <p role="status" className="mt-2 text-sm text-[#dbdee1]">{lastCopy.message}</p>}
            </div>
          }
        />
        <details className="group mt-3 rounded-xl border border-border bg-background/50">
          <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-2 px-3 text-sm font-medium focus-visible:outline-2 focus-visible:outline-[#949cff] [&::-webkit-details-marker]:hidden">
            Symbols &amp; Zalgo intensity
            <ChevronDown aria-hidden="true" className="size-4 text-muted-foreground group-open:rotate-180" />
          </summary>
          <div className="grid min-w-0 items-start gap-4 border-t border-border p-3 md:grid-cols-2">
            <fieldset className="min-w-0">
              <legend className="text-sm font-medium">Aesthetic Kaomoji &amp; Symbol Bar</legend>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <label htmlFor="discord-symbol-placement" className="text-sm text-muted-foreground">Insert at</label>
                <select id="discord-symbol-placement" value={placement} onChange={event => setPlacement(event.target.value as Placement)}
                  className="min-h-11 rounded-lg border border-border bg-background px-3 text-sm">
                  <option value="start">Start</option>
                  <option value="end">End</option>
                </select>
                {hasSymbols && (
                  <button type="button" className="min-h-11 px-2 text-sm underline underline-offset-4" onClick={() => { setAffixes(noSymbols); clearCopy() }}>Clear symbols</button>
                )}
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {symbols.map(symbol => (
                  <button key={symbol.name} type="button" aria-label={symbol.name === 'Corner brackets' ? 'Wrap in corner brackets' : 'Add ' + symbol.name.toLowerCase()}
                    className={actionClass} disabled={affixes.start.length + affixes.end.length + symbol.value.length > 48}
                    onClick={() => insertSymbol(symbol.value)}>
                    {symbol.value}
                  </button>
                ))}
              </div>
            </fieldset>
            <div className="rounded-xl border border-border bg-background p-3.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label htmlFor="discord-zalgo" className="text-sm font-medium">Zalgo / Glitch Intensity</label>
                <span className="rounded-md bg-[#5865F2]/20 px-2 py-1 text-xs font-semibold tabular-nums">{intensity}%</span>
              </div>
              <input type="range" id="discord-zalgo" min={10} max={100} step={10} value={intensity} aria-valuetext={intensity + '%'}
                className="h-8 w-full cursor-pointer accent-[#5865F2] focus-visible:ring-2 focus-visible:ring-ring"
                onChange={event => {
                  setIntensity(Number(event.target.value))
                  setSelectedId('zalgo')
                  if (activeCategory.styles && !activeCategory.styles.includes('zalgo')) setCategory('Cursed/Glitch')
                  clearCopy()
                }} />
              <div className="flex justify-between text-xs text-muted-foreground"><span>10%</span><span>100%</span></div>
            </div>
          </div>
        </details>
      </section>

      {history.length > 0 && (
        <section className="mt-4 rounded-xl border border-border bg-card p-4" aria-labelledby="discord-history-title">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 id="discord-history-title" className="font-semibold">Recent History</h3>
            <button type="button" className="min-h-11 px-2 text-sm underline underline-offset-4" onClick={() => { setHistory([]); clearCopy() }}>Clear history</button>
          </div>
          <ul className="mt-2 grid gap-2 sm:grid-cols-2">
            {history.map((entry, index) => (
              <li key={entry.value} className="min-w-0">
                <button type="button" aria-label={'Copy history item ' + (index + 1) + ': ' + entry.style}
                  className="flex min-h-11 w-full min-w-0 items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-left hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
                  onClick={() => copyResult('history-' + index, entry)}>
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs text-muted-foreground">{entry.style} · {entry.context}</span>
                    <span className="block truncate text-sm">{entry.value}</span>
                  </span>
                  <Copy aria-hidden="true" className="size-4 shrink-0" />
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-6" aria-labelledby="discord-styles-title">
        <h3 id="discord-styles-title" className="font-semibold">Text Styles</h3>
        <p className="mt-1 text-sm text-muted-foreground">{styles.length} base styles and 150+ style and symbol combinations.</p>
        <div role="group" aria-label="Filter text styles" className="mt-3 flex flex-wrap gap-2">
          {categories.map(option => (
            <button key={option.label} type="button" className={actionClass} aria-pressed={option.label === category}
              onClick={() => setCategory(option.label)}>
              {option.label}
            </button>
          ))}
        </div>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {visibleStyles.map(style => (
            <li key={style.id} className={'flex min-w-0 items-center gap-2 rounded-xl border bg-card p-3 ' + (style.id === selected.id ? 'border-[#949cff]' : 'border-border')}>
              <button type="button" aria-label={'Preview ' + style.name} aria-pressed={style.id === selected.id}
                className="min-h-11 min-w-0 flex-1 text-left focus-visible:ring-2 focus-visible:ring-ring" onClick={() => selectStyle(style.id)}>
                <span className="block text-xs text-muted-foreground">{style.name}</span>
                <span className="mt-1 block whitespace-pre-wrap wrap-anywhere">{style.output}</span>
              </button>
              <button type="button" aria-label={'Copy ' + style.name} className={actionClass + ' shrink-0'}
                onClick={() => copyStyle(style)}>{lastCopy.key === style.id ? 'Copied' : 'Copy'}</button>
            </li>
          ))}
        </ul>
      </section>

      <StudioMomentumBridge id="discord-momentum" title="From Discord to Your Social Channels" highlighted={Boolean(lastCopy.key)}>
        <p>Use a Discord announcement to point members to one useful next step. Share a clip on Instagram or TikTok, link the full walkthrough on YouTube, or post a recap on Telegram.</p>
        <p>Use a distinct link for each channel. Compare link clicks, early views and meaningful replies to see what people find useful.</p>
      </StudioMomentumBridge>
      {(text.trim() || history.length > 0 || selectedId !== initialStyle) && <SmartMomentumOffer />}
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
      <div role="status" className="pointer-events-none fixed right-4 bottom-4 left-4 z-50 flex justify-end">
        {copyNotice > 0 && (
          <div className="flex items-center gap-2 rounded-xl border border-[#949cff] bg-[#313338] px-4 py-3 text-sm font-semibold text-white shadow-lg">
            <Check aria-hidden="true" className="size-4 shrink-0 text-[#a5acff]" /> Copied! Ready to paste in Discord
          </div>
        )}
      </div>
    </div>
  )
}
