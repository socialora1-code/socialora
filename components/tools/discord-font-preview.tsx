'use client'

import { Tabs } from '@base-ui/react/tabs'
import { Gamepad2, Hash, MessageSquare, ShieldCheck, UserRound, Volume2 } from 'lucide-react'
import { useState, type ReactNode } from 'react'

const tabs = [
  { id: 'profile', label: 'Profile', Icon: UserRound },
  { id: 'channel', label: 'Channels', Icon: Hash },
  { id: 'chat', label: 'Chat', Icon: MessageSquare },
] as const

export type DiscordPreviewTab = (typeof tabs)[number]['id']

const formats = [
  { id: 'spoiler', label: 'Spoiler', syntax: '||', wrap: (text: string) => '||' + text + '||' },
  { id: 'code', label: 'Code Block', syntax: '```', wrap: (text: string) => '```\n' + text + '\n```' },
  { id: 'quote', label: 'Quote', syntax: '>>>', wrap: (text: string) => '>>> ' + text },
  { id: 'bold', label: 'Bold', syntax: '**', wrap: (text: string) => '**' + text + '**' },
] as const

export type DiscordChatFormat = (typeof formats)[number]['id'] | null

export function wrapDiscordMessage(text: string, format: DiscordChatFormat) {
  return formats.find(option => option.id === format)?.wrap(text) ?? text
}

const darkButton = 'inline-flex min-h-11 items-center justify-center gap-1.5 rounded-lg border border-[#50525b] bg-[#2b2d31] px-3 text-sm text-white hover:bg-[#43454d] aria-pressed:border-[#a5acff] aria-pressed:bg-[#3b4180] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c7cbff]'
const prefixes = ['｜', '・', '✦']

function ServerPreview({ output, voice, prefix, onPrefix }: {
  output: string
  voice: string
  prefix: string
  onPrefix: (value: string) => void
}) {
  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-xl bg-[#2b2d31]">
        <p className="border-b border-[#1e1f22] px-4 py-3 text-sm font-semibold text-white">Creator Hub</p>
        <ul className="space-y-1.5 p-3 text-sm">
          <li className="flex items-start gap-2 rounded-lg bg-[#3d3f49] px-3 py-2.5">
            <Hash aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-[#b5bac1]" />
            <span data-testid="discord-channel-output" className="min-w-0 wrap-anywhere text-white">{output}</span>
          </li>
          <li className="flex items-start gap-2 px-3 py-2 text-[#dbdee1]">
            <Volume2 aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-[#b5bac1]" />
            <span className="min-w-0 wrap-anywhere">{prefix}{voice}</span>
          </li>
        </ul>
      </div>
      <fieldset className="min-w-0">
        <legend className="text-xs font-medium text-[#dbdee1]">Add Channel Prefix</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {prefixes.map(symbol => (
            <button key={symbol} type="button" className={darkButton} aria-label={'Use channel prefix ' + symbol}
              aria-pressed={prefix === symbol} onClick={() => onPrefix(prefix === symbol ? '' : symbol)}>
              {symbol}
            </button>
          ))}
        </div>
      </fieldset>
    </div>
  )
}

function ProfilePreview({ output, bioPreview, roleMode }: {
  output: string
  bioPreview: string
  roleMode: boolean
}) {
  return (
    <div className="overflow-hidden rounded-xl bg-[#232428]">
      <div aria-hidden="true" className="h-11 bg-linear-to-r from-[#5865F2] to-[#8975ef]" />
      <div className="px-4 pb-4">
        <div className="-mt-5 flex items-end justify-between gap-2">
          <div aria-hidden="true" className="relative grid size-12 shrink-0 place-items-center rounded-full border-4 border-[#232428] bg-[#4651c4] text-white">
            <UserRound className="size-6" />
            <span className="absolute -right-0.5 bottom-0 size-3 rounded-full border-2 border-[#232428] bg-[#23a559]" />
          </div>
          <span aria-label="Server member badge" className="rounded-md bg-[#35373d] p-1.5 text-[#c7cbff]"><ShieldCheck aria-hidden="true" className="size-4" /></span>
        </div>
        <p data-testid="discord-display-name" className="mt-2 text-lg font-bold leading-snug wrap-anywhere text-white">{output}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <span className="max-w-full rounded-full bg-[#35373d] px-2 py-1 text-xs wrap-anywhere">{roleMode ? output : 'Creator'}</span>
        </div>
        <div className="mt-3 border-t border-[#43454d] pt-3">
          <p className="text-xs font-semibold text-[#dbdee1]">About Me</p>
          <p data-testid="discord-about-preview" className="mt-1 text-sm whitespace-pre-wrap wrap-anywhere">{bioPreview}</p>
        </div>
        <div className="mt-3 flex items-center gap-2 text-sm text-[#dbdee1]">
          <Gamepad2 aria-hidden="true" className="size-4 shrink-0 text-[#c7cbff]" /> Playing a Game
        </div>
      </div>
    </div>
  )
}

function Spoiler({ text }: { text: string }) {
  const [revealed, setRevealed] = useState(false)

  return (
    <button type="button" aria-label={revealed ? 'Hide spoiler' : 'Reveal spoiler'} aria-pressed={revealed}
      className={'max-w-full rounded bg-[#1e1f22] px-1 text-left focus-visible:outline-2 focus-visible:outline-[#c7cbff] ' + (revealed ? 'text-white' : 'text-transparent')}
      onClick={() => setRevealed(!revealed)}>
      <span aria-hidden={!revealed}>{text}</span>
    </button>
  )
}

function ChatMessage({ text, format }: { text: string; format: DiscordChatFormat }) {
  if (format === 'spoiler') return <Spoiler key={text} text={text} />
  if (format === 'code') return <pre className="rounded-md bg-[#1e1f22] p-2 text-xs whitespace-pre-wrap wrap-anywhere"><code>{text}</code></pre>
  if (format === 'quote') return <blockquote className="border-l-4 border-[#80848e] pl-3">{text}</blockquote>
  if (format === 'bold') return <strong>{text}</strong>
  return text
}

function ChatPreview({ output, format, onFormat }: {
  output: string
  format: DiscordChatFormat
  onFormat: (value: DiscordChatFormat) => void
}) {
  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-xl bg-[#2b2d31]">
        <div className="flex items-center gap-2 border-b border-[#1e1f22] px-4 py-3 text-sm font-semibold text-white">
          <Hash aria-hidden="true" className="size-4 text-[#b5bac1]" /> design-chat
        </div>
        <div className="flex items-start gap-3 px-3 py-4">
          <span aria-hidden="true" className="grid size-8 shrink-0 place-items-center rounded-full bg-[#4651c4] text-sm font-bold text-white">C</span>
          <div className="min-w-0 flex-1">
            <p className="flex flex-wrap items-baseline gap-x-2 text-sm font-semibold text-white">Creator <span className="text-xs font-normal text-[#b5bac1]">Today at 12:00</span></p>
            <div data-testid="discord-chat-output" className="mt-1 text-sm whitespace-pre-wrap wrap-anywhere"><ChatMessage text={output} format={format} /></div>
          </div>
        </div>
      </div>
      <fieldset className="min-w-0">
        <legend className="text-xs font-medium text-[#dbdee1]">Wrap with Discord Markdown</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {formats.map(option => (
            <button key={option.id} type="button" className={darkButton} aria-pressed={format === option.id}
              onClick={() => onFormat(format === option.id ? null : option.id)}>
              <code aria-hidden="true" className="text-xs text-[#c7cbff]">{option.syntax}</code>{option.label}
            </button>
          ))}
        </div>
      </fieldset>
      {format && (
        <code aria-label="Markdown to copy" className="block rounded-lg bg-[#1e1f22] p-2 text-xs whitespace-pre-wrap wrap-anywhere">
          {wrapDiscordMessage(output, format)}
        </code>
      )}
    </div>
  )
}

export function DiscordFontPreview({ tab, onTab, editor, fontPicker, actions, output, voice, prefix, onPrefix, bioPreview, roleMode, format, onFormat }: {
  tab: DiscordPreviewTab
  onTab: (tab: DiscordPreviewTab) => void
  editor: ReactNode
  fontPicker: ReactNode
  actions: ReactNode
  output: string
  voice: string
  prefix: string
  onPrefix: (prefix: string) => void
  bioPreview: string
  roleMode: boolean
  format: DiscordChatFormat
  onFormat: (format: DiscordChatFormat) => void
}) {
  return (
    <Tabs.Root value={tab} onValueChange={value => {
      if (value === 'channel' || value === 'profile' || value === 'chat') onTab(value)
    }}>
      <Tabs.List aria-label="Discord preview" activateOnFocus className="grid grid-cols-3 gap-1 rounded-xl border border-border bg-background/65 p-1">
        {tabs.map(({ id, label, Icon }) => (
          <Tabs.Tab key={id} value={id} className="flex min-h-11 min-w-0 items-center justify-center gap-1.5 rounded-lg px-1.5 text-center text-sm font-medium text-muted-foreground hover:bg-muted data-active:bg-[#4752c4] data-active:text-white focus-visible:outline-2 focus-visible:outline-[#949cff]">
            <Icon aria-hidden="true" className="size-4 shrink-0" />{label}
          </Tabs.Tab>
        ))}
      </Tabs.List>
      <div className="mt-3 grid min-w-0 items-start gap-3 md:mt-5 md:grid-cols-2 md:gap-5">
        {editor}
        <div className="min-w-0 overflow-hidden rounded-xl border border-[#50525b] bg-[#313338] text-[#f2f3f5]">
          <div className="flex min-w-0 items-center justify-between gap-2 px-3 pt-2.5 sm:px-4">
            <div className="flex items-center gap-1.5 text-xs font-medium text-[#dbdee1]">
              <span aria-hidden="true" className="size-2 shrink-0 rounded-full bg-[#949cff]" />
              Live preview
            </div>
            {fontPicker}
          </div>
          <Tabs.Panel value="profile" className="p-3 sm:p-4">
            <ProfilePreview output={output} bioPreview={bioPreview} roleMode={roleMode} />
          </Tabs.Panel>
          <Tabs.Panel value="channel" className="p-3 sm:p-4">
            <ServerPreview output={output} voice={voice} prefix={prefix} onPrefix={onPrefix} />
          </Tabs.Panel>
          <Tabs.Panel value="chat" className="p-3 sm:p-4">
            <ChatPreview output={output} format={format} onFormat={onFormat} />
          </Tabs.Panel>
          {actions}
        </div>
      </div>
    </Tabs.Root>
  )
}
