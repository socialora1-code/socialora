/**
 * Socialora service catalog.
 *
 * Single source of truth for every platform, service, quantity, price and
 * note shown on the site. The checkout API recalculates order totals from
 * this file, so any price change made here applies everywhere.
 *
 * All prices are stored in US cents to avoid floating-point rounding issues.
 */

export type PlatformId = 'instagram' | 'tiktok' | 'youtube' | 'x' | 'telegram'
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
  | 'followers-real'
  | 'followers-hq'
  | 'followers-low-drop'
  | 'followers-mid'
  | 'followers-365'
  | 'followers-std'
  | 'subscribers-30'
  | 'views-lifetime'
  | 'autolikes-50'
  | 'autolikes-100'
  | 'autolikes-200'
  | 'autolikes-300'
  | 'autolikes-400'
  | 'autolikes-500'
  | 'autolikes-600'
  | 'autolikes-700'
  | 'autolikes-800'
  | 'autolikes-900'
  | 'members'
  | 'premium-7'
  | 'premium-14'
  | 'premium-30'
  | 'premium-60'
  | 'premium-90'
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
  /** Regular price (1,000-unit rate x quantity). Only set when a volume discount applies. */
  listPrice?: number
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
  /** Which supplier panel receives the order. Defaults to smmwiz. */
  panel?: 'smmwiz' | 'hepsisosyal'
  /** The panel needs only the username, not a link. */
  usernameOnly?: boolean
  /** Fixed package: one option, no quantity picker. */
  fixed?: boolean
  /** Short facts shown on the service card (start time, speed, range, requirements). */
  notes?: readonly string[]
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
const PRICE_YOUTUBE_VIEWS_LIFETIME = 500
const PRICE_YOUTUBE_WATCHTIME = 2800
const PRICE_YOUTUBE_SUBSCRIBERS = 4500
const PRICE_YOUTUBE_SUBSCRIBERS_30 = 6800
const PRICE_X_FOLLOWERS = 2200
const PRICE_X_FOLLOWERS_REFILL = 4200
const PRICE_X_FOLLOWERS_TOP = 9000
/** X views: $6.00 per 100,000 = 6 cents per 1,000. */
const PRICE_X_VIEWS = 6
const PRICE_INSTAGRAM_US_FOLLOWERS = 1800
const PRICE_INSTAGRAM_COUNTRY_FOLLOWERS = 4800
const PRICE_INSTAGRAM_REAL_FOLLOWERS = 1690
const PRICE_INSTAGRAM_MID_FOLLOWERS = 1000
const PRICE_INSTAGRAM_365_FOLLOWERS = 2000
const PRICE_INSTAGRAM_LIKES = 300
const PRICE_TIKTOK_FOLLOWERS_HQ = 2200
const PRICE_TIKTOK_FOLLOWERS_LOW_DROP = 2600
const PRICE_TIKTOK_FOLLOWERS_STD = 2400
const PRICE_TELEGRAM_MEMBERS = 1400
const PRICE_TELEGRAM_PREMIUM_7 = 1800
const PRICE_TELEGRAM_PREMIUM_14 = 3200
const PRICE_TELEGRAM_PREMIUM_30 = 5900
const PRICE_TELEGRAM_PREMIUM_60 = 9800
const PRICE_TELEGRAM_PREMIUM_90 = 17900

/* -------------------------------------------------------------------------- */
/*                               Editable notes                               */
/* -------------------------------------------------------------------------- */

const DELIVERY_NOTE = 'Starts as soon as your payment is verified.'

const FOLLOWER_REFILL_NOTE = '30-day refill guarantee if your follower count drops.'

const FOLLOWER_REFILL_365_NOTE = '365-day refill guarantee if your follower count drops.'

/* -------------------------------------------------------------------------- */
/*                                Price tables                                */
/* -------------------------------------------------------------------------- */

/** Volume discount: none up to 1,000, 5% from 2,000, 10% from 10,000. */
function volumeDiscount(quantity: number): number {
  if (quantity >= 10000) return 0.1
  if (quantity >= 2000) return 0.05
  return 0
}

/**
 * Builds flat options. Price per 1,000 units is given in US cents.
 * When a volume discount applies, the regular price is kept in listPrice.
 */
function flatOptions(quantities: readonly number[], per1000Cents: number, volume = true): FlatOption[] {
  return quantities.map((quantity) => {
    const list = Math.round((per1000Cents * quantity) / 1000)
    const price = volume ? Math.round(list * (1 - volumeDiscount(quantity))) : list
    return price < list ? { quantity, price, listPrice: list } : { quantity, price }
  })
}

/** Builds options from a fixed price table (quantity, price in whole dollars). */
function tableOptions(per1000Cents: number, rows: readonly (readonly [number, number])[]): FlatOption[] {
  return rows.map(([quantity, dollars]) => {
    const price = dollars * 100
    const list = Math.round((per1000Cents * quantity) / 1000)
    return price < list ? { quantity, price, listPrice: list } : { quantity, price }
  })
}

const FOLLOWER_QUANTITIES = [250, 500, 1000, 2000, 5000, 10000]
const US_FOLLOWER_QUANTITIES = [250, 500, 1000, 2000, 5000, 10000]
const INSTAGRAM_QUANTITIES = [250, 500, 1000, 2000, 5000, 10000, 20000, 50000, 100000]
const INSTAGRAM_REAL_QUANTITIES = [250, 500, 1000, 2000, 5000, 10000, 20000, 50000, 100000, 200000, 500000]
const INSTAGRAM_MID_QUANTITIES = [500, 1000, 2000, 5000, 10000, 20000]
const INSTAGRAM_365_QUANTITIES = [500, 1000, 2000, 5000, 10000, 20000, 50000, 100000, 200000, 500000]
const INSTAGRAM_LIKE_QUANTITIES = [1000, 2000, 5000, 10000, 20000, 50000]
const TIKTOK_STD_QUANTITIES = [250, 500, 1000, 2000]
const X_VIEW_QUANTITIES = [100000, 200000, 500000, 1000000, 5000000, 10000000]
const YOUTUBE_VIEW_QUANTITIES = [1000, 2000, 5000, 10000, 20000, 50000]
const YOUTUBE_VIEW_LIFETIME_QUANTITIES = [1000, 2000, 5000, 10000, 20000, 50000, 100000, 500000, 1000000]
const YOUTUBE_SUBSCRIBER_30_QUANTITIES = [250, 500, 1000, 2000, 5000, 10000, 30000]
const WATCHTIME_QUANTITIES = [1000, 2000, 4000]
const TELEGRAM_PREMIUM_QUANTITIES = [250, 500, 1000, 2000, 5000, 10000, 25000, 50000, 100000]

/** Telegram Members: small orders at the 1,000 rate, bigger orders from the supplier price table. */
const TELEGRAM_MEMBER_OPTIONS: FlatOption[] = [
  ...flatOptions([250, 500], PRICE_TELEGRAM_MEMBERS, false),
  ...tableOptions(PRICE_TELEGRAM_MEMBERS, [
    [1000, 14],
    [2000, 24],
    [5000, 48],
    [10000, 82],
    [20000, 140],
    [50000, 270],
    [100000, 440],
    [200000, 720],
  ]),
]

/* -------------------------------------------------------------------------- */
/*                        Instagram auto likes packages                       */
/* -------------------------------------------------------------------------- */

/** [panel service id, likes per post, price in US cents] */
const AUTO_LIKE_PACKAGES = [
  [798, 50, 800],
  [125, 100, 1400],
  [126, 200, 2500],
  [127, 300, 3400],
  [128, 400, 4200],
  [2269, 500, 4800],
  [1038, 600, 5300],
  [1037, 700, 5700],
  [1046, 800, 6000],
  [1045, 900, 6200],
] as const

function autoLikesService(panelServiceId: number, likes: number, priceCents: number): Service {
  return {
    id: `autolikes-${likes}` as ServiceId,
    label: `Auto Likes · +${likes} per post`,
    unit: 'package',
    target: 'profile',
    summary: `Adds ${likes} likes to every new post you publish over 30 days, for up to 50 posts. One fixed package, just enter your username.`,
    delivery: 'Setup within 0-5 hours of payment. Likes arrive within 0-24 hours of each new post.',
    refill: null,
    defaultQuantity: 1,
    pricing: { kind: 'flat', options: [{ quantity: 1, price: priceCents }] },
    panelServiceId,
    panel: 'hepsisosyal',
    usernameOnly: true,
    fixed: true,
    notes: [
      'Duration: 30 days, up to 50 posts',
      `Likes per post: +${likes}`,
      'Likes come from mixed global accounts',
      'Needs: public profile username',
      'Tell support if you change profile settings (private or business account)',
    ],
  }
}

/* -------------------------------------------------------------------------- */
/*                                  Platforms                                 */
/* -------------------------------------------------------------------------- */

export const PLATFORMS: readonly Platform[] = [
  {
    id: 'instagram',
    name: 'Instagram',
    path: '/instagram',
    tagline: 'Followers by country, plus likes',
    description:
      'Grow your Instagram profile with high-quality followers, followers from the country you choose, and likes for your posts.',
    profileFieldLabel: 'Instagram Profile URL',
    profilePlaceholder: 'https://instagram.com/yourprofile',
    allowedHosts: ['instagram.com', 'instagr.am'],
    services: [
      {
        id: 'followers-mid',
        label: 'Followers · Mid Quality',
        unit: 'followers',
        target: 'profile',
        summary: 'Mid-quality followers for your Instagram profile at a low price. No refill guarantee on this service.',
        delivery: DELIVERY_NOTE,
        refill: null,
        defaultQuantity: 1000,
        pricing: { kind: 'flat', options: flatOptions(INSTAGRAM_MID_QUANTITIES, PRICE_INSTAGRAM_MID_FOLLOWERS) },
        panelServiceId: 10470,
        panel: 'hepsisosyal',
        usernameOnly: true,
        notes: [
          'Starts in 0-1 hours',
          'Speed: up to 5,000 per day',
          'Order range: 500 - 20,000',
          'Needs: public profile username',
        ],
      },
      {
        id: 'followers-365',
        label: 'Followers · 365-Day Refill',
        unit: 'followers',
        target: 'profile',
        summary:
          'Followers for your Instagram profile at up to 50,000 per day, backed by a 365-day refill guarantee. Large orders welcome.',
        delivery: DELIVERY_NOTE,
        refill: FOLLOWER_REFILL_365_NOTE,
        defaultQuantity: 1000,
        pricing: { kind: 'flat', options: flatOptions(INSTAGRAM_365_QUANTITIES, PRICE_INSTAGRAM_365_FOLLOWERS) },
        panelServiceId: 7401,
        panel: 'hepsisosyal',
        usernameOnly: true,
        notes: [
          'Starts in 0-2 hours',
          'Speed: up to 50,000 per day',
          'Order range: 500 - 500,000',
          'Needs: public profile username',
        ],
      },
      {
        id: 'followers-real',
        label: 'Followers · Real Quality',
        unit: 'followers',
        target: 'profile',
        summary:
          'High-quality followers for your Instagram profile, from accounts with profile photos, posts and followers of their own, backed by a 365-day refill guarantee. Orders up to 500,000.',
        delivery: DELIVERY_NOTE,
        refill: FOLLOWER_REFILL_365_NOTE,
        defaultQuantity: 1000,
        pricing: { kind: 'flat', options: flatOptions(INSTAGRAM_REAL_QUANTITIES, PRICE_INSTAGRAM_REAL_FOLLOWERS) },
        panelServiceId: 21989,
      },
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
      {
        id: 'likes',
        label: 'Likes',
        unit: 'likes',
        target: 'post',
        summary:
          'Standard-quality likes for a public Instagram post or reel at a low price, with up to 50% extra likes added as a bonus. Minimum order 1,000.',
        delivery: DELIVERY_NOTE,
        refill: null,
        defaultQuantity: 1000,
        pricing: { kind: 'flat', options: flatOptions(INSTAGRAM_LIKE_QUANTITIES, PRICE_INSTAGRAM_LIKES) },
        panelServiceId: 19826,
      },
      ...AUTO_LIKE_PACKAGES.map(([panelServiceId, likes, priceCents]) =>
        autoLikesService(panelServiceId, likes, priceCents),
      ),
    ],
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    path: '/tiktok',
    tagline: 'Followers',
    description: 'Grow your TikTok profile with high-quality followers, backed by a 30-day refill guarantee.',
    profileFieldLabel: 'TikTok Profile URL',
    profilePlaceholder: 'https://tiktok.com/@yourprofile',
    allowedHosts: ['tiktok.com'],
    services: [
      {
        id: 'followers-hq',
        label: 'Followers · High Quality',
        unit: 'followers',
        target: 'profile',
        summary: 'High-quality followers for your TikTok profile, backed by a 30-day refill guarantee.',
        delivery: DELIVERY_NOTE,
        refill: FOLLOWER_REFILL_NOTE,
        defaultQuantity: 1000,
        pricing: { kind: 'flat', options: flatOptions(FOLLOWER_QUANTITIES, PRICE_TIKTOK_FOLLOWERS_HQ) },
        panelServiceId: 14882,
      },
      {
        id: 'followers-low-drop',
        label: 'Followers · Minimal Drop',
        unit: 'followers',
        target: 'profile',
        summary:
          'TikTok followers from accounts with quality profile photos, followers and posts of their own, with a minimal drop rate and a 30-day refill guarantee.',
        delivery: DELIVERY_NOTE,
        refill: FOLLOWER_REFILL_NOTE,
        defaultQuantity: 1000,
        pricing: { kind: 'flat', options: flatOptions(FOLLOWER_QUANTITIES, PRICE_TIKTOK_FOLLOWERS_LOW_DROP) },
        panelServiceId: 21951,
      },
      {
        id: 'followers-std',
        label: 'Followers · Standard',
        unit: 'followers',
        target: 'profile',
        summary: 'TikTok followers delivered at up to 1,000 per day, backed by a 30-day refill guarantee.',
        delivery: DELIVERY_NOTE,
        refill: FOLLOWER_REFILL_NOTE,
        defaultQuantity: 1000,
        pricing: { kind: 'flat', options: flatOptions(TIKTOK_STD_QUANTITIES, PRICE_TIKTOK_FOLLOWERS_STD) },
        panelServiceId: 10989,
        panel: 'hepsisosyal',
        notes: [
          'Starts in 0-1 hours',
          'Speed: up to 1,000 per day',
          'Order range: 250 - 2,000',
          'Needs: public profile link',
        ],
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
        id: 'views-lifetime',
        label: 'Views · Lifetime Refill',
        unit: 'views',
        target: 'video',
        summary: 'Views for a public YouTube video at up to 3,000 per day, with a lifetime refill guarantee.',
        delivery: DELIVERY_NOTE,
        refill: 'Lifetime refill guarantee if your view count drops.',
        defaultQuantity: 1000,
        pricing: { kind: 'flat', options: flatOptions(YOUTUBE_VIEW_LIFETIME_QUANTITIES, PRICE_YOUTUBE_VIEWS_LIFETIME) },
        panelServiceId: 10437,
        panel: 'hepsisosyal',
        notes: [
          'Starts in 0-4 hours',
          'Speed: up to 3,000 per day',
          'Order range: 1,000 - 1,000,000',
          'Needs: public video link',
        ],
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
      {
        id: 'subscribers-30',
        label: 'Subscribers · 30-Day Refill',
        unit: 'subscribers',
        target: 'channel',
        summary: 'Subscribers for your YouTube channel at up to 200 per day, backed by a 30-day refill guarantee.',
        delivery: DELIVERY_NOTE,
        refill: '30-day refill guarantee if your subscriber count drops.',
        defaultQuantity: 1000,
        pricing: {
          kind: 'flat',
          options: flatOptions(YOUTUBE_SUBSCRIBER_30_QUANTITIES, PRICE_YOUTUBE_SUBSCRIBERS_30),
        },
        panelServiceId: 7386,
        panel: 'hepsisosyal',
        notes: [
          'Starts in 0-6 hours',
          'Speed: up to 200 per day',
          'Order range: 250 - 30,000',
          'Needs: public channel link with at least one video of 4+ minutes',
        ],
      },
    ],
  },
  {
    id: 'x',
    name: 'X (Twitter)',
    path: '/x',
    tagline: 'Followers and views',
    description:
      'Grow your X (Twitter) profile with followers, and boost your tweets and videos with views.',
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
      {
        id: 'views',
        label: 'Views',
        unit: 'views',
        target: 'post',
        summary:
          'Fast-start views and impressions for a public tweet or video on X. Minimum order 100,000, priced per 100,000.',
        delivery: DELIVERY_NOTE,
        refill: null,
        defaultQuantity: 100000,
        pricing: { kind: 'flat', options: flatOptions(X_VIEW_QUANTITIES, PRICE_X_VIEWS, false) },
        panelServiceId: 18525,
      },
    ],
  },
  {
    id: 'telegram',
    name: 'Telegram',
    path: '/telegram',
    tagline: 'Members and channel subscribers',
    description:
      'Grow your Telegram channel or group with members, or add premium channel subscribers with views on your latest posts.',
    profileFieldLabel: 'Telegram Channel or Group Link',
    profilePlaceholder: 'https://t.me/yourchannel',
    allowedHosts: ['t.me', 'telegram.me'],
    services: [
      {
        id: 'members',
        label: 'Members',
        unit: 'members',
        target: 'channel',
        summary:
          'Members for your public Telegram channel or group, from mixed global accounts, backed by a 30-day refill guarantee. Bigger orders get a lower price per 1,000.',
        delivery: DELIVERY_NOTE,
        refill: '30-day refill guarantee. Covers orders placed while your starting count is low; earlier drops are not covered.',
        defaultQuantity: 1000,
        pricing: { kind: 'flat', options: TELEGRAM_MEMBER_OPTIONS },
        panelServiceId: 6681,
        panel: 'hepsisosyal',
        notes: [
          'Starts in 0-2 hours',
          'Speed: up to 10,000 per day',
          'Channel or group must be at least 3 days old',
          'Needs: public link, for example t.me/YourChannel',
        ],
      },
      {
        id: 'premium-7',
        label: 'Premium Subscribers · 7 Days',
        unit: 'subscribers',
        target: 'channel',
        summary:
          'Premium subscribers for your Telegram channel, with random views added to your latest posts. They stay in your channel for 7 days.',
        delivery: DELIVERY_NOTE,
        refill: null,
        defaultQuantity: 1000,
        pricing: { kind: 'flat', options: flatOptions(TELEGRAM_PREMIUM_QUANTITIES, PRICE_TELEGRAM_PREMIUM_7) },
        panelServiceId: 10896,
        panel: 'hepsisosyal',
        notes: [
          'Starts in 0-1 hours',
          'Mixed global quality, all accounts have profile photos',
          'Subscribers come from Telegram search',
          'Needs: channel link. Groups are not supported',
        ],
      },
      {
        id: 'premium-14',
        label: 'Premium Subscribers · 14 Days',
        unit: 'subscribers',
        target: 'channel',
        summary:
          'Premium subscribers for your Telegram channel, with random views added to your latest posts. They stay in your channel for 14 days.',
        delivery: DELIVERY_NOTE,
        refill: null,
        defaultQuantity: 1000,
        pricing: { kind: 'flat', options: flatOptions(TELEGRAM_PREMIUM_QUANTITIES, PRICE_TELEGRAM_PREMIUM_14) },
        panelServiceId: 10897,
        panel: 'hepsisosyal',
        notes: [
          'Starts in 0-1 hours',
          'Mixed global quality, all accounts have profile photos',
          'Subscribers come from Telegram search',
          'Needs: channel link. Groups are not supported',
        ],
      },
      {
        id: 'premium-30',
        label: 'Premium Subscribers · 30 Days',
        unit: 'subscribers',
        target: 'channel',
        summary:
          'Premium subscribers for your Telegram channel, with random views added to your latest posts. They stay in your channel for 30 days.',
        delivery: DELIVERY_NOTE,
        refill: null,
        defaultQuantity: 1000,
        pricing: { kind: 'flat', options: flatOptions(TELEGRAM_PREMIUM_QUANTITIES, PRICE_TELEGRAM_PREMIUM_30) },
        panelServiceId: 10898,
        panel: 'hepsisosyal',
        notes: [
          'Starts in 0-1 hours',
          'Mixed global quality, all accounts have profile photos',
          'Subscribers come from Telegram search',
          'Needs: channel link. Groups are not supported',
        ],
      },
      {
        id: 'premium-60',
        label: 'Premium Subscribers · 60 Days',
        unit: 'subscribers',
        target: 'channel',
        summary:
          'Premium subscribers for your Telegram channel, with random views added to your latest posts. They stay in your channel for 60 days.',
        delivery: DELIVERY_NOTE,
        refill: null,
        defaultQuantity: 1000,
        pricing: { kind: 'flat', options: flatOptions(TELEGRAM_PREMIUM_QUANTITIES, PRICE_TELEGRAM_PREMIUM_60) },
        panelServiceId: 10899,
        panel: 'hepsisosyal',
        notes: [
          'Starts in 0-1 hours',
          'Mixed global quality, all accounts have profile photos',
          'Subscribers come from Telegram search',
          'Needs: channel link. Groups are not supported',
        ],
      },
      {
        id: 'premium-90',
        label: 'Premium Subscribers · 90 Days',
        unit: 'subscribers',
        target: 'channel',
        summary:
          'Premium subscribers for your Telegram channel, with random views added to your latest posts. They stay in your channel for 90 days.',
        delivery: DELIVERY_NOTE,
        refill: null,
        defaultQuantity: 1000,
        pricing: { kind: 'flat', options: flatOptions(TELEGRAM_PREMIUM_QUANTITIES, PRICE_TELEGRAM_PREMIUM_90) },
        panelServiceId: 10900,
        panel: 'hepsisosyal',
        notes: [
          'Starts in 0-1 hours',
          'Mixed global quality, all accounts have profile photos',
          'Subscribers come from Telegram search',
          'Needs: channel link. Groups are not supported',
        ],
      },
    ],
  },
]

/* -------------------------------------------------------------------------- */
/*                               Payment methods                              */
/* -------------------------------------------------------------------------- */

export type PaymentMethodId =
  | 'nowpayments'
  | 'usdt-trc20'
  | 'usdt-bsc'
  | 'usdt-sol'
  | 'usdc-erc20'
  | 'btc'

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
    id: 'nowpayments',
    label: 'Pay automatically (crypto)',
    asset: 'Crypto',
    network: 'Choose your coin at checkout',
    address: '',
    warning: '',
  },
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

/**
 * Regular (undiscounted) price in cents, or null when no volume discount
 * applies to this quantity. Used to show a struck-through price.
 */
export function getListPriceCents(service: Service, quantity: number): number | null {
  if (service.pricing.kind !== 'flat') return null
  const option = service.pricing.options.find((o) => o.quantity === quantity)
  return option?.listPrice ?? null
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
