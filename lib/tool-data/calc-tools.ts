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
  {
    slug: 'tiktok-money-coins-calculator',
    kind: 'calc',
    group: 'Calculators',
    platform: 'TikTok',
    name: 'TikTok Coins & Gift Money Calculator',
    title: 'TikTok Coins to USD Calculator — Live Gift & Diamond Value (2026)',
    h1: 'TikTok Coins & Gift Money Calculator',
    description:
      'Convert TikTok Coins and Diamonds to USD instantly. See how much TikTok Live gifts cost on Web vs App and how much creators actually get paid.',
    intro:
      'How much are TikTok Coins, Diamonds and Live Gifts worth in real US dollars? Enter any coin or diamond amount to compare Web recharge cost, App cost, and exact creator payout after TikTok’s cut.',
    widget: 'tiktok-coins',
    about: [
      'TikTok Live uses three currencies: viewers buy Coins, send virtual Gifts during a stream, and creators receive Diamonds that can be cashed out to PayPal or a bank account.',
      'Roughly two TikTok Coins equal one Creator Diamond, and each Diamond is worth about $0.005 USD — meaning TikTok keeps roughly 50% of the gift value. On top of that, buying coins directly at tiktok.com/coin on desktop or mobile web is 25% to 30% cheaper than recharging inside the iOS or Android app because it avoids app store fees.',
      'Use this calculator to check the dollar value of any TikTok gift (such as a Galaxy at 1,000 coins, a Lion at 29,999 coins, or a TikTok Universe at 44,999 coins) and estimate creator earnings.',
    ],
    tips: [
      'Buy TikTok Coins on a web browser (tiktok.com/coin) instead of the mobile app to save up to 25–30% on every recharge.',
      'You need at least 1,000 TikTok followers to unlock TikTok Live and receive gifts from viewers.',
      '1,000 TikTok Coins equals roughly 500 Diamonds, which pays the creator about $2.50 to $5.00 USD depending on regional rates.',
    ],
    faqs: [
      {
        q: 'How much is 1,000 TikTok Coins worth in USD?',
        a: 'Recharging 1,000 TikTok Coins costs around $10.60 on TikTok Web or ~$14.80 in the mobile app. When gifted on Live, the creator receives roughly $5.00 USD after TikTok’s 50% platform fee.',
      },
      {
        q: 'How much is a TikTok Lion or TikTok Universe worth to the creator?',
        a: 'A Lion gift costs 29,999 coins (~$318 on Web) and pays the creator around $150 USD. A TikTok Universe costs 44,999 coins (~$477 on Web) and pays the creator roughly $225 USD.',
      },
      {
        q: 'How do I unlock TikTok Live if I have under 1,000 followers?',
        a: 'TikTok requires 1,000 followers to go Live and earn Diamonds. You can grow your audience faster with high-retention videos or our TikTok follower packages.',
      },
    ],
    cta: {
      text: 'Need 1,000 followers to unlock TikTok Live and start earning gifts? Check our TikTok follower and view packages.',
      href: '/tiktok',
      label: 'Unlock TikTok Live faster',
    },
  },
  {
    slug: 'instagram-sponsorship-rate-calculator',
    kind: 'calc',
    group: 'Calculators',
    platform: 'Instagram',
    name: 'Instagram Sponsorship & Account Worth Calculator',
    title: 'Instagram Sponsorship Rate & Account Worth Calculator (Free 2026)',
    h1: 'Instagram Sponsorship Rate & Account Worth Calculator',
    description:
      'How much should you charge for an Instagram sponsored Reel, Story or post? Calculate your exact influencer brand deal rate from your followers and engagement.',
    intro:
      'Wondering how much your Instagram account is worth to brands? Enter your followers, average likes and comments to calculate what to charge for a sponsored Reel, feed post, or 3-frame Story set.',
    widget: 'instagram-sponsorship',
    about: [
      'Brands no longer price influencer sponsorships by follower count alone — they look at average views, likes, comments and niche authority. A 15,000-follower creator with strong engagement often earns more per Reel than a 100,000-follower page with inactive followers.',
      'This calculator combines a baseline audience CPM with an active engagement multiplier to estimate fair market rates for a single Feed Post, a Sponsored Reel, a 3-Frame Story sequence with a link sticker, and a bundled campaign.',
    ],
    tips: [
      'Always pitch brands a Reel + 3-Story bundle instead of a single post; bundles convert better for sponsors and increase your total invoice by 35–50%.',
      'Charge an extra 20–30% per month if a brand asks for "paid usage rights" or whitelisting to run your video as an ad.',
      'Before sending your media kit, make sure your top 3 pinned Reels have strong view counts and engagement.',
    ],
    faqs: [
      {
        q: 'How much can a 10K follower Instagram account charge per post?',
        a: 'An active 10,000-follower Instagram creator typically charges between $100 and $250 per sponsored Reel or post, depending on niche and average views.',
      },
      {
        q: 'Do brands check my Reels views before offering a deal?',
        a: 'Yes. Brand managers check your pinned posts and last 6 Reels first. High view counts and consistent likes immediately raise your perceived value.',
      },
    ],
    cta: {
      text: 'Preparing your profile for brand deals? Boost your Reels views and follower authority with our Instagram services.',
      href: '/instagram',
      label: 'Boost your Instagram authority',
    },
  },
  {
    slug: 'telegram-channel-money-calculator',
    kind: 'calc',
    group: 'Calculators',
    platform: 'Telegram',
    name: 'Telegram Channel Earnings & Ad Price Calculator',
    title: 'Telegram Channel Money Calculator — Sponsored Post & Ad Price (2026)',
    h1: 'Telegram Channel Money & Ad Rate Calculator',
    description:
      'Calculate how much your Telegram channel can earn from sponsored posts and ads. Free Telegram ad price calculator based on subscribers, 24h views and niche CPM.',
    intro:
      'Running a Telegram channel? Enter your subscriber count, average 24-hour post views, and niche CPM to calculate how much to charge advertisers per sponsored post and per month.',
    widget: 'telegram-earnings',
    about: [
      'Telegram channels earn far higher ad CPMs than most social networks because messages land directly in subscribers’ chat lists with a visible view counter on every post.',
      'Advertisers price Telegram shoutouts based on your 24-hour post views and your niche. Crypto, finance, tech and marketing channels regularly command $15 to $40+ per 1,000 views, while general news or entertainment averages $4 to $10 CPM.',
    ],
    tips: [
      'Keep your 24-hour view-to-subscriber ratio between 20% and 40% so advertisers see an active, healthy channel.',
      'Offer 24-hour pinned ad slots at a 50% premium over regular 1/24 (1 hour top, 24 hours in feed) placements.',
      'Growing your total subscriber base and Premium member count pushes your channel higher in Telegram global search.',
    ],
    faqs: [
      {
        q: 'How many subscribers do I need to monetize a Telegram channel?',
        a: 'You can sell direct sponsored posts with as few as 1,000 to 2,000 active subscribers, while the official Telegram Ad Platform shares revenue with public channels once they reach 1,000 subscribers.',
      },
      {
        q: 'How do Telegram channels rank higher in Telegram search?',
        a: 'Telegram search ranks channels primarily by total subscriber count, Telegram Premium subscribers, and keyword match in the channel title.',
      },
    ],
    cta: {
      text: 'Want your Telegram channel to rank higher in search and attract advertisers? See our Telegram members & Premium subscriber services.',
      href: '/telegram',
      label: 'Grow your Telegram channel',
    },
  },
]
