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
        window.water.material.uniforms.time.value += 0.3 / 60.0
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

    const cleanupFunctions = [setupBubbleContainerScrollFade()].filter(Boolean) as (() => void)[]

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
