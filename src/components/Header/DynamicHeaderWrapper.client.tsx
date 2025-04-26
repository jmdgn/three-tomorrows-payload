'use client'

import React, { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { HeaderNav } from '../../Header/Nav'
import { DynamicHeaderNav } from '../../Header/Nav/dynamic'
import { BlogHeaderNav } from '@/components/Header/BlogHeaderNav'
import { HeaderShareButton } from '@/components/Header/HeaderShareButton.client'

interface DynamicHeaderWrapperProps {
  headerData: any
  useStaticHeader: boolean
}

export default function DynamicHeaderWrapper({
  headerData,
  useStaticHeader: initialStaticHeaderValue,
}: DynamicHeaderWrapperProps) {
  const pathname = usePathname()
  const [overrideStaticHeader, setOverrideStaticHeader] = useState(null)
  const isBlogPostPage = pathname?.startsWith('/posts/') && pathname !== '/posts'

  // Calculate the effective useStaticHeader value
  const useStaticHeader =
    overrideStaticHeader !== null ? overrideStaticHeader : initialStaticHeaderValue

  useEffect(() => {
    console.log('Current pathname:', pathname)
    console.log('Is blog post page:', isBlogPostPage)
    console.log('Initial static header flag:', initialStaticHeaderValue)

    // If we have valid header data but static header is still true,
    // we'll override it to ensure dynamic header is used
    if (
      initialStaticHeaderValue === true &&
      headerData &&
      headerData.navItems &&
      headerData.navItems.length > 0
    ) {
      // Check if there's at least one valid nav item
      const hasValidItems = headerData.navItems.some(
        (item) =>
          item.link?.label &&
          (item.link?.url ||
            item.link?.type === 'custom' ||
            (item.link?.type === 'reference' && item.link?.reference?.value)),
      )

      if (hasValidItems) {
        console.log('Overriding static header flag to false because valid nav items found')
        setOverrideStaticHeader(false)
      }
    }
  }, [pathname, isBlogPostPage, initialStaticHeaderValue, headerData])

  return (
    <>
      {isBlogPostPage ? (
        <>
          <BlogHeaderNav data={headerData} />
          <HeaderShareButton />
        </>
      ) : useStaticHeader ? (
        <HeaderNav />
      ) : (
        <DynamicHeaderNav data={headerData} />
      )}
    </>
  )
}
