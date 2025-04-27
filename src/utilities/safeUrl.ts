/**
 * Ensures a URL string has a protocol (https:// or http://)
 * @param url The URL string to process
 * @param defaultUrl Optional default URL to use if the input is empty
 * @returns A URL string with a protocol
 */
export function ensureUrlHasProtocol(
  url?: string | null,
  defaultUrl = 'https://three-tomorrows-payload-production.up.railway.app',
): string {
  if (!url) return defaultUrl

  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `https://${url}`
  }

  return url
}

/**
 * Safely creates a URL object with proper error handling
 * @param url The URL string to convert to a URL object
 * @param fallbackUrl Optional fallback URL to use if creation fails
 * @returns A URL object
 */
export function createSafeUrl(
  url?: string | null,
  fallbackUrl = 'https://three-tomorrows-payload-production.up.railway.app',
): URL {
  try {
    const urlWithProtocol = ensureUrlHasProtocol(url)

    return new URL(urlWithProtocol)
  } catch (error) {
    console.warn(`Failed to create URL from: ${url}, using fallback`)

    try {
      return new URL(fallbackUrl)
    } catch (fallbackError) {
      console.error(`Failed to create fallback URL: ${fallbackError}`)

      return new URL('https://three-tomorrows-payload-production.up.railway.app')
    }
  }
}

/**
 * Generates a complete media URL
 * @param path The media path or partial URL
 * @returns A complete media URL
 */
export function getCompleteMediaUrl(path?: string | null): string {
  if (!path) return '/assets/images/placeholder.jpg'

  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }

  const baseUrl = ensureUrlHasProtocol(
    process.env.NEXT_PUBLIC_SERVER_URL || 'three-tomorrows-payload-production.up.railway.app',
  )

  const normalizedPath = path.startsWith('/') ? path : `/${path}`

  const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl

  return `${normalizedBaseUrl}${normalizedPath}`
}
