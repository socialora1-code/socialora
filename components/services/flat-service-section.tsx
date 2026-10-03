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
  STANDARD_PACKAGE_NAME,
  type PlatformId,
  type ServiceId,
} from '@/lib/catalog'
import { formatQuantity, formatUSD } from '@/lib/format'
import { buildOrderHref } from '@/lib/order-url'
import { cn } from '@/lib/utils'

export function FlatServiceSection({
  platformId,
  serviceId,
}: {
  platformId: PlatformId
  serviceId: ServiceId
}) {
  const platform = getPlatform(platformId)!
  const service = getService(platform, serviceId)!
  const [quantity, setQuantity] = useState(service.defaultQuantity)
  const price = getPriceCents(service, null, quantity) ?? 0

  return (
    <div className="grid overflow-hidden rounded-3xl border border-border bg-card md:grid-cols-[1.3fr_1fr]">
      <div className="p-5 sm:p-6">
        <QuantityPicker
          name={`${platform.id}-${service.id}-quantity`}
          legend={`How many ${service.unit}?`}
          quantities={getQuantities(service)}
          value={quantity}
          onChange={setQuantity}
        />
        <dl className="mt-6 flex flex-col gap-3 text-sm">
          <div className="flex gap-2.5">
            <dt className="sr-only">Estimated delivery</dt>
            <Clock className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <dd className="leading-relaxed text-muted-foreground">{service.delivery}</dd>
          </div>
          <div className="flex gap-2.5">
            <dt className="sr-only">Refill</dt>
            <RefreshCw className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <dd className="leading-relaxed text-muted-foreground">
              {service.refill ?? 'Refill is not applicable to this service.'}
            </dd>
          </div>
        </dl>
      </div>

      <div className="flex flex-col justify-between gap-6 border-t border-border bg-muted/50 p-5 sm:p-6 md:border-t-0 md:border-l">
        <div>
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {STANDARD_PACKAGE_NAME} package
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {formatQuantity(quantity)} {platform.name} {service.label}
          </p>
          <p className="mt-1 text-4xl font-semibold tracking-tight tabular-nums" aria-live="polite">
            {formatUSD(price)}
            <span className="ml-1 text-sm font-normal text-muted-foreground">USD</span>
          </p>
        </div>
        <Link
          href={buildOrderHref({ platform: platform.id, service: service.id, quantity })}
          className={cn(buttonVariants(), 'h-12 w-full rounded-full text-base')}
          aria-label={`Order ${formatQuantity(quantity)} ${platform.name} ${service.label} for ${formatUSD(price)}`}
        >
          Order Now
          <ArrowRight data-icon="inline-end" />
        </Link>
      </div>
    </div>
  )
}
