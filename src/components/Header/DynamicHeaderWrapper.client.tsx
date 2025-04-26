'use client'

import React, { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { HeaderNav } from '../../Header/Nav'
import { DynamicHeaderNav } from '../../Header/Nav/dynamic'
import { BlogHeaderNav } from '@/components/Header/BlogHeaderNav'
import { HeaderShareButton } from '@/components/Header/HeaderShareButton.client'

// Mock data that will always work
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

  // Always use our fallback data in production
  const headerData =
    process.env.NODE_ENV === 'production' || !serverHeaderData
      ? FALLBACK_HEADER_DATA
      : serverHeaderData

  // In production, always force dynamic header for non-blog pages
  const useStaticHeader = process.env.NODE_ENV === 'production' ? false : initialStaticHeaderValue

  useEffect(() => {
    console.log('Current pathname:', pathname)
    console.log('Is blog post page:', isBlogPostPage)
    console.log('Environment:', process.env.NODE_ENV)
    console.log('Using static header:', useStaticHeader)
    console.log('Using fallback data:', process.env.NODE_ENV === 'production' || !serverHeaderData)
  }, [pathname, isBlogPostPage, serverHeaderData, useStaticHeader])

  // For blog post pages, use the blog header
  if (isBlogPostPage) {
    return (
      <>
        <BlogHeaderNav data={headerData} />
        <HeaderShareButton />
      </>
    )
  }

  // For all other pages, always use the dynamic header in production
  return <DynamicHeaderNav data={headerData} />
}
