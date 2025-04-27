import canUseDOM from './canUseDOM'

export const getServerSideURL = () => {
  if (process.env.NODE_ENV === 'development') {
    console.log('Getting server side URL with environment variables:', {
      RAILWAY_STATIC_URL: process.env.RAILWAY_STATIC_URL ? 'set' : 'unset',
      RAILWAY_PUBLIC_URL: process.env.RAILWAY_PUBLIC_URL ? 'set' : 'unset',
      NEXT_PUBLIC_SERVER_URL: process.env.NEXT_PUBLIC_SERVER_URL ? 'set' : 'unset',
      VERCEL_PROJECT_PRODUCTION_URL: process.env.VERCEL_PROJECT_PRODUCTION_URL ? 'set' : 'unset',
    })
  }

  if (process.env.RAILWAY_STATIC_URL) {
    return process.env.RAILWAY_STATIC_URL
  }

  if (process.env.RAILWAY_PUBLIC_URL) {
    return process.env.RAILWAY_PUBLIC_URL
  }

  if (process.env.NEXT_PUBLIC_SERVER_URL) {
    return process.env.NEXT_PUBLIC_SERVER_URL
  }

  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  }

  if (process.env.NODE_ENV === 'production') {
    return 'https://three-tomorrows-payload-production.up.railway.app'
  }

  return 'http://localhost:3000'
}

export const getClientSideURL = () => {
  if (process.env.NODE_ENV === 'development') {
    console.log('Getting client side URL with environment:', {
      NEXT_PUBLIC_SERVER_URL: process.env.NEXT_PUBLIC_SERVER_URL ? 'set' : 'unset',
      'window.ENV?.SERVER_URL': canUseDOM && window.ENV?.SERVER_URL ? 'set' : 'unset',
    })
  }

  if (canUseDOM) {
    if (window.ENV && window.ENV.SERVER_URL) {
      return window.ENV.SERVER_URL
    }

    if (process.env.NEXT_PUBLIC_SERVER_URL) {
      return process.env.NEXT_PUBLIC_SERVER_URL
    }

    if (process.env.NODE_ENV === 'production') {
      return 'https://three-tomorrows-payload-production.up.railway.app'
    }

    const protocol = window.location.protocol
    const domain = window.location.hostname
    const port = window.location.port

    const url = `${protocol}//${domain}${port ? `:${port}` : ''}`
    if (process.env.NODE_ENV === 'development') {
      console.log('Using window.location for URL:', url)
    }
    return url
  }

  return getServerSideURL()
}

export const isValidURL = (url: string): boolean => {
  try {
    new URL(url)
    return true
  } catch (e) {
    return false
  }
}

export const ensureValidURL = (url: string): string => {
  if (!url) return ''

  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }

  const baseUrl = getClientSideURL()
  const sanitizedBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl
  const sanitizedUrl = url.startsWith('/') ? url : `/${url}`

  return `${sanitizedBaseUrl}${sanitizedUrl}`
}

if (typeof window !== 'undefined') {
  window.ENV = window.ENV || {
    SERVER_URL: process.env.NEXT_PUBLIC_SERVER_URL || '',
  }
}

declare global {
  interface Window {
    ENV: {
      SERVER_URL: string
    }
  }
}
