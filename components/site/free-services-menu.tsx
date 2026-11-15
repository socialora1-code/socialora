'use client'

import { ChevronDown } from 'lucide-react'
import Link from 'next/link'
import { useRef } from 'react'

const services = [
  { href: '/free-instagram-views', label: 'Free Instagram Views' },
  { href: '/free-telegram-members', label: 'Free Telegram Members' },
  { href: '/free-facebook-followers', label: 'Free Facebook Followers' },
]

export function FreeServicesMenu({ mobile = false, onNavigate }: { mobile?: boolean; onNavigate?: () => void }) {
  const menu = useRef<HTMLDetailsElement>(null)
  const toggle = useRef<HTMLElement>(null)
  function close() {
    if (menu.current) menu.current.open = false
  }

  return (
    <details ref={menu} className={mobile ? 'border-b border-border' : 'relative'}
      onKeyDown={event => {
        if (event.key === 'Escape' && menu.current?.open) {
          event.stopPropagation()
          close()
          toggle.current?.focus()
        }
      }}>
      <summary ref={toggle}
        className={mobile
          ? 'flex min-h-[60px] cursor-pointer list-none items-center justify-between text-lg font-semibold [&::-webkit-details-marker]:hidden'
          : 'flex cursor-pointer list-none items-center gap-1 whitespace-nowrap rounded-full px-3.5 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground [&::-webkit-details-marker]:hidden'}>
        Free Services
        <ChevronDown aria-hidden="true" className={mobile ? 'size-5' : 'size-3.5'} />
      </summary>
      <ul className={mobile ? 'pb-4 pl-3' : 'absolute left-0 top-full z-50 mt-2 w-56 rounded-2xl border border-border bg-background p-2 shadow-xl'}>
        {services.map(service => (
          <li key={service.href}>
            <Link href={service.href} onClick={() => { close(); onNavigate?.() }}
              className="flex min-h-11 items-center rounded-lg px-3 text-sm font-medium hover:bg-muted">
              {service.label}
            </Link>
          </li>
        ))}
      </ul>
    </details>
  )
}
