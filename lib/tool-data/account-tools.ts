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
    title: 'Who Viewed My Instagram Profile? Free Viewer Check & Insights (2026)',
    h1: 'Who Viewed My Instagram Profile Check',
    description:
      'Find out who viewed your Instagram profile and how many secret visitors checked your page. Free Instagram profile viewer calculator, Story stalker tricks & Insights guide — no password needed.',
    intro:
      'Want to see who viewed your Instagram profile? Check your real 7-day profile visits, estimate silent profile stalkers, and use the 4 real Instagram features that reveal exact viewer usernames — 100% free and without risking your password.',
    about: [
      'Every day, thousands of users search "who viewed my Instagram profile" or "can you see who stalks your Instagram." The honest fact: Instagram does not show usernames for regular profile grid visits, and any third-party app or site asking for your login to show a "secret stalker list" is either guessing from public likes or trying to steal your account.',
      'However, Instagram gives you four legitimate, built-in ways to track profile viewers and reveal usernames: 24-hour Story viewer lists (kept for 48 hours in your Story Archive), fresh Pinned Highlights with poll/slider stickers, Close Friends Story filters, and the 7-day / 30-day Profile Visits counter inside Instagram Professional Insights.',
      'Use our free Instagram Profile Viewer Check above to compare your weekly profile visits against your Story viewers and non-follower reach. When you see high silent profile traffic, pinning your best Reels and boosting social proof helps turn anonymous visitors into real followers.',
    ],
    tips: [
      'Never enter your Instagram password on third-party "who viewed my profile" apps — Meta disabled private visitor list APIs years ago.',
      'Add a new Story with an interactive poll or emoji slider to your first Highlight; for 48 hours, you can see every exact username that opens it from your profile.',
      'Check how your Story viewer list is ordered after 50+ views: accounts that frequently visit your profile and message you appear near the top even if they never like your posts.',
      'Pin your 3 highest-view Reels at the top of your grid so silent profile visitors immediately see strong social proof and tap Follow.',
    ],
    faqs: [
      {
        q: 'Can you see who viewed your Instagram profile in 2026?',
        a: 'Not for regular profile or feed visits. Instagram keeps profile grid browsing anonymous, and only reveals exact usernames when someone views your Story (for 48 hours in Archive), taps a fresh Story Highlight, or interacts with a post or Reel.',
      },
      {
        q: 'Do "Who Viewed My Instagram Profile" apps actually work?',
        a: 'No. Third-party profile viewer apps cannot access private visitor data. They either display random usernames from your followers list or phish your Instagram login credentials.',
      },
      {
        q: 'How does Instagram sort your Story viewer list?',
        a: 'Under 50 views, Story viewers appear in reverse chronological order. Above 50 views, Instagram ranks accounts based on profile visits, Story views, DMs and feed interactions — so accounts at the very top who never like your posts are your most active silent viewers.',
      },
      {
        q: 'How do I check how many people visited my Instagram profile?',
        a: 'Switch to a free Creator or Business account in Settings → Account type and tools. Your Professional Dashboard will display exact 7-day and 30-day Profile Visits right at the top of your profile.',
      },
    ],
    cta: {
      text: 'Want silent profile visitors to take your page seriously? Boost your social proof with our Instagram services or try free Instagram views.',
      href: '/instagram',
      label: 'Explore Instagram services',
    },
  },
]
