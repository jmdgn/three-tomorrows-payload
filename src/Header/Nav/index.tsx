'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import DynamicHeaderNav from './dynamic'

const FALLBACK_NAV_ITEMS = [
  { label: 'Services', url: '/services' },
  { label: 'Approach', url: '/our-approach' },
  { label: 'Why This Matters', url: '/why-this-matters' },
  { label: 'Expertise', url: '/expertise' },
  { label: 'Blog', url: '/posts' },
]

export const HeaderNav: React.FC = () => {
  const pathname = usePathname()

  if (pathname === '/') {
    return <DynamicHeaderNav data={null} />
  }

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
                  {FALLBACK_NAV_ITEMS.map((item, index) => (
                    <li key={`nav-${index}`}>
                      <Link href={item.url}>
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </nav>
          </div>
          <div className="contactBtn-container">
            <div className="headerContact">
              <Link className="contactCta header" href="/contact">
                Talk To Us
              </Link>
            </div>
          </div>
        </div>
      </nav>
    </header>
  )
}

export default HeaderNav
