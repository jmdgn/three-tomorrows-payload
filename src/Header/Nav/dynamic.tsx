'use client'

import React, { useState } from 'react'
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  React.useEffect(() => {
    if (isClient && process.env.NODE_ENV === 'development') {
      console.log('DynamicHeaderNav received data:', data ? 'yes' : 'no')
      console.log('navItems count:', data?.navItems?.length || 0)

      if (data?.navItems) {
        console.log('Raw navItems structure:', JSON.stringify(data.navItems, null, 2))
      }
    }
  }, [data, isClient])

  const navItems = React.useMemo(() => {
    if (!data || !data.navItems || !Array.isArray(data.navItems) || data.navItems.length === 0) {
      if (isClient && process.env.NODE_ENV === 'development') {
        console.log('Using FALLBACK_NAV_ITEMS due to missing navItems')
      }
      return FALLBACK_NAV_ITEMS
    }

    const validItems = data.navItems
      .filter((item) => {
        if (!item || !item.link || !item.link.label) {
          return false
        }

        if (item.link.url) {
          return true
        }

        if (item.link.type === 'reference' && item.link.reference?.value) {
          return true
        }

        if (item.link.type === 'custom') {
          return true
        }

        return false
      })
      .map((item) => {
        let url = '#'

        if (item.link?.url) {
          url = item.link.url
        } else if (item.link?.type === 'reference' && item.link?.reference?.value) {
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

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

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
          {/* Desktop Navigation Menu */}
          <div className="menu-container desktop-menu">
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
            {/* Mobile Menu Toggle Button */}
            <div className="mobile-menu-toggle">
              <button onClick={toggleMobileMenu} className="menu-toggle-btn">
                {mobileMenuOpen ? 'Close' : 'Menu'}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="mobile-menu">
            <nav>
              <ul className="mobile-menu-items">
                {navItems.map((item, index) => (
                  <li key={`mobile-nav-${index}`}>
                    {item.newTab ? (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {item.label}
                      </a>
                    ) : (
                      <Link href={item.url} onClick={() => setMobileMenuOpen(false)}>
                        {item.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        )}
      </nav>
    </header>
  )
}

export default DynamicHeaderNav
