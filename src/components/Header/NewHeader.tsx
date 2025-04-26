import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Header as HeaderType } from '@/payload-types'

const FALLBACK_NAV_ITEMS = [
  { label: 'Services', url: '/services' },
  { label: 'Approach', url: '/our-approach' },
  { label: 'Why This Matters', url: '/why-this-matters' },
  { label: 'Expertise', url: '/expertise' },
  { label: 'Blog', url: '/posts' },
]

type Props = {
  header?: HeaderType
}

export const NewHeader: React.FC<Props> = ({ header = {} as HeaderType }) => {
  // Process header data to get nav items
  const navItems = React.useMemo(() => {
    if (!header?.navItems || !Array.isArray(header.navItems) || header.navItems.length === 0) {
      return FALLBACK_NAV_ITEMS
    }

    // Process the nav items from the header
    const validItems = header.navItems
      .filter((item) => {
        return item?.link?.label
      })
      .map((item) => {
        let url = '#'
        let label = 'Link'
        let newTab = false

        if (item.link) {
          label = item.link.label || 'Link'
          newTab = item.link.newTab || false

          if (item.link.url) {
            url = item.link.url
          } else if (item.link.reference?.value?.slug) {
            url = `/${item.link.reference.value.slug}`
          }
        }

        return { label, url, newTab }
      })

    return validItems.length > 0 ? validItems : FALLBACK_NAV_ITEMS
  }, [header])

  // Get CTA info
  const ctaLabel = header?.ctaLabel || 'Talk To Us'
  const ctaLink = header?.ctaLink?.url || '/contact'

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

export default NewHeader
