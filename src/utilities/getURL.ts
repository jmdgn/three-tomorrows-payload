import canUseDOM from './canUseDOM'

export const getServerSideURL = () => {
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

    return `${protocol}//${domain}${port ? `:${port}` : ''}`
  }

  return getServerSideURL()
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
