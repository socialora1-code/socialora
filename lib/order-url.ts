import type { PlatformId, ServiceId, TierId } from '@/lib/catalog'

export function buildOrderHref(selection: {
  platform: PlatformId
  service: ServiceId
  tier?: TierId | null
  quantity: number
}): string {
  const params = new URLSearchParams({
    platform: selection.platform,
    service: selection.service,
    quantity: String(selection.quantity),
  })
  if (selection.tier) params.set('tier', selection.tier)
  return `/order?${params.toString()}`
}
