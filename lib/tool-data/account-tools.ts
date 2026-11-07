import type { ToolDef } from '@/lib/tool-data/types'

export const ACCOUNT_TOOLS: readonly ToolDef[] = [
  {
    slug: 'instagram-fake-follower-checker',
    kind: 'fakecheck',
    group: 'Account Tools',
    platform: 'Instagram',
    name: 'Instagram Fake Follower Check',
    title: 'Instagram Fake Follower Checker — Free Bot & Audit Test (No Login)',
    h1: 'Instagram Fake Follower Check',
    description:
      'Free Instagram fake follower checker (no login required). Enter public numbers to test if an account has bots or real followers, with a clear risk score.',
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
  {
    slug: 'tiktok-shadowban-checker',
    kind: 'shadowban',
    widget: 'tiktok',
    group: 'Account Tools',
    platform: 'TikTok',
    name: 'TikTok Shadowban Checker',
    title: 'TikTok Shadowban Checker — Free FYP & Reach Restriction Test (2026)',
    h1: 'TikTok Shadowban Checker',
    description:
      'Are you shadowbanned on TikTok or stuck at 0–200 views? Free TikTok shadowban test to check For You Page (FYP) restrictions and fix your reach in 48 hours.',
    intro:
      'Stuck at 0 or 200 views on TikTok? Test whether your account is shadowbanned from the For You Page (FYP) or experiencing an algorithm cooldown — no login required.',
    about: [
      'A TikTok shadowban happens when the algorithm restricts your videos from appearing on the For You Page (FYP) or in search results without sending an explicit ban notice. Most creators notice it when their views suddenly drop from thousands to 0–200 views.',
      'This diagnostic tool compares your normal view baseline against your last 3 to 5 uploads, your FYP traffic percentage in TikTok Studio, and your Account Status flags to tell the difference between a real FYP restriction and a content retention dip.',
      'If your account is throttled, mass-deleting videos or re-uploading the same clip can make it worse. Follow the recovery checklist to clear flagged posts and rebuild early engagement velocity.',
    ],
    tips: [
      'Never delete and re-upload the exact same video file — TikTok flags duplicate video hashes as spam.',
      'Wait at least 2 to 3 hours between uploads if your views suddenly drop to 0.',
      'Check TikTok Studio → Analytics → Traffic Sources on your last 3 videos; if "For You" is under 5%, your video was held from recommendations.',
    ],
    faqs: [
      {
        q: 'How long does a TikTok shadowban last in 2026?',
        a: 'Most TikTok FYP restrictions last between 3 and 14 days once you remove or appeal any flagged content and avoid spammy posting behavior.',
      },
      {
        q: 'Why are my TikTok videos stuck at 200–300 views?',
        a: '200–300 views is NOT a shadowban — it is TikTok’s initial test batch on the For You Page. To break past 300 views, you need stronger watch-through completion and early likes/shares.',
      },
      {
        q: 'Why is my new TikTok video stuck at 0 views?',
        a: '0 views after 2+ hours means the video is either under automated safety review, contains unoriginal/watermarked footage, or was posted from a newly created account too quickly.',
      },
    ],
    cta: {
      text: 'Need stronger early momentum to push your TikTok videos past the 200-view test batch? See our TikTok services.',
      href: '/tiktok',
      label: 'Explore TikTok services',
    },
  },
  {
    slug: 'instagram-shadowban-checker',
    kind: 'shadowban',
    widget: 'instagram',
    group: 'Account Tools',
    platform: 'Instagram',
    name: 'Instagram Shadowban Tester',
    title: 'Instagram Shadowban Tester — Check Explore & Reels Reach (Free 2026)',
    h1: 'Instagram Shadowban Tester',
    description:
      'Test if your Instagram account is shadowbanned from Explore, Reels and hashtags. Free 30-second Instagram shadowban checker and recovery guide (no login).',
    intro:
      'Did your Instagram Reels or post reach suddenly crash? Run a 30-second diagnostic to see if your account is restricted from Explore, non-follower recommendations, or hashtag search.',
    about: [
      'Instagram now officially calls shadowbanning "Recommendation Guidelines restrictions." When a single post, Reel audio, or bio link triggers an automated filter, Instagram can quietly stop showing your content to non-followers on Explore and the Reels tab.',
      'Our Instagram Shadowban Tester checks your recent view drop-off, non-follower reach percentage, Account Status green checks, and niche hashtag visibility so you know exactly why your reach fell and how to restore it.',
    ],
    tips: [
      'Open Instagram Settings → Account Status right away; all four rows (Removed content, What can’t be recommended, Features you can’t use, Monetization) must have green checkmarks.',
      'If "What can’t be recommended" flags a post or bio link, edit or delete that item immediately to lift the Explore restriction.',
      'Strong early engagement in the first 30 minutes after posting signals Instagram to push your Reel to non-followers.',
    ],
    faqs: [
      {
        q: 'How do I know if I am shadowbanned on Instagram?',
        a: 'Check Settings → Account Status first, then look at your last 3 Reels in Insights. If non-follower reach dropped below 5% and your posts do not appear under niche hashtags, your recommendations are restricted.',
      },
      {
        q: 'How long does an Instagram shadowban last?',
        a: 'Once you remove or appeal the flagged post in Account Status, non-follower reach typically recovers within 48 hours to 14 days.',
      },
      {
        q: 'Can broken or banned hashtags cause an Instagram shadowban?',
        a: 'Yes. Using restricted or spam-flagged hashtags hides that post from all hashtag feeds. Stick to 3 to 5 specific niche hashtags relevant to your video.',
      },
    ],
    cta: {
      text: 'Want to reignite your Reels reach right away? Try our free Instagram views or see our Instagram growth packages.',
      href: '/free-instagram-views',
      label: 'Get free Instagram views',
    },
  },
]
