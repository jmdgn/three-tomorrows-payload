'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'

export const HeaderNav: React.FC = () => {
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
                        <Link href={item.url}>
                          {item.label}
                        </Link>
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