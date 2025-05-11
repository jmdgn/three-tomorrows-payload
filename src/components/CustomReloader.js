'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

// This is a very simple component that can be used in your app
export default function CustomReloader() {
  const pathname = usePathname()

  useEffect(() => {
    // Previous location tracking
    let previousLocation = null

    // Function to handle location changes
    const handleRouteChange = (newPath) => {
      // Check if we're returning to homepage from another page
      if (newPath === '/' && previousLocation && previousLocation !== '/') {
        console.log('Detected navigation back to homepage, reloading page')
        window.location.reload()
        return
      }

      // Update previous location
      previousLocation = newPath
    }

    // Initialize previous location
    previousLocation = pathname

    // Listen for route changes using MutationObserver (works with Next.js)
    const observer = new MutationObserver(() => {
      if (pathname !== previousLocation) {
        handleRouteChange(pathname)
      }
    })

    // Start observing
    observer.observe(document.body, { childList: true, subtree: true })

    // Cleanup
    return () => {
      observer.disconnect()
    }
  }, [pathname])

  // This component doesn't render anything
  return null
}
