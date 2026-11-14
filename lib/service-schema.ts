import { getPriceCents, getQuantities, getServiceTitle, isTiered, TIERS, type Platform, type Service } from '@/lib/catalog'
import { buildOrderHref } from '@/lib/order-url'
import { SITE } from '@/lib/site'

const provider = { '@type': 'Organization', name: SITE.name, url: SITE.url }

export function serviceSchema(
  platform: Platform,
  service: Service,
  { name = getServiceTitle(platform, service), description = service.summary } = {},
) {
  const tiers = isTiered(service) ? TIERS : [null]
  const offers = getQuantities(service).flatMap(quantity => tiers.flatMap(tier => {
    const tierId = tier?.id ?? null
    const cents = getPriceCents(service, tierId, quantity)
    if (cents === null) return []

    return [{
      '@type': 'Offer',
      name: [name, String(quantity), tier?.name].filter(Boolean).join(' / '),
      price: (cents / 100).toFixed(2),
      priceCurrency: 'USD',
      url: new URL(buildOrderHref({ platform: platform.id, service: service.id, quantity, tier: tierId }), SITE.url).href,
    }]
  }))

  return { '@type': 'Service', name, description, provider, offers }
}
