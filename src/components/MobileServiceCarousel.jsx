'use client'

import React, { useEffect, useRef, useState } from 'react'

const MobileServiceCarousel = ({ serviceItems, getImageSrc }) => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isTouching, setIsTouching] = useState(false)
  const [startX, setStartX] = useState(0)
  const [currentX, setCurrentX] = useState(0)
  const [touchStartTime, setTouchStartTime] = useState(0)
  const carouselRef = useRef(null)
  const slideRefs = useRef([])
  const slideWidth = useRef(0)
  const isDraggingRef = useRef(false)
  const autoplayTimerRef = useRef(null)
  const totalSlides = serviceItems.length

  // Initialize or reset slide references when items change
  useEffect(() => {
    slideRefs.current = serviceItems.map(
      (_, index) => slideRefs.current[index] || React.createRef(),
    )
  }, [serviceItems])

  // Setup carousel on mount and handle resize events
  useEffect(() => {
    const initializeCarousel = () => {
      if (!carouselRef.current) return

      const containerWidth = carouselRef.current.offsetWidth
      slideWidth.current = containerWidth

      // Set initial position
      goToSlide(currentSlide, false)
    }

    // Initialize
    initializeCarousel()

    // Handle window resize
    const handleResize = () => {
      initializeCarousel()
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      if (autoplayTimerRef.current) {
        clearInterval(autoplayTimerRef.current)
      }
    }
  }, [currentSlide])

  // Handle touch and mouse events
  const handleTouchStart = (e) => {
    if (autoplayTimerRef.current) {
      clearInterval(autoplayTimerRef.current)
    }

    setIsTouching(true)
    isDraggingRef.current = true
    setTouchStartTime(Date.now())

    // Get touch or mouse position
    const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX

    setStartX(clientX)
    setCurrentX(clientX)
  }

  const handleTouchMove = (e) => {
    if (!isTouching || !isDraggingRef.current) return

    // Get the current X position
    const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX

    setCurrentX(clientX)

    // Calculate the offset
    const deltaX = clientX - startX

    // Apply transform to the carousel container with damping for smoother feel
    if (carouselRef.current) {
      let offset = -currentSlide * slideWidth.current + deltaX
      
      // Add slight resistance at edges for a better feel
      if ((currentSlide === 0 && deltaX > 0) || (currentSlide === totalSlides - 1 && deltaX < 0)) {
        offset = -currentSlide * slideWidth.current + (deltaX * 0.5)
      }
      
      carouselRef.current.style.transform = `translateX(${offset}px)`
    }

    // Only prevent default for mouse events, not touch events
    // This prevents the error "Unable to preventDefault inside passive event listener"
    if (e.type.includes('mouse')) {
      e.preventDefault()
    }
  }

  const handleTouchEnd = (e) => {
    if (!isTouching || !isDraggingRef.current) return

    const touchDuration = Date.now() - touchStartTime
    const deltaX = currentX - startX
    const absDeltaX = Math.abs(deltaX)

    // Determine if this is a swipe based on distance and time
    const isQuickSwipe = touchDuration < 250 && absDeltaX > 20
    const isLongSwipe = absDeltaX > slideWidth.current * 0.25

    if (isQuickSwipe || isLongSwipe) {
      // If swiped left, go to next slide, if right, go to previous
      if (deltaX < 0 && currentSlide < totalSlides - 1) {
        goToSlide(currentSlide + 1)
      } else if (deltaX > 0 && currentSlide > 0) {
        goToSlide(currentSlide - 1)
      } else {
        // If at the edge, snap back with animation
        goToSlide(currentSlide)
      }
    } else {
      // Snap back to current slide
      goToSlide(currentSlide)
    }

    setIsTouching(false)
    isDraggingRef.current = false
  }

  // Navigate to a specific slide with or without animation
  const goToSlide = (index, animate = true) => {
    if (!carouselRef.current) return

    // Ensure index is within bounds
    const targetIndex = Math.max(0, Math.min(index, totalSlides - 1))

    // Calculate the offset
    const offset = -targetIndex * slideWidth.current

    // Apply transform with or without transition
    carouselRef.current.style.transition = animate
      ? 'transform 0.3s cubic-bezier(0.25, 0.1, 0.25, 1)'
      : 'none'
    carouselRef.current.style.transform = `translateX(${offset}px)`

    // Update state
    setCurrentSlide(targetIndex)

    // Clear transition after animation completes
    if (animate) {
      setTimeout(() => {
        if (carouselRef.current) {
          carouselRef.current.style.transition = 'none'
        }
      }, 300)
    }
  }

  const handleDotClick = (index) => {
    goToSlide(index)
  }

  return (
    <div className="service-carousel-container">
      <div
        className="service-carousel-wrapper"
        style={{
          position: 'relative',
          overflow: 'hidden',
          width: '100%',
        }}
      >
        <div
          ref={carouselRef}
          className={`service-carousel ${isTouching ? 'dragging' : ''}`}
          style={{
            display: 'flex',
            transform: 'translateX(0)',
            transition: 'none',
            width: '100%',
            touchAction: 'pan-y',
            willChange: 'transform',
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleTouchStart}
          onMouseMove={handleTouchMove}
          onMouseUp={handleTouchEnd}
          onMouseLeave={(e) => {
            if (isTouching) handleTouchEnd(e)
          }}
        >
          {serviceItems.map((service, index) => (
            <div
              className="carousel-slide"
              ref={(el) => (slideRefs.current[index] = el)}
              key={index}
              style={{
                flexShrink: 0,
                width: '100%',
                paddingLeft: '8px',
                paddingRight: '8px',
                boxSizing: 'border-box',
                userSelect: 'none',
                pointerEvents: isTouching ? 'none' : 'auto',
              }}
            >
              <div className="serviceCard">
                <div className="serviceContent-panelTop">
                  <div className="serviceFt-image">
                    <img
                      className="service-image"
                      src={getImageSrc(service.image)}
                      width={442}
                      height={442}
                      alt={`${service.breakTitle || ''} ${service.title} Image`}
                      loading="lazy"
                      onError={(e) => {
                        console.error('Image failed to load:', e.target.src)
                        e.target.src = 'assets/images/services/trend.png'
                      }}
                    />
                  </div>
                </div>
                <div className="serviceText-panelBottom">
                  <h6>{service.title}</h6>
                  <p>{service.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination dots */}
        <div className="carousel-dots">
          {Array.from({ length: totalSlides }).map((_, index) => (
            <div
              key={index}
              className={`carousel-dot ${currentSlide === index ? 'active' : ''}`}
              onClick={() => handleDotClick(index)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default MobileServiceCarousel