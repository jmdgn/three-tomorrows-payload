'use client'

import CustomHomepage from '@/components/CustomHomepage'
import { getServerSideURL } from '@/utilities/getURL'

// Mark this route as dynamic (SSR)
export const dynamic = 'force-dynamic'

export default async function HomePage() {
  let homepageData = {}

  try {
    const baseUrl = getServerSideURL()

    // Removed timestamp since we're forcing dynamic render anyway
    const response = await fetch(`${baseUrl}/api/homepage?limit=1`, {
      cache: 'no-store', // prevent any caching
    })

    if (response.ok) {
      const data = await response.json()
      homepageData = data.docs?.[0] || {}
    } else {
      console.error('Failed to fetch homepage data:', response.status, response.statusText)
    }
  } catch (error) {
    console.error('Failed to fetch homepage data:', error)
  }

  return <CustomHomepage {...homepageData} />
}
