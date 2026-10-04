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

  // Close the menu whenever the route changes.
  const [lastPath, setLastPath] = useState(pathname)
  if (lastPath !== pathname) {
    setLastPath(pathname)
    setOpen(false)
  }

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? 'Close menu' : 'Open menu'}
        className="inline-flex size-11 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-muted"
      >
        {open ? <X className="size-5" /> : <Menu className="size-5" />}
      </button>

      {open && (
        <div
          id="mobile-menu"
          className="fixed inset-x-0 top-16 bottom-0 z-50 overflow-y-auto border-t border-border bg-background animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <nav aria-label="Mobile" className="mx-auto flex max-w-6xl flex-col px-4 py-6 sm:px-6">
            <ul className="flex flex-col">
              {[...MAIN_NAV, ...EXTRA_LINKS].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={pathname === item.href ? 'page' : undefined}
                    className="flex min-h-14 items-center border-b border-border/70 text-lg font-medium tracking-tight aria-[current=page]:text-primary"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            <Link href="/order" className={cn(buttonVariants(), 'mt-8 h-12 rounded-full text-base')}>
              Get Started
            </Link>
          </nav>
        </div>
      )}
    </div>
  )
}
```
