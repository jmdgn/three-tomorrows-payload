import React from 'react'
import Link from 'next/link'
import { Media } from '@/components/Media'
import { Header as HeaderType } from '@/payload-types'

type Props = {
  header?: HeaderType
}

export const NewHeader: React.FC<Props> = ({ header = {} as HeaderType }) => {
  return (
    <header>
       <div className="header-container">
        <div className="logo-container">
          <div className="headerLogo">
            <img
              className="main-logo"
              src="assets/logo/logo.svg"
              width={220}
              height={58}
              alt="Three Tomorrows"
            />
          </div>
        </div>
        <div className="menu-container">
          <nav>
            <div className="nav-menu">
              <ul className="menu-ribbon">
                <a href="#section-second">
                  <li>Our Services</li>
                </a>
                <a href="/">
                  <li>Our Approach</li>
                </a>
                <a href="/">
                  <li>Why This Matters</li>
                </a>
                <a href="#section-fourth">
                  <li>Expertise</li>
                </a>
                <a href="#section-fifth">
                  <li>Blog</li>
                </a>
              </ul>
            </div>
          </nav>
        </div>
        <div className="contactBtn-container">
          <div className="headerContact">
            <a className="contactCta header" href="#section-seven">
              Talk To Us
            </a>
          </div>
        </div>
      </div>
    </header>
  )
}
