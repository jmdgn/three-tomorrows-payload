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
            <p className="xlarge">
              <AnimatedTitle 
                staggerDelay={animationSettings.staggerDelay} 
                duration={animationSettings.duration}
              >
                {description}
              </AnimatedTitle>
            </p>
            <div 
              className="body-button" 
              onClick={handleClick}
              role="button"
              tabIndex={0}
            >
              {ctaText}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}