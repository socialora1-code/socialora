export interface GenField {
  id: string
  label: string
  placeholder: string
}

export interface GenConfig {
  /** The first field is required, the others are optional. */
  fields: GenField[]
  empty: string
  note: string
  generate: (values: Record<string, string>, round: number) => string[]
}

const clean = (s?: string): string => (s ?? '').replace(/\s+/g, ' ').trim()
const slug = (s?: string): string => clean(s).toLowerCase().replace(/[^a-z0-9]/g, '')
const titleCase = (s?: string): string =>
  clean(s)
    .toLowerCase()
    .replace(/\b[a-z]/g, (c) => c.toUpperCase())

function rotate<T>(list: readonly T[], round: number, count: number): T[] {
  const out: T[] = []
  const size = Math.min(count, list.length)
  for (let i = 0; i < size; i++) out.push(list[(round * count + i) % list.length])
  return out
}

function bioConfig(limit: number, templates: readonly string[], note: string): GenConfig {
  return {
    fields: [
      { id: 'topic', label: 'What you do or post about', placeholder: 'e.g. travel photographer' },
      { id: 'extra', label: 'Extra detail (optional)', placeholder: 'e.g. Lisbon, or a favorite phrase' },
    ],
    empty: 'Type what you do or post about to get bio ideas.',
    note,
    generate: (v, round) => {
      const t = clean(v.topic)
      const x = clean(v.extra)
      const usable = templates
        .filter((tpl) => x || !tpl.includes('{x}'))
        .map((tpl) => tpl.replace(/\{t\}/g, t).replace(/\{x\}/g, x))
        .filter((s) => s.length <= limit)
      return rotate(usable, round, 6)
    },
  }
}

function templateConfig(opts: {
  label: string
  placeholder: string
  empty: string
  note: string
  templates: readonly string[]
  count: number
}): GenConfig {
  return {
    fields: [{ id: 'topic', label: opts.label, placeholder: opts.placeholder }],
    empty: opts.empty,
    note: opts.note,
    generate: (v, round) => {
      const t = clean(v.topic)
      return rotate(
        opts.templates.map((tpl) => tpl.replace(/\{t\}/g, t)),
        round,
        opts.count,
      )
    },
  }
}

function hashtagConfig(
  suffixes: readonly string[],
  prefixes: readonly string[],
  perSet: number,
  note: string,
): GenConfig {
  return {
    fields: [
      { id: 'keyword', label: 'Your topic or keyword', placeholder: 'e.g. travel' },
      { id: 'second', label: 'Second keyword (optional)', placeholder: 'e.g. photography' },
    ],
    empty: 'Type a topic to get hashtag ideas.',
    note,
    generate: (v, round) => {
      const k = slug(v.keyword)
      const k2 = slug(v.second)
      if (!k) return []
      const all = [
        `#${k}`,
        ...(k2 ? [`#${k2}`, `#${k}${k2}`] : []),
        ...suffixes.map((s) => `#${k}${s}`),
        ...prefixes.map((p) => `#${p}${k}`),
      ]
      const tags = Array.from(new Set(all))
      const offset = (round * 4) % tags.length
      const rot = [...tags.slice(offset), ...tags.slice(0, offset)]
      const sets: string[] = []
      for (let i = 0; i < rot.length; i += perSet) sets.push(rot.slice(i, i + perSet).join(' '))
      return sets.slice(0, 3)
    },
  }
}

const BIO_NOTE = 'These ideas are built from templates and your own words. Edit them so they sound like you.'
const IDEA_NOTE = 'These are starting points built from templates. Change the wording to match your style.'

export const GENERATORS: Record<string, GenConfig> = {
  'hook-instagram': templateConfig({
    label: 'What should the viewer notice?',
    placeholder: 'e.g. a shortcut for invoice approvals',
    empty: 'Enter a topic to get opening lines for your Reel.',
    note: 'Pick a hook you can support with a clip or demonstration. Replace broad wording with the exact detail viewers will see.',
    count: 4,
    templates: [
      'Here is the first thing I check when it comes to {t}.',
      'Watch this example of {t}. Can you spot the decision that changes the result?',
      'Before your next attempt at {t}, check this one detail.',
      'What does {t} look like in practice? Start with this clip.',
      'I will show you the part of {t} that is easy to miss.',
      'If you are comparing approaches to {t}, watch what happens here.',
      'Here is one question to ask before you try {t}.',
      'Can you explain {t} in one clip? This is where I would start.',
    ],
  }),
  'bio-instagram': bioConfig(
    150,
    [
      '{t} ✨ Sharing the good stuff, one post at a time',
      '{t} | {x}',
      'Here for {t} and good vibes',
      '{t}\n📍 {x}\n👇 Latest below',
      'Just a {t} doing my thing',
      'All about {t}. DM for collabs',
      '{t} in progress 🚀',
      'Daily {t}. Real life. No filter',
      '{t} • {x} • Say hi 👋',
      'Turning {t} into something fun',
    ],
    BIO_NOTE,
  ),
  'bio-tiktok': bioConfig(
    80,
    [
      '{t} 🎬 New videos often',
      'Your daily dose of {t}',
      '{t} | {x}',
      'Making {t} fun 🤝',
      '{t} stuff, no filter',
      'Follow for more {t} ✨',
      '{t} • {x}',
      'Learning {t} out loud',
      'Real {t}. Real me.',
      '{t} content, every week',
    ],
    BIO_NOTE,
  ),
  'bio-x': bioConfig(
    160,
    [
      '{t}. Thoughts, links and the occasional hot take.',
      'Writing about {t}. {x}',
      '{t} | {x} | Opinions are my own',
      'I post about {t}. Say hi.',
      'Building in public. {t}.',
      'Obsessed with {t}. Sharing what I learn.',
      '{t}. Follow for threads and daily notes.',
      'Curious about {t}. Always learning.',
    ],
    BIO_NOTE,
  ),
  'bio-facebook': bioConfig(
    101,
    [
      '{t} lover. Always up for a chat.',
      'Into {t}. {x}',
      '{t} fan, coffee drinker, good-times collector',
      'Sharing my {t} journey',
      'Living for {t} 🌟',
      '{t} • {x}',
      'Proud {t} enthusiast',
      'Here for {t} and good company',
    ],
    BIO_NOTE,
  ),
  'bio-discord': bioConfig(
    190,
    [
      '{t}. Here to chat and have fun. DMs open for good vibes.',
      'Into {t}. {x}',
      '{t} nerd. Always down for a game or a chat.',
      'Just a {t} fan hanging out in servers.',
      '{t} | {x} | Say hi!',
      'Chill person who loves {t}.',
      'Talk to me about {t} anytime.',
      '{t} enthusiast and professional snack-lover',
    ],
    BIO_NOTE,
  ),
  'hashtag-instagram': hashtagConfig(
    ['daily', 'life', 'love', 'lovers', 'community', 'tips', 'inspo', 'gram', 'vibes', 'goals', 'world', 'official', 'ideas', 'addict'],
    ['explore', 'love', 'best', 'my', 'daily', 'team'],
    10,
    'These hashtags are ideas built from your keyword. We cannot see how popular each one is, so search them in the app and keep the ones that are active and relevant to your post.',
  ),
  'hashtag-facebook': hashtagConfig(
    ['community', 'tips', 'life', 'daily', 'lovers', 'ideas'],
    ['love', 'best', 'my'],
    5,
    'These hashtags are ideas built from your keyword. A few relevant tags usually read better than a long list. Search them on Facebook before you use them.',
  ),
  'username-instagram': {
    fields: [
      { id: 'name', label: 'Your name or a word you like', placeholder: 'e.g. maya' },
      { id: 'word', label: 'Interest or niche (optional)', placeholder: 'e.g. travel' },
    ],
    empty: 'Type a name or word to get username ideas.',
    note: 'We cannot check if a username is taken. Search each idea in the app, and add a small change if it is already used.',
    generate: (v, round) => {
      const a = slug(v.name)
      const b = slug(v.word)
      if (!a) return []
      const list = [
        `${a}.official`,
        `the.${a}`,
        `${a}_daily`,
        `its${a}`,
        `${a}.studio`,
        `hello.${a}`,
        `${a}.hq`,
        `real.${a}`,
        `${a}.co`,
        `${a}.world`,
        `just.${a}`,
        `${a}_here`,
      ]
      if (b) list.unshift(`${a}.${b}`, `${a}_${b}`, `${b}.by.${a}`, `${b}with${a}`, `the${b}.${a}`, `${a}${b}`)
      return rotate(
        list.filter((u) => u.length <= 30),
        round,
        8,
      )
    },
  },
  'caption-tiktok': templateConfig({
    label: 'What is your video about?',
    placeholder: 'e.g. cooking pasta',
    empty: 'Type your video topic to get caption ideas.',
    note: IDEA_NOTE,
    count: 6,
    templates: [
      'POV: you finally get into {t}',
      'Tell me you love {t} without telling me',
      '{t}, but make it fun',
      'Wait for the end ✨ {t}',
      'Things nobody tells you about {t}',
      'Another day, more {t}',
      "Save this if you're into {t}",
      "Trying {t} so you don't have to",
      'This is your sign to try {t}',
      'Small {t} wins add up',
      'Rate my {t} from 1 to 10',
      'Not me getting obsessed with {t} again',
    ],
  }),
  'caption-facebook': templateConfig({
    label: 'What is your post about?',
    placeholder: 'e.g. my new garden',
    empty: 'Type your post topic to get caption ideas.',
    note: IDEA_NOTE,
    count: 5,
    templates: [
      "Today's focus: {t}. What's yours?",
      'Anyone else into {t}? Tell me in the comments.',
      'Sharing a little {t} today',
      "Happy to share what I've learned about {t}",
      'Small {t} moment that made my day',
      'Weekend plans: {t}. What about you?',
      'A few thoughts on {t} I wanted to share',
      'Throwback to some great {t} times',
      'Quick question for the {t} fans here...',
      '{t} makes a good day better',
    ],
  }),
  'caption-snapchat': templateConfig({
    label: 'What are you posting about?',
    placeholder: 'e.g. beach day',
    empty: 'Type a topic to get caption ideas.',
    note: IDEA_NOTE,
    count: 5,
    templates: [
      'Mood: {t}',
      '{t} kind of day',
      'Caught up in {t}',
      'Me and {t}, always',
      'Current obsession: {t}',
      'No plans, just {t}',
      '{t} vibes only',
      'Quick {t} break',
      'Living my best {t} life',
      'Rare {t} moment',
    ],
  }),
  'youtube-tags': {
    fields: [{ id: 'topic', label: 'Your video topic', placeholder: 'e.g. home workout' }],
    empty: 'Type your video topic to get tag ideas.',
    note: 'These are keyword ideas built from your topic, not data about what people search. Keep the tags that really describe your video, and paste them into YouTube Studio.',
    generate: (v, round) => {
      const t = clean(v.topic).toLowerCase()
      if (!t) return []
      const year = new Date().getFullYear()
      const tags = Array.from(
        new Set([
          t,
          `${t} tutorial`,
          `how to ${t}`,
          `${t} for beginners`,
          `best ${t}`,
          `${t} tips`,
          `${t} ${year}`,
          `${t} ideas`,
          `${t} guide`,
          `learn ${t}`,
          `${t} explained`,
          `${t} mistakes`,
          `${t} tricks`,
          `${t} step by step`,
          `${t} review`,
          `${t} basics`,
        ]),
      )
      const offset = (round * 5) % tags.length
      const rot = [...tags.slice(offset), ...tags.slice(0, offset)]
      return [rot.slice(0, 8).join(', '), rot.slice(8, 16).join(', ')].filter(Boolean)
    },
  },
  'youtube-channel-names': {
    fields: [
      { id: 'topic', label: 'Your channel topic', placeholder: 'e.g. cooking' },
      { id: 'word', label: 'Your name or a word you like (optional)', placeholder: 'e.g. Sam' },
    ],
    empty: 'Type your channel topic to get name ideas.',
    note: 'We cannot check if a name is taken. Search each idea on YouTube before you decide.',
    generate: (v, round) => {
      const t = titleCase(v.topic)
      const w = titleCase(v.word)
      if (!t) return []
      const list = [
        `${t} Hub`,
        `The ${t} Lab`,
        `${t} Daily`,
        `Just ${t}`,
        `${t} Studio`,
        `${t} Corner`,
        `Everyday ${t}`,
        `${t} Unfiltered`,
        `Simply ${t}`,
        `${t} Central`,
        `Team ${t}`,
        `${t} Zone`,
      ]
      if (w) list.unshift(`${w} ${t}`, `${t} with ${w}`, `${w}'s ${t}`)
      return rotate(list, round, 8)
    },
  },
  'content-ideas-instagram': templateConfig({
    label: 'Your niche or topic',
    placeholder: 'e.g. fitness',
    empty: 'Type your niche to get content ideas.',
    note: IDEA_NOTE,
    count: 6,
    templates: [
      '{t}: 5 mistakes beginners make',
      'A day in the life of someone who does {t}',
      'Myth vs fact: {t}',
      '3 tools I use for {t}',
      'Before and after: my {t} progress',
      'Answer the most asked question about {t}',
      '{t} on a budget',
      'What I wish I knew before starting {t}',
      'Behind the scenes of my {t} routine',
      'Beginner vs pro: {t}',
      'Reply to a comment about {t} with a video',
      'One {t} habit that changed things for me',
    ],
  }),
    }
