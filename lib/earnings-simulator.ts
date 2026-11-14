export type EarningsSimulatorId =
  | 'spotify-earnings'
  | 'facebook-earnings'
  | 'tiktok-coins'
  | 'youtube-earnings'
  | 'instagram-sponsorship'

export interface ScenarioOption {
  label: string
  multiplier: number
  sponsorMultiplier?: number
  volume?: string
  excludesSponsoredViews?: boolean
}

interface AdditionalIncome {
  affiliateTitle: string
  commissionLabel: string
  fixedMonthlyLabel?: string
}

interface EarningsSimulatorConfig {
  platform: string
  volume: string
  release: string
  followers: number
  engagementLabel: string
  conversionLabel?: string
  defaultVolume: number
  rateUnit: number
  rateLabel: string
  defaultRates: [number, number]
  selectors: { label: string; options: ScenarioOption[] }[]
  sideTitle: string
  sideRateLabel: string
  sideRateUnit: number
  sideNote: string
  additionalIncome?: AdditionalIncome
  payoutTitle: string
  payoutNote: string
  source: string
}

export const AUDIENCE_REGIONS: ScenarioOption[] = [
  { label: 'Tier 2: Global mix (Latin America, Eastern Europe, Asia)', multiplier: 1 },
  { label: 'Tier 1: US, UK, Canada, Australia, Western Europe', multiplier: 1.35 },
  { label: 'Tier 3: High-volume developing markets', multiplier: 0.6 },
]

export const EARNINGS_SIMULATORS: Record<EarningsSimulatorId, EarningsSimulatorConfig> = {
  'spotify-earnings': {
    platform: 'Spotify',
    volume: 'streams',
    release: 'release',
    followers: 10000,
    engagementLabel: 'Engaged followers (%)',
    conversionLabel: 'Engaged followers who buy merch (%)',
    defaultVolume: 50000,
    rateUnit: 1,
    rateLabel: 'payout per stream',
    defaultRates: [0.003, 0.005],
    selectors: [
      {
        label: 'Listener mix',
        options: [
          { label: 'Balanced listener mix', multiplier: 1 },
          { label: 'Premium-heavy', multiplier: 1.25 },
          { label: 'Free / ad-supported-heavy', multiplier: 0.65 },
        ],
      },
      {
        label: 'Your royalty share',
        options: [
          { label: 'Independent artist (keep 100%)', multiplier: 1 },
          { label: 'Label split 50/50 (keep 50%)', multiplier: 0.5 },
          { label: 'Producer cut 20% (keep 80%)', multiplier: 0.8 },
        ],
      },
    ],
    sideTitle: 'Merch & superfan income',
    sideRateLabel: 'Net profit per merch order ($)',
    sideRateUnit: 1,
    sideNote: 'Enter your profit after costs. The model applies your engagement and purchase rates to the smaller of followers and streams. Playlist pitching can help discovery. This card counts merch income.',
    payoutTitle: 'Estimated Spotify royalties',
    payoutNote: 'Spotify pays royalties based on streamshare. Use your distributor data to set a baseline before splits, then apply your share and scenario adjustments.',
    source: 'https://loudandclear.byspotify.com/faq/',
  },
  'facebook-earnings': {
    platform: 'Facebook',
    volume: 'qualified views',
    release: 'video',
    followers: 10000,
    engagementLabel: 'Engaged followers (%)',
    defaultVolume: 50000,
    rateUnit: 1000,
    rateLabel: 'earnings per 1,000 views',
    defaultRates: [1, 4],
    selectors: [
      {
        label: 'Content niche',
        options: [
          { label: 'Lifestyle & Vlog', multiplier: 1 },
          { label: 'Finance & Business', multiplier: 1.6 },
          { label: 'Tech & SaaS', multiplier: 1.35 },
          { label: 'Gaming', multiplier: 0.85 },
          { label: 'Entertainment & Memes', multiplier: 0.7 },
        ],
      },
      {
        label: 'Video format',
        options: [
          { label: 'Long-form video (In-Stream Ads scenario)', multiplier: 1 },
          { label: 'Reels (Reels Bonus scenario)', multiplier: 0.45 },
        ],
      },
    ],
    sideTitle: 'Brand deal / sponsored post',
    sideRateLabel: 'Sponsor fee per 1,000 engaged followers ($)',
    sideRateUnit: 1000,
    sideNote: 'Use your own quoted fee. The model applies your engagement rate to the smaller of followers and views. Enter 0 to exclude sponsorship.',
    payoutTitle: 'Estimated Facebook ad revenue',
    payoutNote: 'Facebook Content Monetization uses qualified views and content performance. The format labels are scenario presets. Your dashboard shows your actual earnings rate.',
    source: 'https://about.fb.com/news/2026/03/creator-fast-track-grow-your-audience-earn-money-on-facebook/',
  },
  'tiktok-coins': {
    platform: 'TikTok',
    volume: 'views',
    release: 'video',
    followers: 10000,
    engagementLabel: 'Engagement rate (%)',
    defaultVolume: 50000,
    rateUnit: 1000,
    rateLabel: 'eligible earnings per 1,000 views',
    defaultRates: [0.2, 0.8],
    selectors: [
      {
        label: 'Program / format',
        options: [
          { label: 'Creator Rewards Program (1+ min, qualified views)', multiplier: 1, volume: 'qualified views', excludesSponsoredViews: true },
          { label: 'TikTok Pulse (top 4% content)', multiplier: 1.2, volume: 'Pulse-eligible views' },
          { label: 'Standard Short Feed', multiplier: 0 },
        ],
      },
      {
        label: 'Content niche',
        options: [
          { label: 'Entertainment & Memes', multiplier: 1, sponsorMultiplier: 1 },
          { label: 'Finance & Business', multiplier: 1.4, sponsorMultiplier: 1.4 },
          { label: 'Tech & AI', multiplier: 1.25, sponsorMultiplier: 1.25 },
          { label: 'Beauty & Fashion', multiplier: 1.15, sponsorMultiplier: 1.3 },
          { label: 'Gaming', multiplier: 0.9, sponsorMultiplier: 0.9 },
        ],
      },
    ],
    sideTitle: 'Sponsored video (brand deal)',
    sideRateLabel: 'Sponsor fee per 1,000 engaged followers ($)',
    sideRateUnit: 1000,
    sideNote: 'Enter a quoted fee and the share of posts you expect to sponsor. Shop estimates use your order conversion and commission per order.',
    additionalIncome: {
      affiliateTitle: 'TikTok Shop affiliate commission',
      commissionLabel: 'TikTok Shop commission per order ($)',
    },
    payoutTitle: 'Estimated TikTok program revenue',
    payoutNote: 'Use your dashboard rate. Creator Rewards counts qualified views on eligible original videos over one minute. This model removes the sponsored share from those views. Pulse models a separate scenario for eligible accounts. Standard Short Feed models zero direct payout.',
    source: 'https://support.tiktok.com/en/business-and-creator/creator-rewards-program/creator-rewards-program',
  },
  'youtube-earnings': {
    platform: 'YouTube',
    volume: 'views',
    release: 'video',
    followers: 10000,
    engagementLabel: 'Engagement rate (%)',
    defaultVolume: 50000,
    rateUnit: 1000,
    rateLabel: 'ad earnings per 1,000 views',
    defaultRates: [1, 5],
    selectors: [
      {
        label: 'Video format',
        options: [
          { label: 'Long-Form Watch Page Ads', multiplier: 1, sponsorMultiplier: 1 },
          { label: 'Mixed Channel (Long-Form + Shorts)', multiplier: 0.55, sponsorMultiplier: 0.85 },
          { label: 'YouTube Shorts Feed', multiplier: 0.08, sponsorMultiplier: 0.55 },
        ],
      },
      {
        label: 'Content niche',
        options: [
          { label: 'Lifestyle & Vlog', multiplier: 1, sponsorMultiplier: 1 },
          { label: 'Finance & Investing', multiplier: 1.6, sponsorMultiplier: 1.5 },
          { label: 'Tech & SaaS', multiplier: 1.35, sponsorMultiplier: 1.35 },
          { label: 'Education & How-To', multiplier: 1.15, sponsorMultiplier: 1.15 },
          { label: 'Gaming', multiplier: 0.85, sponsorMultiplier: 0.9 },
        ],
      },
    ],
    sideTitle: '60-second integrated brand read',
    sideRateLabel: 'Brand read fee per 1,000 engaged subscribers ($)',
    sideRateUnit: 1000,
    sideNote: 'For mixed or Shorts channels, enter the share of uploads that are suitable for a 60-second brand read. Enter recurring membership revenue once per month.',
    additionalIncome: {
      affiliateTitle: 'Affiliate commission',
      commissionLabel: 'Affiliate commission per order ($)',
      fixedMonthlyLabel: 'Channel memberships',
    },
    payoutTitle: 'Estimated YouTube ad revenue',
    payoutNote: 'Watch Page Ads and Shorts Feed Ads use separate monetization modules. The mixed preset uses an illustrative blend. Use ad earnings from YouTube Studio as your baseline and keep memberships separate.',
    source: 'https://support.google.com/youtube/answer/94522',
  },
  'instagram-sponsorship': {
    platform: 'Instagram',
    volume: 'views',
    release: 'post',
    followers: 10000,
    engagementLabel: 'Engagement rate (%)',
    defaultVolume: 50000,
    rateUnit: 1000,
    rateLabel: 'platform earnings per 1,000 views',
    defaultRates: [0, 0],
    selectors: [
      {
        label: 'Content / sponsorship format',
        options: [
          { label: 'Reels + Feed Carousel Mix', multiplier: 1, sponsorMultiplier: 1 },
          { label: 'Reels-focused', multiplier: 1.15, sponsorMultiplier: 1.15 },
          { label: 'Story sponsorship bundle (Reel + 3 Story Frames)', multiplier: 1, sponsorMultiplier: 1.4 },
        ],
      },
      {
        label: 'Content niche',
        options: [
          { label: 'Creator & Business', multiplier: 1, sponsorMultiplier: 1 },
          { label: 'Beauty & Skincare', multiplier: 1.2, sponsorMultiplier: 1.3 },
          { label: 'Fitness & Wellness', multiplier: 1.1, sponsorMultiplier: 1.15 },
          { label: 'Fashion & Luxury', multiplier: 1.25, sponsorMultiplier: 1.4 },
          { label: 'Theme Page / Meme', multiplier: 0.65, sponsorMultiplier: 0.7 },
        ],
      },
    ],
    sideTitle: 'Brand deal (sponsored post / Reel)',
    sideRateLabel: 'Sponsor fee per 1,000 engaged followers ($)',
    sideRateUnit: 1000,
    sideNote: 'Use a quoted post or Reel sponsorship fee as the baseline. Enter monthly UGC fees separately for content you produce for brands.',
    additionalIncome: {
      affiliateTitle: 'Affiliate commission',
      commissionLabel: 'Affiliate commission per order ($)',
      fixedMonthlyLabel: 'UGC fees',
    },
    payoutTitle: 'Estimated Instagram platform revenue',
    payoutNote: 'Use your own eligible payout history from Professional Dashboard to model platform income. Use the additional income card to estimate brand deals, affiliate sales and UGC.',
    source: 'https://about.fb.com/news/2023/02/earn-money-on-instagram-with-gifts/',
  },
}

export function isEarningsSimulator(id: string): id is EarningsSimulatorId {
  return Object.hasOwn(EARNINGS_SIMULATORS, id)
}

interface EarningsScenario {
  volume: number
  followers: number
  audienceRate: number
  conversionRate: number
  sideRate: number
  sponsoredShare: number
  sponsorMultiplier: number
  excludesSponsoredViews: boolean
  affiliateConversion: number
  commission: number
  fixedMonthlyIncome: number
  lowRate: number
  highRate: number
  rateMultiplier: number
  cadence: number
  period: 'week' | 'month'
  basis: 'item' | 'month'
}

export function projectEarnings(config: EarningsSimulatorConfig, scenario: EarningsScenario) {
  const {
    volume, followers, audienceRate, conversionRate, sideRate, sponsoredShare, sponsorMultiplier,
    affiliateConversion, commission, fixedMonthlyIncome, lowRate, highRate, rateMultiplier, excludesSponsoredViews,
    cadence, period, basis,
  } = scenario
  const per30Days = basis === 'month' ? 1 : cadence * (period === 'week' ? 30 / 7 : 1)
  const perYear = basis === 'month' ? 12 : cadence * (period === 'week' ? 52 : 12)

  const eligibleVolume = excludesSponsoredViews ? volume * (1 - sponsoredShare / 100) : volume
  const platformUnits = (eligibleVolume / config.rateUnit) * rateMultiplier
  const min = platformUnits * Math.min(lowRate, highRate)
  const max = platformUnits * Math.max(lowRate, highRate)
  const average = (min + max) / 2
  const activeAudience = Math.min(volume, followers) * audienceRate / 100
  const sideIncome = activeAudience / config.sideRateUnit * sideRate * conversionRate / 100 * sponsoredShare / 100 * sponsorMultiplier
  const affiliateIncome = activeAudience * affiliateConversion / 100 * commission
  const total = average + sideIncome + affiliateIncome

  return {
    platform: { min: min * per30Days, average: average * per30Days, max: max * per30Days },
    sideIncome: sideIncome * per30Days,
    affiliateIncome: affiliateIncome * per30Days,
    fixedMonthlyIncome,
    total30Days: total * per30Days + fixedMonthlyIncome,
    totalYear: total * perYear + fixedMonthlyIncome * 12,
  }
}
