export const CONTENT_GOALS = {
  reels: { label: 'Reels Discovery', broad: ['Reels', 'Video'], intent: ['Tutorial', 'Demo', 'BehindTheScenes', 'InAction', 'HowTo', 'Walkthrough', 'QuickGuide', 'Highlights'] },
  page: { label: 'Page Engagement', broad: ['Ideas', 'Stories'], intent: ['Discussion', 'Questions', 'Feedback', 'Poll', 'PageUpdate', 'Experiences', 'QandA', 'WhatDoYouThink'] },
  community: { label: 'Community / Groups', broad: ['Community', 'Interests'], intent: ['GroupTips', 'Meetup', 'Beginners', 'Advice', 'Resources', 'Members', 'GroupDiscussion', 'MeetTheGroup'] },
  product: { label: 'Product / Link Clicks', broad: ['Products', 'Shopping'], intent: ['Review', 'Comparison', 'BuyingGuide', 'ProductDemo', 'Features', 'Setup', 'ProductGuide', 'UseCases'] },
} as const

export type ContentGoal = keyof typeof CONTENT_GOALS

export const QUICK_NICHES = [
  { label: 'Food', detail: 'Easy recipes' },
  { label: 'Fitness', detail: 'Home workouts' },
  { label: 'Travel', detail: 'Weekend trips' },
  { label: 'Small business', detail: 'Product demos' },
  { label: 'Photography', detail: 'Portrait lighting' },
] as const

function tagStem(value: string) {
  return value.normalize('NFKC').replace(/[^\p{L}\p{M}\p{N}]/gu, '').toLowerCase()
}

function rotate<T>(items: readonly T[], round: number) {
  const offset = round % items.length
  return [...items.slice(offset), ...items.slice(0, offset)]
}

export function makeHashtagBuckets(topic: string, detail: string, goal: ContentGoal, round: number) {
  const keyword = tagStem(topic)
  if (!/[\p{L}\p{N}]/u.test(keyword)) return []

  const secondary = tagStem(detail)
  const pattern = CONTENT_GOALS[goal]
  const used = new Set<string>()
  const takeTags = (candidates: string[]) => {
    const tags = [...new Set(candidates.map((candidate) => `#${candidate}`))]
      .filter((tag) => !used.has(tag))
      .slice(0, 6)
    tags.forEach((tag) => used.add(tag))
    return tags
  }

  const variant = secondary || keyword
  return [
    {
      label: 'Broad Reach',
      hint: 'Label the main subject and post format.',
      tags: takeTags([keyword, ...rotate([...pattern.broad, 'Posts', 'Content', 'Creators', 'Daily', 'Updates'], round).map((suffix) => keyword + tagStem(suffix))]),
    },
    {
      label: 'Niche Specific',
      hint: 'Name the exact skill, audience, or angle.',
      tags: takeTags([
        ...(secondary ? [keyword + secondary, secondary] : []),
        ...rotate(['Tips', 'Examples', 'Skills', 'Projects', 'Basics', 'Practice', 'Techniques'], round).map((suffix) => variant + tagStem(suffix)),
      ]),
    },
    {
      label: 'High Intent / Community',
      hint: 'Match what readers want to do next.',
      tags: takeTags(rotate(pattern.intent, round).map((suffix) => keyword + tagStem(suffix))),
    },
  ]
}

export const CAPTION_TONES = {
  curiosity: 'Curiosity Hook',
  story: 'Story / Personal',
  discussion: 'Discussion Starter',
  short: 'Short / Spotlight',
} as const

export type CaptionTone = keyof typeof CAPTION_TONES
export type CaptionPlatform = 'facebook' | 'snapchat'

type CaptionDraft = {
  hook: string
  context: string
  question: string
}

const CAPTION_FORMATS: Record<CaptionPlatform, Record<CaptionTone, string>> = {
  facebook: { curiosity: 'Reels', story: 'Feed', discussion: 'Feed', short: 'Stories / Reels' },
  snapchat: { curiosity: 'Spotlight', story: 'Stories', discussion: 'Stories / Replies', short: 'Spotlight / Stories' },
}

const CAPTION_DRAFTS: Record<CaptionPlatform, Record<CaptionTone, readonly CaptionDraft[]>> = {
  facebook: {
    curiosity: [
      { hook: 'What changes when you try {topic} a different way?', context: 'Put the two approaches side by side so the difference is easy to see.', question: 'Which approach would you try first, and why?' },
      { hook: 'Before your next go at {topic}, look at the first step.', context: 'Start with one small trial and keep the rest of your setup the same.', question: 'What would you change on the next try?' },
      { hook: 'What does {topic} actually look like in practice?', context: 'Start with the result, then walk back through the one decision that shaped it.', question: 'Which part would you want to see up close?' },
      { hook: 'What gets overlooked in {topic}?', context: 'Zoom in on the part that happens before the result comes together.', question: 'Where would you spend more time?' },
    ],
    story: [
      { hook: 'A small moment from {topic} stayed with me.', context: 'The little details are what I want to remember about this one.', question: 'What detail from your own experience sticks with you?' },
      { hook: 'A page from my {topic} notes.', context: 'I want to remember the parts in between as much as the finished result.', question: 'What would you keep a record of?' },
      { hook: 'Here is a quieter side of {topic}.', context: 'I wanted to share the part that rarely makes it into the final photo.', question: 'Which part of the process do you enjoy most?' },
      { hook: 'A little behind the scenes of {topic}.', context: 'This is the part I would show a friend who wondered what it felt like.', question: 'Which part would you show first?' },
    ],
    discussion: [
      { hook: 'Where would you start with {topic}?', context: 'Imagine you have one afternoon to try it. Pick a first step you can finish that day.', question: 'What would you do first with the time you have?' },
      { hook: 'What does a good result in {topic} look like to you?', context: 'Think of something you could point to in a photo, a clip, or a screenshot.', question: 'Which detail would tell you it worked?' },
      { hook: 'What makes {topic} worth coming back to?', context: 'Think about the step you would keep if you had to simplify the whole process.', question: 'What would you keep and what would you drop?' },
      { hook: 'What advice about {topic} would you give a beginner?', context: 'A concrete example can make a small piece of advice easier to try.', question: 'What example would you show them?' },
    ],
    short: [
      { hook: '{topic} in one take.', context: 'A quick look at the process.', question: 'Which part should I show next?' },
      { hook: 'A closer look at {topic}.', context: 'One moment from today.', question: 'What caught your eye?' },
      { hook: 'A small {topic} update.', context: 'Here is where it stands.', question: 'What would you try next?' },
      { hook: '{topic}, up close.', context: 'Here is the detail I wanted to share.', question: 'Which detail would you keep?' },
    ],
  },
  snapchat: {
    curiosity: [
      { hook: 'Spot the detail in {topic}.', context: 'Here is a closer look.', question: 'What did you notice first?' },
      { hook: 'What happened next with {topic}?', context: 'Here is how the scene played out.', question: 'What did you expect to happen?' },
      { hook: 'Ever seen {topic} from this angle?', context: 'Same scene, closer frame.', question: 'Which angle would you use?' },
      { hook: 'Watch this part of {topic}.', context: 'A quick cut from the middle.', question: 'Where would you pause the clip?' },
    ],
    story: [
      { hook: 'A little {topic} from my day.', context: 'This is the clip I wanted to keep.', question: 'What moment would you save?' },
      { hook: 'The quieter side of {topic}.', context: 'A frame from in between the big moments.', question: 'What would you put in your Story?' },
      { hook: 'One memory from {topic}.', context: 'This frame takes me back to it.', question: 'Which detail would you remember?' },
      { hook: 'A quick {topic} check-in.', context: 'This is what my day looked like.', question: 'What did yours look like?' },
    ],
    discussion: [
      { hook: 'Your take on {topic}?', context: 'Here is my angle in one clip.', question: 'What would you do differently?' },
      { hook: 'How would you film {topic}?', context: 'I went with a close shot.', question: 'Which angle would you choose?' },
      { hook: 'Your first move with {topic}?', context: 'Think about the first few seconds.', question: 'What would you show first?' },
      { hook: 'What would you keep in a {topic} clip?', context: 'Imagine you only have room for one shot.', question: 'Which moment makes the cut?' },
    ],
    short: [
      { hook: '{topic} in one snap.', context: 'A quick look.', question: 'What caught your eye?' },
      { hook: 'A glimpse of {topic}.', context: 'One moment today.', question: 'What should I show next?' },
      { hook: '{topic} in motion.', context: 'Here is the clip.', question: 'Where would you cut it?' },
      { hook: 'One frame of {topic}.', context: 'This is my pick.', question: 'Which frame is yours?' },
    ],
  },
}

export function makeCaptionDrafts(input: string, platform: CaptionPlatform, tone: CaptionTone, round: number) {
  const topic = input.replace(/[\u2013\u2014]/g, '-').replace(/\s+/g, ' ').trim().replace(/[.!?]+$/, '').trim()
  if (!topic) return []

  const stem = tagStem(topic)
  const descriptor = { curiosity: 'inpractice', story: 'diary', discussion: 'discussion', short: 'clips' }[tone]
  const tags = /[\p{L}\p{N}]/u.test(stem) ? [`#${stem}`, `#${stem}${descriptor}`].join(' ') : ''

  return rotate(CAPTION_DRAFTS[platform][tone], round * 2).slice(0, 2).map((draft) => {
    const hook = draft.hook.replace('{topic}', () => topic)
    const text = [hook, draft.context, draft.question].join('\n\n')
    const words = text.trim().split(/\s+/).length
    const seconds = Math.max(1, Math.ceil(words * 60 / 200))
    return { ...draft, hook, text, tags, seconds, characters: Array.from(text).length, format: CAPTION_FORMATS[platform][tone] }
  })
}
