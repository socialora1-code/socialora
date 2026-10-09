import type { ServiceId } from '@/lib/catalog'

export interface LandingFaq {
  q: string
  a: string
}

export interface LandingPage {
  slug: string
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
    serviceId: "followers-real",
    title: "Buy High-Quality Instagram Followers",
    description:
      "Buy high-quality Instagram followers with a 365-day refill guarantee. Orders up to 500,000, no password needed, pay with crypto.",
    h1: "Buy High-Quality Instagram Followers",
    intro:
      "Our high-quality followers option comes with a 365-day refill guarantee and supports large orders up to 500,000. Pick your amount, enter your public profile link and check out.",
    points: [
      "365-day refill guarantee if your count drops",
      "Orders from 100 up to 500,000 followers",
      "Only your public profile link is needed, never your password",
    ],
    faqs: [
      {
        q: "What does the 365-day refill guarantee cover?",
        a: "If your follower count drops within 365 days after the order is completed, contact us with your order details and we will request a refill.",
      },
      {
        q: "What is the largest order I can place?",
        a: "You can order up to 500,000 followers in one order.",
      },
      ...COMMON_FAQS,
    ],
  },
]

export function getLandingPage(slug: string): LandingPage | undefined {
  return LANDING_PAGES.find((p) => p.slug === slug)
}
