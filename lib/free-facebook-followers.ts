export const FREE_FACEBOOK_QUANTITY = 10

const reservedPaths = new Set(['events', 'groups', 'help', 'login', 'marketplace', 'pages', 'reel', 'reels', 'share', 'watch'])

export function normalizeFacebookProfile(raw: string) {
  let url: URL
  try {
    const input = raw.trim()
    url = new URL(/^https?:\/\//i.test(input) ? input : 'https://' + input)
  } catch {
    return null
  }
  if (!['facebook.com', 'www.facebook.com', 'm.facebook.com'].includes(url.hostname) ||
      url.username || url.password || url.port) return null

  const path = url.pathname.replace(/^\/|\/$/g, '').toLowerCase()
  const id = path === 'profile.php' ? url.searchParams.get('id') : path
  if (!id || reservedPaths.has(id)) return null
  if (/^[1-9]\d{0,24}$/.test(id)) {
    return { id, link: 'https://www.facebook.com/profile.php?id=' + id }
  }
  if (path === 'profile.php' || !/^[a-z0-9][a-z0-9.]{3,73}[a-z0-9]$/.test(id)) return null
  return { id: id.replaceAll('.', ''), link: 'https://www.facebook.com/' + id }
}
