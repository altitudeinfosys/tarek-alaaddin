export const SITE_URL = 'https://www.tarekalaaddin.com'

export function absoluteUrl(path = '') {
  if (!path) return SITE_URL
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`
}
