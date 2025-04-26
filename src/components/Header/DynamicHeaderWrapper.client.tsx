'use client'

import React, { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { HeaderNav } from '../../Header/Nav'
import { DynamicHeaderNav } from '../../Header/Nav/dynamic'
import { BlogHeaderNav } from '@/components/Header/BlogHeaderNav'
import { HeaderShareButton } from '@/components/Header/HeaderShareButton.client'

// Fallback data to use only when dynamic content is unavailable
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

  // Add state for client-side fetched data if needed
  const [clientFetchedData, setClientFetchedData] = useState(null)

  // Check if server data is valid
  const isServerDataValid =
    serverHeaderData &&
    serverHeaderData.navItems &&
    serverHeaderData.navItems.length > 0 &&
    serverHeaderData.navItems.some(
      (item) =>
        item.link?.label &&
        (item.link?.url ||
          item.link?.type === 'custom' ||
          (item.link?.type === 'reference' && item.link?.reference?.value)),
    )

  // Prioritize in this order:
  // 1. Server data if valid
  // 2. Client fetched data if available
  // 3. Fallback data as last resort
  const headerData = isServerDataValid
    ? serverHeaderData
    : clientFetchedData || FALLBACK_HEADER_DATA

  // Only use static header in development if specifically required
  // Force dynamic header in production or when we have valid data
  const useStaticHeader = isServerDataValid
    ? false
    : process.env.NODE_ENV === 'production'
      ? false
      : initialStaticHeaderValue

  useEffect(() => {
    console.log('Current pathname:', pathname)
    console.log('Is blog post page:', isBlogPostPage)
    console.log('Environment:', process.env.NODE_ENV)
    console.log('Server data valid:', isServerDataValid)
    console.log('Using static header:', useStaticHeader)
    console.log('Using fallback data:', !isServerDataValid && !clientFetchedData)

    // You could add client-side data fetching here if needed
    // For example, fetching from an API endpoint that returns navigation data
    // This would be especially useful in production where SSR data might be unreliable

    // Example client-side fetch (uncomment if needed):
    /*
    if (!isServerDataValid && process.env.NODE_ENV === 'production') {
      fetch('/api/navigation')
        .then(res => res.json())
        .then(data => {
          console.log('Client-side fetched navigation data:', data);
          setClientFetchedData(data);
        })
        .catch(err => {
          console.error('Error fetching navigation data:', err);
        });
    }
    */
  }, [pathname, isBlogPostPage, isServerDataValid, useStaticHeader, clientFetchedData])

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
