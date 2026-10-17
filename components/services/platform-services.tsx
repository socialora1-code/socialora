'use client'

import { ChevronDown } from 'lucide-react'
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
    <div className="flex flex-col gap-3">
      {names.map((name) => {
        const list = groups.get(name)!
        const from = Math.min(...list.map(getStartingPriceCents))
        const isOpen = open === name
        return (
          <div key={name}>
            {names.length > 1 && (
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : name)}
                aria-expanded={isOpen}
                className={cn(
                  'flex w-full items-center justify-between gap-4 rounded-2xl border p-5 text-left transition-colors',
                  isOpen ? 'border-primary bg-accent/60' : 'border-border bg-card hover:border-foreground/30',
                )}
              >
                <span>
                  <span className="block text-lg font-semibold tracking-tight">
                    {platform.name} {name}
                  </span>
                  <span className="mt-1 block text-sm text-muted-foreground">
                    {list.length} {list.length === 1 ? 'option' : 'options'} · from {formatUSD(from)}
                  </span>
                </span>
                <ChevronDown
                  className={cn('size-5 shrink-0 text-muted-foreground transition-transform', isOpen && 'rotate-180')}
                  aria-hidden="true"
                />
              </button>
            )}

            <div hidden={!isOpen} className={cn('flex flex-col gap-3', names.length > 1 && 'mt-3 pl-2 sm:pl-4')}>
              {list.map((service) => (
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
          </div>
        )
      })}
    </div>
  )
}
