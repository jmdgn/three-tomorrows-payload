'use client'

import React, { useEffect, useState } from 'react'
import CustomHomepage from '@/components/CustomHomepage'

export default function HomePage() {
  const [homepageData, setHomepageData] = useState(null) // Use null for initial state
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Determine the API URL directly. Use the environment variable, or a fallback.
    const apiUrl =
      process.env.NEXT_PUBLIC_SERVER_URL ||
      'https://three-tomorrows-payload-production.up.railway.app'

    console.log('Attempting to fetch homepage data from:', apiUrl)

    async function fetchHomepageData() {
      try {
        const response = await fetch(`${apiUrl}/api/homepage?limit=1`, {
          cache: 'no-store', // Keep this if you always want fresh data
        })

        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`)
        }

        const data = await response.json()
        console.log('Homepage data received:', data)
        setHomepageData(data.docs?.[0] || {}) // Set data or an empty object if no docs
      } catch (error) {
        console.error('An error occurred while fetching homepage data:', error)
        // Optionally, you could set an error state here to display a message to the user
      } finally {
        setLoading(false)
      }
    }

    fetchHomepageData()
  }, []) // Empty dependency array ensures this runs once on mount

  if (loading) {
    return <div>Loading...</div>
  }

  // Render the component only if data has been successfully fetched
  if (!homepageData) {
    return <div>Error: Could not load homepage data.</div>
  }

  return <CustomHomepage {...homepageData} />
}
