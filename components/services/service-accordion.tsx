'use client'

import { ChevronDown } from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function ServiceAccordion({
  id,
  title,
  summary,
  fromPrice,
  children,
}: {
  id: string
  title: string
  summary: string
  fromPrice: string
  children: ReactNode
}) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    function openFromHash() {
      if (window.location.hash === `#${id}`) setOpen(true)
    }
    openFromHash()
    window.addEventListener('hashchange', openFromHash)
    return () => window.removeEventListener('hashchange', openFromHash)
  }, [id])

  return (
    <section id={id} className="scroll-mt-24 overflow-hidden rounded-2xl border border-border bg-card">
      <h2>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls={`${id}-panel`}
          className="flex w-full items-center justify-between gap-4 p-4 text-left transition-colors hover:bg-muted/40 focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:outline-none sm:p-5"
        >
          <span className="min-w-0">
            <span className="block text-lg font-semibold tracking-tight sm:text-xl">{title}</span>
            <span className="mt-1 block text-sm leading-relaxed font-normal text-muted-foreground">{summary}</span>
          </span>
          <span className="flex shrink-0 items-center gap-3">
            <span className="text-sm font-medium text-muted-foreground tabular-nums">from {fromPrice}</span>
            <ChevronDown
              className={cn('size-5 text-muted-foreground transition-transform', open && 'rotate-180')}
              aria-hidden="true"
            />
          </span>
        </button>
      </h2>
      <div id={`${id}-panel`} hidden={!open} className="border-t border-border p-3 sm:p-5">
        {children}
      </div>
    </section>
  )
}
