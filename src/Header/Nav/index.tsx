'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'

export const HeaderNav: React.FC = () => {
  return (
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
                <li>
                  <Link href="#section-second">Our Services</Link>
                </li>
                <li>
                  <Link href="/">Our Approach</Link>
                </li>
                <li>
                  <Link href="/">Why This Matters</Link>
                </li>
                <li>
                  <Link href="#section-fourth">Expertise</Link>
                </li>
                <li>
                  <Link href="#section-fifth">Blog</Link>
                </li>
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
  )
}