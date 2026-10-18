'use client'

import { useState } from 'react'

type Category = {
  id: string
  label: string
  emojis: string[]
  tags: string[]
  captions: string[]
}

const CATEGORIES: Category[] = [
  {
    id: 'selfie',
    label: 'Selfie',
    emojis: ['📸', '✨', '😎', '🤍', '🌟'],
    tags: ['selfie', 'selfieoftheday', 'mood', 'smile', 'photooftheday'],
    captions: [
      'Caught on a good day.',
      'Camera roll, meet your new favorite.',
      'Feeling like myself today.',
      'Just me, no filter needed.',
      'Smile first, explain later.',
      'This is my good side. Both of them.',
      'Soft light, good mood.',
      'Not trying to impress anyone, just happy.',
      'Dressed up with nowhere to go.',
      'Today’s energy: {t}',
    ],
  },
  {
    id: 'travel',
    label: 'Travel',
    emojis: ['✈️', '🌍', '🌅', '🧳', '🏝️'],
    tags: ['travel', 'wanderlust', 'traveldiaries', 'explore', 'vacationmode'],
    captions: [
      'Collecting moments, not things.',
      'Somewhere new always looks good on me.',
      'The best view comes after the hardest climb.',
      'Out of office, into the world.',
      'Take me back already.',
      'Passport full, heart fuller.',
      'Lost in the best way.',
      'Good places make good stories.',
      'Still dreaming about this view.',
      'Trip notes: {t}',
    ],
  },
  {
    id: 'gym',
    label: 'Gym',
    emojis: ['💪', '🔥', '🏋️', '⚡', '🏃'],
    tags: ['gym', 'fitness', 'workout', 'fitnessmotivation', 'trainhard'],
    captions: [
      'Showed up. That is the win.',
      'Sweat now, smile later.',
      'Progress, not perfection.',
      'Small reps, big change.',
      'Today I chose the harder option.',
      'Stronger than yesterday.',
      'No shortcuts, just the work.',
      'The only bad workout is the one I skipped.',
      'Rest day? Not today.',
      'Training update: {t}',
    ],
  },
  {
    id: 'food',
    label: 'Food',
    emojis: ['🍕', '😋', '☕', '🍰', '🥑'],
    tags: ['foodie', 'foodphotography', 'yum', 'instafood', 'delicious'],
    captions: [
      'Good food, good mood.',
      'Calories don’t count when it tastes this good.',
      'Table for one, plate for two.',
      'Love at first bite.',
      'Eat first, post second. Okay, both at once.',
      'This is my kind of therapy.',
      'Save room for dessert.',
      'Coffee first, then everything else.',
      'Made with love and a little extra cheese.',
      'Today’s special: {t}',
    ],
  },
  {
    id: 'funny',
    label: 'Funny',
    emojis: ['😂', '🙃', '🤪', '😅', '🤷'],
    tags: ['funny', 'humor', 'relatable', 'lol', 'mood'],
    captions: [
      'I have no idea what I’m doing, but I’m doing it confidently.',
      'My plans were great until real life showed up.',
      'Running on coffee and questionable decisions.',
      'I’m not late, everyone else is just early.',
      'Adulting is just googling things and hoping for the best.',
      'I came, I saw, I forgot why.',
      'My bed and I are in a very serious relationship.',
      'Professional overthinker, amateur everything else.',
      'This photo took 37 tries.',
      'Me and {t}: it’s complicated.',
    ],
  },
  {
    id: 'couple',
    label: 'Couple',
    emojis: ['❤️', '🥰', '💑', '💫', '🌹'],
    tags: ['couplegoals', 'love', 'together', 'relationship', 'couple'],
    captions: [
      'Home is wherever you are.',
      'Better together, every single day.',
      'You are my favorite part of every day.',
      'Found my person.',
      'Love looks good on us.',
      'My favorite story is the one with you.',
      'Same team, always.',
      'Still choosing you.',
      'Two hearts, one plan.',
      'With you: {t}',
    ],
  },
  {
    id: 'friends',
    label: 'Friends',
    emojis: ['👯', '🥂', '🤗', '🎉', '💛'],
    tags: ['friends', 'friendship', 'squad', 'goodtimes', 'bestfriends'],
    captions: [
      'Friends are the family we choose.',
      'Good friends, good times.',
      'Better with my people.',
      'Our group chat is louder than this photo.',
      'The kind of friends you call at 2 a.m.',
      'Making memories with my favorites.',
      'No one else I’d rather be chaotic with.',
      'Laughing until it hurts, again.',
      'Squad goals, no explanation needed.',
      'Weekend with the crew: {t}',
    ],
  },
  {
    id: 'aesthetic',
    label: 'Aesthetic',
    emojis: ['🌙', '🤍', '🌿', '🕊️', '✨'],
    tags: ['aesthetic', 'aestheticvibes', 'minimal', 'moodboard', 'vibes'],
    captions: [
      'Quiet moments, loud feelings.',
      'Soft days only.',
      'Light, shadow and everything between.',
      'Collecting little pieces of calm.',
      'Slow mornings, golden hours.',
      'Less noise, more peace.',
      'Made of sunsets and small joys.',
      'Stay in your own world a little longer.',
      'Simple, still, beautiful.',
      'Mood: {t}',
    ],
  },
  {
    id: 'birthday',
    label: 'Birthday',
    emojis: ['🎂', '🎉', '🎈', '🥳', '🎁'],
    tags: ['birthday', 'birthdaygirl', 'birthdayboy', 'celebrate', 'newage'],
    captions: [
      'Another year older, another year better.',
      'New age, same me, more cake.',
      'Thank you for all the birthday love.',
      'Level up unlocked.',
      'Cheers to another trip around the sun.',
      'Today I get to be the main character.',
      'Grateful for every year and everyone in it.',
      'Birthday mode: on.',
      'Making this year my best one yet.',
      'Birthday plans: {t}',
    ],
  },
  {
    id: 'business',
    label: 'Business',
    emojis: ['🚀', '💼', '📈', '🙌', '✅'],
    tags: ['smallbusiness', 'entrepreneur', 'supportsmallbusiness', 'behindthescenes', 'brand'],
    captions: [
      'Big things start with small steps.',
      'Behind the scenes of something we love.',
      'Thank you for supporting a small business.',
      'We’re open, and we’re glad you’re here.',
      'Built with passion, delivered with care.',
      'New day, new goals.',
      'Quality takes time, and it’s worth it.',
      'You asked, we listened.',
      'Every order is packed with love.',
      'Now available: {t}',
    ],
  },
]

const inputClass =
  'mt-2 h-12 w-full rounded-xl border border-border bg-background px-4 text-base outline-none focus-visible:ring-3 focus-visible:ring-ring/40'

function clean(s: string): string {
  return s.replace(/\s+/g, ' ').trim()
}

function slug(s: string): string {
  return clean(s).toLowerCase().replace(/[^a-z0-9]/g, '')
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text)
  } catch {
    const area = document.createElement('textarea')
    area.value = text
    document.body.appendChild(area)
    area.select()
    document.execCommand('copy')
    document.body.removeChild(area)
  }
}

export function CaptionGenerator() {
  const [categoryId, setCategoryId] = useState('selfie')
  const [topic, setTopic] = useState('')
  const [round, setRound] = useState(0)
  const [copied, setCopied] = useState('')

  const category = CATEGORIES.find((c) => c.id === categoryId) ?? CATEGORIES[0]
  const t = clean(topic)
  const usable = category.captions
    .filter((c) => t || !c.includes('{t}'))
    .map((c) => c.replace(/\{t\}/g, t))

  const count = Math.min(6, usable.length)
  const picks = Array.from({ length: count }, (_, i) => {
    const index = (round * count + i) % usable.length
    return {
      key: `${round}-${i}`,
      text: usable[index],
      emoji: category.emojis[(index + round) % category.emojis.length],
    }
  })

  const tags = Array.from(new Set([...(slug(topic) ? [slug(topic)] : []), ...category.tags]))
    .slice(0, 6)
    .map((x) => `#${x}`)
    .join(' ')

  async function copy(key: string, value: string) {
    await copyText(value)
    setCopied(key)
    setTimeout(() => setCopied(''), 1500)
  }

  return (
    <div>
      <div className="rounded-3xl border border-border bg-card p-6 sm:p-8">
        <fieldset>
          <legend className="text-sm font-medium">What kind of post is it?</legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  setCategoryId(c.id)
                  setRound(0)
                }}
                aria-pressed={c.id === categoryId}
                className={`rounded-full border px-4 py-2 text-sm font-medium ${
                  c.id === categoryId
                    ? 'border-foreground bg-foreground text-background'
                    : 'border-border bg-background hover:border-foreground/30'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="mt-5">
          <label htmlFor="cap-topic" className="text-sm font-medium">
            What is it about? (optional)
          </label>
          <input
            id="cap-topic"
            maxLength={40}
            placeholder="e.g. Paris, leg day, birthday dinner"
            value={topic}
            onChange={(e) => {
              setTopic(e.target.value)
              setRound(0)
            }}
            className={inputClass}
          />
        </div>
      </div>

      <ul className="mt-6 grid gap-3" aria-live="polite">
        {picks.map((item) => {
          const full = `${item.text} ${item.emoji}`
          return (
            <li key={item.key} className="rounded-2xl border border-border bg-card p-4">
              <p className="break-words text-base">
                {item.text} <span aria-hidden="true">{item.emoji}</span>
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => copy(`${item.key}-a`, full)}
                  className="inline-flex h-10 items-center justify-center rounded-full border border-border px-4 text-sm font-medium"
                >
                  {copied === `${item.key}-a` ? 'Copied' : 'Copy caption'}
                </button>
                <button
                  type="button"
                  onClick={() => copy(`${item.key}-b`, `${full}\n.\n.\n${tags}`)}
                  className="inline-flex h-10 items-center justify-center rounded-full border border-border px-4 text-sm font-medium"
                >
                  {copied === `${item.key}-b` ? 'Copied' : 'Copy with hashtags'}
                </button>
              </div>
            </li>
          )
        })}
      </ul>

      <button
        type="button"
        onClick={() => setRound((r) => r + 1)}
        className="mt-4 inline-flex h-11 items-center justify-center rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground"
      >
        More captions
      </button>

      <div className="mt-6 rounded-2xl border border-border bg-card p-4">
        <p className="text-sm font-medium">Hashtag ideas for this post</p>
        <p className="mt-2 break-words text-sm text-muted-foreground">{tags}</p>
        <button
          type="button"
          onClick={() => copy('tags', tags)}
          className="mt-3 inline-flex h-10 items-center justify-center rounded-full border border-border px-4 text-sm font-medium"
        >
          {copied === 'tags' ? 'Copied' : 'Copy hashtags'}
        </button>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
        These captions are starting points built from templates. Change a word or two so they sound like you. The
        hashtags are ideas, not trending data, so search them in the app before you use them.
      </p>
    </div>
  )
}
