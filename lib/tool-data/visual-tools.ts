import type { ToolDef } from '@/lib/tool-data/types'

export const VISUAL_TOOLS: readonly ToolDef[] = [
  {
    slug: 'instagram-grid-maker',
    kind: 'grid',
    group: 'Visual Tools',
    platform: 'Instagram',
    name: 'Instagram Grid Maker',
    title: 'Instagram Grid Maker - Split a Photo into a 3x3 Grid',
    h1: 'Instagram Grid Maker',
    description:
      'Free Instagram grid maker. Split one photo into a 3x3, 3x2 or 3x1 grid of tiles and download them to post as a giant picture on your profile.',
    intro:
      'Turn one big photo into a grid of tiles for your profile. Pick your photo, choose the grid size and download every tile. Your photo stays on your device.',
    tips: [
      'Post the tiles in reverse order, starting with the last one, so the picture lines up on your profile.',
      'Pick a photo with a clear subject in the middle. Tiny details get lost when the photo is split.',
      'Use a large, sharp photo. Small photos look blurry once they are cut into pieces.',
    ],
    faqs: [
      {
        q: 'Is my photo uploaded anywhere?',
        a: 'No. The photo is cut right in your browser and never leaves your device.',
      },
      {
        q: 'In what order should I post the tiles?',
        a: 'Start with the last tile and finish with the first one. That way the first tile ends up in the top left corner of your profile.',
      },
      {
        q: 'Which grid sizes can I make?',
        a: 'You can split a photo into 3x3, 3x2 or 3x1 tiles.',
      },
    ],
  },
  {
    slug: 'social-media-photo-resizer',
    kind: 'resize',
    group: 'Visual Tools',
    platform: 'Social Media',
    name: 'Social Media Photo Resizer',
    title: 'Social Media Photo Resizer - Instagram, Story, YouTube and X Sizes',
    h1: 'Social Media Photo Resizer',
    description:
      'Free social media photo resizer. Crop and resize any photo to the right size for Instagram posts, Stories, TikTok, YouTube thumbnails, YouTube banners and X headers.',
    intro:
      'Pick your photo, choose where you want to post it and download it at the right size. Everything happens in your browser, so your photo stays private.',
    tips: [
      'Keep the important part of your photo near the center, because the edges are cropped to fit.',
      'Start with a big, sharp photo. Enlarging a small photo makes it look blurry.',
      'Use the Story and TikTok size for any vertical video cover or Reels cover.',
    ],
    faqs: [
      {
        q: 'Is my photo uploaded anywhere?',
        a: 'No. Resizing happens on your device and nothing is sent to a server.',
      },
      {
        q: 'Why does the photo look cropped?',
        a: 'Each platform uses a different shape. The tool fills the new shape and trims whatever does not fit.',
      },
      {
        q: 'Which sizes are included?',
        a: 'Instagram post, Instagram square, Instagram and TikTok Story, YouTube thumbnail, YouTube banner and X header.',
      },
    ],
  },
  {
    slug: 'copy-paste-symbols',
    kind: 'symbols',
    group: 'Visual Tools',
    platform: 'Social Media',
    name: 'Copy and Paste Symbols',
    title: 'Copy and Paste Symbols - Cool Symbols for Bios and Captions',
    h1: 'Copy and Paste Symbols',
    description:
      'Free copy and paste symbols for Instagram bios, TikTok, captions and usernames. Tap any symbol to copy hearts, stars, arrows, lines and more.',
    intro:
      'Tap any symbol to copy it, then paste it into your bio, caption or name. Pick a category to find what you need fast.',
    tips: [
      'Use a few symbols as line dividers in your bio. Too many make it hard to read.',
      'Check how a symbol looks on your phone. Some devices draw symbols a little differently.',
      'Arrows and hearts work well at the start of a line to point people to your link.',
    ],
    faqs: [
      {
        q: 'How do I copy a symbol?',
        a: 'Tap the symbol. It is copied to your clipboard, and you can paste it anywhere.',
      },
      {
        q: 'Do these work on Instagram and TikTok?',
        a: 'Yes. They are normal text characters, so you can paste them into bios, captions, comments and names.',
      },
      {
        q: 'Why does a symbol look different on another phone?',
        a: 'Each device has its own font, so the same symbol can look slightly different.',
      },
    ],
  },
  {
    slug: 'follower-goal-calculator',
    kind: 'goal',
    group: 'Visual Tools',
    platform: 'Instagram',
    name: 'Follower Goal Calculator',
    title: 'Follower Goal Calculator - How Long to Reach Your Follower Goal',
    h1: 'Follower Goal Calculator',
    description:
      'Free follower goal calculator. Enter your followers, your goal and how many you gain each week to see how long it takes and how your growth looks on a chart.',
    intro:
      'Find out how long it takes to reach your follower goal. Enter where you are, where you want to be and how many followers you gain per week.',
    tips: [
      'Use your real average from the last month, not your best week.',
      'Growth is rarely steady. Treat the result as a rough estimate.',
      'Set smaller goals along the way, like your next 1,000. They keep you going.',
    ],
    faqs: [
      {
        q: 'Is the result exact?',
        a: 'No. It is an estimate based on steady growth, and real growth goes up and down.',
      },
      {
        q: 'What if I gain a different number each week?',
        a: 'Use your average over the last few weeks.',
      },
      {
        q: 'Does it work for TikTok, YouTube and X?',
        a: 'Yes. It only uses numbers, so you can use it for any platform.',
      },
    ],
    cta: {
      text: 'Want to move faster? See our services for Instagram, TikTok, YouTube and X.',
      href: '/instagram',
      label: 'See Instagram services',
    },
  },
]
