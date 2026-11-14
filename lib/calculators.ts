export interface CalcField {
  id: string
  label: string
  placeholder: string
  defaultValue?: string
}

export interface CalcResult {
  headline: string
  sub?: string
  lines?: [string, string][]
  note?: string
}

export interface CalcConfig {
  fields: CalcField[]
  empty: string
  compute: (values: Record<string, number>) => CalcResult | null
}

const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
const usd2 = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const ok = (n: number) => !Number.isNaN(n)
const opt = (n: number) => (Number.isNaN(n) ? 0 : n)

function engagementConfig(audience: CalcField, metrics: CalcField[], bands: [number, number, number]): CalcConfig {
  return {
    fields: [audience, ...metrics],
    empty: `Enter your ${audience.label.toLowerCase()} and your average interactions to see your engagement rate.`,
    compute: (v) => {
      const base = v[audience.id]
      if (!(base > 0)) return null
      if (!ok(v[metrics[0].id])) return null
      const total = metrics.reduce((sum, m) => sum + opt(v[m.id]), 0)
      const rate = (total / base) * 100
      const [low, mid, high] = bands
      const label = rate < low ? 'Low' : rate < mid ? 'Average' : rate < high ? 'Good' : 'High'
      return {
        headline: `${rate.toFixed(2)}%`,
        sub: label,
        note: 'Rates vary by niche and usually fall as accounts grow. Treat the label as a rule of thumb, not a verdict.',
      }
    },
  }
}

export const CALCULATORS: Record<string, CalcConfig> = {
  'twitch-earnings': {
    fields: [
      { id: 'subs', label: 'Paid subscribers', placeholder: 'e.g. 100' },
      { id: 'pay', label: 'Your payout per subscriber ($)', placeholder: 'e.g. 2.50', defaultValue: '2.50' },
      { id: 'bits', label: 'Bits cheered per month (optional)', placeholder: 'e.g. 5000' },
    ],
    empty: 'Enter your subscribers or monthly Bits to see an estimate.',
    compute: (v) => {
      if (!ok(v.subs) && !ok(v.bits)) return null
      const pay = ok(v.pay) ? v.pay : 0
      const fromSubs = opt(v.subs) * pay
      const fromBits = opt(v.bits) * 0.01
      const total = fromSubs + fromBits
      return {
        headline: usd2.format(total),
        sub: 'Estimated per month',
        lines: [
          ['From subscriptions', usd2.format(fromSubs)],
          ['From Bits', usd2.format(fromBits)],
          ['Estimated per year', usd2.format(total * 12)],
        ],
        note: 'Ads, sponsorships and donations are not included. Your real payout per subscriber depends on your agreement with Twitch, so check your own dashboard and replace the example number.',
      }
    },
  },
  'tiktok-engagement': engagementConfig(
    { id: 'followers', label: 'Followers', placeholder: 'e.g. 10000' },
    [
      { id: 'likes', label: 'Average likes per video', placeholder: 'e.g. 500' },
      { id: 'comments', label: 'Average comments per video', placeholder: 'e.g. 20' },
      { id: 'shares', label: 'Average shares per video (optional)', placeholder: 'e.g. 10' },
    ],
    [2, 5, 10],
  ),
  'x-engagement': engagementConfig(
    { id: 'followers', label: 'Followers', placeholder: 'e.g. 5000' },
    [
      { id: 'likes', label: 'Average likes per post', placeholder: 'e.g. 40' },
      { id: 'replies', label: 'Average replies per post', placeholder: 'e.g. 5' },
      { id: 'reposts', label: 'Average reposts per post (optional)', placeholder: 'e.g. 3' },
    ],
    [0.5, 1, 3],
  ),
  'youtube-engagement': engagementConfig(
    { id: 'subscribers', label: 'Subscribers', placeholder: 'e.g. 8000' },
    [
      { id: 'likes', label: 'Average likes per video', placeholder: 'e.g. 300' },
      { id: 'comments', label: 'Average comments per video', placeholder: 'e.g. 25' },
    ],
    [1, 3, 6],
  ),
  'tiktok-coins': {
    fields: [
      { id: 'coins', label: 'TikTok Coins or Gift value (Coins)', placeholder: 'e.g. 5000' },
      { id: 'diamonds', label: 'Or Diamonds in your creator balance (optional)', placeholder: 'e.g. 2500' },
    ],
    empty: 'Enter TikTok Coins (e.g. 1,000 coins or 29,999 for a Lion gift) to see buyer cost and creator USD payout.',
    compute: (v) => {
      const coins = ok(v.coins) && v.coins > 0 ? v.coins : ok(v.diamonds) && v.diamonds > 0 ? v.diamonds * 2 : 0
      if (!(coins > 0)) return null
      const diamonds = coins / 2
      const creatorUsd = diamonds * 0.005
      const webBuyerCost = coins * 0.0106
      const appBuyerCost = coins * 0.0148
      return {
        headline: usd2.format(creatorUsd),
        sub: 'Estimated Creator Payout (USD after TikTok ~50% cut)',
        lines: [
          ['TikTok Coins', Math.round(coins).toLocaleString('en-US')],
          ['Equivalent Creator Diamonds', Math.round(diamonds).toLocaleString('en-US')],
          ['Viewer recharge cost on TikTok.com/coin (Web)', usd2.format(webBuyerCost)],
          ['Viewer recharge cost in iOS / Android App', usd2.format(appBuyerCost)],
        ],
        note: 'Creators receive roughly 50% of the coin value via Diamonds ($0.005 per Diamond / ~$5 per 1,000 Coins). Buying coins on TikTok Web is up to 25-30% cheaper than in-app purchases.',
      }
    },
  },
  'instagram-sponsorship': {
    fields: [
      { id: 'followers', label: 'Instagram Followers', placeholder: 'e.g. 25000' },
      { id: 'likes', label: 'Average likes per post / Reel', placeholder: 'e.g. 900' },
      { id: 'comments', label: 'Average comments per post / Reel', placeholder: 'e.g. 35' },
    ],
    empty: 'Enter your followers, average likes and comments to estimate your Instagram sponsorship rate per post, Reel and Story.',
    compute: (v) => {
      if (!(v.followers > 0) || !ok(v.likes)) return null
      const eng = v.likes + opt(v.comments)
      const er = (eng / v.followers) * 100
      const baseLow = (v.followers / 1000) * 8 + eng * 0.08
      const baseHigh = (v.followers / 1000) * 15 + eng * 0.18
      const low = Math.max(25, baseLow)
      const high = Math.max(50, baseHigh)
      return {
        headline: `${usd.format(low)} - ${usd.format(high)}`,
        sub: `Estimated Sponsored Reel / Feed Post Rate (${er.toFixed(2)}% Engagement)`,
        lines: [
          ['Sponsored Reel (15-60s)', `${usd.format(low * 1.15)} - ${usd.format(high * 1.25)}`],
          ['3-Frame Story Set with Link Sticker', `${usd.format(low * 0.35)} - ${usd.format(high * 0.45)}`],
          ['Reel + Story Bundle Package', `${usd.format(low * 1.35)} - ${usd.format(high * 1.5)}`],
        ],
        note: 'Brand deals depend on your niche (finance, tech and beauty pay higher CPMs), audience location and usage rights. Stronger view and follower numbers directly increase your negotiating floor.',
      }
    },
  },
  'telegram-earnings': {
    fields: [
      { id: 'subscribers', label: 'Channel Subscribers', placeholder: 'e.g. 15000' },
      { id: 'views', label: 'Average 24-hour views per post', placeholder: 'e.g. 3500' },
      { id: 'cpm', label: 'Niche CPM per 1,000 post views ($)', placeholder: 'e.g. 12', defaultValue: '12' },
    ],
    empty: 'Enter your Telegram channel subscribers and 24-hour post views to estimate sponsored post price and monthly ad revenue.',
    compute: (v) => {
      if (!(v.views > 0)) return null
      const cpm = ok(v.cpm) && v.cpm > 0 ? v.cpm : 12
      const postPriceLow = Math.max(10, (v.views / 1000) * (cpm * 0.8))
      const postPriceHigh = Math.max(20, (v.views / 1000) * (cpm * 1.3))
      const reachPct = v.subscribers > 0 ? ((v.views / v.subscribers) * 100).toFixed(1) : 'N/A'
      return {
        headline: `${usd2.format(postPriceLow)} - ${usd2.format(postPriceHigh)}`,
        sub: 'Estimated Price per 24h Sponsored Post',
        lines: [
          ['10 Sponsored Posts / Month', `${usd.format(postPriceLow * 10)} - ${usd.format(postPriceHigh * 10)}`],
          ['20 Sponsored Posts / Month', `${usd.format(postPriceLow * 20)} - ${usd.format(postPriceHigh * 20)}`],
          ['24h View-to-Subscriber Ratio', `${reachPct}%`],
        ],
        note: 'Crypto, finance and B2B Telegram channels command $15-$40+ CPM, while general entertainment averages $4-$10 CPM. Growing active members and consistent post views raises your ad rate.',
      }
    },
  },
}
