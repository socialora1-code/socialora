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

type CountryCode = 'us' | 'es' | 'sa' | 'br'

const COUNTRY_BY_SERVICE: Partial<Record<ServiceId, { code: CountryCode; label: string }>> = {
  'followers-us': { code: 'us', label: 'United States' },
  'followers-es': { code: 'es', label: 'Spain' },
  'followers-es-female': { code: 'es', label: 'Spain · Female' },
  'followers-es-male': { code: 'es', label: 'Spain · Male' },
  'followers-ar': { code: 'sa', label: 'Arabic · Saudi Arabia' },
  'followers-br': { code: 'br', label: 'Brazil' },
}

function Flag({ code }: { code: CountryCode }) {
  const stripe = 20 / 13
  return (
    <svg
      viewBox="0 0 30 20"
      aria-hidden="true"
      className="h-8 w-12 shrink-0 rounded-md shadow-sm ring-1 ring-black/10"
    >
      {code === 'us' && (
        <>
          <rect width="30" height="20" fill="#ffffff" />
          {Array.from({ length: 7 }, (_, i) => (
            <rect key={i} y={i * 2 * stripe} width="30" height={stripe} fill="#B22234" />
          ))}
          <rect width="12" height={stripe * 7} fill="#3C3B6E" />
          {Array.from({ length: 12 }, (_, i) => (
            <circle
              key={i}
              cx={1.8 + (i % 4) * 2.8}
              cy={1.7 + Math.floor(i / 4) * 2.9}
              r="0.7"
              fill="#ffffff"
            />
          ))}
        </>
      )}
      {code === 'es' && (
        <>
          <rect width="30" height="20" fill="#AA151B" />
          <rect y="5" width="30" height="10" fill="#F1BF00" />
        </>
      )}
      {code === 'sa' && (
        <>
          <rect width="30" height="20" fill="#006C35" />
          <rect x="8" y="6" width="14" height="2" rx="1" fill="#ffffff" opacity="0.9" />
          <rect x="7" y="14" width="16" height="1" fill="#ffffff" />
        </>
      )}
      {code === 'br' && (
        <>
          <rect width="30" height="20" fill="#009739" />
          <polygon points="15,2.5 27,10 15,17.5 3,10" fill="#FEDD00" />
          <circle cx="15" cy="10" r="4.2" fill="#012169" />
          <path d="M10.9 9.2 Q15 7.8 19.1 10.8" stroke="#ffffff" strokeWidth="0.9" fill="none" />
        </>
      )}
    </svg>
  )
}

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
  const country = COUNTRY_BY_SERVICE[service.id]

  return (
    <div className="overflow-hidden rounded-3xl border border-border bg-card">
      {country && (
        <div className="flex items-center gap-3 border-b border-border bg-muted/40 px-5 py-3 sm:px-6">
          <Flag code={country.code} />
          <span className="text-base font-semibold tracking-tight">{country.label}</span>
        </div>
      )}

      <div className="grid md:grid-cols-[1.3fr_1fr]">
        <div className="min-w-0 p-5 sm:p-6">
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
            {service.refill && (
              <div className="flex gap-2.5">
                <dt className="sr-only">Refill</dt>
                <RefreshCw className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                <dd className="leading-relaxed text-muted-foreground">{service.refill}</dd>
              </div>
            )}
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
    </div>
  )
}
