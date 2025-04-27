import canUseDOM from './canUseDOM'

export const getServerSideURL = () => {
  if (process.env.RAILWAY_PUBLIC_URL) {
    return process.env.RAILWAY_PUBLIC_URL
  }

  if (process.env.NEXT_PUBLIC_SERVER_URL) {
    return process.env.NEXT_PUBLIC_SERVER_URL
  }

  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  }

  return 'http://localhost:3000'
}

export const getClientSideURL = () => {
  if (canUseDOM) {
    if (process.env.NEXT_PUBLIC_SERVER_URL) {
      return process.env.NEXT_PUBLIC_SERVER_URL
    }

    const protocol = window.location.protocol
    const domain = window.location.hostname
    const port = window.location.port

    return `${protocol}//${domain}${port ? `:${port}` : ''}`
  }

  return getServerSideURL()
}
