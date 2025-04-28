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
      console.log('Applying iOS Safari URL bar fix - keeping URL bar fixed')

      setTimeout(() => {
        window.scrollTo(0, 1)
      }, 100)

      const handleScroll = () => {
        if (window.scrollY < 5) {
          window.scrollTo(0, 5)
        }
      }

      window.addEventListener('scroll', handleScroll)

      return () => {
        window.removeEventListener('scroll', handleScroll)
      }
    }
  }, [])

  return <HomePageNavigationHandler />
}
