'use client'

import { useEffect, useRef } from 'react'
import { getThree } from '@/components/HomeScripts/ThreeProvider'

function throttle(func, limit) {
  let inThrottle
  return function (...args) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

export function LandingEffects() {
  const animationRef = useRef(null)
  const mouseRef = useRef({ x: 0.5, y: 0.5 })
  const targetRef = useRef({ x: 0.5, y: 0.5 })
  const currentScaleRef = useRef(1)
  const carouselAnimationRef = useRef([])
  const carouselIntervalRef = useRef(null)

  useEffect(() => {
    const threeModules = getThree()
    const THREE = threeModules ? threeModules.THREE : window.THREE || null

    window.scrollTo(0, 0)

    const timeouts = []
    const observers = []
    const eventListeners = []

    let isMounted = true

    window.currentScale = 1

    let mouseX = 0.5
    let mouseY = 0.5
    const targetX = 0.5
    const targetY = 0.5
    const parallaxIntensity = 15

    const handleAnchorLinks = () => {
      document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        const clickHandler = function (e) {
          e.preventDefault()
          const targetId = this.getAttribute('href')
          const targetElement = document.querySelector(targetId)

          if (targetElement) {
            const headerHeight = document.querySelector('header')?.offsetHeight || 0
            const targetPosition = targetElement.offsetTop - headerHeight

            window.scrollTo({
              top: targetPosition,
              behavior: 'smooth',
            })

            history.replaceState(null, null, window.location.pathname)
          }
        }

        anchor.addEventListener('click', clickHandler)
        eventListeners.push({ element: anchor, event: 'click', handler: clickHandler })
      })

      if (window.location.hash) {
        const targetElement = document.querySelector(window.location.hash)
        if (targetElement) {
          const timeoutId = setTimeout(() => {
            if (!isMounted) return

            const headerHeight = document.querySelector('header')?.offsetHeight || 0
            const targetPosition = targetElement.offsetTop - headerHeight
            window.scrollTo(0, targetPosition)

            history.replaceState(null, null, window.location.pathname)
          }, 100)

          timeouts.push(timeoutId)
        }
      }
    }

    const delayMainLoad = () => {
      const mainElement = document.querySelector('main')

      if (mainElement) {
        const currentDisplay = window.getComputedStyle(mainElement).display
        if (currentDisplay === 'none') {
          const timeoutId = setTimeout(() => {
            if (!isMounted) return

            mainElement.style.display = 'block'
            mainElement.style.opacity = '1'
          }, 1000)

          timeouts.push(timeoutId)
        }
      }
    }

    /* Infinite Carousel Setup */
    const setupInfiniteCarousel = () => {
      const carouselElements = document.querySelectorAll('.infinite-carousel')
      if (carouselElements.length === 0) return

      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
      const carouselAnimationRefs = []

      carouselElements.forEach((carouselEl, index) => {
        const items = carouselEl.querySelectorAll('.carousel-item')
        if (items.length === 0) return

        // Remove previous clones
        carouselEl.querySelectorAll('.carousel-item-clone').forEach((clone) => clone.remove())

        const isReverse = index === 1
        const speed = isMobile ? (isReverse ? -0.4 : 0.4) : isReverse ? -0.8 : 0.8
        const cloneCount = 2

        // Clone items
        for (let i = 0; i < cloneCount; i++) {
          const target = isReverse ? Array.from(items).reverse() : items
          target.forEach((item) => {
            const clone = item.cloneNode(true)
            clone.classList.add('carousel-item-clone')
            isReverse ? carouselEl.prepend(clone) : carouselEl.appendChild(clone)
          })
        }

        const itemWidth = items[0].offsetWidth
        const originalSetWidth = items.length * itemWidth

        carouselEl.scrollLeft = isReverse ? originalSetWidth * (cloneCount - 1) : originalSetWidth

        let isDragging = false
        let isHovering = false
        let isUserScrolling = false
        let startX = 0
        let initialScroll = 0
        let resumeScrollTimer = null

        const animationRef = { current: null }
        carouselAnimationRefs.push(animationRef)

        const adjustScroll = () => {
          const currentScroll = carouselEl.scrollLeft
          const max = originalSetWidth * (cloneCount + 1)
          const min = originalSetWidth * (cloneCount - 1)

          if (speed > 0) {
            if (currentScroll >= max) carouselEl.scrollLeft -= originalSetWidth
            else if (currentScroll <= min) carouselEl.scrollLeft += originalSetWidth
          } else {
            if (currentScroll <= min) carouselEl.scrollLeft += originalSetWidth * 2
            else if (currentScroll >= max) carouselEl.scrollLeft -= originalSetWidth * 2
          }
        }

        const autoScroll = () => {
          if (!isUserScrolling && !isHovering && !isDragging) {
            carouselEl.scrollLeft += speed
            adjustScroll()
          }
          animationRef.current = requestAnimationFrame(autoScroll)
        }

        const startAutoScroll = () => {
          if (!animationRef.current) {
            animationRef.current = requestAnimationFrame(autoScroll)
          }
        }

        const stopAutoScroll = () => {
          if (animationRef.current) {
            cancelAnimationFrame(animationRef.current)
            animationRef.current = null
          }
        }

        const resumeScrollAfterDelay = () => {
          clearTimeout(resumeScrollTimer)
          resumeScrollTimer = setTimeout(() => {
            isUserScrolling = false
          }, 1500)
        }

        const setDragging = (val) => {
          isDragging = val
          carouselEl.classList.toggle('dragging', val)
        }

        const handleDrag = (clientX) => {
          const x = clientX - carouselEl.offsetLeft
          const walk = (x - startX) * 2
          carouselEl.scrollLeft = initialScroll - walk
          adjustScroll()
        }

        // Mouse / touch handlers
        const onMouseDown = (e) => {
          setDragging(true)
          isUserScrolling = true
          startX = e.pageX - carouselEl.offsetLeft
          initialScroll = carouselEl.scrollLeft
        }

        const onMouseMove = (e) => {
          if (!isDragging) return
          e.preventDefault()
          handleDrag(e.pageX)
        }

        const onMouseUp = () => {
          setDragging(false)
          resumeScrollAfterDelay()
        }

        const onTouchStart = (e) => {
          setDragging(true)
          isUserScrolling = true
          startX = e.touches[0].pageX - carouselEl.offsetLeft
          initialScroll = carouselEl.scrollLeft
        }

        const onTouchMove = (e) => {
          if (!isDragging) return
          handleDrag(e.touches[0].pageX)
        }

        const onTouchEnd = () => {
          setDragging(false)
          resumeScrollAfterDelay()
        }

        // Other handlers
        const onScroll = () => {
          if (isDragging) {
            isUserScrolling = true
            adjustScroll()
          }
        }

        const onVisibilityChange = () => {
          document.visibilityState === 'visible' ? startAutoScroll() : stopAutoScroll()
        }

        const onResize = () => {
          const newWidth = items[0].offsetWidth
          const newTotalWidth = items.length * newWidth
          carouselEl.scrollLeft = (carouselEl.scrollLeft / originalSetWidth) * newTotalWidth
        }

        const observer = new IntersectionObserver(
          ([entry]) => {
            entry.isIntersecting ? startAutoScroll() : stopAutoScroll()
          },
          {
            threshold: 0.1,
            rootMargin: '0px 0px 100px 0px',
          },
        )

        observer.observe(carouselEl)
        observers.push({ observer, element: carouselEl })

        // Event listeners
        const bindings = [
          ['mouseenter', () => (isHovering = true)],
          ['mouseleave', () => (isHovering = false)],
          ['mousedown', onMouseDown],
          ['mousemove', onMouseMove],
          ['mouseup', onMouseUp],
          ['touchstart', onTouchStart],
          ['touchmove', onTouchMove],
          ['touchend', onTouchEnd],
          ['scroll', onScroll],
        ]

        bindings.forEach(([event, handler]) => {
          carouselEl.addEventListener(event, handler, { passive: event.includes('touch') })
          eventListeners.push({ element: carouselEl, event, handler })
        })

        const globalEvents = [
          [window, 'resize', onResize],
          [document, 'visibilitychange', onVisibilityChange],
        ]

        globalEvents.forEach(([target, event, handler]) => {
          target.addEventListener(event, handler, { passive: true })
          eventListeners.push({ element: target, event, handler })
        })

        // Recovery check
        const interval = setInterval(() => {
          if (
            document.visibilityState === 'visible' &&
            !isDragging &&
            !isUserScrolling &&
            animationRef.current === null
          ) {
            startAutoScroll()
          }
        }, 5000)

        timeouts.push(interval)
        console.log(`Initial auto-scroll start for carousel ${index}`)
        startAutoScroll()
      })

      if (typeof carouselAnimationRef !== 'undefined') {
        carouselAnimationRef.current = carouselAnimationRefs
      }
    }

    /* Intro Text Animation - Using RAF for smoothness */
    const setupIntroTextAnimation = () => {
      const elementsToAnimate = [
        document.querySelector('.intro-title'),
        document.querySelector('.intro-subtitle'),
        ...document.querySelectorAll('.body-intro'),
        document.querySelector('.anchorBtn-container'),
      ].filter(Boolean)

      const handleScroll = () => {
        if (!isMounted) return

        requestAnimationFrame(() => {
          const scrollPosition = window.scrollY
          const windowHeight = window.innerHeight
          const maxScroll = windowHeight * 0.5

          const progress = Math.min(scrollPosition / maxScroll, 1)

          elementsToAnimate.forEach((element) => {
            element.style.transform = `translateY(-${progress * 10}%)`
            element.style.opacity = 1 - progress
          })
        })
      }

      const throttledHandleScroll = throttle(handleScroll, 10)

      if (elementsToAnimate.length > 0) {
        window.addEventListener('scroll', throttledHandleScroll)
        eventListeners.push({ element: window, event: 'scroll', handler: throttledHandleScroll })

        handleScroll()
      }
    }

    /* Foreground Position Change - Optimized with single observer */
    const setupForegroundPositionChange = () => {
      const foregroundElements = document.querySelector('.foreground-elements')
      const introSection = document.querySelector('.intro-section')

      if (foregroundElements && introSection) {
        const observer = new IntersectionObserver(
          (entries) => {
            if (!isMounted) return

            entries.forEach((entry) => {
              const newZIndex = entry.isIntersecting ? '2' : '-1'
              if (foregroundElements.style.zIndex !== newZIndex) {
                foregroundElements.style.zIndex = newZIndex
              }
            })
          },
          {
            threshold: 0.1, // Trigger when at least 10% of element is visible
          },
        )

        // Observe the intro section container
        observer.observe(introSection)
        observers.push({ observer, element: introSection })
      }
    }

    /* Parallax Mouse Movement - With throttling */
    const setupParallaxMouseMovement = () => {
      let lastUpdateTime = 0

      const handleMouseMove = throttle((e) => {
        const now = Date.now()
        if (window.scrollY > window.innerHeight) return

        lastUpdateTime = now
        targetRef.current.x = e.clientX / window.innerWidth
        targetRef.current.y = e.clientY / window.innerHeight
      }, 16)

      window.addEventListener('mousemove', handleMouseMove)
      eventListeners.push({ element: window, event: 'mousemove', handler: handleMouseMove })
    }

    /* Consolidate animation loop - this will replace multiple animation loops */
    const animate = () => {
      if (!isMounted) return

      const time = performance.now() * 0.0005

      mouseX += (targetRef.current.x - mouseX) * 0.05
      mouseY += (targetRef.current.y - mouseY) * 0.05

      if (window.sphere && window.water) {
        const sp = window.scrollProgress || 0

        if (sp < 0.95) {
          const parallaxX = (mouseX - 0.5) * parallaxIntensity
          const parallaxY = (0.5 - mouseY) * parallaxIntensity

          if (window.camera && window.controls) {
            window.camera.position.x += (parallaxX - window.camera.position.x) * 0.1
            window.camera.position.y += (parallaxY - window.camera.position.y) * 0.1
            window.camera.lookAt(window.controls.target)
          }
        }

        const targetScale = window.targetScale !== undefined ? window.targetScale : 1
        const lerpSpeed = targetScale === 0 ? 0.2 : 0.05

        if (THREE && THREE.MathUtils && THREE.MathUtils.lerp) {
          currentScaleRef.current = THREE.MathUtils.lerp(
            currentScaleRef.current,
            targetScale,
            lerpSpeed,
          )
        } else {
          currentScaleRef.current =
            currentScaleRef.current + (targetScale - currentScaleRef.current) * lerpSpeed
        }

        const baseScale =
          THREE && THREE.MathUtils && THREE.MathUtils.lerp
            ? THREE.MathUtils.lerp(1, 0.2, sp)
            : 1 - 0.8 * sp

        window.sphere.scale.setScalar(baseScale * currentScaleRef.current)

        window.sphere.position.y = Math.sin(time) * 12 + 18

        window.sphere.rotation.x = time * 0.3
        window.sphere.rotation.z = time * 0.31

        window.water.material.uniforms.time.value += 0.25 / 60.0

        if (window.controls && window.renderer && window.scene && window.camera) {
          window.controls.update()
          window.renderer.render(window.scene, window.camera)
        }
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    /* Intro Overlay Fade-In - With RAF for smoothness */
    const setupIntroOverlayFadeIn = () => {
      const handleScroll = () => {
        if (!isMounted) return

        requestAnimationFrame(() => {
          const overlay = document.querySelector('.ocean-overlay')
          if (!overlay) return

          const scrollTop = window.scrollY
          let triggerDistance

          if (window.innerWidth < 768) {
            triggerDistance = 500
          } else if (window.innerWidth < 1024) {
            triggerDistance = 800
          } else if (window.innerWidth < 1280) {
            triggerDistance = 1000
          } else if (window.innerWidth < 1740) {
            triggerDistance = 1400
          } else {
            triggerDistance = 1800
          }

          let opacity = scrollTop / triggerDistance
          opacity = Math.min(opacity, 1)

          overlay.style.opacity = opacity.toString()
        })
      }

      const throttledHandleScroll = throttle(handleScroll, 20)
      window.addEventListener('scroll', throttledHandleScroll)
      eventListeners.push({ element: window, event: 'scroll', handler: throttledHandleScroll })

      handleScroll()
    }

    /* Introduction Statement Fade-In - Enhanced with Blur */
    const setupIntroStatementFadeIn = () => {
      const statementContainer = document.querySelector('.introState-inner')
      if (!statementContainer) return

      const statement = statementContainer.querySelector('h2')
      if (!statement) return

      if (!statementContainer.dataset.processed) {
        const words = statement.textContent.split(' ')
        statement.innerHTML = words
          .map((word) => `<span class="fade-word">${word}</span>`)
          .join(' ')

        statementContainer.dataset.processed = 'true'
      }

      const wordElements = document.querySelectorAll('.fade-word')

      const styleId = 'enhanced-fade-word-style'
      let styleElement = document.getElementById(styleId)

      if (!styleElement) {
        styleElement = document.createElement('style')
        styleElement.id = styleId
        document.head.appendChild(styleElement)
      }

      styleElement.textContent = `
        .fade-word {
          opacity: 0;
          filter: blur(25px); /* Strong blur effect */
          display: inline-block;
          color: #171744;
          will-change: opacity, filter;
          position: relative;
          
          /* Faster opacity, much longer blur transition */
          transition: 
            opacity 0.5s cubic-bezier(0.19, 1, 0.22, 1),
            filter 1.4s cubic-bezier(0.19, 1, 0.22, 1);
        }
        
        .fade-word.fade-in {
          opacity: 1;
          filter: blur(0);
        }
        
        .fade-word.hidden {
          opacity: 0;
          filter: blur(25px);
        }
      `

      const fadeInWordsRandomly = (words) => {
        if (!isMounted) return

        const indices = Array.from(words.keys())
        for (let i = indices.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1))
          ;[indices[i], indices[j]] = [indices[j], indices[i]]
        }

        const batchSize = 2

        for (let batch = 0; batch < indices.length; batch += batchSize) {
          const timeoutId = setTimeout(() => {
            if (!isMounted) return

            const end = Math.min(batch + batchSize, indices.length)
            for (let i = batch; i < end; i++) {
              const randomDelay = Math.random() * 180

              setTimeout(() => {
                if (!isMounted) return
                words[indices[i]].classList.add('fade-in')
              }, randomDelay)
            }
          }, batch * 75)

          timeouts.push(timeoutId)
        }
      }

      const resetWords = (words, hide = false) => {
        words.forEach((word) => {
          word.classList.remove('fade-in')
          if (hide) {
            word.classList.add('hidden')
          } else {
            word.classList.remove('hidden')
          }
        })
      }

      const observer = new IntersectionObserver(
        (entries) => {
          if (!isMounted) return

          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              if (!statementContainer.classList.contains('visible')) {
                statementContainer.classList.add('visible')
                resetWords(wordElements, false)

                const timeoutId = setTimeout(() => {
                  if (!isMounted) return
                  fadeInWordsRandomly(wordElements)
                }, 500)

                timeouts.push(timeoutId)
              }
            } else {
              if (entry.intersectionRatio < 0.1) {
                statementContainer.classList.remove('visible')
                resetWords(wordElements, true)
              }
            }
          })
        },
        {
          threshold: [0, 0.1, 0.5, 1],
          rootMargin: '0px 0px 10% 0px',
        },
      )

      observer.observe(statementContainer)
      observers.push({ observer, element: statementContainer })
    }

    /* Fade in New Sphere Object - Matching original behavior */
    const setupSphereObjectFade = () => {
      const sphereContainer = document.getElementById('sphere-container')
      const introPara = document.querySelector('.intro-para')
      const factoidsSection = document.querySelector('.factoids-complete')

      if (sphereContainer) {
        sphereContainer.style.opacity = '0'
        sphereContainer.style.transition = 'opacity 0.4s ease-in-out'
      }

      if (!sphereContainer || !introPara || !factoidsSection) return

      const handleScroll = () => {
        if (!isMounted) return

        requestAnimationFrame(() => {
          const viewportHeight = window.innerHeight
          const introParaRect = introPara.getBoundingClientRect()
          const factoidsRect = factoidsSection.getBoundingClientRect()

          // EXACTLY matching the original code's fade in condition:
          // "if (introParaRect.bottom <= viewportHeight * 0.8)"
          if (introParaRect.bottom <= viewportHeight * 0.8) {
            sphereContainer.style.opacity = '1'
          } else {
            sphereContainer.style.opacity = '0'
          }

          // EXACTLY matching the original code's fade out condition:
          // "if (approachSnippetRect.bottom <= viewportHeight * 0.7)"
          if (factoidsRect.bottom <= viewportHeight * 0.7) {
            sphereContainer.style.opacity = '0'
          }
        })
      }

      const throttledScrollHandler = throttle(handleScroll, 16) // 60fps
      window.addEventListener('scroll', throttledScrollHandler)
      eventListeners.push({ element: window, event: 'scroll', handler: throttledScrollHandler })

      handleScroll()
    }

    /* H3 Title Animation - Optimized */
    const setupTitleAnimation = () => {
      const titles = document.querySelectorAll('.animate-title')

      if (titles.length === 0) return

      titles.forEach((title) => {
        if (!title.dataset.processed) {
          const words = title.textContent.split(' ').map((word) => {
            const span = document.createElement('span')
            span.textContent = word + ' '
            span.style.opacity = '0'
            span.style.transform = 'translateY(20px)'
            span.style.display = 'inline-block'
            span.style.transition = 'opacity 0.5s ease, transform 0.5s ease'
            return span
          })

          title.innerHTML = ''
          words.forEach((span) => title.appendChild(span))

          title.dataset.processed = 'true'
        }

        const words = title.querySelectorAll('span')

        const observer = new IntersectionObserver(
          (entries) => {
            if (!isMounted) return

            entries.forEach((entry) => {
              if (entry.isIntersecting && !title.dataset.animated) {
                title.dataset.animated = 'true'

                const batchSize = 3
                for (let i = 0; i < words.length; i += batchSize) {
                  const timeoutId = setTimeout(() => {
                    if (!isMounted) return

                    const end = Math.min(i + batchSize, words.length)
                    for (let j = i; j < end; j++) {
                      words[j].style.opacity = '1'
                      words[j].style.transform = 'translateY(0)'
                    }
                  }, i * 100)

                  timeouts.push(timeoutId)
                }

                observer.unobserve(title)
              }
            })
          },
          { threshold: 0.5 },
        )

        observer.observe(title)
        observers.push({ observer, element: title })
      })
    }

    handleAnchorLinks()
    delayMainLoad()

    setupIntroTextAnimation()
    setupForegroundPositionChange()
    setupParallaxMouseMovement()
    setupIntroOverlayFadeIn()
    setupIntroStatementFadeIn()
    setupSphereObjectFade()
    setupTitleAnimation()
    setupInfiniteCarousel()

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      isMounted = false

      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }

      if (carouselAnimationRef.current) {
        if (Array.isArray(carouselAnimationRef.current)) {
          carouselAnimationRef.current.forEach((ref) => {
            if (ref && ref.current) {
              cancelAnimationFrame(ref.current)
            }
          })
        } else if (carouselAnimationRef.current) {
          cancelAnimationFrame(carouselAnimationRef.current)
        }
      }

      if (carouselIntervalRef.current) {
        clearInterval(carouselIntervalRef.current)
      }

      timeouts.forEach((timeoutId) => clearTimeout(timeoutId))

      observers.forEach(({ observer, element }) => {
        if (observer && element) {
          observer.unobserve(element)
          observer.disconnect()
        }
      })

      eventListeners.forEach(({ element, event, handler }) => {
        element.removeEventListener(event, handler)
      })
    }
  }, [])

  return null
}
