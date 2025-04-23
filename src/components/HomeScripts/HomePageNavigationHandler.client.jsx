'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { resetThree } from './ThreeProvider'

export default function HomePageNavigationHandler() {
  const pathname = usePathname()
  const isHomePage = pathname === '/'
  const previousPathRef = useRef(pathname)
  const initialized = useRef(false)
  
  useEffect(() => {
    const returningToHomePage = isHomePage && previousPathRef.current !== '/' && previousPathRef.current !== null
    
    if (returningToHomePage) {
      console.log('Returning to homepage, refreshing Three.js context')
      
      const alreadyRefreshed = sessionStorage.getItem('homepage_refreshed')
      
      if (!alreadyRefreshed) {
        sessionStorage.setItem('homepage_refreshed', 'true')
        
        window.location.href = '/'
        return
      }
    }
    
    if (!isHomePage && previousPathRef.current === '/') {
      console.log('Leaving homepage, cleaning up Three.js resources')
      resetThree()
      
      sessionStorage.removeItem('homepage_refreshed')
    }
    
    previousPathRef.current = pathname
    
    if (isHomePage && !initialized.current) {
      initialized.current = true
      console.log('Loading homepage Three.js scripts')
      
      if (typeof window !== 'undefined') {
        if (window.initThreeJS && !window.threeJSInitialized) {
          window.threeJSInitialized = true
          window.initThreeJS().catch(console.error)
        }
      }
    }
    
    return () => {
      if (previousPathRef.current === '/') {
        console.log('Component unmounting, cleaning up Three.js resources')
        resetThree()
      }
    }
  }, [pathname, isHomePage])
  
  useEffect(() => {
    const handleBeforeUnload = () => {
      sessionStorage.removeItem('homepage_refreshed')
    }
    
    window.addEventListener('beforeunload', handleBeforeUnload)
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [])
  
  return null
}