import type { PlatformId, ServiceId } from '@/lib/catalog'

export interface LandingFaq {
  q: string
  a: string
}

export interface LandingPage {
  slug: string
  platformId?: PlatformId
  serviceId: ServiceId
  title: string
  description: string
  h1: string
  intro: string
  points: string[]
  faqs: LandingFaq[]
}

const COMMON_FAQS: LandingFaq[] = [
  {
    q: "Do you need my Instagram password?",
    a: "No. We only need your public profile URL or username. Never share your password with anyone.",
  },
  {
    q: "How do I pay?",
    a: "You pay with crypto at checkout. You can choose automatic payment or send the exact amount to the wallet address shown on the order page.",
  },
  {
    q: "When does my order start?",
    a: "Your order starts after your payment is verified. We email you the order updates, so use an email address you check.",
  },
  {
    q: "Is buying followers safe for my account?",
    a: "We never ask for your login details and your profile only needs to stay public. Instagram's terms do not allow purchased followers, so nobody can promise how the platform will treat an account. Start with a smaller amount if you are unsure.",
  },
]

const TIKTOK_COMMON_FAQS: LandingFaq[] = [
  {
    q: "Do you need my TikTok password?",
    a: "No. We only need your public profile URL or username. Never share your password with anyone.",
  },
  {
    q: "How do I pay?",
    a: "You pay with crypto at checkout. You can choose automatic payment or send the exact amount to the wallet address shown on the order page.",
  },
  {
    q: "When does my order start?",
    a: "Your order starts after your payment is verified. We email you the order updates, so use an email address you check.",
  },
  {
    q: "Is buying followers safe for my account?",
    a: "We never ask for your login details and your profile only needs to stay public. Platforms set their own rules and nobody can promise how an account will be treated, so start with a smaller amount if you are unsure.",
  },
]

const YOUTUBE_COMMON_FAQS: LandingFaq[] = [
  {
    q: "Do you need my YouTube password?",
    a: "No. We only need a public link. Never share your password or login code with anyone.",
  },
  {
    q: "How do I pay?",
    a: "You pay with crypto at checkout. You can choose automatic payment or send the exact amount to the wallet address shown on the order page.",
  },
  {
    q: "When does my order start?",
    a: "Your order starts after your payment is verified. We email you the order updates, so use an email address you check.",
  },
  {
    q: "Is this safe for my channel?",
    a: "We never ask for your login details and your video or channel only needs to stay public. YouTube's terms do not allow purchased engagement, so nobody can promise how the platform will treat a channel. Start with a smaller amount if you are unsure.",
  },
]

const TELEGRAM_COMMON_FAQS: LandingFaq[] = [
  {
    q: "Do you need my Telegram login?",
    a: "No. We only need the public link of your channel or group. Never share your login code or password with anyone.",
  },
  {
    q: "How do I pay?",
    a: "You pay with crypto at checkout. You can choose automatic payment or send the exact amount to the wallet address shown on the order page.",
  },
  {
    q: "When does my order start?",
    a: "Your order starts after your payment is verified. We email you the order updates, so use an email address you check.",
  },
  {
    q: "Is this safe for my channel?",
    a: "We never ask for your login details. Telegram sets its own rules and nobody can promise how a channel or group will be treated, so start with a smaller amount if you are unsure.",
  },
]

const X_COMMON_FAQS: LandingFaq[] = [
  {
    q: "Do you need my X password?",
    a: "No. We only need your public profile or post link. Never share your password with anyone.",
  },
  {
    q: "How do I pay?",
    a: "You pay with crypto at checkout. You can choose automatic payment or send the exact amount to the wallet address shown on the order page.",
  },
  {
    q: "When does my order start?",
    a: "Your order starts after your payment is verified. We email you the order updates, so use an email address you check.",
  },
  {
    q: "Is this safe for my account?",
    a: "We never ask for your login details and your profile or post only needs to stay public. X sets its own rules and nobody can promise how an account will be treated, so start with a smaller amount if you are unsure.",
  },
]

export const LANDING_PAGES: readonly LandingPage[] = [
  {
    slug: "buy-usa-followers",
    serviceId: "followers-us",
    title: "Buy USA Instagram Followers",
    description:
      "Buy USA Instagram followers with a 30-day refill guarantee. Simple USD pricing, no password needed, pay with crypto.",
    h1: "Buy USA Instagram Followers",
    intro:
      "Add American followers to your Instagram profile. Choose your amount, enter your public profile link and check out in a few minutes. Every order is covered by a 30-day refill guarantee if your follower count drops.",
    points: [
      "Followers sourced for a USA audience",
      "30-day refill guarantee if your count drops",
      "Only your public profile link is needed, never your password",
    ],
    faqs: [
      {
        q: "Who are USA Instagram followers?",
        a: "They are followers sourced for an American audience. They help your profile look more relevant if your content, brand or page targets the United States.",
      },
      {
        q: "What does the 30-day refill guarantee cover?",
        a: "If your follower count drops within 30 days after the order is completed, contact us with your order details and we will request a refill.",
      },
      ...COMMON_FAQS,
    ],
  },
  {
    slug: "buy-spanish-followers",
    serviceId: "followers-es",
    title: "Buy Spanish Instagram Followers",
    description:
      "Buy Spanish Instagram followers with a 30-day refill guarantee. Clear USD pricing, no password needed, pay with crypto.",
    h1: "Buy Spanish Instagram Followers",
    intro:
      "Add Spanish followers to your Instagram profile. Good for pages, shops and creators that speak to a Spanish-speaking audience. Every order is covered by a 30-day refill guarantee.",
    points: [
      "Followers sourced for a Spanish audience",
      "30-day refill guarantee if your count drops",
      "Only your public profile link is needed, never your password",
    ],
    faqs: [
      {
        q: "Who are Spanish Instagram followers?",
        a: "They are followers sourced for a Spanish audience. They fit profiles that post in Spanish or target Spanish-speaking customers.",
      },
      {
        q: "Can I choose male or female Spanish followers?",
        a: "Yes. We also offer Spanish female and Spanish male options. Pick the one you want on the Instagram services page.",
      },
      {
        q: "What does the 30-day refill guarantee cover?",
        a: "If your follower count drops within 30 days after the order is completed, contact us with your order details and we will request a refill.",
      },
      ...COMMON_FAQS,
    ],
  },
  {
    slug: "buy-arabic-followers",
    serviceId: "followers-ar",
    title: "Buy Arabic Instagram Followers",
    description:
      "Buy Arabic Instagram followers with a 30-day refill guarantee. Simple USD pricing, no password needed, pay with crypto.",
    h1: "Buy Arabic Instagram Followers",
    intro:
      "Add Arabic followers to your Instagram profile. A good fit for pages and brands that target Arabic-speaking audiences. Every order is covered by a 30-day refill guarantee.",
    points: [
      "Followers sourced for an Arabic audience",
      "30-day refill guarantee if your count drops",
      "Only your public profile link is needed, never your password",
    ],
    faqs: [
      {
        q: "Who are Arabic Instagram followers?",
        a: "They are followers sourced for an Arabic audience. They suit profiles that post in Arabic or sell to Arabic-speaking customers.",
      },
      {
        q: "What does the 30-day refill guarantee cover?",
        a: "If your follower count drops within 30 days after the order is completed, contact us with your order details and we will request a refill.",
      },
      ...COMMON_FAQS,
    ],
  },
  {
    slug: "buy-brazilian-followers",
    serviceId: "followers-br",
    title: "Buy Brazilian Instagram Followers",
    description:
      "Buy Brazilian Instagram followers with a 30-day refill guarantee. Clear USD pricing, no password needed, pay with crypto.",
    h1: "Buy Brazilian Instagram Followers",
    intro:
      "Add Brazilian followers to your Instagram profile. A good fit for creators and brands that speak to a Portuguese-speaking audience in Brazil. Every order is covered by a 30-day refill guarantee.",
    points: [
      "Followers sourced for a Brazilian audience",
      "30-day refill guarantee if your count drops",
      "Only your public profile link is needed, never your password",
    ],
    faqs: [
      {
        q: "Who are Brazilian Instagram followers?",
        a: "They are followers sourced for a Brazilian audience. They suit profiles that post in Portuguese or target customers in Brazil.",
      },
      {
        q: "What does the 30-day refill guarantee cover?",
        a: "If your follower count drops within 30 days after the order is completed, contact us with your order details and we will request a refill.",
      },
      ...COMMON_FAQS,
    ],
  },
  {
    slug: "buy-high-quality-followers",
    serviceId: "followers-365",
    title: "Buy Instagram Followers with 365-Day Refill",
    description:
      "Buy Instagram followers with a 365-day refill guarantee. Orders from 500 to 100,000, just your username, pay with crypto.",
    h1: "Buy Instagram Followers with a 365-Day Refill Guarantee",
    intro:
      "Add followers to your Instagram profile with a full year of refill cover. Orders run from 500 up to 100,000 followers. Pick your amount, enter your public username and check out.",
    points: [
      "365-day refill guarantee if your count drops",
      "Orders from 500 up to 100,000 followers",
      "Only your public username is needed, never your password",
    ],
    faqs: [
      {
        q: "What does the 365-day refill guarantee cover?",
        a: "If your follower count drops within 365 days after the order is completed, contact us with your order details and we will request a refill.",
      },
      {
        q: "What is the largest order I can place?",
        a: "You can order up to 100,000 followers in one order. The smallest order is 500.",
      },
      {
        q: "Do I need to send a profile link?",
        a: "No. For this service you only enter your public Instagram username. Your profile must stay public while the order is running.",
      },
      ...COMMON_FAQS,
    ],
  },
]

export const TIKTOK_LANDING_PAGES: readonly LandingPage[] = [
  {
    slug: "buy-high-quality-tiktok-followers",
    platformId: "tiktok",
    serviceId: "followers-hq",
    title: "Buy High-Quality TikTok Followers",
    description:
      "Buy high-quality TikTok followers with a 30-day refill guarantee. Simple USD pricing, no password needed, pay with crypto.",
    h1: "Buy High-Quality TikTok Followers",
    intro:
      "Add high-quality followers to your TikTok profile. Choose your amount, enter your public profile link and check out in a few minutes. Every order is covered by a 30-day refill guarantee if your follower count drops.",
    points: [
      "High-quality followers for your TikTok profile",
      "30-day refill guarantee if your count drops",
      "Only your public profile link is needed, never your password",
    ],
    faqs: [
      {
        q: "What are high-quality TikTok followers?",
        a: "This is our main TikTok followers service. It comes with a 30-day refill guarantee in case your follower count drops after the order is completed.",
      },
      {
        q: "What does the 30-day refill guarantee cover?",
        a: "If your follower count drops within 30 days after the order is completed, contact us with your order details and we will request a refill.",
      },
      {
        q: "Which TikTok followers option should I choose?",
        a: "Both options include a 30-day refill guarantee. High Quality is the lower-priced option. Minimal Drop is chosen to keep the drop rate low and costs a little more. Compare prices on the TikTok services page.",
      },
      ...TIKTOK_COMMON_FAQS,
    ],
  },
  {
    slug: "buy-minimal-drop-tiktok-followers",
    platformId: "tiktok",
    serviceId: "followers-low-drop",
    title: "Buy TikTok Followers with Minimal Drop",
    description:
      "Buy TikTok followers with a minimal drop rate and a 30-day refill guarantee. Clear USD pricing, no password needed, pay with crypto.",
    h1: "Buy TikTok Followers with a Minimal Drop Rate",
    intro:
      "Add followers to your TikTok profile from accounts with profile photos, followers and posts of their own, chosen for a minimal drop rate. Every order is covered by a 30-day refill guarantee.",
    points: [
      "Followers from accounts with profile photos, followers and posts of their own",
      "Minimal drop rate with a 30-day refill guarantee",
      "Only your public profile link is needed, never your password",
    ],
    faqs: [
      {
        q: "What does minimal drop mean?",
        a: "It means this service is chosen to keep the number of followers that disappear after delivery low. Some drop can still happen on any platform, so the 30-day refill guarantee applies if your count goes down.",
      },
      {
        q: "What does the 30-day refill guarantee cover?",
        a: "If your follower count drops within 30 days after the order is completed, contact us with your order details and we will request a refill.",
      },
      {
        q: "Which TikTok followers option should I choose?",
        a: "Both options include a 30-day refill guarantee. High Quality is the lower-priced option. Minimal Drop is chosen to keep the drop rate low and costs a little more. Compare prices on the TikTok services page.",
      },
      ...TIKTOK_COMMON_FAQS,
    ],
  },
]

export const YOUTUBE_LANDING_PAGES: readonly LandingPage[] = [
  {
    slug: "buy-youtube-views",
    platformId: "youtube",
    serviceId: "views-lifetime",
    title: "Buy YouTube Views with Lifetime Refill",
    description:
      "Buy YouTube views with a lifetime refill guarantee. Orders from 1,000 to 1,000,000, clear USD pricing, no password needed, pay with crypto.",
    h1: "Buy YouTube Views with a Lifetime Refill Guarantee",
    intro:
      "Give your video a stronger start. Choose your amount, paste the public link of your video and check out in a few minutes. Orders run from 1,000 up to 1,000,000 views and are covered by a lifetime refill guarantee if your view count drops.",
    points: [
      "Lifetime refill guarantee if your view count drops",
      "Orders from 1,000 up to 1,000,000 views",
      "Only your public video link is needed, never your password",
    ],
    faqs: [
      {
        q: "How fast are the views delivered?",
        a: "Orders start within 0-4 hours after your payment is verified, at a speed of up to 3,000 views per day. Larger orders are delivered over several days.",
      },
      {
        q: "What does the lifetime refill guarantee cover?",
        a: "If your view count drops after the order is completed, contact us with your order details and we will request a refill.",
      },
      {
        q: "Which link do I need?",
        a: "The public link of the video you want to boost. The video must stay public while the order is running.",
      },
      ...YOUTUBE_COMMON_FAQS,
    ],
  },
  {
    slug: "buy-youtube-subscribers",
    platformId: "youtube",
    serviceId: "subscribers",
    title: "Buy YouTube Subscribers with 30-Day Refill",
    description:
      "Buy YouTube subscribers with a 30-day refill guarantee. Clear USD pricing, no password needed, pay with crypto.",
    h1: "Buy YouTube Subscribers with a 30-Day Refill Guarantee",
    intro:
      "Add subscribers to your YouTube channel. Choose your amount, paste your public channel link and check out in a few minutes. Every order is covered by a 30-day refill guarantee if your subscriber count drops.",
    points: [
      "30-day refill guarantee if your subscriber count drops",
      "Orders from 250 up to 10,000 subscribers",
      "Only your public channel link is needed, never your password",
    ],
    faqs: [
      {
        q: "What does the 30-day refill guarantee cover?",
        a: "If your subscriber count drops within 30 days after the order is completed, contact us with your order details and we will request a refill.",
      },
      {
        q: "Do subscribers help me get monetized?",
        a: "Subscribers are one of the requirements of the YouTube Partner Program, but not the only one. Watch hours and policy compliance also matter, and YouTube sets the final rules, so check its current requirements. Buying subscribers does not guarantee approval.",
      },
      {
        q: "Which link do I need?",
        a: "The public link of your channel. The channel must stay public while the order is running.",
      },
      ...YOUTUBE_COMMON_FAQS,
    ],
  },
  {
    slug: "buy-youtube-watch-time",
    platformId: "youtube",
    serviceId: "watchtime",
    title: "Buy YouTube Watch Time (Watch Hours)",
    description:
      "Buy YouTube watch hours for a public video that is at least 30 minutes long. Orders of 1,000, 2,000 or 4,000 hours, no password needed, pay with crypto.",
    h1: "Buy YouTube Watch Time",
    intro:
      "Add watch hours to a public YouTube video. Choose 1,000, 2,000 or 4,000 hours, paste the link of your video and check out. One unit ordered equals one hour of watch time.",
    points: [
      "1,000 ordered equals 1,000 hours of watch time",
      "Packages of 1,000, 2,000 or 4,000 hours",
      "Only your public video link is needed, never your password",
    ],
    faqs: [
      {
        q: "Which video can I use?",
        a: "A public video that is at least 30 minutes long. The video must stay public while the order is running.",
      },
      {
        q: "Does watch time get me monetized?",
        a: "Public watch hours are one of the requirements of the YouTube Partner Program. Subscribers and policy compliance also matter, and YouTube sets the final rules, so check its current requirements. Buying watch time does not guarantee approval.",
      },
      {
        q: "Is there a refill guarantee?",
        a: "No. This service does not include a refill guarantee.",
      },
      ...YOUTUBE_COMMON_FAQS,
    ],
  },
]

export const TELEGRAM_LANDING_PAGES: readonly LandingPage[] = [
  {
    slug: "buy-telegram-members",
    platformId: "telegram",
    serviceId: "members",
    title: "Buy Telegram Members with 30-Day Refill",
    description:
      "Buy Telegram channel or group members with a 30-day refill guarantee. Volume pricing in USD, no login needed, pay with crypto.",
    h1: "Buy Telegram Members for Your Channel or Group",
    intro:
      "Add members to your public Telegram channel or group. Choose your amount, paste your link and check out in a few minutes. The more you order, the lower the price per 1,000.",
    points: [
      "Members from mixed global accounts for a channel or group",
      "30-day refill guarantee, as described below",
      "Volume pricing: bigger orders cost less per 1,000",
    ],
    faqs: [
      {
        q: "Where do the members come from?",
        a: "They are mixed global accounts that are added to your member count. They are not a replacement for real readers, so keep posting for your real audience.",
      },
      {
        q: "What does the 30-day refill guarantee cover?",
        a: "The refill covers orders placed while your starting member count is low. Drops that happened before your order are not covered. Contact us with your order details if your count drops within 30 days.",
      },
      {
        q: "What do I need before I order?",
        a: "A public link such as t.me/YourChannel or t.me/YourGroup. The channel or group must be at least 3 days old.",
      },
      {
        q: "How fast is delivery?",
        a: "Orders start within 0-2 hours after your payment is verified, at a speed of up to 10,000 members per day.",
      },
      ...TELEGRAM_COMMON_FAQS,
    ],
  },
  {
    slug: "buy-telegram-premium-subscribers",
    platformId: "telegram",
    serviceId: "premium-30",
    title: "Buy Telegram Premium Channel Subscribers",
    description:
      "Buy Telegram Premium subscribers for your channel, with random views added to your latest posts. Stay periods from 7 to 90 days, pay with crypto.",
    h1: "Buy Telegram Premium Channel Subscribers",
    intro:
      "Add Premium subscribers to your Telegram channel, with random views added to your latest posts. This page shows the 30-day option. Choose your amount, paste your channel link and check out.",
    points: [
      "Subscribers from Telegram search, with profile photos",
      "Random views added to your latest posts",
      "Other stay periods (7, 14, 60 and 90 days) are on the Telegram services page",
    ],
    faqs: [
      {
        q: "How long do the subscribers stay?",
        a: "On this page they stay in your channel for 30 days. If you want 7, 14, 60 or 90 days, pick that option on the Telegram services page.",
      },
      {
        q: "Can I use a group link?",
        a: "No. This service works for channels only. Please enter a channel link.",
      },
      {
        q: "Is there a refill guarantee?",
        a: "No. Premium subscribers do not include a refill guarantee.",
      },
      {
        q: "What quality are the subscribers?",
        a: "They are mixed global accounts that all have profile photos and come from Telegram search. Orders start within 0-1 hours after your payment is verified.",
      },
      ...TELEGRAM_COMMON_FAQS,
    ],
  },
]

export const X_LANDING_PAGES: readonly LandingPage[] = [
  {
    slug: "buy-x-followers",
    platformId: "x",
    serviceId: "followers-refill",
    title: "Buy X (Twitter) Followers with 30-Day Refill",
    description:
      "Buy X (Twitter) followers with a 30-day refill guarantee. Clear USD pricing, no password needed, pay with crypto.",
    h1: "Buy X (Twitter) Followers with a 30-Day Refill Guarantee",
    intro:
      "Add followers to your X profile. Choose your amount, paste your public profile link and check out in a few minutes. Every order is covered by a 30-day refill guarantee if your follower count drops.",
    points: [
      "30-day refill guarantee if your count drops",
      "Orders from 250 up to 10,000 followers",
      "Only your public profile link is needed, never your password",
    ],
    faqs: [
      {
        q: "What does the 30-day refill guarantee cover?",
        a: "If your follower count drops within 30 days after the order is completed, contact us with your order details and we will request a refill.",
      },
      {
        q: "Which X followers option should I choose?",
        a: "We offer three options: Followers at the lowest price with no refill, Followers with a 30-day refill, and Top Quality, our premium option. Compare prices on the X services page.",
      },
      {
        q: "Can I choose the country, age or interests of the followers?",
        a: "No. This option adds followers to your profile and does not let you pick a country, age or interest.",
      },
      ...X_COMMON_FAQS,
    ],
  },
  {
    slug: "buy-x-views",
    platformId: "x",
    serviceId: "views",
    title: "Buy X (Twitter) Views and Impressions",
    description:
      "Buy views and impressions for a public X post or video. Orders from 100,000 views, priced per 100,000, pay with crypto.",
    h1: "Buy X (Twitter) Views and Impressions",
    intro:
      "Give a public tweet or video on X a stronger start. Orders start at 100,000 views and are priced per 100,000. Paste the link of your post and check out in a few minutes.",
    points: [
      "Views and impressions for a public post or video",
      "Minimum order 100,000, priced per 100,000",
      "Only your public post link is needed, never your password",
    ],
    faqs: [
      {
        q: "What is the minimum order?",
        a: "The minimum order is 100,000 views. The price is shown per package before you check out.",
      },
      {
        q: "Does this add likes or reposts?",
        a: "No. This service adds views and impressions only. It does not promise likes, replies, reposts or any other result.",
      },
      {
        q: "Is there a refill guarantee?",
        a: "No. This service does not include a refill guarantee.",
      },
      ...X_COMMON_FAQS,
    ],
  },
]

export function getLandingPage(slug: string): LandingPage | undefined {
  return LANDING_PAGES.find((p) => p.slug === slug)
}

export function getTikTokLandingPage(slug: string): LandingPage | undefined {
  return TIKTOK_LANDING_PAGES.find((p) => p.slug === slug)
}

export const MOVED_LANDING_SLUGS = new Set([
  'buy-usa-followers',
  'buy-spanish-followers',
  'buy-arabic-followers',
  'buy-brazilian-followers',
])

export function getLandingPagesFor(platformId: PlatformId): readonly LandingPage[] {
  if (platformId === 'tiktok') return TIKTOK_LANDING_PAGES
  if (platformId === 'youtube') return YOUTUBE_LANDING_PAGES
  if (platformId === 'telegram') return TELEGRAM_LANDING_PAGES
  if (platformId === 'x') return X_LANDING_PAGES
  if (platformId === 'instagram') return LANDING_PAGES.filter((p) => !MOVED_LANDING_SLUGS.has(p.slug))
  return []
}

export function getPlatformLandingPage(platformId: PlatformId, slug: string): LandingPage | undefined {
  return getLandingPagesFor(platformId).find((p) => p.slug === slug)
}
