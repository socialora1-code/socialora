import type { ToolDef } from '@/lib/tool-data/types'

export const CAPTION_TOOLS: readonly ToolDef[] = [
  {
    slug: 'instagram-caption-generator',
    kind: 'caption',
    group: 'Caption Generators',
    platform: 'Instagram',
    name: 'Instagram Caption Generator',
    title: 'Instagram Caption Generator - Captions with Emojis & Hashtags',
    h1: 'Instagram Caption Generator',
    description:
      'Free Instagram caption generator. Pick selfie, travel, gym, food, funny, couple and more, then copy a caption with emojis and hashtag ideas.',
    intro:
      'Find the right words for your next post. Pick the type of post, add a topic if you like, and copy a caption with an emoji and hashtag ideas in one tap.',
    about: [
      'A good caption does not need to be long. It needs to fit the photo and sound like you. This generator groups captions by post type, such as selfie, travel, gym, food, funny, couple, friends, aesthetic, birthday and business, so you start from lines that already match your mood.',
      'Add a short topic, like a city or an activity, and some captions will use it. Press More captions for a fresh batch, copy the one you like and change a word or two so it feels personal.',
      'Every caption comes with an emoji, and you can copy it with a small set of hashtag ideas. Hashtags are ideas built from the post type and your topic, so check them in the app and keep the ones that are active and relevant.',
    ],
    tips: [
      'Keep it short when the photo says a lot. A few words often work better than a paragraph.',
      'Ask a question at the end if you want comments. It gives people an easy way to reply.',
      'Use a few relevant hashtags instead of a long block, and put them at the end or in the first comment.',
    ],
    faqs: [
      {
        q: 'Are these captions unique?',
        a: 'They are built from templates, so other people may see similar lines. Edit a word or two so the caption sounds like you.',
      },
      {
        q: 'How long can an Instagram caption be?',
        a: 'Instagram allows long captions, but only the first lines show before the “more” button. Put the most important words first.',
      },
      {
        q: 'Are the hashtags trending?',
        a: 'No. They are ideas built from your post type and topic. Search each one in the app to see how active it is.',
      },
    ],
    cta: {
      text: 'Want your next post to start stronger? See our Instagram services.',
      href: '/instagram',
      label: 'See Instagram services',
    },
  },
]
