'use client'

import React, { useEffect } from 'react'
import dynamic from 'next/dynamic'

const HomePageNavigationHandler = dynamic(() => import('./HomePageNavigationHandler.client'), {
  ssr: false,
})

export default function ClientNavigationHandler() {
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      typeof window.initThreeJS === 'function' &&
      !window.threeJSInitialized
    ) {
      console.log('ClientNavigationHandler: Attempting to initialize Three.js directly')
      window.threeJSInitialized = true
      window.initThreeJS().catch((e) => {
        console.error('Error initializing Three.js:', e)
        window.threeJSInitialized = false
      })
    }

    return () => {}
  }, [])

  useEffect(() => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream
    const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent)

    if (isIOS && isSafari) {
      console.log('Applying iOS Safari URL bar fix')

      setTimeout(() => {
        window.scrollTo(0, 1)

        const viewportHeight = window.innerHeight
        document.documentElement.style.setProperty('--viewport-height', `${viewportHeight}px`)

        const body = document.body
        const html = document.documentElement

        body.style.height = `${viewportHeight}px`
        html.style.height = `${viewportHeight}px`
      }, 300)

      const handleTouchMove = (e) => {
        const isAtTop = window.pageYOffset === 0
        const isAtBottom = window.innerHeight + window.pageYOffset >= document.body.offsetHeight

        if (
          (isAtTop && e.touches[0].screenY > e.touches[0].clientY) ||
          (isAtBottom && e.touches[0].screenY < e.touches[0].clientY)
        ) {
          e.preventDefault()
        }
      }

      const handleResize = () => {
        const newViewportHeight = window.innerHeight
        document.documentElement.style.setProperty('--viewport-height', `${newViewportHeight}px`)

        const body = document.body
        const html = document.documentElement
        body.style.height = `${newViewportHeight}px`
        html.style.height = `${newViewportHeight}px`
      }

      document.addEventListener('touchmove', handleTouchMove, { passive: false })
      window.addEventListener('resize', handleResize)

      return () => {
        document.removeEventListener('touchmove', handleTouchMove)
        window.removeEventListener('resize', handleResize)
      }
    }
  }, [])

  return <HomePageNavigationHandler />
}
