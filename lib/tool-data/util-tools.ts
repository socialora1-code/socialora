import type { ToolDef } from '@/lib/tool-data/types'

export const UTIL_TOOLS: readonly ToolDef[] = [
  {
    slug: 'instagram-giveaway-picker',
    kind: 'picker',
    group: 'Utility Tools',
    platform: 'Instagram',
    name: 'Instagram Giveaway Picker',
    title: 'Instagram Giveaway Generator | Free, No Login',
    h1: 'Instagram Giveaway Picker',
    description:
      'Use this free Instagram giveaway generator to pick winners instantly. Paste your entrant list, choose a winner count and draw. No login needed.',
    intro:
      'Pick giveaway winners fairly and fast. Paste the usernames of everyone who entered, one per line, choose how many winners you need and press the button.',
       about: [
      "A fair giveaway depends on one thing: every entrant must have the same chance. This picker draws winners with your browser's built-in secure random generator, so no name is favored, and nothing you paste is saved or sent anywhere.",
      'A simple workflow: copy the usernames from your post comments, paste them here one per line, keep "Remove duplicate names" on so nobody gets extra chances, then pick. Always pick one or two backup winners, because some people never reply to the DM.',
      'Before you announce, screenshot the result or record your screen while you pick. Showing the draw openly builds trust with your followers and protects you if anyone questions the result.',
    ],
    tips: [
      'Post your rules and end date before you start, so everyone knows how the giveaway works.',
      'Copy the names from your comments and paste them here, one per line.',
      'Pick a backup winner too, in case someone does not reply.',
    ],
    faqs: [
      {
        q: 'Can I use the Instagram giveaway winner picker for backup winners?',
        a: 'Yes. Include backups in the number of names you draw, then record the order. If you need one winner and two backups, draw three names at once.',
      },
      {
        q: 'Can this tool read the comments on my post?',
        a: 'No. You paste the names yourself, and the tool picks randomly from your list.',
      },
      {
        q: 'Is the pick really random?',
        a: 'Yes. Every name has the same chance, and nothing is saved or sent anywhere.',
      },
      {
        q: 'What does "remove duplicates" do?',
        a: 'If someone commented several times, their name counts once. Turn it off if you want each entry to count separately.',
      },
    ],
    cta: {
      text: 'Want more people to see your next giveaway? See our Instagram services.',
      href: '/instagram',
      label: 'See Instagram services',
    },
  },
  {
    slug: 'whatsapp-link-generator',
    kind: 'link',
    group: 'Utility Tools',
    platform: 'WhatsApp',
    name: 'WhatsApp Link Generator',
    title: 'WhatsApp Link Generator - Create a Click-to-Chat Link',
    h1: 'WhatsApp Link Generator',
    description:
      'Free WhatsApp link generator. Enter a phone number and an optional message to create a wa.me click-to-chat link you can share anywhere.',
    intro:
      'Create a link that opens a WhatsApp chat in one tap. Enter the phone number with the country code, add a first message if you like, then copy your link.',
    tips: [
      'Write the number with the country code first, with no plus sign, spaces or leading zeros.',
      'A short pre-filled message such as "Hi, I have a question about..." makes it easy for people to start.',
      'Put the link in your Instagram bio, website or email signature so people can reach you quickly.',
    ],
    faqs: [
      {
        q: 'Do I need WhatsApp Business?',
        a: 'No. The link works with a regular WhatsApp number as well as a business one.',
      },
      {
        q: 'Can people message me without saving my number?',
        a: 'Yes. The link opens a chat with the number directly.',
      },
      {
        q: 'What format should phone numbers use for wa.me links?',
        a: 'Use the full international format with country code and area code, but omit any plus signs, spaces, dashes, or leading zeros (for example, 15551234567 for a US number).',
      }
    ],
  },
  {
    slug: 'youtube-thumbnail-downloader',
    kind: 'thumb',
    group: 'Utility Tools',
    platform: 'YouTube',
    name: 'YouTube Thumbnail Downloader',
    title: 'YouTube Thumbnail Downloader - Get Any Video Thumbnail',
    h1: 'YouTube Thumbnail Downloader',
    description:
      'Free YouTube thumbnail downloader. Paste a video link to see its thumbnail in every available size and open the full-size image.',
    intro:
      'Paste a YouTube video link and see its thumbnail in every size that exists. Open the one you need and save it from there.',
    tips: [
      'Study the thumbnails in your niche: clear faces, big text and strong contrast stand out.',
      'Test two thumbnails on your own video and keep the one that gets more clicks.',
      'It works with normal links, Shorts links and short youtu.be links.',
    ],
    faqs: [
      {
        q: 'Why is the biggest size missing?',
        a: 'Not every video has a full HD thumbnail. Older or low-resolution uploads may only have the smaller sizes.',
      },
      {
        q: 'Which links work?',
        a: 'Normal watch links, short youtu.be links, Shorts links, or just the 11-character video ID.',
      },
      {
        q: 'What resolution is the maximum quality YouTube thumbnail?',
        a: 'The maximum resolution thumbnail (maxresdefault.jpg) is 1920x1080 pixels (Full HD). If the creator did not upload a high-definition custom thumbnail, YouTube provides the 640x480 standard version instead.',
      }
    ],
    cta: {
      text: 'Working on your channel? See our YouTube views, watch time and subscribers.',
      href: '/youtube',
      label: 'See YouTube services',
    },
  },
]
