'use client'

import React from 'react'
import Link from 'next/link'
import type { OurServicesIntroBlock as OurServicesIntroBlockProps } from '@/payload-types'
import { Page } from '@/payload-types'
import AnimatedTitle from '@/components/HomeScripts/AnimatedTitle'

const getHref = (link: any): string => {
  if (!link || link.type === 'none') return '#'

  if (link.type === 'reference' && link.reference) {
    if (typeof link.reference === 'object' && link.reference !== null) {
      const page = link.reference as Page
      return page.fullPath || `/${page.slug}`
    } else if (typeof link.reference === 'string') {
      console.warn('Page reference not populated. Check maxDepth in relationship field.')
      return '#'
    }
  }

  if (link.type === 'custom' && link.url) {
    return link.url
  }

  return '#'
}

const isExternalLink = (url: string): boolean => {
  return (
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('mailto:') ||
    url.startsWith('tel:')
  )
}

export const OurServicesIntroBlock: React.FC<OurServicesIntroBlockProps> = ({
  heading,
  headingColor,
  subheading,
  serviceItems,
}) => {
  return (
    <section className="services-intro-section">
      <div className="services-intro-outer">
        <div className="services-intro-inner">
          <div className="services-intro-grid">
            {/* Left Column - Title Content */}
            <div className="services-intro-left">
              <div className="titleText">
                <div className="titleContent-container">
                  <h4 style={{ color: headingColor || '#171744' }}>{heading}</h4>
                </div>
                <div className="txtContent-container">
                  <p className="xlarge">
                    <AnimatedTitle staggerDelay={0.02} duration={0.6}>
                      {subheading}
                    </AnimatedTitle>
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column - Service Items */}
            <div className="services-intro-right">
              {serviceItems && serviceItems.length > 0 && (
                <div className="services-items">
                  {serviceItems.map((item, index) => {
                    const href = getHref(item.link)
                    const newTab = item.link?.newTab || false
                    const hasLink = href !== '#'
                    const isExternal = isExternalLink(href)

                    if (!hasLink) {
                      return (
                        <div className="expertise-panel" key={index}>
                          <div className="expertise-content">
                            <h5>{item.text}</h5>
                            <p>{item.hoverText || ''}</p>
                          </div>
                          <div className="expertise-arrow">
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 16 16"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M0.292893 14.2929C-0.097631 14.6834 -0.097631 15.3166 0.292893 15.7071C0.683418 16.0976 1.31658 16.0976 1.70711 15.7071L0.292893 14.2929ZM16 1C16 0.447715 15.5523 -9.44832e-09 15 -9.44832e-09L6 -9.44832e-09C5.44772 -9.44832e-09 5 0.447715 5 1C5 1.55228 5.44772 2 6 2H14L14 10C14 10.5523 14.4477 11 15 11C15.5523 11 16 10.5523 16 10L16 1ZM1 15L1.70711 15.7071L15.7071 1.70711L15 1L14.2929 0.292893L0.292893 14.2929L1 15Z"
                                fill="#191C1C"
                              />
                            </svg>
                          </div>
                        </div>
                      )
                    }

                    if (isExternal || item.link?.type === 'custom') {
                      return (
                        <a
                          href={href}
                          className="expertise-panel"
                          key={index}
                          target={newTab ? '_blank' : '_self'}
                          rel={newTab ? 'noopener noreferrer' : undefined}
                        >
                          <div className="expertise-content">
                            <h5>{item.text}</h5>
                            <p>{item.hoverText || ''}</p>
                          </div>
                          <div className="expertise-arrow">
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 16 16"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M0.292893 14.2929C-0.097631 14.6834 -0.097631 15.3166 0.292893 15.7071C0.683418 16.0976 1.31658 16.0976 1.70711 15.7071L0.292893 14.2929ZM16 1C16 0.447715 15.5523 -9.44832e-09 15 -9.44832e-09L6 -9.44832e-09C5.44772 -9.44832e-09 5 0.447715 5 1C5 1.55228 5.44772 2 6 2H14L14 10C14 10.5523 14.4477 11 15 11C15.5523 11 16 10.5523 16 10L16 1ZM1 15L1.70711 15.7071L15.7071 1.70711L15 1L14.2929 0.292893L0.292893 14.2929L1 15Z"
                                fill="#191C1C"
                              />
                            </svg>
                          </div>
                        </a>
                      )
                    }

                    return (
                      <Link
                        href={href}
                        className="expertise-panel"
                        key={index}
                        target={newTab ? '_blank' : '_self'}
                      >
                        <div className="expertise-content">
                          <h5>{item.text}</h5>
                          <p>{item.hoverText || ''}</p>
                        </div>
                        <div className="expertise-arrow">
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M0.292893 14.2929C-0.097631 14.6834 -0.097631 15.3166 0.292893 15.7071C0.683418 16.0976 1.31658 16.0976 1.70711 15.7071L0.292893 14.2929ZM16 1C16 0.447715 15.5523 -9.44832e-09 15 -9.44832e-09L6 -9.44832e-09C5.44772 -9.44832e-09 5 0.447715 5 1C5 1.55228 5.44772 2 6 2H14L14 10C14 10.5523 14.4477 11 15 11C15.5523 11 16 10.5523 16 10L16 1ZM1 15L1.70711 15.7071L15.7071 1.70711L15 1L14.2929 0.292893L0.292893 14.2929L1 15Z"
                              fill="#191C1C"
                            />
                          </svg>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
