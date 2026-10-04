/**
 * Socialora service catalog.
 *
 * This is the single source of truth for every platform, service, tier,
 * quantity, price, delivery note and refill note shown on the site.
 * The checkout API also recalculates order totals from this file, so any
 * price change made here applies everywhere automatically.
 *
 * All prices are stored in US cents to avoid floating-point rounding issues.
 */

export type PlatformId = 'instagram' | 'tiktok' | 'youtube'
export type ServiceId = 'followers' | 'likes' | 'views' | 'subscribers'
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
    description: 'High-quality USA followers with a minimal drop rate',
    emphasized: false,
  },
  {
    id: 'premium',
    name: 'Premium',
    badge: 'Recommended',
    description:
      'Premium USA followers with their own posts and followers. Minimal drop, and replacement deliveries are made if any occur',
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
/*                               Editable notes                               */
/* -------------------------------------------------------------------------- */

const DELIVERY_NOTE =
  'Starts after your payment is manually verified. Timing varies with order size.'

const FOLLOWER_REFILL_NOTE =
  'If your count drops after delivery, contact support and we will review your order.'

/* -------------------------------------------------------------------------- */
/*                                Price tables                                */
/* -------------------------------------------------------------------------- */

/** Builds tiered options. Prices per 100 units are given in US cents. */
function tieredOptions(
  quantities: readonly number[],
  per100Cents: Record<TierId, number>,
): TieredOption[] {
  return quantities.map((quantity) => ({
    quantity,
    prices: {
      'high-quality': Math.round((per100Cents['high-quality'] * quantity) / 100),
      premium: Math.round((per100Cents.premium * quantity) / 100),
      vip: Math.round((per100Cents.vip * quantity) / 100),
    },
  }))
}

/** Builds flat options. Price per 1,000 units is given in US cents. */
function flatOptions(quantities: readonly number[], per1000Cents: number): FlatOption[] {
  return quantities.map((quantity) => ({
    quantity,
    price: Math.round((per1000Cents * quantity) / 1000),
  }))
}

const FOLLOWER_QUANTITIES = [
  100, 250, 500, 1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000,
]

const LIKE_QUANTITIES = [1000, 2000, 5000, 10000, 20000, 50000, 100000]

const VIEW_QUANTITIES = [
  1000, 2000, 5000, 10000, 20000, 50000, 100000, 250000, 500000, 1000000,
]

// Instagram / TikTok followers, price per 100: High-Quality $3, Premium $5
// (the "vip" value is unused because VIP is not offered)
const FOLLOWER_OPTIONS: readonly TieredOption[] = tieredOptions(FOLLOWER_QUANTITIES, {
  'high-quality': 300,
  premium: 500,
  vip: 500,
})

// YouTube subscribers, price per 100: High-Quality $6, Premium $10
const YOUTUBE_SUBSCRIBER_OPTIONS: readonly TieredOption[] = tieredOptions(
  FOLLOWER_QUANTITIES,
  {
    'high-quality': 600,
    premium: 1000,
    vip: 1000,
  },
)

// Likes: $7.99 per 1,000
const LIKE_OPTIONS: readonly FlatOption[] = flatOptions(LIKE_QUANTITIES, 799)

// Views: $4.99 per 1,000
const VIEW_OPTIONS: readonly FlatOption[] = flatOptions(VIEW_QUANTITIES, 499)

// YouTube views: $9.99 per 1,000
const YOUTUBE_VIEW_OPTIONS: readonly FlatOption[] = flatOptions(VIEW_QUANTITIES, 999)

/* -------------------------------------------------------------------------- */
/*                                  Platforms                                 */
/* -------------------------------------------------------------------------- */

export const PLATFORMS: readonly Platform[] = [
  {
    id: 'instagram',
    name: 'Instagram',
    path: '/instagram',
    tagline: 'Followers, likes and views',
    description:
      'Grow your Instagram presence with followers for your profile and likes or views for your posts and Reels.',
    profileFieldLabel: 'Instagram Profile URL',
    profilePlaceholder: 'https://instagram.com/yourprofile',
    allowedHosts: ['instagram.com', 'instagr.am'],
    services: [
      {
        id: 'followers',
        label: 'Followers',
        unit: 'followers',
        target: 'profile',
        summary: 'Choose a tier and quantity for your Instagram profile.',
        delivery: DELIVERY_NOTE,
        refill: FOLLOWER_REFILL_NOTE,
        defaultQuantity: 1000,
        pricing: { kind: 'tiered', options: FOLLOWER_OPTIONS },
        tierDescriptions: {
          'high-quality': 'High-quality USA followers with a minimal drop rate',
          premium:
            'Premium USA followers with their own posts and followers. Minimal drop, and replacement deliveries are made if any occur',
        },
      },
      {
        id: 'likes',
        label: 'Likes',
        unit: 'likes',
        target: 'post',
        summary: 'Likes for a single public Instagram post or Reel.',
        delivery: DELIVERY_NOTE,
        refill: null,
        defaultQuantity: 1000,
        pricing: { kind: 'flat', options: LIKE_OPTIONS },
      },
      {
        id: 'views',
        label: 'Views',
        unit: 'views',
        target: 'post',
        summary: 'Views for a single public Instagram Reel or video.',
        delivery: DELIVERY_NOTE,
        refill: null,
        defaultQuantity: 1000,
        pricing: { kind: 'flat', options: VIEW_OPTIONS },
      },
    ],
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    path: '/tiktok',
    tagline: 'Followers, likes and views',
    description:
      'Build momentum on TikTok with followers for your account and likes or views for your videos.',
    profileFieldLabel: 'TikTok Profile URL',
    profilePlaceholder: 'https://tiktok.com/@yourprofile',
    allowedHosts: ['tiktok.com'],
    services: [
      {
        id: 'followers',
        label: 'Followers',
        unit: 'followers',
        target: 'profile',
        summary: 'Choose a tier and quantity for your TikTok account.',
        delivery: DELIVERY_NOTE,
        refill: FOLLOWER_REFILL_NOTE,
        defaultQuantity: 1000,
        pricing: { kind: 'tiered', options: FOLLOWER_OPTIONS },
        tierDescriptions: {
          'high-quality': 'High-quality USA followers with a minimal drop rate',
          premium:
            'Premium USA followers with their own videos and followers. Minimal drop, and replacement deliveries are made if any occur',
        },
      },
      {
        id: 'likes',
        label: 'Likes',
        unit: 'likes',
        target: 'video',
        summary: 'Likes for a single public TikTok video.',
        delivery: DELIVERY_NOTE,
        refill: null,
        defaultQuantity: 1000,
        pricing: { kind: 'flat', options: LIKE_OPTIONS },
      },
      {
        id: 'views',
        label: 'Views',
        unit: 'views',
        target: 'video',
        summary: 'Views for a single public TikTok video.',
        delivery: DELIVERY_NOTE,
        refill: null,
        defaultQuantity: 1000,
        pricing: { kind: 'flat', options: VIEW_OPTIONS },
      },
    ],
  },
  {
    id: 'youtube',
    name: 'YouTube',
    path: '/youtube',
    tagline: 'Subscribers and views',
    description:
      'Support your YouTube channel with subscribers for your channel and views for your videos.',
    profileFieldLabel: 'YouTube Profile URL',
    profilePlaceholder: 'https://youtube.com/@yourchannel',
    allowedHosts: ['youtube.com', 'youtu.be'],
    services: [
      {
        id: 'subscribers',
        label: 'Subscribers',
        unit: 'subscribers',
        target: 'channel',
        summary: 'Choose a tier and quantity for your YouTube channel.',
        delivery: DELIVERY_NOTE,
        refill: FOLLOWER_REFILL_NOTE,
        defaultQuantity: 1000,
        pricing: { kind: 'tiered', options: YOUTUBE_SUBSCRIBER_OPTIONS },
        tierDescriptions: {
          'high-quality': 'High-quality USA subscribers with a minimal drop rate',
          premium:
            'Premium USA subscribers with channels of their own. Minimal drop, and replacement deliveries are made if any occur',
        },
      },
      {
        id: 'views',
        label: 'Views',
        unit: 'views',
        target: 'video',
        summary: 'Views for a single public YouTube video.',
        delivery: DELIVERY_NOTE,
        refill: null,
        defaultQuantity: 1000,
        pricing: { kind: 'flat', options: YOUTUBE_VIEW_OPTIONS },
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

/** Lowest price in cents across the tiers that are offered. */
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
