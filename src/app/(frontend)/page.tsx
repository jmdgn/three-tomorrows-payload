'use client'

import React, { useEffect, useState } from 'react'
import CustomHomepage from '@/components/CustomHomepage'
import { getClientSideURL } from '@/utilities/getURL'

export default function HomePage() {
  const [homepageData, setHomepageData] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchHomepageData() {
      try {
        const baseUrl = 'https://three-tomorrows-payload-production.up.railway.app'

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
