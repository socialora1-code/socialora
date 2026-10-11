import type { ToolDef } from '@/lib/tool-data/types'

export const UTIL_TOOLS: readonly ToolDef[] = [
  {
    slug: 'instagram-giveaway-picker',
    kind: 'picker',
    group: 'Utility Tools',
    platform: 'Instagram',
    name: 'Instagram Giveaway Picker',
    title: 'Instagram Giveaway Picker - Random Winner Generator',
    h1: 'Instagram Giveaway Picker',
    description:
      'Free random winner picker for Instagram giveaways. Paste the names of your entrants, choose how many winners you need and pick fairly in one click.',
    intro:
      'Pick giveaway winners fairly and fast. Paste the usernames of everyone who entered, one per line, choose how many winners you need and press the button.',
    tips: [
      'Write your rules in the giveaway post: how to enter, the end date and how you will pick winners.',
      'Copy the entrants from your comments yourself, then paste them here. This tool does not connect to Instagram.',
      'Pick one or two backup winners in case someone does not reply.',
    ],
    faqs: [
      {
        q: 'Can this tool read the comments on my post?',
        a: 'No. It does not connect to Instagram. You paste the names yourself, and the tool picks randomly from that list.',
      },
      {
        q: 'Is the pick really random?',
        a: 'It uses your browser’s secure random number generator, and every name has the same chance. Nothing is saved or sent anywhere.',
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
        a: 'Yes. The link opens a chat with the number directly, so they do not need to save it first.',
      },
      {
        q: 'Does the tool store my number?',
        a: 'No. The link is built in your browser and nothing is sent to us.',
      },
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
      'Use thumbnails from other channels only as inspiration for your own design, or with the owner’s permission.',
      'Look at what works in your niche: clear faces, big text and strong contrast are common in thumbnails that get clicks.',
      'Test two thumbnails on your own video and keep the one people click more.',
    ],
    faqs: [
      {
        q: 'Why is the biggest size missing?',
        a: 'Not every video has a full HD thumbnail. Older or low-resolution uploads may only have the smaller sizes.',
      },
      {
        q: 'Can I use any thumbnail I download?',
        a: 'Thumbnails belong to the video’s creator. Use your own, or ask for permission before you use someone else’s.',
      },
      {
        q: 'Which links work?',
        a: 'Normal watch links, short youtu.be links, Shorts links, or just the 11-character video ID.',
      },
    ],
    cta: {
      text: 'Working on your channel? See our YouTube views, watch time and subscribers.',
      href: '/youtube',
      label: 'See YouTube services',
    },
  },
]
