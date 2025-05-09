'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import threeJsManager from '@/utilities/ThreeJsManager'

function debounce(func: (...args: any[]) => void, wait: number) {
  let timeout: ReturnType<typeof setTimeout>
  return function (...args: any[]) {
    clearTimeout(timeout)
    timeout = setTimeout(() => func.apply(this, args), wait)
  }
}

function throttle(func: (...args: any[]) => void, limit: number) {
  let inThrottle: boolean
  return function (...args: any[]) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

export function AnimationBottom() {
  const pathname = usePathname()
  const isHomePage = pathname === '/'

  useEffect(() => {
    // Skip if not on homepage
    if (!isHomePage) return

    // Initialize event cleanup array
    const eventListeners: { target: Window | Element; event: string; handler: EventListener }[] = []
    const observers: { observer: IntersectionObserver; element: Element }[] = []
    const timeouts: number[] = []
    let isMounted = true

    // Setup Bubble Container Scroll Fade
    const setupBubbleContainerScrollFade = () => {
      const bubbleContainer = document.querySelector('.bubble-container') as HTMLElement | null
      const servicePanel = document.querySelector('.service-panel')
      const factoidsSection = document.querySelector('.factoids-complete')

      if (!bubbleContainer || !servicePanel || !factoidsSection) return null

      let lastScrollPosition = 0
      let isScrollingDown = true
      let isFactoidsVisible = false

      const scrollDirectionHandler = () => {
        if (!isMounted) return

        const currentScroll = window.pageYOffset
        isScrollingDown = currentScroll > lastScrollPosition
        lastScrollPosition = currentScroll
      }

      const debouncedScrollDirectionHandler = debounce(scrollDirectionHandler, 50)
      window.addEventListener('scroll', debouncedScrollDirectionHandler)
      eventListeners.push({
        target: window,
        event: 'scroll',
        handler: debouncedScrollDirectionHandler,
      })

      const combinedObserver = new IntersectionObserver(
        (entries) => {
          if (!isMounted) return

          entries.forEach((entry) => {
            const targetId = entry.target.id || entry.target.className

            if (targetId.includes('service-panel') && bubbleContainer) {
              // Set flag on window for Three.js manager
              if (window._isServicePanelVisible !== undefined) {
                window._isServicePanelVisible = entry.isIntersecting
              }

              if (entry.isIntersecting && !isFactoidsVisible) {
                bubbleContainer.style.opacity = entry.intersectionRatio.toString()
              } else if (
                !entry.isIntersecting &&
                entry.boundingClientRect.top > 0 &&
                !isFactoidsVisible
              ) {
                bubbleContainer.style.opacity = '0'
              }
            }

            if (targetId.includes('factoids-complete')) {
              isFactoidsVisible = entry.isIntersecting

              if (entry.isIntersecting && bubbleContainer) {
                bubbleContainer.style.opacity = '0'
              }
            }
          })
        },
        {
          threshold: [0, 0.25, 0.5, 0.75, 1],
          rootMargin: '0px',
        },
      )

      if (servicePanel) {
        combinedObserver.observe(servicePanel)
        observers.push({ observer: combinedObserver, element: servicePanel })
      }

      if (factoidsSection) {
        combinedObserver.observe(factoidsSection)
        observers.push({ observer: combinedObserver, element: factoidsSection })
      }

      return () => {
        combinedObserver.disconnect()
      }
    }

    // Setup Factoid Frame Script
    const setupFactoidFrameScript = () => {
      const section = document.querySelector('.factoids-complete')
      const stickyElem = document.querySelector('.factoidBkgnd-sticky') as HTMLElement | null
      const contentFull = document.querySelector('.factoidContent-full') as HTMLElement | null

      if (!section || !stickyElem || !contentFull) return null

      stickyElem.style.transition = 'none'

      function easeOutCubic(x: number) {
        return 1 - Math.pow(1 - x, 3)
      }

      function slowEase(x: number) {
        return Math.pow(x, 1.5) * (1 - x) + x * Math.pow(x, 2)
      }

      function extraSlowEase(x: number) {
        return Math.pow(x, 0.6)
      }

      // Throttle this function to improve performance
      const updateStickyFromScroll = throttle(() => {
        if (!section || !stickyElem || !contentFull || !isMounted) return

        const anchorBtnContainer = contentFull.querySelector(
          '.anchorBtn-container',
        ) as HTMLElement | null

        const rect = section.getBoundingClientRect()
        const windowHeight = window.innerHeight
        const windowWidth = window.innerWidth

        const enterStart = windowHeight * 1.6
        const enterEnd = windowHeight * 0.1

        let enterProgress = (enterStart - rect.top) / (enterStart - enterEnd)
        enterProgress = Math.max(0, Math.min(1, enterProgress))

        let exitProgress =
          (windowHeight * 2.0 - rect.bottom) / (windowHeight * 2.0 - windowHeight * 0.05)
        exitProgress = Math.max(0, Math.min(1, exitProgress))

        const easedEnter = slowEase(enterProgress)
        const easedExit = extraSlowEase(exitProgress)

        let progress = 0

        if (rect.top < windowHeight && rect.bottom > 0) {
          if (enterProgress < 1) {
            progress = easedEnter
          } else {
            progress = 1 - easedExit
          }
        }

        progress = Math.max(0, Math.min(1, progress))

        if (anchorBtnContainer) {
          if (enterProgress >= 1 && exitProgress > 0.05) {
            anchorBtnContainer.style.opacity = '0'
            anchorBtnContainer.style.pointerEvents = 'none'
          } else {
            anchorBtnContainer.style.opacity = '1'
            anchorBtnContainer.style.pointerEvents = 'auto'
          }
        }

        const minWidth = 60
        const minHeight = 60

        const maxWidth = windowWidth * 1
        const maxHeight = windowHeight * 1.2

        const width = minWidth + (maxWidth - minWidth) * progress
        const height = minHeight + (maxHeight - minHeight) * progress
        const borderRadius = 32 * (1 - progress)

        const topOffset = 50 * (1 - progress) - windowHeight * 0.1 * progress

        stickyElem.style.width = `${width}px`
        stickyElem.style.height = `${height}px`
        stickyElem.style.borderRadius = `${borderRadius}px`
        stickyElem.style.top = `${topOffset}px`
        stickyElem.style.left = `${(windowWidth - width) / 2}px`

        const opacityStartThreshold = 0.75

        let contentOpacity
        if (enterProgress < 1) {
          contentOpacity =
            progress > opacityStartThreshold
              ? Math.pow((progress - opacityStartThreshold) / (1 - opacityStartThreshold), 0.8)
              : 0
        } else {
          contentOpacity = Math.pow(progress, 1.5)
        }

        contentFull.style.opacity = Math.max(0, Math.min(1, contentOpacity)).toString()
      }, 16) // Throttle to ~60fps

      // Use requestAnimationFrame for smoother updates
      let animationId: number | null = null

      const updateFrame = () => {
        updateStickyFromScroll()
        if (isMounted) {
          animationId = requestAnimationFrame(updateFrame)
        }
      }

      animationId = requestAnimationFrame(updateFrame)

      // Setup scroll event for backup
      window.addEventListener('scroll', updateStickyFromScroll, { passive: true })
      eventListeners.push({
        target: window,
        event: 'scroll',
        handler: updateStickyFromScroll as unknown as EventListener,
      })

      return () => {
        if (animationId) {
          cancelAnimationFrame(animationId)
        }
        window.removeEventListener('scroll', updateStickyFromScroll)
      }
    }

    // Setup Factoid Cards Fade
    const setupFactoidCardsFade = () => {
      const elements = document.querySelectorAll('.stickyContent-title, .factoidSingle-container')

      if (elements.length === 0) return null

      // Add styles for factoid containers
      document.querySelectorAll('.factoidSingle-container').forEach((factoid) => {
        if (factoid instanceof HTMLElement) {
          factoid.style.transition = 'opacity 0.5s ease-out, transform 0.4s ease-out'
        }
      })

      // Add styles for title
      document.querySelectorAll('.stickyContent-title').forEach((title) => {
        if (!(title instanceof HTMLElement) || !title.textContent) return

        if (!title.querySelector('span')) {
          const text = title.textContent
          title.innerHTML = ''
          for (let i = 0; i < text.length; i++) {
            const span = document.createElement('span')
            span.textContent = text[i]
            title.appendChild(span)
          }
        }

        title.style.transition = 'opacity 0.5s ease-out'
      })

      // Setup color cache for better performance
      const colorCache: { [key: string]: string } = {}
      function getInterpolatedColor(color1: string, color2: string, progress: number) {
        const roundedProgress = Math.round(progress * 100) / 100
        const cacheKey = `${color1}-${color2}-${roundedProgress}`

        if (colorCache[cacheKey]) return colorCache[cacheKey]

        const r1 = parseInt(color1.substring(1, 3), 16)
        const g1 = parseInt(color1.substring(3, 5), 16)
        const b1 = parseInt(color1.substring(5, 7), 16)
        const r2 = parseInt(color2.substring(1, 3), 16)
        const g2 = parseInt(color2.substring(3, 5), 16)
        const b2 = parseInt(color2.substring(5, 7), 16)

        const r = Math.round(r1 + (r2 - r1) * roundedProgress)
        const g = Math.round(g1 + (g2 - g1) * roundedProgress)
        const b = Math.round(b1 + (b2 - b1) * roundedProgress)

        const result = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
        colorCache[cacheKey] = result
        return result
      }

      // Throttled update function
      const updateOpacity = throttle(() => {
        if (!isMounted) return

        requestAnimationFrame(() => {
          const titleThreshold = window.innerHeight * 0.1
          const factoidFadeStart = window.innerHeight * 0.2
          const factoidFadeEnd = window.innerHeight * 0.05

          const colorSpeed = 0.6
          const staggerDivisor = 1
          const colorStartMultiplier = 4.5

          // Use batch processing for better performance
          const elementCount = elements.length
          const batchSize = 5

          for (let i = 0; i < elementCount; i += batchSize) {
            const endIndex = Math.min(i + batchSize, elementCount)

            for (let j = i; j < endIndex; j++) {
              const element = elements[j]
              if (!(element instanceof HTMLElement)) continue

              const rect = element.getBoundingClientRect()
              const distanceFromTop = rect.top

              if (element.classList.contains('factoidSingle-container')) {
                const opacity =
                  1 -
                  Math.min(
                    1,
                    Math.max(
                      0,
                      (factoidFadeStart - distanceFromTop) / (factoidFadeStart - factoidFadeEnd),
                    ),
                  )

                const translateY = 20 * (1 - opacity)
                element.style.transform = `translateY(${translateY}px)`
                element.style.opacity = opacity.toString()
              } else {
                const opacity = Math.min(1, Math.max(0, distanceFromTop / titleThreshold))
                element.style.opacity = opacity.toString()
              }

              if (
                element.classList.contains('stickyContent-title') &&
                parseFloat(element.style.opacity) > 0.1
              ) {
                const letters = element.querySelectorAll('span')
                const totalLetters = letters.length

                const colorProgress = Math.min(
                  1,
                  Math.max(
                    0,
                    ((titleThreshold * colorStartMultiplier - distanceFromTop) / titleThreshold) *
                      colorSpeed,
                  ),
                )

                // Optimize by processing letters in batches
                const letterBatchSize = 5
                for (let i = 0; i < totalLetters; i += letterBatchSize) {
                  const endIdx = Math.min(i + letterBatchSize, totalLetters)

                  // Calculate common values once per batch
                  const baseProgress = colorProgress - i / (totalLetters * staggerDivisor)

                  for (let j = i; j < endIdx; j++) {
                    const letter = letters[j] as HTMLElement
                    if (!letter) continue

                    const letterProgress = Math.min(1, Math.max(0, baseProgress * totalLetters))
                    const color = getInterpolatedColor('#929292', '#FFFFFF', letterProgress)
                    letter.style.color = color
                  }
                }
              }
            }
          }
        })
      }, 16) // ~60fps

      window.addEventListener('scroll', updateOpacity, { passive: true })
      window.addEventListener('resize', updateOpacity, { passive: true })
      eventListeners.push({
        target: window,
        event: 'scroll',
        handler: updateOpacity as unknown as EventListener,
      })
      eventListeners.push({
        target: window,
        event: 'resize',
        handler: updateOpacity as unknown as EventListener,
      })

      // Initial update
      updateOpacity()

      return () => {
        window.removeEventListener('scroll', updateOpacity)
        window.removeEventListener('resize', updateOpacity)
      }
    }

    // Initialize all UI effects
    const cleanupFunctions = [
      setupBubbleContainerScrollFade(),
      setupFactoidFrameScript(),
      setupFactoidCardsFade(),
    ].filter(Boolean) as (() => void)[]

    // Clean up on unmount
    return () => {
      isMounted = false

      // Clean up event listeners
      eventListeners.forEach(({ target, event, handler }) => {
        target.removeEventListener(event, handler)
      })

      // Clean up observers
      observers.forEach(({ observer, element }) => {
        if (observer && element) {
          observer.unobserve(element)
          observer.disconnect()
        }
      })

      // Clear timeouts
      timeouts.forEach((timeoutId) => clearTimeout(timeoutId))

      // Run specific cleanup functions
      cleanupFunctions.forEach((cleanup) => {
        if (cleanup) cleanup()
      })
    }
  }, [isHomePage])

  // Skip rendering if not on homepage
  if (!isHomePage) return null

  return null
}

export function useAnimationBottom() {
  // This hook is maintained for backward compatibility
  return null
}
