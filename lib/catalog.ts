/**
 * Socialora service catalog.
 *
 * Single source of truth for every platform, service, quantity, price and
 * note shown on the site. The checkout API recalculates order totals from
 * this file, so any price change made here applies everywhere.
 *
 * All prices are stored in US cents to avoid floating-point rounding issues.
 */

export type PlatformId = 'instagram' | 'tiktok' | 'youtube' | 'x'
export type ServiceId =
  | 'followers'
  | 'likes'
  | 'views'
  | 'subscribers'
  | 'watchtime'
  | 'followers-refill'
  | 'followers-top'
  | 'followers-us'
  | 'followers-es'
  | 'followers-es-female'
  | 'followers-es-male'
  | 'followers-ar'
  | 'followers-br'
export type TierId = 'high-quality' | 'premium' | 'vip'

export interface Tier {
  id: TierId
  name: string
  badge: string
  description: string
  emphasized: boolean
}

export const TIERS: readonly Tier[] = [
  {
    id: 'high-quality',
    name: 'High-Quality',
    badge: 'Selected',
    description: 'High-quality accounts with a minimal drop rate',
    emphasized: false,
  },
  {
    id: 'premium',
    name: 'Premium',
    badge: 'Recommended',
    description: 'Premium accounts with a minimal drop rate',
    emphasized: true,
  },
] as const

export const STANDARD_PACKAGE_NAME = 'Standard'

export interface TieredOption {
  quantity: number
  prices: Record<TierId, number>
}

export interface FlatOption {
  quantity: number
  price: number
}

export type ServicePricing =
  | { kind: 'tiered'; options: readonly TieredOption[] }
  | { kind: 'flat'; options: readonly FlatOption[] }

export interface Service {
  id: ServiceId
  /** Short label, e.g. "Followers". */
  label: string
  /** Unit used next to quantities, e.g. "followers". */
  unit: string
  /** What the customer should link to for this service. */
  target: 'profile' | 'post' | 'video' | 'channel'
  summary: string
  /** Editable delivery note. Avoid committing to exact timeframes here. */
  delivery: string
  /** Editable refill note. Set to null when refill does not apply. */
  refill: string | null
  defaultQuantity: number
  pricing: ServicePricing
  /** Optional tier descriptions that replace the defaults for this service. */
  tierDescriptions?: Partial<Record<TierId, string>>
  /** Service number at the supplier panel (used later for automation). Not a secret. */
  panelServiceId?: number
}

export interface Platform {
  id: PlatformId
  name: string
  path: `/${PlatformId}`
  tagline: string
  description: string
  profileFieldLabel: string
  profilePlaceholder: string
  /** Hostnames accepted when a full URL is submitted. */
  allowedHosts: readonly string[]
  services: readonly Service[]
}

/* -------------------------------------------------------------------------- */
/*                         PRICES (US cents per 1,000)                        */
/*                  Change a price here, e.g. 800 = $8.00                     */
/* -------------------------------------------------------------------------- */

const PRICE_YOUTUBE_VIEWS = 800
const PRICE_YOUTUBE_WATCHTIME = 2800
const PRICE_YOUTUBE_SUBSCRIBERS = 4500
const PRICE_X_FOLLOWERS = 2200
const PRICE_X_FOLLOWERS_REFILL = 4200
const PRICE_X_FOLLOWERS_TOP = 9000
const PRICE_INSTAGRAM_US_FOLLOWERS = 1800
const PRICE_INSTAGRAM_COUNTRY_FOLLOWERS = 4800

/* -------------------------------------------------------------------------- */
/*                               Editable notes                               */
/* -------------------------------------------------------------------------- */

const DELIVERY_NOTE =
  'Starts as soon as your payment is verified. We will email you when your order is complete.'

const FOLLOWER_REFILL_NOTE = '30-day refill guarantee if your follower count drops.'

/* -------------------------------------------------------------------------- */
/*                                Price tables                                */
/* -------------------------------------------------------------------------- */

/** Builds flat options. Price per 1,000 units is given in US cents. */
function flatOptions(quantities: readonly number[], per1000Cents: number): FlatOption[] {
  return quantities.map((quantity) => ({
    quantity,
    price: Math.round((per1000Cents * quantity) / 1000),
  }))
}

const FOLLOWER_QUANTITIES = [100, 250, 500, 1000, 2000, 5000, 10000]
const US_FOLLOWER_QUANTITIES = [100, 250, 500, 1000, 2000, 5000, 10000]
const INSTAGRAM_QUANTITIES = [100, 250, 500, 1000, 2000, 5000, 10000, 20000, 50000, 100000]
const YOUTUBE_VIEW_QUANTITIES = [1000, 2000, 5000, 10000, 20000, 50000]
const WATCHTIME_QUANTITIES = [1000, 2000, 4000]

/* -------------------------------------------------------------------------- */
/*                                  Platforms                                 */
/* -------------------------------------------------------------------------- */

export const PLATFORMS: readonly Platform[] = [
  {
    id: 'instagram',
    name: 'Instagram',
    path: '/instagram',
    tagline: 'Followers by country',
    description:
      'Grow your Instagram profile with followers from the country you choose. Pick the option that fits your audience.',
    profileFieldLabel: 'Instagram Profile URL',
    profilePlaceholder: 'https://instagram.com/yourprofile',
    allowedHosts: ['instagram.com', 'instagr.am'],
    services: [
      {
        id: 'followers-us',
        label: 'Followers · USA',
        unit: 'followers',
        target: 'profile',
        summary: 'American followers with profile photos for your Instagram profile, backed by a 30-day refill guarantee.',
        delivery: DELIVERY_NOTE,
        refill: FOLLOWER_REFILL_NOTE,
        defaultQuantity: 1000,
        pricing: { kind: 'flat', options: flatOptions(US_FOLLOWER_QUANTITIES, PRICE_INSTAGRAM_US_FOLLOWERS) },
        panelServiceId: 21722,
      },
      {
        id: 'followers-es',
        label: 'Followers · Spanish',
        unit: 'followers',
        target: 'profile',
        summary: 'Spanish followers for your Instagram profile, backed by a 30-day refill guarantee.',
        delivery: DELIVERY_NOTE,
        refill: FOLLOWER_REFILL_NOTE,
        defaultQuantity: 1000,
        pricing: { kind: 'flat', options: flatOptions(INSTAGRAM_QUANTITIES, PRICE_INSTAGRAM_COUNTRY_FOLLOWERS) },
        panelServiceId: 14541,
      },
      {
        id: 'followers-es-female',
        label: 'Followers · Spanish Female',
        unit: 'followers',
        target: 'profile',
        summary: 'Spanish female followers for your Instagram profile, backed by a 30-day refill guarantee.',
        delivery: DELIVERY_NOTE,
        refill: FOLLOWER_REFILL_NOTE,
        defaultQuantity: 1000,
        pricing: { kind: 'flat', options: flatOptions(INSTAGRAM_QUANTITIES, PRICE_INSTAGRAM_COUNTRY_FOLLOWERS) },
        panelServiceId: 14542,
      },
      {
        id: 'followers-es-male',
        label: 'Followers · Spanish Male',
        unit: 'followers',
        target: 'profile',
        summary: 'Spanish male followers for your Instagram profile, backed by a 30-day refill guarantee.',
        delivery: DELIVERY_NOTE,
        refill: FOLLOWER_REFILL_NOTE,
        defaultQuantity: 1000,
        pricing: { kind: 'flat', options: flatOptions(INSTAGRAM_QUANTITIES, PRICE_INSTAGRAM_COUNTRY_FOLLOWERS) },
        panelServiceId: 14543,
      },
      {
        id: 'followers-ar',
        label: 'Followers · Arabic',
        unit: 'followers',
        target: 'profile',
        summary: 'Arabic followers for your Instagram profile, backed by a 30-day refill guarantee.',
        delivery: DELIVERY_NOTE,
        refill: FOLLOWER_REFILL_NOTE,
        defaultQuantity: 1000,
        pricing: { kind: 'flat', options: flatOptions(INSTAGRAM_QUANTITIES, PRICE_INSTAGRAM_COUNTRY_FOLLOWERS) },
        panelServiceId: 14527,
      },
      {
        id: 'followers-br',
        label: 'Followers · Brazilian',
        unit: 'followers',
        target: 'profile',
        summary: 'Brazilian followers for your Instagram profile, backed by a 30-day refill guarantee.',
        delivery: DELIVERY_NOTE,
        refill: FOLLOWER_REFILL_NOTE,
        defaultQuantity: 1000,
        pricing: { kind: 'flat', options: flatOptions(INSTAGRAM_QUANTITIES, PRICE_INSTAGRAM_COUNTRY_FOLLOWERS) },
        panelServiceId: 14553,
      },
    ],
  },
  {
    id: 'youtube',
    name: 'YouTube',
    path: '/youtube',
    tagline: 'Views, watch time and subscribers',
    description:
      'Grow your YouTube channel with views, watch time and subscribers for your videos and channel.',
    profileFieldLabel: 'YouTube Video or Channel URL',
    profilePlaceholder: 'https://youtube.com/@yourchannel',
    allowedHosts: ['youtube.com', 'youtu.be'],
    services: [
      {
        id: 'views',
        label: 'Views',
        unit: 'views',
        target: 'video',
        summary: 'Fast-start views for a single public YouTube video, with a lifetime refill guarantee.',
        delivery: DELIVERY_NOTE,
        refill: 'Lifetime refill guarantee if your view count drops.',
        defaultQuantity: 1000,
        pricing: { kind: 'flat', options: flatOptions(YOUTUBE_VIEW_QUANTITIES, PRICE_YOUTUBE_VIEWS) },
        panelServiceId: 17022,
      },
      {
        id: 'watchtime',
        label: 'Watch Time',
        unit: 'hours',
        target: 'video',
        summary:
          'Watch hours for a public video that is at least 30 minutes long. 1,000 ordered = 1,000 hours of watch time.',
        delivery: DELIVERY_NOTE,
        refill: null,
        defaultQuantity: 1000,
        pricing: { kind: 'flat', options: flatOptions(WATCHTIME_QUANTITIES, PRICE_YOUTUBE_WATCHTIME) },
        panelServiceId: 21361,
      },
      {
        id: 'subscribers',
        label: 'Subscribers',
        unit: 'subscribers',
        target: 'channel',
        summary: 'Subscribers for your YouTube channel, backed by a 30-day refill guarantee.',
        delivery: DELIVERY_NOTE,
        refill: '30-day refill guarantee if your subscriber count drops.',
        defaultQuantity: 1000,
        pricing: { kind: 'flat', options: flatOptions(FOLLOWER_QUANTITIES, PRICE_YOUTUBE_SUBSCRIBERS) },
        panelServiceId: 21981,
      },
    ],
  },
  {
    id: 'x',
    name: 'X (Twitter)',
    path: '/x',
    tagline: 'Followers',
    description: 'Grow your X (Twitter) profile with followers. Choose the option that fits your goals.',
    profileFieldLabel: 'X (Twitter) Profile URL',
    profilePlaceholder: 'https://x.com/yourprofile',
    allowedHosts: ['x.com', 'twitter.com'],
    services: [
      {
        id: 'followers',
        label: 'Followers',
        unit: 'followers',
        target: 'profile',
        summary: 'Budget-friendly followers for your X profile.',
        delivery: DELIVERY_NOTE,
        refill: null,
        defaultQuantity: 1000,
        pricing: { kind: 'flat', options: flatOptions(FOLLOWER_QUANTITIES, PRICE_X_FOLLOWERS) },
        panelServiceId: 21339,
      },
      {
        id: 'followers-refill',
        label: 'Followers · 30-Day Refill',
        unit: 'followers',
        target: 'profile',
        summary: 'Followers for your X profile, backed by a 30-day refill guarantee.',
        delivery: DELIVERY_NOTE,
        refill: FOLLOWER_REFILL_NOTE,
        defaultQuantity: 1000,
        pricing: { kind: 'flat', options: flatOptions(FOLLOWER_QUANTITIES, PRICE_X_FOLLOWERS_REFILL) },
        panelServiceId: 21338,
      },
      {
        id: 'followers-top',
        label: 'Followers · Top Quality',
        unit: 'followers',
        target: 'profile',
        summary: 'Our top-quality followers for your X profile, built for lasting results.',
        delivery: DELIVERY_NOTE,
        refill: null,
        defaultQuantity: 1000,
        pricing: { kind: 'flat', options: flatOptions(FOLLOWER_QUANTITIES, PRICE_X_FOLLOWERS_TOP) },
        panelServiceId: 21340,
      },
    ],
  },
]

/* -------------------------------------------------------------------------- */
/*                               Payment methods                              */
/* -------------------------------------------------------------------------- */

export type PaymentMethodId = 'usdt-trc20' | 'usdt-bsc' | 'usdt-sol' | 'usdc-erc20' | 'btc'

export interface PaymentMethod {
  id: PaymentMethodId
  label: string
  asset: string
  network: string
  /** Wallet address. Must be displayed exactly as stored — never shortened. */
  address: string
  warning: string
}

export const PAYMENT_METHODS: readonly PaymentMethod[] = [
  {
    id: 'usdt-trc20',
    label: 'USDT — TRC20',
    asset: 'USDT',
    network: 'TRON (TRC20)',
    address: 'TVdRkrna3g2USpAwm3KmBicsGgD7SR8P8h',
    warning:
      'Send only USDT on the TRON (TRC20) network to this address. Funds sent on any other network may be permanently lost.',
  },
  {
    id: 'usdt-bsc',
    label: 'USDT — BNB Smart Chain',
    asset: 'USDT',
    network: 'BNB Smart Chain (BEP20)',
    address: '0x3bee83bd8d8aee958f6e199c7bf07f7d0cba31c6',
    warning:
      'Send only USDT on BNB Smart Chain (BEP20) to this address. Do not use Ethereum, TRON or any other network.',
  },
  {
    id: 'usdt-sol',
    label: 'USDT — Solana',
    asset: 'USDT',
    network: 'Solana (SPL)',
    address: 'DxMWunCZNjwHfZtk9oEE6VSfUwasjDgCNQ7Knq8XhuNy',
    warning:
      'Send only USDT (SPL token) on the Solana network to this address. Funds sent on any other network may be permanently lost.',
  },
  {
    id: 'usdc-erc20',
    label: 'USDC — Ethereum ERC20',
    asset: 'USDC',
    network: 'Ethereum (ERC20)',
    address: '0x3bee83bd8d8aee958f6e199c7bf07f7d0cba31c6',
    warning:
      'Send only USDC on the Ethereum (ERC20) network to this address. Do not send USDT or use any other network.',
  },
  {
    id: 'btc',
    label: 'Bitcoin',
    asset: 'BTC',
    network: 'Bitcoin',
    address: 'bc1p9j6xxdmfuljp9tg7hw6tq8u3ajjked58djuvnx0yyew0dehze0fq8fdmxk',
    warning:
      'Send only BTC on the Bitcoin network to this address. Send the BTC equivalent of the exact USD order amount at the time of payment.',
  },
]

/* -------------------------------------------------------------------------- */
/*                                   Helpers                                  */
/* -------------------------------------------------------------------------- */

export function getPlatform(id: string | null | undefined): Platform | undefined {
  return PLATFORMS.find((p) => p.id === id)
}

export function getService(platform: Platform, id: string | null | undefined): Service | undefined {
  return platform.services.find((s) => s.id === id)
}

export function getTier(id: string | null | undefined): Tier | undefined {
  return TIERS.find((t) => t.id === id)
}

/** Tier description for a service, using the service override when present. */
export function getTierDescription(service: Service, tier: Tier): string {
  return service.tierDescriptions?.[tier.id] ?? tier.description
}

export function getPaymentMethod(id: string | null | undefined): PaymentMethod | undefined {
  return PAYMENT_METHODS.find((m) => m.id === id)
}

export function isTiered(service: Service): boolean {
  return service.pricing.kind === 'tiered'
}

export function getQuantities(service: Service): number[] {
  return service.pricing.options.map((o) => o.quantity)
}

/**
 * Returns the price in cents for a combination, or null when the
 * combination does not exist in the catalog.
 */
export function getPriceCents(
  service: Service,
  tierId: TierId | null,
  quantity: number,
): number | null {
  if (service.pricing.kind === 'tiered') {
    if (!tierId) return null
    const option = service.pricing.options.find((o) => o.quantity === quantity)
    return option ? option.prices[tierId] : null
  }
  if (tierId) return null
  const option = service.pricing.options.find((o) => o.quantity === quantity)
  return option ? option.price : null
}

/** Lowest price in cents across the options that are offered. */
export function getStartingPriceCents(service: Service): number {
  if (service.pricing.kind === 'tiered') {
    const offered = TIERS.map((t) => t.id)
    return Math.min(
      ...service.pricing.options.flatMap((o) => offered.map((id) => o.prices[id])),
    )
  }
  return Math.min(...service.pricing.options.map((o) => o.price))
}

export function getServiceTitle(platform: Platform, service: Service): string {
  return `${platform.name} ${service.label}`
}
