```tsx
import Link from 'next/link'
import { Logo } from '@/components/site/logo'
import { MobileNav } from '@/components/site/mobile-nav'
import { buttonVariants } from '@/components/ui/button'
import { MAIN_NAV } from '@/lib/site'
import { cn } from '@/lib/utils'

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Logo />
        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {MAIN_NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="rounded-full px-3.5 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-2">
          <Link
            href="/contact"
            className="hidden rounded-full px-3.5 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:inline-flex"
          >
            Support
          </Link>
          <Link
            href="/order"
            className={cn(buttonVariants(), 'hidden h-10 rounded-full px-5 sm:inline-flex')}
          >
            Get Started
          </Link>
          <MobileNav />
        </div>
      </div>
    </header>
  )
}
```
