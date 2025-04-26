'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import DynamicHeaderNav from './dynamic'

// Mock data for testing dynamic header
const MOCK_HEADER_DATA = {
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

export const HeaderNav: React.FC = () => {
  const pathname = usePathname()
  const [headerData, setHeaderData] = useState(null)

  useEffect(() => {
    // In a real implementation, you would fetch this data from your API
    // For now, we're using mock data for testing
    setHeaderData(MOCK_HEADER_DATA)
  }, [])

  // Always use DynamicHeaderNav, but with appropriate data based on the route
  if (pathname === '/') {
    return <DynamicHeaderNav data={headerData} />
  }

  return <DynamicHeaderNav data={MOCK_HEADER_DATA} />
}

export default HeaderNav
