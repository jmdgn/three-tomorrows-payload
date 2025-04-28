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

  return <HomePageNavigationHandler />
}
