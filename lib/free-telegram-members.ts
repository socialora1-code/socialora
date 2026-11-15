export const FREE_TELEGRAM_QUANTITY = 10

export function normalizeTelegramChannel(raw: string): string | null {
  const input = raw.trim().toLowerCase()
  const match = input.match(/^(?:@|(?:https?:\/\/)?(?:www\.)?(?:t\.me|telegram\.me)\/(?:s\/)?)([a-z][a-z0-9_]{3,30}[a-z0-9])\/?$/)
  return match?.[1] ?? null
}
