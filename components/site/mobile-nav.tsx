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
    if (!open) {
      document.body.style.overflow = ''
      return
    }

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
      }
    }

    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <div className="relative lg:hidden">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? 'Close menu' : 'Open menu'}
        className="relative z-[110] inline-flex size-11 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-muted"
      >
        {open ? <X className="size-5" /> : <Menu className="size-5" />}
      </button>

      {open && (
        <div
          id="mobile-menu"
          className="absolute right-0 top-full z-[100] mt-3 w-[calc(100vw-2rem)] max-h-[calc(100dvh-5rem)] overflow-y-auto rounded-2xl border border-border bg-background shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <nav
            aria-label="Mobile"
            className="flex flex-col px-5 py-5"
          >
            <ul className="flex flex-col">
              {[...MAIN_NAV, ...EXTRA_LINKS].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={pathname === item.href ? 'page' : undefined}
                    onClick={() => setOpen(false)}
                    className="flex min-h-14 items-center border-b border-border/70 text-lg font-medium tracking-tight transition-colors hover:text-primary aria-[current=page]:text-primary"
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
    </div>
  )
}
```
