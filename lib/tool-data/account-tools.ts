import type { ToolDef } from '@/lib/tool-data/types'

export const ACCOUNT_TOOLS: readonly ToolDef[] = [
  {
    slug: 'instagram-fake-follower-checker',
    kind: 'fakecheck',
    group: 'Account Tools',
    platform: 'Instagram',
    name: 'Instagram Fake Follower Check',
    title: 'Instagram Fake Follower Check - Does an Account Look Organic?',
    h1: 'Instagram Fake Follower Check',
    description:
      'Free Instagram fake follower check. Enter public numbers to see if an account looks organic, with a risk level and a clear reason for each signal.',
    intro:
      'Does an Instagram account look organic? Enter a few public numbers for your own account or one you want to check. You get a risk level and a plain explanation for every signal.',
    about: [
      'No tool can tell from numbers alone whether a single follower is fake. What numbers can show is whether an account follows the patterns of real audiences. This check looks at five signals: engagement for the size of the account, comments compared with likes, followers versus following, followers per post and growth in the last 30 days.',
      'Each signal is marked as normal, worth a look or unusual, with a short reason. One unusual signal is not proof of anything, because viral posts and giveaways can change the numbers. Several unusual signals together are a better reason to look closer.',
      'Brands can use it as a first filter before working with a creator. After the check, open the latest posts and read the comments yourself. Real comments talk about the content, while generic emoji-only comments from unrelated accounts are a warning sign.',
    ],
    tips: [
      'Use averages from the last 10 to 20 posts, not your best or worst post.',
      'Add the growth of the last 30 days if you can. Sudden jumps are one of the clearest signals.',
      'Read the comments yourself after the check. Real comments mention the content of the post.',
    ],
    faqs: [
      {
        q: 'Can this tool tell me which followers are fake?',
        a: 'No. It cannot look at individual followers. It checks whether the public numbers of an account look like those of a real, active audience.',
      },
      {
        q: 'Does a high risk result prove an account bought followers?',
        a: 'No. Viral posts, giveaways and follow-for-follow groups can create the same patterns. Treat the result as a reason to look closer, not as proof.',
      },
      {
        q: 'Where do I find the numbers?',
        a: 'Followers, following and posts are on the profile. Likes and comments are public on each post, and the growth of the last 30 days is in Instagram Insights for your own account.',
      },
    ],
    cta: {
      text: 'Want your profile to look stronger? See our Instagram services.',
      href: '/instagram',
      label: 'See Instagram services',
    },
  },
  {
    slug: 'who-viewed-my-instagram-profile',
    kind: 'profileviewers',
    group: 'Account Tools',
    platform: 'Instagram',
    name: 'Who Viewed My Instagram Profile Check',
    title: 'Who Viewed My Instagram Profile? Real Check & Insights Calculator',
    h1: 'Who Viewed My Instagram Profile Check',
    description:
      'Can you see who viewed your Instagram profile? Check your real 7-day profile visits, silent Story viewers, and non-follower reach without risking your login.',
    intro:
      'Searching for who viewed your Instagram profile? Learn what Instagram actually tracks, avoid fake password-stealing apps, and calculate your silent profile visitors using real Insights.',
    about: [
      'Thousands of people search every day to see who viewed their Instagram profile. The honest truth is that Instagram does not provide a list of usernames for regular profile grid visits, and any third-party app asking for your password to show "secret stalkers" puts your account at risk.',
      'However, Instagram does give you four legitimate ways to see profile traffic and viewer identities: 24-hour Story viewer lists (available up to 48 hours in Archive), fresh Story Highlights, Close Friends Story checks, and the 7-day / 30-day Profile Visits counter inside Instagram Professional Insights.',
      'Use this calculator to compare your weekly profile visits with your Story viewers and non-follower reach. When your profile visits are high, strengthening your pinned Reels and social proof helps turn silent visitors into real followers.',
    ],
    tips: [
      'Never enter your Instagram login on third-party "who viewed my profile" apps — they cannot access private visitor logs.',
      'Add a fresh Story with an interactive sticker to your top Highlight; for 48 hours you can see every username that views it from your profile.',
      'Pin your 3 highest-performing Reels at the top of your grid so anonymous profile visitors have an immediate reason to follow.',
    ],
    faqs: [
      {
        q: 'Can anyone see who viewed their Instagram profile?',
        a: 'Not for regular profile or feed visits. Instagram only shows exact usernames when someone views your Story (within 48 hours) or interacts with a post, Reel or poll.',
      },
      {
        q: 'Are "Who Viewed My Instagram Profile" apps safe?',
        a: 'No. Meta disabled public visitor endpoints years ago. Apps claiming to show secret profile visitors either show random accounts from your followers list or phish your login credentials.',
      },
      {
        q: 'How do I see how many people visited my Instagram profile?',
        a: 'Switch to a free Creator or Business account in Instagram Settings. Your Professional Dashboard will show exact 7-day and 30-day Profile Visits at the top of your profile.',
      },
    ],
    cta: {
      text: 'Want silent profile visitors to take your page seriously? Boost your social proof with our Instagram services or try free Instagram views.',
      href: '/instagram',
      label: 'Explore Instagram services',
    },
  },
]
