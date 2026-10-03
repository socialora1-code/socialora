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
    description: 'Accounts with photos and posts',
    emphasized: false,
  },
  {
    id: 'premium',
    name: 'Premium',
    badge: 'Recommended',
    description: 'Real, active accounts that look natural',
    emphasized: true,
  },
  {
    id: 'vip',
    name: 'VIP',
    badge: 'Exclusive',
    description: 'Real, active and targeted',
    emphasized: false,
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

const FOLLOWER_OPTIONS: readonly TieredOption[] = [
  { quantity: 100, prices: { 'high-quality': 599, premium: 799, vip: 999 } },
  { quantity: 250, prices: { 'high-quality': 1499, premium: 1999, vip: 2499 } },
  { quantity: 500, prices: { 'high-quality': 2999, premium: 3999, vip: 4999 } },
  { quantity: 1000, prices: { 'high-quality': 5999, premium: 7999, vip: 9999 } },
  { quantity: 2000, prices: { 'high-quality': 11999, premium: 15999, vip: 19999 } },
  { quantity: 5000, prices: { 'high-quality': 29999, premium: 39999, vip: 49999 } },
  { quantity: 10000, prices: { 'high-quality': 59999, premium: 79999, vip: 99999 } },
  { quantity: 20000, prices: { 'high-quality': 119999, premium: 159999, vip: 199999 } },
]

const YOUTUBE_SUBSCRIBER_OPTIONS: readonly TieredOption[] = [
  { quantity: 100, prices: { 'high-quality': 899, premium: 1199, vip: 1499 } },
  { quantity: 250, prices: { 'high-quality': 2248, premium: 2998, vip: 3748 } },
  { quantity: 500, prices: { 'high-quality': 4495, premium: 5995, vip: 7495 } },
  { quantity: 1000, prices: { 'high-quality': 8990, premium: 11990, vip: 14990 } },
  { quantity: 2000, prices: { 'high-quality': 17980, premium: 23980, vip: 29980 } },
  { quantity: 5000, prices: { 'high-quality': 44950, premium: 59950, vip: 74950 } },
  { quantity: 10000, prices: { 'high-quality': 89900, premium: 119900, vip: 149900 } },
]

const LIKE_OPTIONS: readonly FlatOption[] = [
  { quantity: 1000, price: 799 },
  { quantity: 2000, price: 1598 },
  { quantity: 5000, price: 3995 },
  { quantity: 10000, price: 7990 },
  { quantity: 20000, price: 15980 },
]

const VIEW_OPTIONS: readonly FlatOption[] = [
  { quantity: 1000, price: 499 },
  { quantity: 2000, price: 998 },
  { quantity: 5000, price: 2495 },
  { quantity: 10000, price: 4990 },
  { quantity: 20000, price: 9980 },
  { quantity: 50000, price: 24950 },
  { quantity: 100000, price: 49900 },
]

const YOUTUBE_VIEW_OPTIONS: readonly FlatOption[] = [
  { quantity: 1000, price: 999 },
  { quantity: 2000, price: 1998 },
  { quantity: 5000, price: 4995 },
  { quantity: 10000, price: 9990 },
  { quantity: 20000, price: 19980 },
  { quantity: 50000, price: 49950 },
  { quantity: 100000, price: 99900 },
]

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

/** Lowest price in cents across all options of a service. */
export function getStartingPriceCents(service: Service): number {
  if (service.pricing.kind === 'tiered') {
    return Math.min(
      ...service.pricing.options.flatMap((o) => Object.values(o.prices)),
    )
  }
  return Math.min(...service.pricing.options.map((o) => o.price))
}

export function getServiceTitle(platform: Platform, service: Service): string {
  return `${platform.name} ${service.label}`
}
