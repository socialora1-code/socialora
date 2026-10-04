'use client'

import { ArrowRight, Clock, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { QuantityPicker } from '@/components/services/quantity-picker'
import { buttonVariants } from '@/components/ui/button'
import {
  getPlatform,
  getPriceCents,
  getQuantities,
  getService,
  getTierDescription,
  TIERS,
  type PlatformId,
  type ServiceId,
} from '@/lib/catalog'
import { formatQuantity, formatUSD } from '@/lib/format'
import { buildOrderHref } from '@/lib/order-url'
import { cn } from '@/lib/utils'

export function TieredServiceSection({
  platformId,
  serviceId,
}: {
  platformId: PlatformId
  serviceId: ServiceId
}) {
  const platform = getPlatform(platformId)!
  const service = getService(platform, serviceId)!
  const quantities = getQuantities(service)
  const [quantity, setQuantity] = useState(service.defaultQuantity)

  return (
    <div>
      <div className="rounded-2xl border border-border bg-card p-4 sm:p-5">
        <QuantityPicker
          name={`${platform.id}-${service.id}-quantity`}
          legend={`How many ${service.unit}?`}
          quantities={quantities}
          value={quantity}
          onChange={setQuantity}
        />
      </div>

      <ul className="mx-auto mt-6 grid max-w-4xl gap-4 md:grid-cols-2 md:items-stretch">
        {TIERS.map((tier) => {
          const price = getPriceCents(service, tier.id, quantity)
          if (price === null) return null
          return (
            <li
              key={tier.id}
              className={cn(
                'relative flex flex-col rounded-3xl border bg-card p-6 transition-shadow',
                tier.emphasized
                  ? 'border-primary/60 shadow-[0_20px_50px_-24px_oklch(0.48_0.2_278/.45)] ring-1 ring-primary/30 md:-translate-y-2'
                  : 'border-border',
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-xl font-semibold tracking-tight">{tier.name}</h3>
                <span
                  className={cn(
                    'rounded-full px-2.5 py-1 text-xs font-medium',
                    tier.emphasized ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
                  )}
                >
                  {tier.badge}
                </span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {getTierDescription(service, tier)}
              </p>

              <div className="mt-6 border-t border-border pt-6">
                <p className="text-sm text-muted-foreground">
                  {formatQuantity(quantity)} {platform.name} {service.label}
                </p>
                <p className="mt-1 text-4xl font-semibold tracking-tight tabular-nums" aria-live="polite">
                  {formatUSD(price)}
                  <span className="ml-1 text-sm font-normal text-muted-foreground">USD</span>
                </p>
              </div>

              <dl className="mt-6 flex flex-col gap-3 text-sm">
                <div className="flex gap-2.5">
                  <dt className="sr-only">Estimated delivery</dt>
                  <Clock className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                  <dd className="leading-relaxed text-muted-foreground">{service.delivery}</dd>
                </div>
                {service.refill && (
                  <div className="flex gap-2.5">
                    <dt className="sr-only">Refill</dt>
                    <RefreshCw className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                    <dd className="leading-relaxed text-muted-foreground">{service.refill}</dd>
                  </div>
                )}
              </dl>

              <div className="mt-auto pt-8">
                <Link
                  href={buildOrderHref({ platform: platform.id, service: service.id, tier: tier.id, quantity })}
                  className={cn(
                    buttonVariants({ variant: tier.emphasized ? 'default' : 'outline' }),
                    'h-12 w-full rounded-full text-base',
                  )}
                  aria-label={`Order ${formatQuantity(quantity)} ${tier.name} ${platform.name} ${service.label} for ${formatUSD(price)}`}
                >
                  Order Now
                  <ArrowRight data-icon="inline-end" />
                </Link>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
