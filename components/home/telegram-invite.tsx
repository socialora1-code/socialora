'use client'

import { useEffect, useId, useRef } from 'react'

export function TelegramInvite({ open, onClose, onJoin }: {
  open: boolean
  onClose: () => void
  onJoin: () => void
}) {
  const dialog = useRef<HTMLDialogElement>(null)
  const title = useId()
  useEffect(() => {
    const element = dialog.current
    if (open && !element?.open) element?.showModal()
    if (!open && element?.open) element.close()
  }, [open])

  return (
    <dialog ref={dialog} aria-labelledby={title} onCancel={onClose}
      onClick={event => { if (event.target === event.currentTarget) onClose() }}
      className="fixed inset-0 m-auto w-[calc(100%-2rem)] max-w-sm rounded-3xl border border-border bg-card p-6 text-center text-foreground shadow-2xl backdrop:bg-black/65">
      <button type="button" onClick={onClose} aria-label="Close invitation"
        className="absolute right-3 top-3 flex size-10 items-center justify-center rounded-full text-2xl text-muted-foreground hover:bg-muted">×</button>
      <img src="/socialora-community.jpg" alt="Socialora Chat profile" width={80} height={80}
        className="mx-auto mb-3 size-20 rounded-full object-cover" />
      <p className="text-sm font-medium text-muted-foreground">Socialora Chat | Creator Growth &amp; Free Tools</p>
      <h3 id={title} className="mt-2 text-xl font-semibold leading-snug">Join our Telegram group to get free views</h3>
      <p className="mb-5 mt-2 text-sm text-muted-foreground">Open the group in Telegram, join, then return here to claim your views.</p>
      <a href="/api/free-views/telegram/join" target="_blank" rel="noopener noreferrer" onClick={onJoin}
        className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground hover:opacity-90">Join group</a>
    </dialog>
  )
}
