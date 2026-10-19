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
]
