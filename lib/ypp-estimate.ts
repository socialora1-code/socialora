export const YPP_SUBSCRIBERS = 1_000

export const YPP_PATHS = {
  long: {
    label: 'Long-form video',
    target: 4_000,
    windowDays: 365,
    windowLabel: '12 months',
    metric: 'qualified watch hours',
    averageLabel: 'Qualified watch hours per video',
    uploadLabel: 'New videos per week',
    defaults: { activity: 2_000, uploads: 2, average: 80 },
    activityStep: 50,
    averageStep: 5,
    averageRange: 500,
  },
  shorts: {
    label: 'Shorts',
    target: 10_000_000,
    windowDays: 90,
    windowLabel: '90 days',
    metric: 'qualified Shorts views',
    averageLabel: 'Qualified views per Short',
    uploadLabel: 'New Shorts per week',
    defaults: { activity: 2_000_000, uploads: 7, average: 150_000 },
    activityStep: 50_000,
    averageStep: 5_000,
    averageRange: 500_000,
  },
} as const

export type YppPath = keyof typeof YPP_PATHS

export function estimateYpp({
  path,
  subscribers,
  weeklySubscribers,
  activity,
  uploads,
  average,
}: {
  path: YppPath
  subscribers: number
  weeklySubscribers: number
  activity: number
  uploads: number
  average: number
}) {
  const { target, windowDays } = YPP_PATHS[path]
  const subscriberGap = Math.max(0, YPP_SUBSCRIBERS - subscribers)
  const activityGap = Math.max(0, target - activity)
  const weeklyActivity = uploads * average
  const dailyActivity = weeklyActivity / 7
  const steadyActivity = dailyActivity * windowDays
  const subscriberDays = subscriberGap === 0 ? 0 : weeklySubscribers > 0 ? subscriberGap * 7 / weeklySubscribers : Infinity
  const activityAt = (days: number) =>
    activity * Math.max(0, 1 - days / windowDays) + dailyActivity * Math.min(days, windowDays)

  const activityDays = activityGap === 0
    ? 0
    : steadyActivity >= target
      ? activityGap * windowDays / (steadyActivity - activity)
      : Infinity
  const days = Math.max(subscriberDays, activityDays)
  const reachable = Number.isFinite(days) && activityAt(days) >= target - 1e-7

  return {
    subscriberGap,
    activityGap,
    weeklyActivity,
    steadyActivity,
    days: reachable ? days : null,
    limitingFactor: !Number.isFinite(subscriberDays) ? 'subscribers' : !reachable ? 'activity' : subscriberDays > activityDays ? 'subscribers' : 'activity',
  }
}
