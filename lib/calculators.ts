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
const usd3 = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 3,
  maximumFractionDigits: 3,
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

function viewsRangeConfig(lowDefault: string, highDefault: string, note: string): CalcConfig {
  return {
    fields: [
      { id: 'views', label: 'Monthly views', placeholder: 'e.g. 100000' },
      { id: 'rpmLow', label: 'Low earnings per 1,000 views ($)', placeholder: 'e.g. 1', defaultValue: lowDefault },
      { id: 'rpmHigh', label: 'High earnings per 1,000 views ($)', placeholder: 'e.g. 5', defaultValue: highDefault },
    ],
    empty: 'Enter your monthly views to see an estimated earnings range.',
    compute: (v) => {
      if (!(v.views > 0) || !ok(v.rpmLow) || !ok(v.rpmHigh)) return null
      const a = Math.min(v.rpmLow, v.rpmHigh)
      const b = Math.max(v.rpmLow, v.rpmHigh)
      const low = (v.views / 1000) * a
      const high = (v.views / 1000) * b
      return {
        headline: `${usd.format(low)} - ${usd.format(high)}`,
        sub: 'Estimated per month',
        lines: [
          ['Estimated per year', `${usd.format(low * 12)} - ${usd.format(high * 12)}`],
          ['Earnings per 1,000 views used', `${usd2.format(a)} - ${usd2.format(b)}`],
        ],
        note,
      }
    },
  }
}

export const CALCULATORS: Record<string, CalcConfig> = {
  'youtube-earnings': viewsRangeConfig(
    '1',
    '5',
    'This is an estimate for planning only. Real earnings depend on your country, niche, audience, season and on how many views are monetized. The numbers in the boxes are examples, replace them with your own.',
  ),
  'facebook-earnings': viewsRangeConfig(
    '1',
    '4',
    'This is an estimate for planning only. Facebook programs, eligibility and rates change, and earnings depend on your content and audience. Replace the example numbers with your own.',
  ),
  'spotify-earnings': {
    fields: [
      { id: 'streams', label: 'Monthly streams', placeholder: 'e.g. 50000' },
      { id: 'low', label: 'Low payout per stream ($)', placeholder: 'e.g. 0.003', defaultValue: '0.003' },
      { id: 'high', label: 'High payout per stream ($)', placeholder: 'e.g. 0.005', defaultValue: '0.005' },
    ],
    empty: 'Enter your monthly streams to see an estimated payout range.',
    compute: (v) => {
      if (!(v.streams > 0) || !ok(v.low) || !ok(v.high)) return null
      const a = Math.min(v.low, v.high)
      const b = Math.max(v.low, v.high)
      const low = v.streams * a
      const high = v.streams * b
      return {
        headline: `${usd.format(low)} - ${usd.format(high)}`,
        sub: 'Estimated per month, before splits and fees',
        lines: [
          ['Estimated per year', `${usd.format(low * 12)} - ${usd.format(high * 12)}`],
          ['Payout per stream used', `${usd3.format(a)} - ${usd3.format(b)}`],
        ],
        note: 'Spotify does not pay a fixed rate per stream. The money goes to the rights holders and passes through your label or distributor, so your own share can be lower. Use this as a rough guide.',
      }
    },
  },
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
}
