import test, { afterEach } from 'node:test'
import assert from 'node:assert/strict'
import { registerHooks } from 'node:module'

const root = new URL('../', import.meta.url)
registerHooks({ resolve(specifier, context, nextResolve) {
  if (specifier.startsWith('@/')) return { url: new URL(`${specifier.slice(2)}.ts`, root).href, shortCircuit: true }
  if (specifier === 'next/server') return nextResolve('next/server.js', context)
  if (specifier === 'next/headers') return { url: 'data:text/javascript,export async function cookies(){return {get(){return globalThis.__testCookie ? {value:globalThis.__testCookie}:undefined}}}', shortCircuit: true }
  return nextResolve(specifier, context)
} })
const auth = await import('../lib/telegram-free-views.ts')
const { POST } = await import('../app/api/free-views/route.ts')
const joinRoute = await import('../app/api/free-views/telegram/join/route.ts')
const token = '123456789:test-only-key'
const now = Math.floor(Date.now() / 1000)
const originalFetch = globalThis.fetch
const originalEnv = { ...process.env }
afterEach(() => { globalThis.fetch = originalFetch; delete globalThis.__testCookie; process.env = { ...originalEnv } })
function request(body = {}, origin = 'https://www.getsocialora.com') {
  return new Request('https://www.getsocialora.com/api/free-views', {
    method: 'POST', headers: { 'content-type': 'application/json', origin, 'x-forwarded-for': '192.0.2.1' },
    body: JSON.stringify({ link: 'https://www.instagram.com/reel/Example1/', quantity: 100, ...body }),
  })
}
function setup({ member = true, outage = false, panel = 'placed' } = {}) {
  process.env.FREE_VIEWS_TELEGRAM_ENABLED = 'true'
  process.env.FREE_VIEWS_TELEGRAM_BOT_TOKEN = token
  process.env.SMMWIZ_API_KEY = 'test-panel-key'
  process.env.KV_REST_API_URL = 'https://redis.test'
  process.env.KV_REST_API_TOKEN = 'test-redis-key'
  globalThis.__testCookie = auth.createInviteReceipt(token)
  const counts = new Map(), locks = new Set()
  const calls = { panel: 0, redis: 0, telegram: 0 }
  globalThis.fetch = async (url, options) => {
    if (String(url).startsWith('https://api.telegram.org/')) {
      calls.telegram++
      if (outage) throw new Error('Telegram offline')
      return Response.json({ ok: true, result: { status: member ? 'member' : 'left' } })
    }
    if (url === 'https://redis.test') {
      calls.redis++
      const [, script, n, ...args] = JSON.parse(options.body)
      const keys = args.slice(0, n)
      if (script.includes("redis.call('DEL'")) {
        locks.delete(keys[0]); for (const key of keys.slice(1)) counts.set(key, Math.max(0, (counts.get(key) ?? 0) - 1))
        return Response.json({ result: 1 })
      }
      if (keys.slice(1).some(k => (counts.get(k) ?? 0) >= 3)) return Response.json({ result: 1 })
      if (locks.has(keys[0])) return Response.json({ result: 2 })
      locks.add(keys[0]); for (const key of keys.slice(1)) counts.set(key, (counts.get(key) ?? 0) + 1)
      return Response.json({ result: 0 })
    }
    if (url === 'https://smmwiz.com/api/v2') {
      calls.panel++
      if (panel === 'unknown') throw new Error('Response lost after request')
      return Response.json(panel === 'placed' ? { order: 123 } : { error: 'Not accepted' })
    }
    throw new Error('Unexpected external request')
  }
  return calls
}

test('invitation receipts expire and cannot be forged', () => {
  const receipt = auth.createInviteReceipt(token, now)
  assert.equal(auth.hasInviteReceipt(receipt, token, now), true)
  assert.equal(auth.hasInviteReceipt(receipt, 'wrong-key', now), false)
  assert.equal(auth.hasInviteReceipt(receipt + 'x', token, now), false)
  assert.equal(auth.hasInviteReceipt(receipt, token, now + auth.SESSION_SECONDS), false)
  assert.equal(auth.hasInviteReceipt('1', token, now), false)
})
test('direct API calls without opening the invitation cannot spend quota or panel money', async () => {
  const calls = setup(); delete globalThis.__testCookie
  const response = await POST(request())
  assert.equal(response.status, 403)
  assert.equal((await response.json()).code, 'TELEGRAM_INVITE_REQUIRED')
  assert.deepEqual(calls, { telegram: 0, redis: 0, panel: 0 })
})
test('invitation clicks do not authenticate or call Telegram membership APIs', async () => {
  const calls = setup()
  const response = await POST(request())
  assert.equal(response.status, 200)
  assert.equal(calls.telegram, 0)
  assert.equal(calls.panel, 1)
})
test('visitors retain three claims; a fourth distinct post is refused', async () => {
  const calls = setup()
  for (let i = 0; i < 3; i++) assert.equal((await POST(request({ link: `https://instagram.com/reel/Post${i}/` }))).status, 200)
  assert.equal((await POST(request({ link: 'https://instagram.com/reel/Post4/' }))).status, 429)
  assert.equal(calls.panel, 3)
})
test('concurrent duplicate submissions create one panel order', async () => {
  const calls = setup()
  const results = await Promise.all([POST(request()), POST(request())])
  assert.deepEqual(results.map(r => r.status).sort(), [200, 429])
  assert.equal(calls.panel, 1)
})
test('an uncertain panel response keeps the duplicate guard; a definite rejection releases it', async () => {
  let calls = setup({ panel: 'unknown' })
  assert.equal((await POST(request())).status, 503)
  assert.equal((await POST(request())).status, 429)
  assert.equal(calls.panel, 1)
  calls = setup({ panel: 'rejected' })
  assert.equal((await POST(request())).status, 502)
  assert.equal((await POST(request())).status, 502)
  assert.equal(calls.panel, 2)
})
test('cross-origin requests cannot order', async () => {
  const calls = setup()
  assert.equal((await POST(request({}, 'https://other.test'))).status, 403)
  assert.equal(calls.panel, 0)
})
test('Join group redirects directly to the existing group and remembers the click', async () => {
  setup()
  const response = await joinRoute.GET()
  assert.equal(response.status, 303)
  assert.equal(response.headers.get('location'), auth.GROUP_URL)
  assert.match(response.headers.get('set-cookie'), /socialora_telegram_invite=/)
  assert.match(response.headers.get('set-cookie'), /HttpOnly/i)
  assert.match(response.headers.get('set-cookie'), /SameSite=lax/i)
})
