'use client'

import { useEffect, useState } from 'react'
import { FlatServiceSection } from '@/components/services/flat-service-section'
import { ServiceAccordion } from '@/components/services/service-accordion'
import { TieredServiceSection } from '@/components/services/tiered-service-section'
import { getPlatform, getStartingPriceCents, isTiered, type PlatformId, type Service } from '@/lib/catalog'
import { formatUSD } from '@/lib/format'
import { cn } from '@/lib/utils'

function categoryOf(s: Service): string {
  const id = String(s.id)
  if (id.includes('autolikes')) return 'Likes'
  if (id.includes('autoviews') || id.startsWith('views')) return 'Views'
  if (id === 'watchtime') return 'Watch Time'
  if (id.startsWith('subscribers')) return 'Subscribers'
  if (id === 'members') return 'Members'
  if (id.startsWith('premium')) return 'Premium Subscribers'
  return 'Followers'
}

export function PlatformServices({ platformId }: { platformId: PlatformId }) {
  const platform = getPlatform(platformId)!
  const groups = new Map<string, Service[]>()
  for (const s of platform.services) {
    const c = categoryOf(s)
    groups.set(c, [...(groups.get(c) ?? []), s])
  }
  const names = Array.from(groups.keys())
  const [open, setOpen] = useState<string | null>(names.length === 1 ? names[0] : null)

  useEffect(() => {
    const hash = window.location.hash.replace('#', '')
    const found = platform.services.find((s) => s.id === hash)
    if (found) setOpen(categoryOf(found))
  }, [platform])

  return (
    <div>
      {names.length > 1 && (
        <ul className="grid gap-3 sm:grid-cols-3">
          {names.map((name) => {
            const list = groups.get(name)!
            const from = Math.min(...list.map(getStartingPriceCents))
            return (
              <li key={name}>
                <button
                  type="button"
                  onClick={() => setOpen(open === name ? null : name)}
                  aria-expanded={open === name}
                  className={cn(
                    'w-full rounded-2xl border p-5 text-left transition-colors',
                    open === name ? 'border-primary bg-accent/60' : 'border-border bg-card hover:border-foreground/30',
                  )}
                >
                  <span className="block text-lg font-semibold tracking-tight">
                    {platform.name} {name}
                  </span>
                  <span className="mt-1 block text-sm text-muted-foreground">
                    {list.length} {list.length === 1 ? 'option' : 'options'} · from {formatUSD(from)}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      )}

      {names.map((name) => (
        <div key={name} hidden={open !== name} className={cn('flex flex-col gap-3', names.length > 1 && 'mt-4')}>
          {groups.get(name)!.map((service) => (
            <ServiceAccordion
              key={service.id}
              id={service.id}
              title={`${platform.name} ${service.label}`}
              summary={service.summary}
              fromPrice={formatUSD(getStartingPriceCents(service))}
            >
              {isTiered(service) ? (
                <TieredServiceSection platformId={platform.id} serviceId={service.id} />
              ) : (
                <FlatServiceSection platformId={platform.id} serviceId={service.id} />
              )}
            </ServiceAccordion>
          ))}
        </div>
      ))}
    </div>
  )
}
