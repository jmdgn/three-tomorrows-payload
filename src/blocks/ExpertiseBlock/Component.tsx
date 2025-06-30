'use client'

import React, { useEffect, useRef, useState } from 'react'
import type { ExpertiseBlock as ExpertiseBlockProps } from '@/payload-types'
import { loadGSAP } from '@/utilities/gsapLoader'

interface TabContent {
  title: string
  content: string
  image?: {
    url: string
    alt?: string
  }
}

export const ExpertiseBlock: React.FC<ExpertiseBlockProps> = ({
  backgroundImage,
  heroSection,
  emergingFuturesData,
  sustainabilityData,
}) => {
  const {
    emergingFuturesTitle = 'Emerging Futures Technology',
    emergingFuturesSubtitle = 'Cutting through noise to identify the signals that matter most for your future. Helping you see beyond the horizon and prepare for multiple possible tomorrows.',
    sustainabilityTitle = 'Strategic Sustainability & Social Impact',
    sustainabilitySubtitle = 'Cutting through noise to identify the signals that matter most for your future. Helping you see beyond the horizon and prepare for multiple possible tomorrows.',
  } = heroSection || {}

  const componentRef = useRef<HTMLDivElement>(null)
  const heroContainerRef = useRef<HTMLDivElement>(null)
  const heroAnimationWrapperRef = useRef<HTMLDivElement>(null)
  const emergingPanelRef = useRef<HTMLDivElement>(null)
  const sustainabilityPanelRef = useRef<HTMLDivElement>(null)

  const [isMounted, setIsMounted] = useState(false)
  const [gsapReady, setGsapReady] = useState(false)
  const [activeEmergingTab, setActiveEmergingTab] = useState(0)
  const [activeSustainabilityTab, setActiveSustainabilityTab] = useState(0)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    let mounted = true
    const initGSAP = async () => {
      try {
        const gsapModules = await loadGSAP()
        if (gsapModules && mounted) {
          setGsapReady(true)
        }
      } catch (error) {
        console.error('Error loading GSAP:', error)
      }
    }
    initGSAP()
    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    if (!gsapReady || !isMounted || typeof window === 'undefined') return

    const { gsap, ScrollTrigger } = window
    if (!gsap || !ScrollTrigger) return

    const ctx = gsap.context(() => {
      if (heroAnimationWrapperRef.current && heroContainerRef.current && backgroundImage?.url) {
        gsap.to(heroAnimationWrapperRef.current, {
          backgroundPosition: '50% 75%',
          ease: 'none',
          scrollTrigger: {
            id: 'hero-background-parallax',
            trigger: heroContainerRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
            invalidateOnRefresh: true,
          },
        })
      }

      // Hero section pin and scale animation
      if (heroContainerRef.current && heroAnimationWrapperRef.current) {
        const heroTimeline = gsap.timeline({
          scrollTrigger: {
            id: 'expertise-hero-sequence',
            trigger: heroContainerRef.current,
            pin: true,
            scrub: 1,
            start: 'top top',
            end: '+=1200',
            invalidateOnRefresh: true,
          },
        })

        heroTimeline
          .fromTo(
            heroAnimationWrapperRef.current,
            { width: '90vw', height: '85vh', borderRadius: '24px' },
            {
              width: '100vw',
              height: '100vh',
              borderRadius: '0px',
              ease: 'power1.inOut',
              duration: 2,
            },
          )
          .to({}, { duration: 8 }) // Hold
          .to(heroAnimationWrapperRef.current, {
            width: '90vw',
            height: '85vh',
            borderRadius: '24px',
            ease: 'power1.inOut',
            duration: 2,
          })
      }

      // Use matchMedia for responsive animations
      ScrollTrigger.matchMedia({
        // Desktop and Tablet - Parallax effect is active
        '(min-width: 769px)': () => {
          if (emergingPanelRef.current && sustainabilityPanelRef.current) {
            ScrollTrigger.create({
              id: 'panel-pin-desktop',
              trigger: emergingPanelRef.current,
              pin: true,
              start: 'top top',
              endTrigger: sustainabilityPanelRef.current,
              end: 'top bottom',
              pinSpacing: false,
              invalidateOnRefresh: true,
            })

            const parallaxTimeline = gsap.timeline({
              scrollTrigger: {
                id: 'panel-parallax-desktop',
                trigger: sustainabilityPanelRef.current,
                scrub: 0.5,
                start: 'top bottom',
                end: 'bottom bottom',
                invalidateOnRefresh: true,
              },
            })

            parallaxTimeline.to(emergingPanelRef.current, {
              yPercent: -20,
              opacity: 0.7,
              ease: 'power1.out',
            })
          }
        },

        // Mobile - Parallax and pinning are disabled
        '(max-width: 768px)': () => {
          // No GSAP animations here, so panels will scroll normally
          return
        },
      })
    }, componentRef)

    return () => ctx.revert()
  }, [gsapReady, isMounted, backgroundImage])

  const heroWrapperStyle = {
    ...(backgroundImage?.url
      ? {
          backgroundImage: `linear-gradient(rgba(26, 95, 63, 0.5), rgba(26, 95, 63, 0.5)), url(${backgroundImage.url})`,
        }
      : {}),
  }

  const handleScrollTo = (ref: React.RefObject<HTMLDivElement>) => {
    ref.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }

  return (
    <>
      <style jsx>{`
        /* --- Main Containers --- */
        .expertise-block-container {
          position: relative;
          width: 100%;
        }
        .expertise-hero {
          height: 100vh;
          width: 100%;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: visible;
        }
        .hero-animation-wrapper {
          position: relative;
          overflow: hidden;
          background: #1a5f3f;
          display: flex;
          align-items: center;
          justify-content: center;
          background-size: cover;
          background-position: 50% 25%;
          background-repeat: no-repeat;
        }
        .hero-content {
          position: relative;
          width: 100%;
          height: 100%;
          display: flex;
          z-index: 10;
        }
        .expertise-section {
          width: 50%;
          height: -webkit-fill-available;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          margin: 1rem;
          text-align: left;
          transition: all 0.3s ease-in-out;
        }
        .hero-animation-wrapper:hover .expertise-section:not(:hover) {
          opacity: 0.5;
        }
        .section-content {
          max-width: 520px;
          color: #fff;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }
        .section-title {
          margin-bottom: 1rem;
        }
        .section-subtitle {
          font-size: 1rem;
          color: rgba(255, 255, 255, 0.8);
          line-height: 1.6;
        }
        .cta-button {
          width: fit-content;
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 1.5rem;
          font-family: 'Neue Montreal Medium';
          font-size: 14px;
          line-height: 18px;
          transition: all 0.3s ease-in-out;
          color: #fff;
          text-decoration: none;
          cursor: pointer;
          opacity: 0;
          transform: translateY(10px);
        }
        .expertise-section:hover .cta-button {
          opacity: 1;
          transform: translateY(0);
        }
        .cta-button:hover {
          gap: 12px;
        }
        .panels-container {
          position: relative;
          width: 100%;
          padding: 10svh 0;
        }
        .panels-wrapper {
          position: relative;
        }
        .expertise-panel {
          width: 100svw;
          min-height: 100svh;
          height: auto;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          position: relative;
          flex-shrink: 0;
          padding: 5rem 0;
        }
        .expertise-section.emerging:hover,
        .expertise-section.sustainability:hover {
          border-radius: 1.2rem;
          background: rgba(255, 255, 255, 0.1);
          box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
          backdrop-filter: blur(5px);
          -webkit-backdrop-filter: blur(5px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          transition: all 0.3s linear;
        }
        .expertise-panel.emerging {
          z-index: 1;
        }
        .expertise-panel.sustainability {
          z-index: 2;
        }
        .panel-content {
          width: 100%;
          height: auto;
          overflow: visible;
          display: flex;
          flex-direction: column;
        }
        .panel-header {
          display: flex;
          align-items: center;
          gap: 2rem;
          width: -webkit-fill-available;
          text-align: left;
          margin: 0 3rem;
          padding: 2.5rem 0;
          border-top: 1px solid #e0e0e0;
        }
        .panel-header h3 {
          margin: 0;
        }
        .panel-header-icon {
          width: 80px;
          height: 80px;
          border-radius: 12px;
          object-fit: cover;
          flex-shrink: 0;
        }
        .panel-header-icon-placeholder {
          width: 80px;
          height: 80px;
          border-radius: 12px;
          background: #000;
          flex-shrink: 0;
        }
        .panel-body {
          flex: 1;
          display: flex;
          width: 100%;
          height: auto;
          overflow: visible;
          align-items: flex-start;
        }
        .panel-image-container {
          width: 50%;
          padding: 3rem;
          position: -webkit-sticky;
          position: sticky;
          top: 15vh;
          align-self: flex-start;
          height: 75vh;
        }
        .panel-image-wrapper {
          width: 100%;
          height: 100%;
          position: relative;
        }
        .panel-image-wrapper img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 1rem;
        }
        .image-placeholder {
          width: 100%;
          height: 100%;
          aspect-ratio: 5/4;
          background: #e0e0e0;
          border-radius: 1.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #999;
          font-size: 1.2rem;
        }
        .panel-accordion-container {
          width: 50%;
          padding: 3rem;
          overflow-y: visible;
        }
        .accordion-item {
          padding: 1rem 0;
          border-bottom: 1px solid #ccc;
          overflow: hidden;
          transition: all 0.3s ease;
        }
        .accordion-item:last-child {
          margin-bottom: 0;
        }
        .accordion-header {
          padding: 1.5rem 0;
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          align-items: center;
          transition: all 0.3s ease;
          user-select: none;
        }
        .accordion-header.active .accordion-title {
          color: #171744;
        }
        .accordion-title {
          font-family: 'Neue Montreal';
          color: #878484;
          margin: 0;
        }
        .accordion-icon {
          width: 24px;
          height: 24px;
          transition: transform 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .accordion-icon::after {
          content: '+';
          font-size: 1.5rem;
          font-weight: 300;
        }
        .accordion-header.active .accordion-icon::after {
          content: '−';
        }
        .accordion-content {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .accordion-content.active {
          max-height: 600px;
        }
        .accordion-content-inner {
          padding-bottom: 1rem;
        }
        .accordion-description {
          line-height: 1.6;
          color: #333;
        }
        @media (max-width: 1024px) {
          .expertise-panel {
            width: 95vw;
          }
          .panel-body {
            flex-direction: column;
          }
          .panel-image-container,
          .panel-accordion-container {
            width: 100%;
          }
          .panel-image-container {
            padding: 2rem;
            position: static;
            height: 40svh;
          }
          .panel-accordion-container {
            height: auto;
            padding: 2rem;
          }
        }
        @media (max-width: 768px) {
          .expertise-hero {
            height: 100svh;
          }
          .hero-content {
            flex-direction: column;
            height: 85%;
          }
          .hero-animation-wrapper {
            border-radius: 1rem;
          }
          .expertise-section {
            width: fit-content;
          }
          .section-title {
            margin-bottom: 0.5rem;
          }
          .section-subtitle {
            font-size: 14px;
          }
          .cta-button {
            opacity: 1;
            transform: translateY(0);
          }
          .expertise-panel {
            width: 100vw;
            padding: 3rem 0;
          }
          .panel-header {
            margin: 0 1rem;
            padding: 2rem 0;
            border-top: none;
          }
          .panel-image-container {
            width: -webkit-fill-available;
            padding: 1rem;
          }
          .panel-accordion-container {
            width: fit-content;
            padding: 1rem;
          }
          .image-placeholder {
            border-radius: 1rem;
          }
          .accordion-header {
            gap: 2rem;
          }
          .accordion-title {
            font-size: 2rem;
          }
        }
      `}</style>

      <div ref={componentRef} className="expertise-block-container">
        {/* --- Hero Section --- */}
        <section ref={heroContainerRef} className="expertise-hero">
          <div
            ref={heroAnimationWrapperRef}
            className="hero-animation-wrapper"
            style={heroWrapperStyle}
          >
            <div className="hero-content">
              <div className="expertise-section emerging">
                <div className="section-content">
                  <h3 className="section-title">{emergingFuturesTitle}</h3>
                  <p className="section-subtitle">{emergingFuturesSubtitle}</p>
                  <a className="cta-button" onClick={() => handleScrollTo(emergingPanelRef)}>
                    Explore the Possibilities
                    <svg
                      width="7"
                      height="12"
                      viewBox="0 0 7 12"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M1 1L6 6L1 11"
                        stroke="white"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      ></path>
                    </svg>
                  </a>
                </div>
              </div>
              <div className="expertise-section sustainability">
                <div className="section-content">
                  <h3 className="section-title">{sustainabilityTitle}</h3>
                  <p className="section-subtitle">{sustainabilitySubtitle}</p>
                  <a className="cta-button" onClick={() => handleScrollTo(sustainabilityPanelRef)}>
                    See the Impact
                    <svg
                      width="7"
                      height="12"
                      viewBox="0 0 7 12"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M1 1L6 6L1 11"
                        stroke="white"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      ></path>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- Vertically Scrolling Panels Section --- */}
        <section className="panels-container">
          <div className="panels-wrapper">
            {emergingFuturesData && (
              <div ref={emergingPanelRef} className="expertise-panel emerging">
                <div className="panel-content">
                  <div className="panel-header">
                    {emergingFuturesData.panelIcon?.url ? (
                      <img
                        src={emergingFuturesData.panelIcon.url}
                        alt=""
                        className="panel-header-icon"
                      />
                    ) : (
                      <div className="panel-header-icon-placeholder"></div>
                    )}
                    <h3>{emergingFuturesData.panelTitle}</h3>
                  </div>
                  <div className="panel-body">
                    <div className="panel-image-container">
                      <div className="panel-image-wrapper">
                        {emergingFuturesData.tabs[activeEmergingTab]?.image?.url ? (
                          <img
                            src={emergingFuturesData.tabs[activeEmergingTab].image.url}
                            alt={emergingFuturesData.tabs[activeEmergingTab].image.alt || ''}
                          />
                        ) : (
                          <div className="image-placeholder">
                            <span>No image selected</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="panel-accordion-container">
                      {emergingFuturesData.tabs.map((tab, index) => (
                        <div key={index} className="accordion-item">
                          <div
                            className={`accordion-header ${
                              activeEmergingTab === index ? 'active' : ''
                            }`}
                            onClick={() => setActiveEmergingTab(index)}
                          >
                            <h3 className="thin accordion-title">{tab.title}</h3>
                            <div className="accordion-icon"></div>
                          </div>
                          <div
                            className={`accordion-content ${
                              activeEmergingTab === index ? 'active' : ''
                            }`}
                          >
                            <div className="accordion-content-inner">
                              <p className="accordion-description">{tab.content}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
            {sustainabilityData && (
              <div ref={sustainabilityPanelRef} className="expertise-panel sustainability">
                <div className="panel-content">
                  <div className="panel-header">
                    {sustainabilityData.panelIcon?.url ? (
                      <img
                        src={sustainabilityData.panelIcon.url}
                        alt=""
                        className="panel-header-icon"
                      />
                    ) : (
                      <div className="panel-header-icon-placeholder"></div>
                    )}
                    <h3>{sustainabilityData.panelTitle}</h3>
                  </div>
                  <div className="panel-body">
                    <div className="panel-image-container">
                      <div className="panel-image-wrapper">
                        {sustainabilityData.tabs[activeSustainabilityTab]?.image?.url ? (
                          <img
                            src={sustainabilityData.tabs[activeSustainabilityTab].image.url}
                            alt={sustainabilityData.tabs[activeSustainabilityTab].image.alt || ''}
                          />
                        ) : (
                          <div className="image-placeholder">
                            <span>No image selected</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="panel-accordion-container">
                      {sustainabilityData.tabs.map((tab, index) => (
                        <div key={index} className="accordion-item">
                          <div
                            className={`accordion-header ${
                              activeSustainabilityTab === index ? 'active' : ''
                            }`}
                            onClick={() => setActiveSustainabilityTab(index)}
                          >
                            <h3 className="thin accordion-title">{tab.title}</h3>
                            <div className="accordion-icon"></div>
                          </div>
                          <div
                            className={`accordion-content ${
                              activeSustainabilityTab === index ? 'active' : ''
                            }`}
                          >
                            <div className="accordion-content-inner">
                              <p className="accordion-description">{tab.content}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  )
}
