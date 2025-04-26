'use client'

import React, { useEffect, useState } from 'react'
import CustomHomepage from '@/components/CustomHomepage'

export default function HomePage() {
  const [homepageData, setHomepageData] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchHomepageData() {
      try {
        // Use the environment variable directly in the client
        const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || window.location.origin

        console.log('Fetching homepage data from:', `${baseUrl}/api/homepage?limit=1`)

        const response = await fetch(`${baseUrl}/api/homepage?limit=1`, {
          cache: 'no-store',
        })

        if (response.ok) {
          const data = await response.json()
          setHomepageData(data.docs?.[0] || {})
        } else {
          console.error('Failed to fetch homepage data:', response.status, response.statusText)
        }
      } catch (error) {
        console.error('Failed to fetch homepage data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchHomepageData()
  }, [])

  if (loading) {
    return <div>Loading...</div>
  }

  return <CustomHomepage {...homepageData} />
}
