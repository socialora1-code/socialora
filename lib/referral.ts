export const COMMISSION_PERCENT = 20
export const MIN_PAYOUT_USD = 10
export const REF_STORAGE_KEY = 'socialora_ref'
export const REF_TTL_DAYS = 30
export const REF_CODE_REGEX = /^[a-z0-9]{3,20}$/

export function normalizeRefCode(raw: string): string | null {
  const code = raw.trim().toLowerCase()
  return REF_CODE_REGEX.test(code) ? code : null
}

export function readStoredRef(): string | null {
  try {
    const raw = window.localStorage.getItem(REF_STORAGE_KEY)
    if (!raw) return null
    const data = JSON.parse(raw) as { code?: string; expires?: number }
    if (!data.code || !data.expires || Date.now() > data.expires) return null
    return normalizeRefCode(data.code)
  } catch {
    return null
  }
}

export function storeRef(code: string) {
  try {
    window.localStorage.setItem(
      REF_STORAGE_KEY,
      JSON.stringify({ code, expires: Date.now() + REF_TTL_DAYS * 24 * 60 * 60 * 1000 }),
    )
  } catch {
    // Tarayici depolamayi engelliyorsa sessizce gec.
  }
}
