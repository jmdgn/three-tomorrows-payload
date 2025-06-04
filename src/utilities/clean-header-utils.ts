import { getServerSideURL } from '@/utilities/getURL'
import type { Header } from '@/payload-types'

export async function testHeaderAccess(serverURL: string): Promise<boolean> {
  try {
    console.log('Testing header access...')

    // Change from /api/globals/header to /api/header
    const url = `${serverURL}/api/header`
    console.log('Fetching from URL:', url)

    const response = await fetch(url, {
      method: 'HEAD',
      headers: {
        Accept: 'application/json',
      },
    })

    if (!response.ok) {
      console.error('Header test failed with status:', response.status)
      console.error('Response headers:', Object.fromEntries(response.headers.entries()))
      return false
    }

    console.log('Header test passed')
    return true
  } catch (error) {
    console.error('Header test error:', error)
    return false
  }
}

export async function fetchHeader(): Promise<Header | null> {
  try {
    console.log('Fetching header data...')

    const baseUrl = getServerSideURL()
    const url = `${baseUrl}/api/globals/header`

    console.log('Fetching header from URL:', url)

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    })

    console.log('Header fetch response status:', response.status)

    if (!response.ok) {
      console.error('Header fetch failed with status:', response.status)
      console.error('Response headers:', Object.fromEntries(response.headers.entries()))

      try {
        const errorText = await response.text()
        console.error('Error response body:', errorText)
      } catch (e) {
        console.error('Could not read error response body:', e)
      }

      return null
    }

    const data = await response.json()
    console.log('Header data received:', data)

    return data
  } catch (error) {
    console.error('Error fetching header:', error)
    return null
  }
}
