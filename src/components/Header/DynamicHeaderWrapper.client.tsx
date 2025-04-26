'use client'

import React, { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { HeaderNav } from '../../Header/Nav'
import { DynamicHeaderNav } from '../../Header/Nav/dynamic'
import { BlogHeaderNav } from '@/components/Header/BlogHeaderNav'
import { HeaderShareButton } from '@/components/Header/HeaderShareButton.client'

// Fallback data to use only when all else fails
const FALLBACK_HEADER_DATA = {
  navItems: [
    {
      id: 'services',
      link: {
        type: 'custom',
        label: 'Services',
        url: '/services',
      },
    },
    {
      id: 'approach',
      link: {
        type: 'custom',
        label: 'Approach',
        url: '/our-approach',
      },
    },
    {
      id: 'why',
      link: {
        type: 'custom',
        label: 'Why This Matters',
        url: '/why-this-matters',
      },
    },
    {
      id: 'expertise',
      link: {
        type: 'custom',
        label: 'Expertise',
        url: '/expertise',
      },
    },
    {
      id: 'blog',
      link: {
        type: 'custom',
        label: 'Blog',
        url: '/posts',
      },
    },
  ],
  ctaLink: { url: '/contact' },
  ctaLabel: 'Talk To Us',
}

interface DynamicHeaderWrapperProps {
  headerData: any
  useStaticHeader: boolean
}

export default function DynamicHeaderWrapper({
  headerData: serverHeaderData,
  useStaticHeader: initialStaticHeaderValue,
}: DynamicHeaderWrapperProps) {
  const pathname = usePathname()
  const isBlogPostPage = pathname?.startsWith('/posts/') && pathname !== '/posts'

  // State for client-side fetched data
  const [clientData, setClientData] = useState(null)
  const [isClientLoading, setIsClientLoading] = useState(false)
  const [clientFetchAttempted, setClientFetchAttempted] = useState(false)

  // Function to validate header data
  const isValidHeaderData = (data) => {
    if (!data) return false

    if (!data.navItems || !Array.isArray(data.navItems) || data.navItems.length === 0) {
      return false
    }

    // Check for at least one valid navigation item
    return data.navItems.some((item) => {
      if (!item || !item.link || !item.link.label) {
        return false
      }

      const hasValidUrl = !!item.link.url
      const isCustomType = item.link.type === 'custom'
      const hasValidReference =
        item.link.type === 'reference' && item.link.reference && item.link.reference.value

      return hasValidUrl || isCustomType || hasValidReference
    })
  }

  // Validate server data
  const isServerDataValid = isValidHeaderData(serverHeaderData)

  // Client-side data fetching
  useEffect(() => {
    // Only attempt client fetch if server data is invalid and we haven't tried yet
    if (!isServerDataValid && !clientFetchAttempted && !isClientLoading) {
      const fetchHeaderData = async () => {
        setIsClientLoading(true)
        console.log('Attempting client-side header data fetch')

        try {
          // Attempt to fetch from your API endpoint
          const response = await fetch('/api/header')

          if (!response.ok) {
            throw new Error(`Failed to fetch header data: ${response.status}`)
          }

          const data = await response.json()
          console.log('Client-side fetched header data:', data)

          if (isValidHeaderData(data)) {
            console.log('Client-side data is valid')
            setClientData(data)
          } else {
            console.log('Client-side data is invalid')
          }
        } catch (error) {
          console.error('Error fetching header data:', error)
        } finally {
          setIsClientLoading(false)
          setClientFetchAttempted(true)
        }
      }

      fetchHeaderData()
    }
  }, [isServerDataValid, clientFetchAttempted, isClientLoading])

  // Prioritize data sources:
  // 1. Server data if valid
  // 2. Client-fetched data if valid
  // 3. Fallback data as a last resort
  const headerData = isServerDataValid
    ? serverHeaderData
    : isValidHeaderData(clientData)
      ? clientData
      : FALLBACK_HEADER_DATA

  // Always use dynamic header in production or when we have valid data
  const useStaticHeader =
    isServerDataValid || isValidHeaderData(clientData)
      ? false
      : process.env.NODE_ENV === 'production'
        ? false
        : initialStaticHeaderValue

  // Determine if we're using fallback data
  const usingFallbackData = !isServerDataValid && !isValidHeaderData(clientData)

  useEffect(() => {
    console.log('Current pathname:', pathname)
    console.log('Is blog post page:', isBlogPostPage)
    console.log('Environment:', process.env.NODE_ENV)
    console.log('Server data valid:', isServerDataValid)
    console.log('Client data valid:', isValidHeaderData(clientData))
    console.log('Client fetch attempted:', clientFetchAttempted)
    console.log('Using static header:', useStaticHeader)
    console.log('Using fallback data:', usingFallbackData)
  }, [
    pathname,
    isBlogPostPage,
    isServerDataValid,
    clientData,
    clientFetchAttempted,
    useStaticHeader,
    usingFallbackData,
  ])

  // For blog post pages, use the blog header
  if (isBlogPostPage) {
    return (
      <>
        <BlogHeaderNav data={headerData} />
        <HeaderShareButton />
      </>
    )
  }

  // For all other pages, use the appropriate header based on flags
  return useStaticHeader ? <HeaderNav /> : <DynamicHeaderNav data={headerData} />
}
