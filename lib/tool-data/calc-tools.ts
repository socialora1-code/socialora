import type { ToolDef } from '@/lib/tool-data/types'

export const CALC_TOOLS: readonly ToolDef[] = [
  {
    slug: 'youtube-money-calculator',
    kind: 'calc',
    group: 'Calculators',
    platform: 'YouTube',
    name: 'YouTube Money Calculator',
    title: 'YouTube Money Calculator - Estimate Your Earnings',
    h1: 'YouTube Money Calculator',
    description:
      'Free YouTube money calculator. Enter your monthly views and an earnings range per 1,000 views to estimate what a channel could earn.',
    intro:
      'Wondering what your views could be worth? Enter your monthly views and a low and high earnings rate per 1,000 views. You get a monthly and yearly range right away. It is free and needs no sign-up.',
    widget: 'youtube-earnings',
    tips: [
      'Earnings per 1,000 views change a lot between channels. Once you are monetized, check your own number in YouTube Studio analytics and use it here.',
      'Run Shorts and long videos separately. They are paid in different ways, so mixing them gives a misleading average.',
      'Views only earn money if they come with ads. Not every view on a monetized video is a paid view.',
    ],
    faqs: [
      {
        q: 'How accurate is this estimate?',
        a: 'It is a planning tool, not a promise. Your real income depends on your niche, your viewers’ countries, the time of year and which views are monetized. Treat the range as a rough guide.',
      },
      {
        q: 'What do I need to earn money on YouTube?',
        a: 'You need to join the YouTube Partner Program. The rules and thresholds can change, so check the current requirements on YouTube’s help pages.',
      },
    ],
    cta: {
      text: 'Working toward monetization? See our YouTube views, watch time and subscriber options.',
      href: '/youtube',
      label: 'See YouTube services',
    },
  },
  {
    slug: 'facebook-money-calculator',
    kind: 'calc',
    group: 'Calculators',
    platform: 'Facebook',
    name: 'Facebook Earnings Calculator',
    title: 'Facebook Earnings Calculator - Estimate Your Income',
    h1: 'Facebook Earnings Calculator',
    description:
      'Free Facebook earnings calculator. Enter your monthly views and an earnings range per 1,000 views to estimate possible income from your page or videos.',
    intro:
      'Curious what your Facebook views could earn? Enter your monthly views and a low and high rate per 1,000 views, and see an estimated monthly and yearly range.',
    widget: 'facebook-earnings',
    tips: [
      'Facebook has more than one way to earn, and programs change often. Check which ones you can join in Meta Business Suite.',
      'Use your own past numbers instead of the example rates. They are the most honest starting point.',
      'Video that keeps people watching tends to earn more than short clips that people scroll past.',
    ],
    faqs: [
      {
        q: 'Does everyone earn money from Facebook views?',
        a: 'No. You need to be eligible for a monetization program, and eligibility rules differ by country and change over time. Check your account for what is available to you.',
      },
      {
        q: 'Why is the range so wide?',
        a: 'Because earnings per 1,000 views depend on content, audience and ad demand. A wide range is more realistic than one exact number.',
      },
    ],
  },
  {
    slug: 'spotify-royalty-calculator',
    kind: 'calc',
    group: 'Calculators',
    platform: 'Spotify',
    name: 'Spotify Royalty Calculator',
    title: 'Spotify Royalty Calculator - Estimate Payout per Stream',
    h1: 'Spotify Royalty Calculator',
    description:
      'Free Spotify royalty calculator. Enter your monthly streams and a payout range per stream to estimate what a track or artist could earn.',
    intro:
      'See roughly what your streams are worth. Enter your monthly streams and a low and high payout per stream, and get a monthly and yearly estimate.',
        about: [
      'Spotify does not pay a fixed rate per stream. Money is shared with the rights holders and the amount per stream changes by country, listener type and agreement, which is why this calculator uses a low and a high rate instead of one number.',
      'Enter your monthly streams and adjust the two rates until they match what your distributor reports. You get a monthly and a yearly range, which is more useful for planning than a single exact figure.',
      'Remember that labels, distributors and co-writers take their share first. Treat the result as the total pool, and multiply by your own split to see what you might actually receive.',
    ],
    widget: 'spotify-earnings',
    tips: [
      'The payout per stream is not fixed. It changes by country, listener type and your agreement, so keep the range wide.',
      'Remember splits. If you work with a label, distributor or co-writers, your own share is only part of the total.',
      'Look at your real payments in your distributor’s report and update the numbers here to get a better picture.',
    ],
    faqs: [
      {
        q: 'How much does Spotify pay per stream?',
        a: 'There is no single rate. Spotify shares revenue with the rights holders, and the amount per stream moves over time. The example range here is only a starting point you can change.',
      },
      {
        q: 'Is the result what I will receive?',
        a: 'Not necessarily. Labels, distributors and other rights holders take their share first, so your payout can be lower than the total shown.',
      },
    ],
  },
  {
    slug: 'twitch-earnings-calculator',
    kind: 'calc',
    group: 'Calculators',
    platform: 'Twitch',
    name: 'Twitch Earnings Calculator',
    title: 'Twitch Earnings Calculator - Estimate Subs & Bits Income',
    h1: 'Twitch Earnings Calculator',
    description:
      'Free Twitch earnings calculator. Enter your subscribers and Bits to estimate monthly and yearly income from your channel.',
    intro:
      'Add up what your channel could earn from subscriptions and Bits. Enter your paid subscribers, your payout per subscriber and your monthly Bits.',
    widget: 'twitch-earnings',
    tips: [
      'Payout per subscriber depends on your agreement with Twitch. The example is common, but your dashboard shows the exact number.',
      'Bits are worth one cent each to the streamer, so a small number of Bits adds up slowly.',
      'Ads, sponsorships and donations are extra and are not part of this estimate.',
    ],
    faqs: [
      {
        q: 'Does this include ads and sponsorships?',
        a: 'No. It covers only subscriptions and Bits. Ads, sponsors and donations can be a large part of income for some channels, so add them separately.',
      },
      {
        q: 'Why is my real payout different?',
        a: 'Your revenue split, taxes, regional pricing and gifted subscriptions can all change the final amount. Use this as an estimate.',
      },
    ],
  },
  {
    slug: 'tiktok-engagement-rate-calculator',
    kind: 'calc',
    group: 'Calculators',
    platform: 'TikTok',
    name: 'TikTok Engagement Rate Calculator',
    title: 'TikTok Engagement Rate Calculator (Free)',
    h1: 'TikTok Engagement Rate Calculator',
    description:
      'Free TikTok engagement rate calculator. Enter your followers and average likes, comments and shares to see your engagement rate.',
    intro:
      'Find out how much your TikTok audience reacts to your videos. Enter your followers and your average likes, comments and shares per video.',
    widget: 'tiktok-engagement',
    tips: [
      'Use the average of your last 10 to 20 videos instead of one video. One viral video can hide your normal results.',
      'TikTok engagement is often higher than on other platforms, so compare yourself with TikTok accounts of a similar size.',
      'Comments and shares show stronger interest than likes. Try ending videos with a question to start a conversation.',
    ],
    faqs: [
      {
        q: 'How is the rate calculated?',
        a: 'We add the average likes, comments and shares per video, divide by your followers and multiply by 100. Some people divide by views instead. Both are fine, just stay consistent.',
      },
      {
        q: 'What is a good TikTok engagement rate?',
        a: 'It depends on your niche and size. The labels on this page are rough rules of thumb, and smaller accounts usually see higher rates than large ones.',
      },
    ],
    cta: {
      text: 'Want a stronger start for your next video? See our TikTok services.',
      href: '/tiktok',
      label: 'See TikTok services',
    },
  },
  {
    slug: 'x-engagement-rate-calculator',
    kind: 'calc',
    group: 'Calculators',
    platform: 'X',
    name: 'X (Twitter) Engagement Rate Calculator',
    title: 'Twitter / X Engagement Rate Calculator (Free)',
    h1: 'Twitter / X Engagement Rate Calculator',
    description:
      'Free Twitter and X engagement rate calculator. Enter your followers and average likes, replies and reposts to see your engagement rate.',
    intro:
      'Check how well your posts connect with your followers. Enter your followers and the average likes, replies and reposts per post.',
    widget: 'x-engagement',
    tips: [
      'Average over your last 20 posts and leave out outliers, so one big post does not skew the number.',
      'Replies matter. A post that starts a conversation usually reaches more people than one that only collects likes.',
      'Rates on X are often lower than on other platforms, so compare with accounts on X, not on Instagram or TikTok.',
    ],
    faqs: [
      {
        q: 'Should I use followers or impressions?',
        a: 'This calculator uses followers. If you can see impressions in your analytics, dividing by impressions shows how well each post performs with the people who actually saw it.',
      },
      {
        q: 'What counts as engagement?',
        a: 'Likes, replies and reposts are included here. Clicks, profile visits and bookmarks are not public, so they are not part of this number.',
      },
    ],
    cta: {
      text: 'Want your X profile to look more established? See our X services.',
      href: '/x',
      label: 'See X services',
    },
  },
  {
    slug: 'youtube-engagement-rate-calculator',
    kind: 'calc',
    group: 'Calculators',
    platform: 'YouTube',
    name: 'YouTube Engagement Rate Calculator',
    title: 'YouTube Engagement Rate Calculator (Free)',
    h1: 'YouTube Engagement Rate Calculator',
    description:
      'Free YouTube engagement rate calculator. Enter your subscribers and average likes and comments per video to see your engagement rate.',
    intro:
      'See how actively your YouTube audience responds. Enter your subscribers and the average likes and comments per video.',
    widget: 'youtube-engagement',
    tips: [
      'Use the average of your last 10 videos, and compare similar video types, such as long videos with long videos.',
      'Ask for a specific kind of comment, like a question or a topic request. People answer clear prompts more than general ones.',
      'Watch time and viewer retention matter as much as likes. Check them in YouTube Studio next to this number.',
    ],
    faqs: [
      {
        q: 'Why use subscribers instead of views?',
        a: 'Subscribers show how engaged your core audience is. You can also divide by views to see how a single video performed. Pick one method and keep using it.',
      },
      {
        q: 'What is a good rate?',
        a: 'It depends on your niche and size. The labels here are rough rules of thumb, and bigger channels usually have lower rates than small ones.',
      },
    ],
    cta: {
      text: 'Need a stronger start for your channel? See our YouTube services.',
      href: '/youtube',
      label: 'See YouTube services',
    },
  },
]
