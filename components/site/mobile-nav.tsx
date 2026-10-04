```tsx
'use client'

import { Menu, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { buttonVariants } from '@/components/ui/button'
import { MAIN_NAV } from '@/lib/site'
import { cn } from '@/lib/utils'

const EXTRA_LINKS = [
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact & Support' },
] as const

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? 'Close menu' : 'Open menu'}
        className="relative z-[10000] inline-flex size-11 items-center justify-center rounded-full border border-border bg-card text-foreground"
      >
        {open ? <X className="size-5" /> : <Menu className="size-5" />}
      </button>

      {open && (
        <div
          id="mobile-menu"
          style={{
            position: 'fixed',
            top: '64px',
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
            background: '#ffffff',
            overflowY: 'auto',
          }}
        >
          <nav
            aria-label="Mobile"
            className="mx-auto flex max-w-6xl flex-col px-5 py-6"
          >
            <ul className="flex flex-col">
              {[...MAIN_NAV, ...EXTRA_LINKS].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="flex min-h-14 items-center border-b border-gray-200 text-lg font-medium text-gray-900"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>

            <Link
              href="/order"
              onClick={() => setOpen(false)}
              className={cn(
                buttonVariants(),
                'mt-6 h-12 w-full rounded-full text-base'
              )}
            >
              Get Started
            </Link>
          </nav>
        </div>
      )}
    </>
  )
}
```
