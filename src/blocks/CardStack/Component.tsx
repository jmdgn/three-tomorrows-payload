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

  useEffect(() => {
    if (!gsapReady || !cards || cards.length === 0) return

    if (typeof window === 'undefined') return

    const { gsap, ScrollTrigger } = window

    if (!gsap || !ScrollTrigger) {
      console.error('GSAP or ScrollTrigger not available')
      return
    }

    ScrollTrigger.getAll().forEach((trigger) => {
      if (trigger.vars?.id?.startsWith('cardstack-')) {
        trigger.kill()
      }
    })

    const timeoutId = setTimeout(() => {
      const cardElements = gsap.utils.toArray('.stackCard') as HTMLElement[]

      if (cardElements.length === 0) return

      const firstCardST = ScrollTrigger.create({
        trigger: cardElements[0],
        start: 'center center',
      })

      const lastCardST = ScrollTrigger.create({
        trigger: cardElements[cardElements.length - 1],
        start: 'center center',
      })

      const stickDistance = 0

      cardElements.forEach((card, index) => {
        const scale = 1 - (cardElements.length - index) * 0.05

        const scaleDown = gsap.to(card, {
          scale: scale,
          transformOrigin: '50% -160%',
          ease: 'none',
        })

        ScrollTrigger.create({
          id: `cardstack-${index}`,
          trigger: card,
          start: 'center center',
          end: () => lastCardST.start + stickDistance,
          pin: true,
          pinSpacing: false,
          animation: scaleDown,
          scrub: 1,
        })
      })
    }, 100)

    return () => {
      clearTimeout(timeoutId)
      if (window.ScrollTrigger) {
        ScrollTrigger.getAll().forEach((trigger) => {
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

  const containerClass = 'w-full'

  return (
    <>
      <section ref={sectionRef} className="cardStacking py-16">
        <div className={containerClass}>
          <div className="row justify-content-center">
            <div className="col-12">
              <div ref={cardsContainerRef} className="cardStacking__cards">
                {cards.map((card, index) => (
                  <div
                    key={index}
                    className="stackCard"
                    style={{
                      backgroundColor: card.backgroundColor || '#FBFCFD',
                      color: card.textColor || '#191C1C',
                    }}
                  >
                    <div className="stackCard__body">
                      <div className="stackCard__content">
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
                        <div className="stackCard__image">
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
      </section>
    </>
  )
}
