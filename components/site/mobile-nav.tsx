```tsx
'use client'

import { Menu, X } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

const LINKS = [
  { href: '/instagram', label: 'Instagram' },
  { href: '/tiktok', label: 'TikTok' },
  { href: '/youtube', label: 'YouTube' },
  { href: '/how-it-works', label: 'How It Works' },
  { href: '/faq', label: 'FAQ' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Support' },
]

export function MobileNav() {
  const [open, setOpen] = useState(false)

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-label={open ? 'Close menu' : 'Open menu'}
        className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {open && (
        <div
          style={{
            position: 'fixed',
            top: '64px',
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 99999,
            background: 'white',
            overflowY: 'auto',
          }}
        >
          <nav className="flex flex-col px-5 py-6">
            {LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="flex min-h-[60px] items-center border-b border-gray-200 text-lg font-semibold text-gray-900"
              >
                {item.label}
              </Link>
            ))}

            <Link
              href="/order"
              onClick={() => setOpen(false)}
              className="mt-8 flex h-12 items-center justify-center rounded-full bg-blue-600 font-semibold text-white"
            >
              Get Started
            </Link>
          </nav>
        </div>
      )}
    </div>
  )
}
```
