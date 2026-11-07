'use client'

import { useEffect, useId, useRef } from 'react'

type TelegramUser = Record<string, string | number>

export function TelegramConnect({ botUsername, onConnected, onError }: {
  botUsername: string
  onConnected: () => void
  onError: (message: string) => void
}) {
  const container = useRef<HTMLDivElement>(null)
  const callback = `socialoraTelegram${useId().replace(/[^a-zA-Z0-9]/g, '')}`
  const connectedRef = useRef(onConnected)
  const errorRef = useRef(onError)
  connectedRef.current = onConnected
  errorRef.current = onError

  useEffect(() => {
    const callbacks = window as unknown as Record<string, unknown>
    let active = true
    callbacks[callback] = async (user: TelegramUser) => {
      try {
        const response = await fetch('/api/free-views/telegram', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(user),
        })
        const result = await response.json()
        if (!active) return
        if (response.ok && result.ok) connectedRef.current()
        else errorRef.current(result.error ?? 'Please try connecting again.')
      } catch { if (active) errorRef.current('Could not connect. Please try again.') }
    }
    const target = container.current
    const script = document.createElement('script')
    script.src = 'https://telegram.org/js/telegram-widget.js?22'
    script.async = true
    script.setAttribute('data-telegram-login', botUsername)
    script.setAttribute('data-size', 'large')
    script.setAttribute('data-userpic', 'false')
    script.setAttribute('data-onauth', `${callback}(user)`)
    script.onerror = () => { if (active) errorRef.current('Telegram login could not load. Please allow it and try again.') }
    target?.appendChild(script)
    return () => { active = false; delete callbacks[callback]; target?.replaceChildren() }
  }, [botUsername, callback])

  return <div ref={container} className="min-h-12" aria-label="Connect your Telegram account" />
}
