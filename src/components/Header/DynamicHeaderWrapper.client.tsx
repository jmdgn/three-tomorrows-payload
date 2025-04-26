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

  // Function to validate server data with detailed logging
  const validateServerData = () => {
    console.log('Server data received:', serverHeaderData ? 'yes' : 'no')

    if (!serverHeaderData) {
      console.log('Server data is null or undefined')
      return false
    }

    console.log(
      'Server data navItems:',
      serverHeaderData.navItems ? `${serverHeaderData.navItems.length} items` : 'missing',
    )

    if (
      !serverHeaderData.navItems ||
      !Array.isArray(serverHeaderData.navItems) ||
      serverHeaderData.navItems.length === 0
    ) {
      console.log('Server data has no valid navItems array')
      return false
    }

    // Check for at least one valid navigation item
    const hasValidItem = serverHeaderData.navItems.some((item) => {
      if (!item || !item.link || !item.link.label) {
        return false
      }

      const hasValidUrl = !!item.link.url
      const isCustomType = item.link.type === 'custom'
      const hasValidReference =
        item.link.type === 'reference' && item.link.reference && item.link.reference.value

      return hasValidUrl || isCustomType || hasValidReference
    })

    console.log('Server data has at least one valid nav item:', hasValidItem)
    return hasValidItem
  }

  // Validate server data
  const isServerDataValid = validateServerData()

  // Prioritize server data if valid, otherwise use fallback
  const headerData = isServerDataValid ? serverHeaderData : FALLBACK_HEADER_DATA

  // Always use dynamic header in production or when we have valid data
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
    console.log('Using fallback data:', !isServerDataValid)
  }, [pathname, isBlogPostPage, isServerDataValid, useStaticHeader])

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
