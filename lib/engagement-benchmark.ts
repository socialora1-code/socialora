export const BENCHMARKS = {
  'instagram-engagement': {
    platform: 'Instagram', audience: 'Followers', item: 'post', baseRate: 3, baseReach: 25,
    likes: 'Likes', comments: 'Comments', distribution: 'Saves and shares',
    note: 'Saves and shares help you see which posts people want to revisit or pass along. Compare posts of the same format and use your own Insights.',
  },
  'tiktok-engagement': {
    platform: 'TikTok', audience: 'Followers', item: 'video', baseRate: 5, baseReach: 40,
    likes: 'Likes', comments: 'Comments', distribution: 'Saves and shares',
    note: 'TikTok considers interactions such as likes, shares and comments alongside viewing behavior. Check watch time and completion alongside this breakdown.',
    source: 'https://support.tiktok.com/en/using-tiktok/exploring-videos/how-tiktok-recommends-content',
  },
  'youtube-engagement': {
    platform: 'YouTube', audience: 'Subscribers', item: 'video', baseRate: 3, baseReach: 25,
    likes: 'Likes', comments: 'Comments', distribution: 'Shares',
    note: 'YouTube recommendations also consider viewing history and satisfaction. Compare similar videos and include audience retention when reviewing results.',
    source: 'https://support.google.com/youtube/answer/141805',
  },
  'x-engagement': {
    platform: 'X', audience: 'Followers', item: 'post', baseRate: 1, baseReach: 20,
    likes: 'Likes', comments: 'Replies', distribution: 'Reposts and bookmarks',
    note: 'Compare replies and reposts to see where posts start conversations or travel beyond your immediate audience. Use impressions from the same posts.',
  },
  'twitch-earnings': {
    platform: 'Twitch', audience: 'Followers', item: 'stream', baseRate: 3, baseReach: 20,
    likes: 'Reactions (if tracked)', comments: 'Chat messages', distribution: 'Shares (if tracked)',
    note: 'Use metrics for the same streams. Chat messages can repeat per viewer. Include watch time and average concurrent viewers when pitching a live sponsorship.',
  },
  'telegram-earnings': {
    platform: 'Telegram', audience: 'Subscribers', item: 'post', baseRate: 2, baseReach: 30,
    likes: 'Reactions', comments: 'Comments', distribution: 'Forwards',
    note: 'Use the same 24-hour window for views, reactions and forwards. If comments are disabled, report reactions and forwards in your sponsor pitch.',
  },
} satisfies Record<string, {
  platform: string
  audience: string
  item: string
  baseRate: number
  baseReach: number
  likes: string
  comments: string
  distribution: string
  note: string
  source?: string
}>

export type BenchmarkId = keyof typeof BENCHMARKS

export const BENCHMARK_NICHES = [
  { label: 'Lifestyle', factor: 1 },
  { label: 'Finance', factor: 0.85 },
  { label: 'Tech', factor: 0.9 },
  { label: 'Beauty & Fashion', factor: 1.15 },
  { label: 'Gaming', factor: 1.1 },
  { label: 'Entertainment', factor: 1.25 },
]

export const BENCHMARK_TIERS = ['Needs Momentum', 'Niche Average', 'High Performing', 'Viral & Brand Ready']

export function isBenchmark(id: string): id is BenchmarkId {
  return Object.hasOwn(BENCHMARKS, id)
}

export function assessEngagement(
  id: BenchmarkId,
  niche: number,
  { audience, views, likes, comments, distribution }: Record<'audience' | 'views' | 'likes' | 'comments' | 'distribution', number>,
) {
  const { baseRate, baseReach } = BENCHMARKS[id]
  const factor = BENCHMARK_NICHES[niche].factor
  const total = likes + comments + distribution
  const rate = audience > 0 ? total / audience * 100 : null
  const byView = views > 0 ? total / views * 100 : null
  const reference = baseRate * factor
  const reachReference = baseReach * factor
  const thresholds = [1, 1.5, 2]
  const targets = thresholds.map((multiplier) => ({
    interactions: Math.ceil(audience * reference * multiplier / 100 - 1e-9),
    views: Math.ceil(audience * reachReference * multiplier / 100 - 1e-9),
  }))
  const tier = audience > 0
    ? targets.filter((target) => total >= target.interactions && views >= target.views).length
    : null
  const nextTier = tier === null ? null : Math.min(3, Math.max(2, tier + 1))
  const target = nextTier === null ? null : targets[nextTier - 1]

  return {
    total, rate, byView, reference, reachReference, tier, nextTier,
    gap: target ? {
      views: Math.max(0, target.views - views),
      interactions: Math.max(0, target.interactions - total),
      target,
    } : null,
  }
}
