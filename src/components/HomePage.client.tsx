'use client'

import React, { useEffect, useState, useRef } from 'react'
import CustomHomepage from '@/components/CustomHomepage'
import Script from 'next/script'
import dynamic from 'next/dynamic'

// Dynamic import ThreeJsManager to avoid SSR issues
// FIXED: Use the correct path with .client.js extension
const loadThreeJsManager = async () => {
  try {
    const module = await import('@/utilities/ThreeJsManager.client.js')
    return module.default
  } catch (error) {
    console.error('Error loading ThreeJsManager:', error)
    return null
  }
}

export default function HomePage() {
  const [homepageData, setHomepageData] = useState({})
  const [loading, setLoading] = useState(true)
  const [apiBaseUrl, setApiBaseUrl] = useState('')
  const threeJsManagerRef = useRef(null)

  // Environment variables for client-side
  const envScript = `
    window.ENV = {
      SERVER_URL: "${process.env.NEXT_PUBLIC_SERVER_URL || ''}"
    };
    console.log('Environment variables injected:', window.ENV);
  `

  useEffect(() => {
    // Safely load ThreeJsManager only on client-side
    if (typeof window !== 'undefined') {
      loadThreeJsManager().then((manager) => {
        if (manager) {
          threeJsManagerRef.current = manager
          manager.setIsHomePage(true)
        }
      })
    }

    function determineApiUrl() {
      if (typeof window !== 'undefined' && window.ENV?.SERVER_URL) {
        return window.ENV.SERVER_URL
      }

      if (process.env.NEXT_PUBLIC_SERVER_URL) {
        return process.env.NEXT_PUBLIC_SERVER_URL
      }

      return 'https://three-tomorrows-payload-production.up.railway.app'
    }

    const url = determineApiUrl()
    setApiBaseUrl(url)
    console.log('API Base URL set to:', url)

    async function fetchHomepageData() {
      try {
        const endpoint = `${url}/api/homepage?limit=1`
        console.log('Fetching homepage data from:', endpoint)

        const response = await fetch(endpoint, {
          cache: 'no-store',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (response.ok) {
          const data = await response.json()
          console.log('Homepage data received:', data)
          setHomepageData(data.docs?.[0] || {})
        } else {
          console.error('Failed to fetch homepage data:', response.status, response.statusText)

          // Try a fallback URL if the first one fails
          if (url !== 'https://three-tomorrows-payload-production.up.railway.app') {
            console.log('Trying fallback URL...')
            const fallbackUrl = 'https://three-tomorrows-payload-production.up.railway.app'
            const fallbackEndpoint = `${fallbackUrl}/api/homepage?limit=1`

            const fallbackResponse = await fetch(fallbackEndpoint, {
              cache: 'no-store',
              headers: {
                'Content-Type': 'application/json',
              },
            })

            if (fallbackResponse.ok) {
              const fallbackData = await fallbackResponse.json()
              console.log('Homepage data received from fallback:', fallbackData)
              setHomepageData(fallbackData.docs?.[0] || {})
            } else {
              console.error('Fallback fetch also failed:', fallbackResponse.status)
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch homepage data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchHomepageData()

    // Cleanup when component unmounts
    return () => {
      // Only run cleanup if manager was initialized
      if (threeJsManagerRef.current) {
        threeJsManagerRef.current.setIsHomePage(false)
      }
    }
  }, [])

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <>
      <Script
        id="environment-script"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: envScript }}
      />

      <CustomHomepage {...homepageData} />
    </>
  )
}
