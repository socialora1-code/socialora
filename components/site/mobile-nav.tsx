'use client'

import { ChevronDown, Menu, X } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

export type ToolMenuGroup = {
  title: string
  links: { href: string; label: string }[]
}

const LINKS = [
  { href: '/', label: 'Home' },
  { href: '/instagram', label: 'Instagram' },
  { href: '/tiktok', label: 'TikTok' },
  { href: '/youtube', label: 'YouTube' },
  { href: '/x', label: 'X (Twitter)' },
  { href: '/free-instagram-views', label: 'Free Instagram Views' },
  { href: '/tools', label: 'Free Tools' },
  { href: '/custom-request', label: 'Custom Request' },
  { href: '/track', label: 'Track Order' },
  { href: '/referral', label: 'Referral Program' },
  { href: '/faq', label: 'FAQ' },
  { href: '/contact', label: 'Support' },
  { href: '/about', label: 'About' },
]

export function MobileNav({ toolGroups = [] }: { toolGroups?: ToolMenuGroup[] }) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <div className="xl:hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-label={open ? 'Close menu' : 'Open menu'}
        className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {open &&
        createPortal(
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 99999,
              background: 'var(--background)',
              color: 'var(--foreground)',
              display: 'flex',
              flexDirection: 'column',
              overflowY: 'auto',
            }}
          >
            <div className="flex h-16 shrink-0 items-center justify-between border-b border-border px-5">
              <span className="text-xl font-bold text-foreground">Socialora</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card"
              >
                <X className="h-5 w-5 text-foreground" />
              </button>
            </div>

            <nav className="flex flex-1 flex-col px-5 py-4">
              {LINKS.map((item) =>
                item.href === '/tools' && toolGroups.length > 0 ? (
                  <details key={item.label} className="border-b border-border">
                    <summary className="flex min-h-[60px] cursor-pointer list-none items-center justify-between text-lg font-semibold text-foreground [&::-webkit-details-marker]:hidden">
                      {item.label}
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    </summary>
                    <div className="pb-4">
                      <Link
                        href="/tools"
                        onClick={() => setOpen(false)}
                        className="flex min-h-[44px] items-center text-base font-medium text-primary"
                      >
                        All free tools
                      </Link>
                      {toolGroups.map((group) => (
                        <div key={group.title} className="mt-3">
                          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            {group.title}
                          </p>
                          <ul>
                            {group.links.map((link) => (
                              <li key={link.href}>
                                <Link
                                  href={link.href}
                                  onClick={() => setOpen(false)}
                                  className="flex min-h-[44px] items-center text-base text-foreground"
                                >
                                  {link.label}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </details>
                ) : (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="flex min-h-[60px] items-center border-b border-border text-lg font-semibold text-foreground"
                  >
                    {item.label}
                  </Link>
                ),
              )}

              <Link
                href="/order"
                onClick={() => setOpen(false)}
                className="brand-gradient mt-auto flex h-14 items-center justify-center rounded-full text-lg font-semibold text-white"
              >
                Get Started
              </Link>
            </nav>
          </div>,
          document.body,
        )}
    </div>
  )
}
