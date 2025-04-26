'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'

interface HeaderData {
  navItems?: Array<{
    id: string
    link?: {
      type?: string
      label?: string
      url?: string
      newTab?: boolean
      reference?: {
        relationTo?: string
        value?: {
          slug?: string
          title?: string
          id?: string
        }
      }
    }
  }> | null
  logo?: any
  ctaLink?: any
  ctaLabel?: string
}

const FALLBACK_NAV_ITEMS = [
  { label: 'Services', url: '/services' },
  { label: 'Approach', url: '/our-approach' },
  { label: 'Why This Matters', url: '/why-this-matters' },
  { label: 'Expertise', url: '/expertise' },
  { label: 'Blog', url: '/posts' },
]

export const DynamicHeaderNav: React.FC<{ data: HeaderData | null }> = ({ data }) => {
  const isClient = typeof window !== 'undefined'

  // For debugging purposes only
  React.useEffect(() => {
    if (isClient && process.env.NODE_ENV === 'development') {
      console.log('DynamicHeaderNav received data:', data ? 'yes' : 'no')
      console.log('navItems count:', data?.navItems?.length || 0)

      // Log raw navItems to inspect structure
      if (data?.navItems) {
        console.log('Raw navItems structure:', JSON.stringify(data.navItems, null, 2))
      }
    }
  }, [data, isClient])

  const navItems = React.useMemo(() => {
    // If no data or navItems, return fallback
    if (!data || !data.navItems || !Array.isArray(data.navItems) || data.navItems.length === 0) {
      if (isClient && process.env.NODE_ENV === 'development') {
        console.log('Using FALLBACK_NAV_ITEMS due to missing navItems')
      }
      return FALLBACK_NAV_ITEMS
    }

    // Process the nav items
    const validItems = data.navItems
      .filter((item) => {
        // Base case - we need an item with a link and label
        if (!item || !item.link || !item.link.label) {
          return false
        }

        // Link URL directly provided
        if (item.link.url) {
          return true
        }

        // Reference link
        if (item.link.type === 'reference' && item.link.reference?.value) {
          return true
        }

        // Custom link with no URL (should have one, but we'll be forgiving)
        if (item.link.type === 'custom') {
          return true
        }

        return false
      })
      .map((item) => {
        // Build the normalized nav item
        let url = '#'

        // Direct URL
        if (item.link?.url) {
          url = item.link.url
        }
        // Reference URL
        else if (item.link?.type === 'reference' && item.link?.reference?.value) {
          const refValue = item.link.reference.value
          url = `/${refValue.slug}` || '#'
        }

        return {
          label: item.link!.label!,
          url: url,
          newTab: item.link!.newTab || false,
        }
      })

    if (validItems.length === 0) {
      if (isClient && process.env.NODE_ENV === 'development') {
        console.log('No valid items after filtering, using fallback')
      }
      return FALLBACK_NAV_ITEMS
    }

    if (isClient && process.env.NODE_ENV === 'development') {
      console.log('Using', validItems.length, 'valid navigation items:')
      console.log('Final nav items:', JSON.stringify(validItems, null, 2))
    }
    return validItems
  }, [data, isClient])

  const ctaLabel = data?.ctaLabel || 'Talk To Us'
  const ctaLink = data?.ctaLink?.url || '/contact'

  return (
    <header className="main-nav">
      <nav className="mainNav">
        <div className="header-container">
          <div className="logo-container">
            <div className="headerLogo">
              <Link href="/">
                <Image
                  className="main-logo"
                  src="/assets/logo/logo.svg"
                  width={220}
                  height={58}
                  alt="Three Tomorrows"
                  priority
                />
              </Link>
            </div>
          </div>
          <div className="menu-container">
            <nav>
              <div className="nav-menu">
                <ul className="menu-ribbon">
                  {navItems.map((item, index) => (
                    <li key={`nav-${index}`}>
                      {item.newTab ? (
                        <a href={item.url} target="_blank" rel="noopener noreferrer">
                          {item.label}
                        </a>
                      ) : (
                        <Link href={item.url}>{item.label}</Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </nav>
          </div>
          <div className="contactBtn-container">
            <div className="headerContact">
              <Link className="contactCta header" href={ctaLink}>
                {ctaLabel}
              </Link>
            </div>
          </div>
        </div>
      </nav>
    </header>
  )
}

export default DynamicHeaderNav
