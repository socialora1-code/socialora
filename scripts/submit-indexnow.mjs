import { readdir, readFile } from 'node:fs/promises'

const origin = new URL('https://www.getsocialora.com')
const publicDirectory = new URL('../public/', import.meta.url)
const endpoint = 'https://api.indexnow.org/indexnow'
const submit = process.argv.includes('--submit')
const mainPaths = new Set([
  '/', '/tools', '/instagram', '/tiktok', '/youtube', '/x', '/telegram', '/blog', '/free-instagram-views',
])

async function getText(url, label) {
  const response = await fetch(url, { redirect: 'error', signal: AbortSignal.timeout(15000) })
  if (!response.ok) throw new Error(`${label} returned HTTP ${response.status}`)
  return response.text()
}

function getUrlList(xml) {
  if (!/<urlset(?:\s|>)/.test(xml)) throw new Error('Expected a sitemap URL set')
  const urls = new Set()
  for (const [, value] of xml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/g)) {
    const url = new URL(value)
    if (url.origin !== origin.origin || url.username || url.password || url.search || url.hash) continue
    if (mainPaths.has(url.pathname) || url.pathname.startsWith('/tools/')) {
      urls.add(url.href)
    }
  }
  if (!urls.has(origin.href) || !urls.has(new URL('/tools', origin).href) || urls.size < 3) {
    throw new Error('Expected the homepage, tools hub and at least one tool in the live sitemap')
  }
  if (urls.size > 10000) throw new Error('The URL set exceeds the single request limit of 10,000')
  return [...urls]
}

async function main() {
  const args = process.argv.slice(2)
  if (args.length > 1 || args.some((arg) => arg !== '--submit')) {
    throw new Error('Usage: npm run indexnow [-- --submit]')
  }
  const [keyFiles, sitemap] = await Promise.all([
    readdir(publicDirectory),
    getText(new URL('/sitemap.xml', origin), 'Live sitemap'),
  ])
  const candidates = keyFiles.filter((name) => /^[0-9a-f]{48}\.txt$/.test(name))
  if (candidates.length !== 1) throw new Error('Expected one IndexNow key file in public/')
  const [filename] = candidates
  const key = await readFile(new URL(filename, publicDirectory), 'utf8')
  if (filename !== `${key}.txt`) throw new Error('The IndexNow key file name and content differ')

  const keyLocation = new URL(filename, origin)
  const urlList = getUrlList(sitemap)
  const nicheCount = urlList.filter((url) => /^\/tools\/[^/]+\/[^/]+\/?$/.test(new URL(url).pathname)).length
  if (!submit) {
    console.log(JSON.stringify({ host: origin.host, total: urlList.length, nicheCount, urlList }, null, 2))
    return
  }

  if ((await getText(keyLocation, 'Live verification file')).trim() !== key) {
    throw new Error('The live IndexNow verification file does not match the local key')
  }
  const response = await fetch(endpoint, {
    method: 'POST',
    redirect: 'error',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ host: origin.host, key, keyLocation: keyLocation.href, urlList }),
    signal: AbortSignal.timeout(20000),
  })
  const accepted = response.status === 200 || response.status === 202
  console.log(JSON.stringify({
    httpStatus: response.status,
    urlsAttempted: urlList.length,
    nicheCount,
    outcome: response.status === 200 ? 'received' : response.status === 202 ? 'key_validation_pending' : 'rejected',
    retryAfter: response.headers.get('retry-after') ?? undefined,
  }))
  if (!accepted) process.exitCode = 1
}

main().catch((error) => {
  console.error(`IndexNow: ${error.message}`)
  process.exitCode = 1
})
