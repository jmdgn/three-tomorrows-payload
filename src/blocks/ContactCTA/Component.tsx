'use client'

import React from 'react'
import type { ContactCTABlock as ContactCTABlockProps } from '@/payload-types'
import AnimatedTitle from '@/components/HomeScripts/AnimatedTitle'

export const ContactCTABlock: React.FC<ContactCTABlockProps> = ({
  heading = 'Contact Us',
  description = "Let's talk about how we can implement strategy and transformation into your business to help you shape tomorrow.",
  ctaText = 'Talk To Us',
  ctaLink = '/contact',
  animationSettings = { staggerDelay: 0.02, duration: 0.6 },
}) => {
  const handleClick = () => {
    window.location.href = ctaLink
  }

  return (
    <section id="contactModule-internal" className="contactForm-panel">
      <div className="contactContent-outer">
        <div className="contactContent-inner">
          <div className="contactPanel-home">
            <h4>{heading}</h4>
            <p className="xlarge internalPanel">
              <AnimatedTitle
                staggerDelay={animationSettings.staggerDelay}
                duration={animationSettings.duration}
              >
                {description}
              </AnimatedTitle>
            </p>
            <div className="body-button" onClick={handleClick} role="button" tabIndex={0}>
              {ctaText}
              <div className="ctaButton-iconContainer">
                <svg
                  className="first"
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="#000"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M0.46967 10.5703C0.176777 10.8631 0.176777 11.338 0.46967 11.6309C0.762563 11.9238 1.23744 11.9238 1.53033 11.6309L0.46967 10.5703ZM11.75 1.10059C11.75 0.686372 11.4142 0.350586 11 0.350586L4.25 0.350587C3.83579 0.350587 3.5 0.686373 3.5 1.10059C3.5 1.5148 3.83579 1.85059 4.25 1.85059L10.25 1.85059L10.25 7.85058C10.25 8.2648 10.5858 8.60058 11 8.60058C11.4142 8.60058 11.75 8.2648 11.75 7.85058L11.75 1.10059ZM1.53033 11.6309L11.5303 1.63092L10.4697 0.570256L0.46967 10.5703L1.53033 11.6309Z"></path>
                </svg>
                <svg
                  className="second"
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="#FFF"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M0.46967 10.5703C0.176777 10.8631 0.176777 11.338 0.46967 11.6309C0.762563 11.9238 1.23744 11.9238 1.53033 11.6309L0.46967 10.5703ZM11.75 1.10059C11.75 0.686372 11.4142 0.350586 11 0.350586L4.25 0.350587C3.83579 0.350587 3.5 0.686373 3.5 1.10059C3.5 1.5148 3.83579 1.85059 4.25 1.85059L10.25 1.85059L10.25 7.85058C10.25 8.2648 10.5858 8.60058 11 8.60058C11.4142 8.60058 11.75 8.2648 11.75 7.85058L11.75 1.10059ZM1.53033 11.6309L11.5303 1.63092L10.4697 0.570256L0.46967 10.5703L1.53033 11.6309Z"></path>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
