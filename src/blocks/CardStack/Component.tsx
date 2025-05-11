'use client'

import React, { useEffect, useRef, useState } from 'react'
import type { CardStackBlock as CardStackBlockProps } from '@/payload-types'
import { Media } from '@/components/Media'
import { loadGSAP } from '@/utilities/gsapLoader'

export const CardStackBlock: React.FC<CardStackBlockProps> = ({
  cards,
  containerWidth = 'default',
}) => {
  const sectionRef = useRef<HTMLDivElement>(null)
  const cardsContainerRef = useRef<HTMLDivElement>(null)
  const [gsapReady, setGsapReady] = useState(false)

  // Load GSAP
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

  // Setup animations
  useEffect(() => {
    if (!gsapReady || !cards || cards.length === 0) return

    const { gsap, ScrollTrigger } = window

    if (!gsap || !ScrollTrigger) {
      console.error('GSAP or ScrollTrigger not available')
      return
    }

    // Small delay to ensure DOM is ready
    const timeoutId = setTimeout(() => {
      // Get all card elements
      const cardElements = gsap.utils.toArray('.stackCard') as HTMLElement[]

      if (cardElements.length === 0) return

      // Clear any existing ScrollTriggers for this component
      ScrollTrigger.getAll().forEach((trigger) => {
        if (trigger.vars?.id?.startsWith('cardstack-')) {
          trigger.kill()
        }
      })

      // Calculate stick distance for better animation flow
      const stickDistance = 0

      // Set up ScrollTrigger for each card
      cardElements.forEach((card, index) => {
        const scale = 1 - (cards.length - index) * 0.025

        // Set initial state
        gsap.set(card, {
          scale: 1,
          transformOrigin: '50% bottom',
        })

        // Create scale animation
        const scaleAnimation = gsap.to(card, {
          scale: scale,
          transformOrigin: '50% bottom',
          ease: 'none',
          paused: true,
        })

        // Create ScrollTrigger
        ScrollTrigger.create({
          id: `cardstack-${index}`,
          trigger: card,
          start: 'center center',
          end: () => {
            // Find the last card's ScrollTrigger start position
            const lastCard = cardElements[cardElements.length - 1]
            const lastCardST = ScrollTrigger.create({
              trigger: lastCard,
              start: 'center center',
            })
            const end = lastCardST.start + stickDistance
            lastCardST.kill() // Clean up temporary trigger
            return end
          },
          pin: true,
          pinSpacing: false,
          animation: scaleAnimation,
          scrub: 1,
        })
      })
    }, 100)

    // Cleanup function
    return () => {
      clearTimeout(timeoutId)
      if (window.ScrollTrigger) {
        window.ScrollTrigger.getAll().forEach((trigger) => {
          if (trigger.vars?.id?.startsWith('cardstack-')) {
            trigger.kill()
          }
        })
      }
    }
  }, [cards, gsapReady])

  if (!cards || cards.length === 0) {
    return null
  }

  const containerClass =
    {
      default: 'container',
      full: 'w-full',
      wide: 'max-w-7xl mx-auto px-4',
    }[containerWidth] || 'container'

  return (
    <section ref={sectionRef} className="cardStacking py-16">
      <div className={containerClass}>
        <div className="row justify-content-center">
          <div className="col-12">
            <div ref={cardsContainerRef} className="cardStacking__cards">
              {cards.map((card, index) => (
                <div
                  key={index}
                  className="stackCard flex items-center justify-between rounded-lg p-8 my-4 relative overflow-hidden"
                  style={{
                    backgroundColor: card.backgroundColor || '#8314F9',
                    color: card.textColor || '#FFFFFF',
                    minHeight: '300px',
                    willChange: 'transform',
                  }}
                >
                  <div className="stackCard__body w-full flex items-center justify-between">
                    <div className="stackCard__content flex-1 pr-8">
                      <h3 className="stackCard__body-content-header text-2xl md:text-3xl font-bold mb-4">
                        {card.title}
                      </h3>
                      {card.content && (
                        <p className="stackCard__body-content-text text-base md:text-lg">
                          {card.content}
                        </p>
                      )}
                    </div>
                    {card.image && (
                      <div className="stackCard__image ml-8 flex-shrink-0">
                        <Media
                          resource={card.image}
                          className="rounded-lg overflow-hidden"
                          imgClassName="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .stackCard {
          box-shadow:
            0 4px 6px -1px rgba(0, 0, 0, 0.1),
            0 2px 4px -1px rgba(0, 0, 0, 0.06);
          transition: box-shadow 0.3s ease;
        }

        .stackCard:hover {
          box-shadow:
            0 10px 15px -3px rgba(0, 0, 0, 0.1),
            0 4px 6px -2px rgba(0, 0, 0, 0.05);
        }

        .stackCard__image {
          width: 300px;
          height: 200px;
        }

        @media (max-width: 768px) {
          .stackCard__body {
            flex-direction: column;
          }

          .stackCard__content {
            padding-right: 0;
          }

          .stackCard__image {
            margin-left: 0;
            margin-top: 1rem;
            width: 100%;
            height: 150px;
          }
        }
      `}</style>
    </section>
  )
}
