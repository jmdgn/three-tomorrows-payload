'use client'

import React, { useEffect, useRef, useState } from 'react'

const MobileServiceCarousel = ({ serviceItems, getImageSrc }) => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isTouching, setIsTouching] = useState(false)
  const [startX, setStartX] = useState(0)
  const [currentX, setCurrentX] = useState(0)
  const [touchStartTime, setTouchStartTime] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const carouselRef = useRef(null)
  const slideRefs = useRef([])
  const slideWidth = useRef(0)
  const isDraggingRef = useRef(false)
  const totalSlides = serviceItems.length

  useEffect(() => {
    slideRefs.current = serviceItems.map(
      (_, index) => slideRefs.current[index] || React.createRef()
    )
  }, [serviceItems])

  useEffect(() => {
    const initializeCarousel = () => {
      if (!carouselRef.current) return

      const containerWidth = carouselRef.current.offsetWidth
      slideWidth.current = containerWidth

      goToSlide(currentSlide, false)
    }

    initializeCarousel()

    const handleResize = () => {
      initializeCarousel()
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [currentSlide])

  const handleTouchStart = (e) => {
    if (isAnimating) return
    
    setIsTouching(true)
    isDraggingRef.current = true
    setTouchStartTime(Date.now())

    const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX

    setStartX(clientX)
    setCurrentX(clientX)
  }

  const handleTouchMove = (e) => {
    if (!isTouching || !isDraggingRef.current || isAnimating) return

    const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX

    setCurrentX(clientX)

    const deltaX = clientX - startX

    if (carouselRef.current) {
      let offset = -currentSlide * slideWidth.current + deltaX
      
      if (currentSlide === 0 && deltaX > 0) {
        offset = -currentSlide * slideWidth.current + (deltaX * 0.3)
      } else if (currentSlide === totalSlides - 1 && deltaX < 0) {
        offset = -currentSlide * slideWidth.current + (deltaX * 0.3)
      }
      
      carouselRef.current.style.transform = `translateX(${offset}px)`
    }

    if (e.type.includes('mouse')) {
      e.preventDefault()
    }
  }

  const handleTouchEnd = (e) => {
    if (!isTouching || !isDraggingRef.current || isAnimating) return

    const touchDuration = Date.now() - touchStartTime
    const deltaX = currentX - startX
    const absDeltaX = Math.abs(deltaX)

    const isQuickSwipe = touchDuration < 250 && absDeltaX > 20
    const isLongSwipe = absDeltaX > slideWidth.current * 0.15

    if (isQuickSwipe || isLongSwipe) {
      if (deltaX < 0 && currentSlide < totalSlides - 1) {
        goToSlide(currentSlide + 1)
      } else if (deltaX > 0 && currentSlide > 0) {
        goToSlide(currentSlide - 1)
      } else {
        goToSlide(currentSlide)
      }
    } else {
      goToSlide(currentSlide)
    }

    setIsTouching(false)
    isDraggingRef.current = false
  }

  const goToSlide = (index, animate = true) => {
    if (!carouselRef.current || isAnimating) return

    const targetIndex = Math.max(0, Math.min(index, totalSlides - 1))

    const offset = -targetIndex * slideWidth.current

    if (animate) {
      setIsAnimating(true)
    }

    carouselRef.current.style.transition = animate
      ? 'transform 0.5s cubic-bezier(0.25, 0.1, 0.25, 1)'
      : 'none'
    carouselRef.current.style.transform = `translateX(${offset}px)`

    setCurrentSlide(targetIndex)

    if (animate) {
      setTimeout(() => {
        if (carouselRef.current) {
          carouselRef.current.style.transition = 'none'
          setIsAnimating(false)
        }
      }, 500)
    }
  }

  const handleDotClick = (index) => {
    if (isAnimating) return
    goToSlide(index)
  }

  return (
    <div className="service-carousel-container">
      <div
        className="service-carousel-wrapper"
        style={{
          position: 'relative',
          overflow: 'visible',
          width: '100%',
          marginBottom: '16px',
        }}
      >
        <div
          ref={carouselRef}
          className={`service-carousel ${isTouching ? 'dragging' : ''} ${isAnimating ? 'animating' : ''}`}
          style={{
            display: 'flex',
            transform: 'translateX(0)',
            transition: 'none',
            width: '100%',
            touchAction: 'pan-y',
            willChange: 'transform',
            paddingBottom: '8px',
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
              key={index}
              style={{
                flexShrink: 0,
                width: '100%',
                padding: '0 12px',
                boxSizing: 'border-box',
                userSelect: 'none',
                pointerEvents: isTouching || isAnimating ? 'none' : 'auto',
                opacity: isAnimating ? (index === currentSlide ? 1 : 0.8) : 1,
                transform: `scale(${isAnimating ? (index === currentSlide ? 1 : 0.95) : 1})`,
                transition: 'opacity 0.5s ease, transform 0.5s ease',
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
              style={{
                transition: 'all 0.4s ease',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default MobileServiceCarousel