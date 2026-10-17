'use client'

import { QuantityPicker } from '@/components/services/quantity-picker'
import { PlatformIcon } from '@/components/site/platform-icon'
import {
  getListPriceCents,
  getPriceCents,
  getQuantities,
  isTiered,
  PLATFORMS,
  STANDARD_PACKAGE_NAME,
  TIERS,
  type Platform,
  type PlatformId,
  type Service,
  type ServiceId,
  type TierId,
} from '@/lib/catalog'
import { formatQuantity, formatUSD } from '@/lib/format'
import { cn } from '@/lib/utils'

const optionClass = cn(
  'relative flex cursor-pointer rounded-2xl border border-border bg-background transition-colors',
  'hover:border-foreground/30 has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/40',
  'has-[:checked]:border-primary has-[:checked]:bg-accent/60 has-[:checked]:ring-1 has-[:checked]:ring-primary',
)
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
export function OrderDetailsStep({
  platform,
  service,
  tierId,
  quantity,
  priceCents,
  onPlatformChange,
  onServiceChange,
  onTierChange,
  onQuantityChange,
}: {
  platform: Platform
  service: Service
  tierId: TierId | null
  quantity: number
  priceCents: number | null
  onPlatformChange: (id: PlatformId) => void
  onServiceChange: (id: ServiceId) => void
  onTierChange: (id: TierId) => void
  onQuantityChange: (q: number) => void
}) {
  const tiered = isTiered(service)
  const fixed = Boolean(service.fixed)
    const categories = Array.from(new Set(platform.services.map(categoryOf)))
  const category = categoryOf(service)
  const inCategory = platform.services.filter((s) => categoryOf(s) === category)
  const listPrice = getListPriceCents(service, quantity)
  const itemName = fixed
    ? `${platform.name} ${service.label}`
    : `${formatQuantity(quantity)} ${platform.name} ${service.label}`

  return (
    <div className="flex flex-col gap-7">
                  {categories.length > 1 && (
        <fieldset className="min-w-0">
          <legend className="text-sm font-medium">Type</legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => {
                  const first = platform.services.find((s) => categoryOf(s) === c)
                  if (first) onServiceChange(first.id)
                }}
                aria-pressed={c === category}
                className={cn(
                  'inline-flex h-11 items-center rounded-full border px-5 text-sm font-medium transition-colors',
                  c === category
                    ? 'border-foreground bg-foreground text-background'
                    : 'border-border bg-background hover:border-foreground/30',
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      {inCategory.length > 1 && (
        <div className="min-w-0">
          <label htmlFor="service" className="text-sm font-medium">
            Option
          </label>
          <select
            id="service"
            value={service.id}
            onChange={(e) => onServiceChange(e.target.value as ServiceId)}
            className="mt-3 h-12 w-full rounded-xl border border-border bg-background px-4 text-base"
          >
            {inCategory.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      )}

      <fieldset className="min-w-0">
        <legend className="text-sm font-medium">Service</legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {platform.services.map((s) => (
            <label
              key={s.id}
              className={cn(
                'inline-flex h-11 cursor-pointer items-center rounded-full border border-border bg-background px-5 text-sm font-medium transition-colors',
                'hover:border-foreground/30 has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/40',
                'has-[:checked]:border-foreground has-[:checked]:bg-foreground has-[:checked]:text-background',
              )}
            >
              <input
                type="radio"
                name="service"
                value={s.id}
                checked={service.id === s.id}
                onChange={() => onServiceChange(s.id)}
                className="sr-only"
              />
              {s.label}
            </label>
          ))}
        </div>
      </fieldset>

      {tiered ? (
        <fieldset className="min-w-0">
          <legend className="text-sm font-medium">Package</legend>
          <div className="mt-3 grid gap-2 md:grid-cols-3">
            {TIERS.map((tier) => {
              const tierPrice = getPriceCents(service, tier.id, quantity)
              return (
                <label key={tier.id} className={cn(optionClass, 'flex-col gap-1 p-4')}>
                  <input
                    type="radio"
                    name="tier"
                    value={tier.id}
                    checked={tierId === tier.id}
                    onChange={() => onTierChange(tier.id)}
                    className="sr-only"
                  />
                  <span className="flex items-center justify-between gap-2">
                    <span className="font-semibold">{tier.name}</span>
                    <span
                      className={cn(
                        'rounded-full px-2 py-0.5 text-[11px] font-medium',
                        tier.emphasized ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
                      )}
                    >
                      {tier.badge}
                    </span>
                  </span>
                  <span className="text-sm leading-snug text-muted-foreground">{tier.description}</span>
                  {tierPrice !== null && (
                    <span className="mt-1 text-sm font-semibold tabular-nums">{formatUSD(tierPrice)}</span>
                  )}
                </label>
              )
            })}
          </div>
        </fieldset>
      ) : (
        <div className="rounded-2xl border border-dashed border-border px-4 py-3 text-sm text-muted-foreground">
          Package: <span className="font-medium text-foreground">{STANDARD_PACKAGE_NAME}</span> — this service has a
          single package.
        </div>
      )}

      {fixed ? (
        <div className="rounded-2xl border border-border bg-muted/40 px-4 py-3 text-sm leading-relaxed text-muted-foreground">
          This is a fixed package, so there is no quantity to choose. {service.summary}
        </div>
      ) : (
        <QuantityPicker
          name="quantity"
          legend="Quantity"
          quantities={getQuantities(service)}
          value={quantity}
          onChange={onQuantityChange}
        />
      )}

      <div className="flex items-end justify-between gap-4 rounded-2xl bg-muted/70 p-4">
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">{itemName}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{service.delivery}</p>
        </div>
        <p className="shrink-0 text-2xl font-semibold tracking-tight tabular-nums" aria-live="polite">
          {listPrice !== null && (
            <span className="mr-2 text-base font-normal text-muted-foreground line-through">
              {formatUSD(listPrice)}
            </span>
          )}
          {priceCents !== null ? formatUSD(priceCents) : '—'}
        </p>
      </div>
    </div>
  )
}
