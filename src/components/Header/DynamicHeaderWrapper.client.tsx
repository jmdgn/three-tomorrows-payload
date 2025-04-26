'use client'

import React, { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { HeaderNav } from '../../Header/Nav'
import { DynamicHeaderNav } from '../../Header/Nav/dynamic'
import { BlogHeaderNav } from '@/components/Header/BlogHeaderNav'
import { HeaderShareButton } from '@/components/Header/HeaderShareButton.client'

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

  const shouldUseFallback =
    !serverHeaderData ||
    !serverHeaderData.navItems ||
    serverHeaderData.navItems.length === 0 ||
    process.env.NODE_ENV === 'production'

  const headerData = shouldUseFallback ? FALLBACK_HEADER_DATA : serverHeaderData

  const useStaticHeader = process.env.NODE_ENV === 'production' ? false : initialStaticHeaderValue

  useEffect(() => {
    console.log('Current pathname:', pathname)
    console.log('Is blog post page:', isBlogPostPage)
    console.log('Environment:', process.env.NODE_ENV)
    console.log('Using static header:', useStaticHeader)
    console.log('Using fallback data:', shouldUseFallback)

    if (!shouldUseFallback && serverHeaderData) {
      console.log('Server provided nav items:', serverHeaderData.navItems?.length || 0)
    }
  }, [pathname, isBlogPostPage, serverHeaderData, useStaticHeader, shouldUseFallback])

  if (isBlogPostPage) {
    return (
      <>
        <BlogHeaderNav data={headerData} />
        <HeaderShareButton />
      </>
    )
  }

  return useStaticHeader ? <HeaderNav /> : <DynamicHeaderNav data={headerData} />
}
