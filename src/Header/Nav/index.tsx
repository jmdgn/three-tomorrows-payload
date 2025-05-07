'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import DynamicHeaderNav from './dynamic'

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
  ctaLabel: "Let's Talk",
}

export const HeaderNav: React.FC = () => {
  const pathname = usePathname()
  const [headerData, setHeaderData] = useState(MOCK_HEADER_DATA)

  useEffect(() => {
    console.log('HeaderNav component running on pathname:', pathname)
    console.log('Environment:', process.env.NODE_ENV)

    setHeaderData(MOCK_HEADER_DATA)
  }, [pathname])

  return <DynamicHeaderNav data={headerData} />
}

export default HeaderNav
