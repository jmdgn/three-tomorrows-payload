'use client'

import { useEffect, useRef } from 'react'
import { getThree } from '../../components/HomeScripts/ThreeProvider'

export function AnimationBottom() {
  useAnimationBottom()
  return null
}

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

interface EventListenerItem {
  target: Window | Element
  event: string
  handler: EventListener | ((...args: any[]) => void)
}

interface ObserverItem {
  observer: IntersectionObserver
  element: Element
}

export function useAnimationBottom() {
  const animationRef = useRef<number | null>(null)
  const scrollListenerRef = useRef<((...args: any[]) => void) | null>(null)
  const observersRef = useRef<ObserverItem[]>([])
  const eventListenersRef = useRef<EventListenerItem[]>([])
  const timeoutsRef = useRef<number[]>([])

  useEffect(() => {
    const isMounted = true

    const threeModules = getThree()
    const THREE = threeModules ? threeModules.THREE : window.THREE || null

    const handleScroll = () => {
      if (!isMounted) return

      const scrollY = window.scrollY
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight
      const scrollProgress = Math.min(scrollY / maxScroll, 1)
      window.scrollProgress = scrollProgress
    }

    const debouncedHandleScroll = debounce(handleScroll, 10)
    window.addEventListener('scroll', debouncedHandleScroll)
    scrollListenerRef.current = debouncedHandleScroll
    eventListenersRef.current.push({
      target: window,
      event: 'scroll',
      handler: debouncedHandleScroll,
    })

    function animate() {
      if (!isMounted) return

      if (window._isServicePanelVisible === true || !isMounted) {
        if (window._frameCount === undefined) window._frameCount = 0
        window._frameCount++

        if (window._frameCount % 3 !== 0) {
          animationRef.current = requestAnimationFrame(animate)
          return
        }
      }

      const time = performance.now() * 0.0005
      const sp = window.scrollProgress || 0

      if (window.mouseX !== undefined && window.targetX !== undefined) {
        window.mouseX = window.mouseX + (window.targetX - window.mouseX) * 0.05
        window.mouseY = (window.mouseY || 0) + ((window.targetY || 0) - (window.mouseY || 0)) * 0.05
      }

      if (window.camera) {
        window.camera.fov = THREE ? THREE.MathUtils.lerp(55, 75, sp) : 55 + (75 - 55) * sp
        window.camera.updateProjectionMatrix()
      }

      if (window.sphere && window.water) {
        window.water.position.y = THREE ? THREE.MathUtils.lerp(0, 60, sp) : 0 + 60 * sp

        if (window.mouseX !== undefined && window.parallaxIntensity !== undefined) {
          const _dynamicIntensity = window.parallaxIntensity * (1 - sp)
        }

        const sphereStartY = 18
        const sphereEndY = -30
        const sphereStartScale = 1.0
        const sphereEndScale = 0.7

        const scrollStartThreshold = 0.0
        const scrollEndThreshold = 0.25

        function easeOutCubic(x: number) {
          return 1 - Math.pow(1 - x, 3)
        }

        let sphereY: number, sphereScale: number

        if (sp >= scrollStartThreshold && sp <= scrollEndThreshold) {
          const normalizedProgress =
            (sp - scrollStartThreshold) / (scrollEndThreshold - scrollStartThreshold)

          const easedProgress = easeOutCubic(normalizedProgress)

          sphereY = sphereStartY * (1 - easedProgress) + sphereEndY * easedProgress
          sphereScale = sphereStartScale * (1 - easedProgress) + sphereEndScale * easedProgress

          if (normalizedProgress > 0.5) {
            const waveIntensity = (normalizedProgress - 0.5) * 2 * 5.0
            sphereY += Math.sin(time * 0.5) * waveIntensity
          }
        } else if (sp < scrollStartThreshold) {
          sphereY = sphereStartY
          sphereScale = sphereStartScale

          sphereY += Math.sin(time) * 2.5
        } else {
          sphereY = sphereEndY
          sphereScale = sphereEndScale

          sphereY += Math.sin(time * 0.5) * 5.0
        }

        window.sphere.position.y = sphereY
        window.sphere.scale.setScalar(sphereScale)

        if (window.camera) {
          window.camera.position.y = THREE
            ? THREE.MathUtils.lerp(30, 5, sp * 1.2)
            : 30 - 25 * (sp * 1.2)
          window.camera.position.z = THREE
            ? THREE.MathUtils.lerp(100, 40, sp * 1.1)
            : 100 - 60 * (sp * 1.1)
        }

        if (window.controls) {
          window.controls.target.y = THREE ? THREE.MathUtils.lerp(12, -10, sp) : 12 - 22 * sp
        }
      }

      if (window.water && window.water.material && window.water.material.uniforms) {
        window.water.material.uniforms.time.value += 1.0 / 60.0
      }

      if (window.controls) {
        window.controls.update()
      }

      if (window.renderer && window.scene && window.camera) {
        window.renderer.render(window.scene, window.camera)
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

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
      eventListenersRef.current.push({
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
        observersRef.current.push({ observer: combinedObserver, element: servicePanel })
      }

      if (factoidsSection) {
        combinedObserver.observe(factoidsSection)
        observersRef.current.push({ observer: combinedObserver, element: factoidsSection })
      }

      return () => {
        window.removeEventListener('scroll', debouncedScrollDirectionHandler)
        combinedObserver.disconnect()
      }
    }

    const setupFactoidFrameScript = () => {
      const section = document.querySelector('.factoids-complete')
      const stickyElem = document.querySelector('.factoidBkgnd-sticky') as HTMLElement | null
      const contentFull = document.querySelector('.factoidContent-full') as HTMLElement | null

      if (!section || !stickyElem || !contentFull) return null

      stickyElem.style.transition = 'none'

      function easeOutCubic(x: number) {
        return 1 - Math.pow(1 - x, 3)
      }

      function updateStickyFromScroll() {
        if (!section || !stickyElem || !contentFull) return

        const rect = section.getBoundingClientRect()
        const windowHeight = window.innerHeight

        const enterStart = windowHeight * 0.8
        const enterEnd = windowHeight * 0.2

        let enterProgress = (enterStart - rect.top) / (enterStart - enterEnd)
        enterProgress = Math.max(0, Math.min(1, enterProgress))

        let exitProgress =
          (windowHeight * 0.8 - rect.bottom) / (windowHeight * 0.8 - windowHeight * 0.2)
        exitProgress = Math.max(0, Math.min(1, exitProgress))

        const easedEnter = easeOutCubic(enterProgress)
        const easedExit = easeOutCubic(exitProgress)

        let progress = 0

        if (rect.top < windowHeight && rect.bottom > 0) {
          if (enterProgress < 1) {
            // Growing
            progress = easedEnter
          } else {
            // Shrinking
            progress = 1 - easedExit
          }
        }

        // Clamp again for safety
        progress = Math.max(0, Math.min(1, progress))

        const width = 5 + (100 - 5) * progress
        const height = 5 + (100 - 5) * progress
        const borderRadius = 32 * (1 - progress)
        const topOffset = 50 * (1 - progress)

        stickyElem.style.width = `${width}vw`
        stickyElem.style.height = `${height}vh`
        stickyElem.style.borderRadius = `${borderRadius}px`
        stickyElem.style.top = `${topOffset}px`

        // Content fade-in after 85% growth
        const opacityStart = 0.85
        const opacityProgress = (progress - opacityStart) / (1 - opacityStart)
        contentFull.style.opacity = Math.max(0, Math.min(1, opacityProgress)).toString()
      }

      function onAnimationFrame() {
        if (!section || !stickyElem || !contentFull) return
        updateStickyFromScroll()
        requestAnimationFrame(onAnimationFrame)
      }

      requestAnimationFrame(onAnimationFrame)

      return () => {
        // No cleanup needed
      }
    }

    const setupFactoidCardsFade = () => {
      const elements = document.querySelectorAll('.stickyContent-title, .factoidSingle-container')

      if (elements.length === 0) return null

      document.querySelectorAll('.factoidSingle-container').forEach((factoid) => {
        if (factoid instanceof HTMLElement) {
          factoid.style.transition = 'opacity 0.5s ease-out, transform 0.4s ease-out'
        }
      })

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

      function updateOpacity() {
        if (!isMounted) return

        requestAnimationFrame(() => {
          const titleThreshold = window.innerHeight * 0.1
          const factoidFadeStart = window.innerHeight * 0.2
          const factoidFadeEnd = window.innerHeight * 0.05

          const colorSpeed = 0.6
          const staggerDivisor = 1
          const colorStartMultiplier = 4.5

          elements.forEach((element) => {
            if (!(element instanceof HTMLElement)) return

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

              const batchSize = 5
              for (let i = 0; i < totalLetters; i += batchSize) {
                const endIdx = Math.min(i + batchSize, totalLetters)
                for (let j = i; j < endIdx; j++) {
                  const letter = letters[j] as HTMLElement
                  if (!letter) continue

                  const letterProgress = Math.min(
                    1,
                    Math.max(
                      0,
                      (colorProgress - j / (totalLetters * staggerDivisor)) * totalLetters,
                    ),
                  )
                  const color = getInterpolatedColor('#929292', '#FFFFFF', letterProgress)
                  letter.style.color = color
                }
              }
            }
          })
        })
      }

      updateOpacity()

      const throttledUpdateOpacity = throttle(updateOpacity, 16)
      window.addEventListener('scroll', throttledUpdateOpacity)
      window.addEventListener('resize', throttledUpdateOpacity)
      eventListenersRef.current.push({
        target: window,
        event: 'scroll',
        handler: throttledUpdateOpacity,
      })
      eventListenersRef.current.push({
        target: window,
        event: 'resize',
        handler: throttledUpdateOpacity,
      })

      return () => {
        window.removeEventListener('scroll', throttledUpdateOpacity)
        window.removeEventListener('resize', throttledUpdateOpacity)
      }
    }

    const cleanupFunctions = [
      setupBubbleContainerScrollFade(),
      setupFactoidFrameScript(),
      setupFactoidCardsFade(),
    ].filter(Boolean) as (() => void)[]

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }

      window.removeEventListener('scroll', debouncedHandleScroll)

      cleanupFunctions.forEach((cleanup) => {
        if (cleanup) cleanup()
      })

      timeoutsRef.current.forEach((timeoutId) => clearTimeout(timeoutId))

      eventListenersRef.current.forEach(({ target, event, handler }) => {
        target.removeEventListener(event, handler)
      })

      observersRef.current.forEach(({ observer, element }) => {
        if (observer && element) {
          observer.unobserve(element)
          observer.disconnect()
        }
      })
    }
  }, [])

  return null
}
