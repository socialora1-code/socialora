export type GiveawayRules = {
  winners: number
  backups: number
  mentions: number
  keyword: string
  dedupe: boolean
}

type Entry = { name: string; key: string; comment: string }

export const SAMPLE_COMMENTS = [
  '@sample_maya: Entering #studio @sample_jo @sample_lee',
  '@sample_alex: Count me in #studio @sample_sam @sample_ana',
  '@sample_sam: My entry #STUDIO @sample_ana @sample_maya',
  '@sample_kai: Here for #studio @sample_ana @sample_jo',
  '@SAMPLE_MAYA: Second comment #studio @sample_ana @sample_jo',
  '@sample_jo: Just one tag #studio @sample_lee',
  '@sample_ana: @sample_jo @sample_lee',
].join('\n')

const username = /^@?[\w.]{1,30}$/u
const usernameWithComment = /^(@?[\w.]{1,30})(?:\s*:\s*|\t+)(.*)$/u
const mentionPattern = /(?<![\p{L}\p{N}_.@])@([a-z\d_](?:[a-z\d_.]{0,29}))(?![a-z\d_])/giu
const wordPattern = /[#@]?[\p{L}\p{M}\p{N}_]+/gu

function toEntry(line: string): Entry {
  const parts = usernameWithComment.exec(line)
  const rawName = parts?.[1] ?? line
  const name = username.test(rawName) ? `@${rawName.replace(/^@/, '')}` : rawName.replace(/[\u2013\u2014]/g, '-')
  return { name, key: rawName.replace(/^@/, '').toLowerCase(), comment: parts?.[2] ?? '' }
}

function hasRule(comment: string, keyword: string) {
  if (!keyword) return true
  const words = comment.normalize('NFKC').toLowerCase().match(wordPattern) ?? []
  const required = keyword.normalize('NFKC').toLowerCase().match(wordPattern) ?? []
  return required.length > 0 && words.some((_, index) =>
    required.every((word, offset) => {
      const candidate = words[index + offset]
      return word.startsWith('#') ? candidate === word : candidate?.replace(/^#/, '') === word
    }),
  )
}

export function getGiveawayEntries(text: string, rules: GiveawayRules) {
  const rows = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
  const entries: Entry[] = []
  const users = new Set<string>()
  let excluded = 0
  let duplicates = 0
  for (const row of rows) {
    const entry = toEntry(row)
    if (!hasRule(entry.comment, rules.keyword)) {
      excluded++
      continue
    }
    if (rules.mentions > 0) {
      const tags = new Set([...entry.comment.matchAll(mentionPattern)].map((match) => match[1].replace(/\.+$/, '').toLowerCase()))
      tags.delete(entry.key)
      if (tags.size < rules.mentions) {
        excluded++
        continue
      }
    }
    if (rules.dedupe && users.has(entry.key)) {
      duplicates++
      continue
    }
    users.add(entry.key)
    entries.push(entry)
  }
  return { entries, unique: users.size, excluded, duplicates }
}

function randomInt(max: number) {
  const limit = Math.floor(0x100000000 / max) * max
  const buffer = new Uint32Array(1)
  do {
    crypto.getRandomValues(buffer)
  } while (buffer[0] >= limit)
  return buffer[0] % max
}

export function drawGiveaway(entries: readonly Entry[], count: number) {
  const pool = [...entries]
  const picked = new Map<string, string>()
  while (picked.size < count && pool.length > 0) {
    const index = randomInt(pool.length)
    const entry = pool[index]
    pool[index] = pool[pool.length - 1]
    pool.pop()
    if (!picked.has(entry.key)) picked.set(entry.key, entry.name)
  }
  return [...picked.values()]
}

export function giveawayTerms(rules: GiveawayRules) {
  const requirements = [
    'Leave a comment on this post.',
    ...(rules.mentions > 0 ? [`Mention at least ${rules.mentions} distinct ${rules.mentions === 1 ? 'friend' : 'friends'} in that comment.`] : []),
    ...(rules.keyword ? [`Include ${rules.keyword} in the same comment.`] : []),
    rules.dedupe ? 'One eligible entry per person.' : 'Each eligible comment counts as an entry. Each person can hold only one winner or backup spot.',
  ]
  return [
    'GIVEAWAY',
    'Prize: [add prize]',
    'Entry deadline: [add date, time and time zone]',
    'Who can enter: [add age, locations and other eligibility rules]',
    '',
    'How to enter',
    ...requirements,
    '',
    `We will randomly select ${rules.winners} ${rules.winners === 1 ? 'winner' : 'winners'} and ${rules.backups} ${rules.backups === 1 ? 'backup' : 'backups'} from eligible entries.`,
    'Results and claim deadline: [add announcement date, contact method and claim deadline]',
    'Full rules: [add rules link or remaining terms]',
    'This giveaway is independently run and is not sponsored, endorsed, administered by, or associated with Instagram. By entering, participants release Instagram from responsibility for this promotion.',
  ].join('\n')
}

export function giveawayAnnouncements(winners: readonly string[], backups: readonly string[], sample: boolean) {
  const names = winners.join(', ')
  const label = winners.length === 1 ? 'Winner' : 'Winners'
  const prefix = sample ? 'SAMPLE DRAW\n\n' : ''
  return {
    story: `${prefix}GIVEAWAY RESULTS\n${label}: ${names}\nThanks to everyone who entered! Please check the giveaway post for claim details.`,
    post: [
      `${prefix}Giveaway results are in!`,
      `${label}: ${names}`,
      ...(backups.length ? [`Backup order: ${backups.join(', ')}. A backup is contacted only if a prize becomes available.`] : []),
      'Congratulations, and thank you to everyone who entered! Winners, please follow the claim instructions in the giveaway rules.',
    ].join('\n\n'),
  }
}
