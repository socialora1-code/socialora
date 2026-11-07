import test, { afterEach } from 'node:test'
import assert from 'node:assert/strict'
import { createHash, createHmac } from 'node:crypto'
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
const loginRoute = await import('../app/api/free-views/telegram/route.ts')
const token = '123456789:test-only-key'
const now = Math.floor(Date.now() / 1000)
function signedPayload(overrides = {}) {
  const fields = { id: 123456, first_name: 'Test', auth_date: now, ...overrides }
  const check = Object.entries(fields).sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => `${k}=${v}`).join('\n')
  return { ...fields, hash: createHmac('sha256', createHash('sha256').update(token).digest()).update(check).digest('hex') }
}
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
  globalThis.__testCookie = auth.createTelegramSession('123456', token)
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

test('signed Telegram identity is verified; forgery and stale/future logins are rejected', () => {
  const valid = signedPayload()
  assert.equal(auth.verifyTelegramLogin(valid, token, now), '123456')
  assert.equal(auth.verifyTelegramLogin({ ...valid, id: 999 }, token, now), null)
  assert.equal(auth.verifyTelegramLogin(signedPayload({ auth_date: now - 301 }), token, now), null)
  assert.equal(auth.verifyTelegramLogin(signedPayload({ auth_date: now + 31 }), token, now), null)
  assert.equal(auth.verifyTelegramLogin({ ...valid, hash: 'bad' }, token, now), null)
})
test('remembered sessions expire and cannot be edited or signed with another bot key', () => {
  const cookie = auth.createTelegramSession('123456', token, now)
  assert.equal(auth.readTelegramSession(cookie, token, now), '123456')
  assert.equal(auth.readTelegramSession(cookie.replace('123456.', '999999.'), token, now), null)
  assert.equal(auth.readTelegramSession(cookie, 'wrong-key', now), null)
  assert.equal(auth.readTelegramSession(cookie, token, now + auth.SESSION_SECONDS), null)
})
test('direct API calls without Telegram connection cannot spend quota or panel money', async () => {
  const calls = setup(); delete globalThis.__testCookie
  const response = await POST(request())
  assert.equal(response.status, 401)
  assert.equal((await response.json()).code, 'TELEGRAM_CONNECT_REQUIRED')
  assert.deepEqual(calls, { telegram: 0, redis: 0, panel: 0 })
})
test('nonmembers and Telegram outages fail before quota or paid panel requests', async () => {
  let calls = setup({ member: false })
  assert.equal((await POST(request())).status, 403)
  assert.equal(calls.panel, 0); assert.equal(calls.redis, 0)
  calls = setup({ outage: true })
  assert.equal((await POST(request())).status, 503)
  assert.equal(calls.panel, 0); assert.equal(calls.redis, 0)
})
test('members retain three claims; a fourth distinct post is refused', async () => {
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
test('cross-origin requests cannot log in or order', async () => {
  const calls = setup()
  assert.equal((await POST(request({}, 'https://other.test'))).status, 403)
  assert.equal((await loginRoute.POST(new Request('https://www.getsocialora.com/api/free-views/telegram', {
    method: 'POST', headers: { origin: 'https://other.test' }, body: JSON.stringify(signedPayload()),
  }))).status, 403)
  assert.equal(calls.panel, 0)
})
test('valid Telegram login creates a protected remembered cookie', async () => {
  setup()
  const response = await loginRoute.POST(new Request('https://www.getsocialora.com/api/free-views/telegram', {
    method: 'POST', headers: { origin: 'https://www.getsocialora.com', 'content-type': 'application/json' }, body: JSON.stringify(signedPayload()),
  }))
  assert.equal(response.status, 200)
  assert.match(response.headers.get('set-cookie'), /HttpOnly/i)
  assert.match(response.headers.get('set-cookie'), /SameSite=lax/i)
  assert.match(response.headers.get('set-cookie'), /Max-Age=7776000/)
})
