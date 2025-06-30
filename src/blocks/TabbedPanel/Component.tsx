'use client'

import React, { useEffect, useRef, useState } from 'react'
import type { TabbedPanelBlock as TabbedPanelBlockProps } from '@/payload-types'
import { Media } from '@/components/Media'
import { loadGSAP } from '@/utilities/gsapLoader'

export const TabbedPanelBlock: React.FC<TabbedPanelBlockProps> = ({
  panel1,
  panel2,
  fullWidth,
}) => {
  const [activeTab1, setActiveTab1] = useState(0)
  const [activeTab2, setActiveTab2] = useState(0)
  const [gsapReady, setGsapReady] = useState(false)

  const sectionRef = useRef<HTMLDivElement>(null)
  const bgTransitionRef = useRef<HTMLDivElement>(null)
  const panelDarkRef = useRef<HTMLDivElement>(null)
  const panelLightRef = useRef<HTMLDivElement>(null)

  const panels = [panel1, panel2].filter((p) => p && p.tabs && p.tabs.length > 0)
  const panelCount = panels.length

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
    if (!gsapReady || typeof window === 'undefined') return

    const { gsap, ScrollTrigger } = window
    if (!gsap || !ScrollTrigger) return

    ScrollTrigger.getAll().forEach((trigger) => {
      const id = trigger.vars?.id
      if (id === 'tabbed-panel-bg' || id === 'panel-dark-fade' || id === 'panel-light-reveal') {
        trigger.kill()
      }
    })

    const sectionEl = sectionRef.current
    const bgEl = bgTransitionRef.current
    const panelDarkEl = panelDarkRef.current
    const panelLightEl = panelLightRef.current

    if (!sectionEl) return

    // Increased scroll gap multiplier
    const scrollGapMultiplier = 1.5 // Increase this to add more gap between panels
    const fadeDistance = window.innerHeight * 0.5
    const gapDistance = window.innerHeight * scrollGapMultiplier
    const delayDistance = window.innerHeight * 0.5 // Delay before starting transitions

    if (bgEl) {
      ScrollTrigger.create({
        id: 'tabbed-panel-bg',
        trigger: sectionEl,
        start: () => `top+=${delayDistance} top`,
        end: () => `+=${sectionEl.offsetHeight / panelCount}`,
        scrub: 1,
        onUpdate: (self) => {
          const progress = Math.min(Math.max(self.progress, 0), 1)
          const r = Math.round(25 + (247 - 25) * progress)
          const g = Math.round(28 + (247 - 28) * progress)
          const b = Math.round(28 + (247 - 28) * progress)
          bgEl.style.backgroundColor = `rgb(${r}, ${g}, ${b})`
        },
      })
    }

    if (panelDarkEl) {
      // Keep panel-1 visible for longer before starting fade
      gsap
        .timeline({
          scrollTrigger: {
            id: 'panel-dark-fade',
            trigger: panelDarkEl,
            start: 'top top',
            end: () => `+=${delayDistance + fadeDistance}`,
            scrub: true,
            pin: true,
            pinSpacing: false,
          },
        })
        .to(panelDarkEl, {
          opacity: 1,
          duration: delayDistance / (delayDistance + fadeDistance),
          ease: 'none',
        })
        .to(panelDarkEl, {
          opacity: 0,
          duration: fadeDistance / (delayDistance + fadeDistance),
          ease: 'none',
        })
    }

    if (panelLightEl && panelDarkEl) {
      // Start panel-2 off-screen and hidden
      gsap.set(panelLightEl, {
        y: gapDistance,
        opacity: 0,
      })

      // Animate panel-2 into view after the gap
      gsap.to(panelLightEl, {
        y: 0,
        opacity: 1,
        ease: 'power2.out',
        scrollTrigger: {
          id: 'panel-light-reveal',
          trigger: panelDarkEl,
          start: () => `top+=${delayDistance + fadeDistance} top`,
          end: () => `+=${gapDistance}`,
          scrub: 1,
        },
      })
    }

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => {
        const id = trigger.vars?.id
        if (id === 'tabbed-panel-bg' || id === 'panel-dark-fade' || id === 'panel-light-reveal') {
          trigger.kill()
        }
      })
    }
  }, [gsapReady, panelCount])

  const renderPanel = (
    panel: typeof panel1,
    activeTab: number,
    setActiveTab: (index: number) => void,
    panelClass: string,
  ) => {
    if (!panel || !panel.tabs || panel.tabs.length === 0) return null

    const activeContent = panel.tabs[activeTab]

    return (
      <div className={`tabbed-panel-wrapper ${panelClass}`}>
        {panel.title && (
          <div className="tabbed-panel-header">
            <h4 className="tabbed-panel-title">{panel.title}</h4>
          </div>
        )}

        <div className="tabbed-panel-tabs">
          <div className="tabs-container">
            {panel.tabs.map((tab, index) => (
              <button
                key={index}
                className={`tab-button ${activeTab === index ? 'tab-active' : 'tab-inactive'}`}
                onClick={() => setActiveTab(index)}
                type="button"
              >
                <span className="tab-label">{tab.tabLabel}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="tabbed-panel-content">
          <div className="content-wrapper">
            <div className="content-text">
              {activeContent.contentTitle && (
                <h2 className="content-title">{activeContent.contentTitle}</h2>
              )}
              {activeContent.contentBody && <p>{activeContent.contentBody}</p>}
            </div>

            {activeContent.contentImage && (
              <div className="content-image">
                <Media
                  resource={activeContent.contentImage}
                  className="image-wrapper"
                  imgClassName="panel-image"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Adjusted height to account for the gap between panels and delay
  const scrollGapMultiplier = 1.5
  const delayMultiplier = 0.5
  const heightWrapperStyle: React.CSSProperties = {
    height:
      panelCount > 0
        ? `${panelCount * 100 + scrollGapMultiplier * 100 + delayMultiplier * 100}vh`
        : '0px',
  }

  return (
    <section ref={sectionRef} className="tabbed-panel-section" data-full-width={fullWidth}>
      <div className="tabbed-panel-height-wrapper" style={heightWrapperStyle}>
        {/* Sticky background container */}
        <div ref={bgTransitionRef} className="tabbed-panel-bg-transition">
          <div className="tabbed-panel-viewport">
            <div className="tabbed-panel-scroll-content">
              {/* Panel 1: dark. Attach ref for pin+fade */}
              <div ref={panelDarkRef} className="panel-container panel-dark">
                {renderPanel(panel1, activeTab1, setActiveTab1, 'panel-1')}
              </div>
              {/* Panel 2: light */}
              <div ref={panelLightRef} className="panel-container panel-light">
                {renderPanel(panel2, activeTab2, setActiveTab2, 'panel-2')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
