'use client'

import React, { useEffect } from 'react'
import dynamic from 'next/dynamic'
import { usePathname } from 'next/navigation'

const HomePageNavigationHandler = dynamic(() => import('./HomePageNavigationHandler.client'), {
  ssr: false,
})

export default function ClientNavigationHandler() {
  const pathname = usePathname()
  const isHomePage = pathname === '/'

  useEffect(() => {
    if (
      isHomePage &&
      typeof window !== 'undefined' &&
      typeof window.initThreeJS === 'function' &&
      !window.threeJSInitialized
    ) {
      console.log('ClientNavigationHandler: Attempting to initialize Three.js on homepage')
      window.threeJSInitialized = true
      window.initThreeJS().catch((e) => {
        console.error('Error initializing Three.js:', e)
        window.threeJSInitialized = false
      })
    }

    return () => {}
  }, [isHomePage])

  if (!isHomePage) return null

  return <HomePageNavigationHandler />
}
