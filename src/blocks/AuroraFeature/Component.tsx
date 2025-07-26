'use client'

import React, { useRef, useEffect } from 'react'
import type { AuroraFeatureBlock as AuroraFeatureBlockProps } from '@/payload-types'

export const AuroraFeatureBlock: React.FC<AuroraFeatureBlockProps & { id?: string }> = ({
  heading,
  textColor,
  parallaxStrength,
}) => {
  const sectionRef = useRef<HTMLElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const strength = typeof parallaxStrength === 'number' ? parallaxStrength : 20
    if (strength === 0) return

    const handleScroll = () => {
      if (!sectionRef.current || !videoRef.current) return

      const rect = sectionRef.current.getBoundingClientRect()
      const scrollPercent = Math.max(
        0,
        Math.min(1, (window.innerHeight - rect.top) / (window.innerHeight + rect.height)),
      )

      const parallaxOffset = (scrollPercent - 0.5) * -strength
      videoRef.current.style.transform = `translate(-50%, -50%) translateY(${parallaxOffset}%)`
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [parallaxStrength])

  return (
    <section ref={sectionRef} className="aurora-feature-section">
      <div className="aurora-feature-container">
        <video
          ref={videoRef}
          src="https://threetomorrows.com/api/media/file/aurora-display.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="aurora-feature-video"
        />
        <div className="aurora-feature-content" style={{ color: textColor || '#FFFFFF' }}>
          {heading && <h2 className="aurora-feature-heading">{heading}</h2>}
        </div>
      </div>
    </section>
  )
}
