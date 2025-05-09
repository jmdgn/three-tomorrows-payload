'use client'

import React, { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Script from 'next/script'

interface HomepageOnlyScriptProps {
  src: string
  id?: string
  strategy?: 'beforeInteractive' | 'afterInteractive' | 'lazyOnload'
}

/**
 * A component that only loads scripts when on the homepage
 */
export const HomepageOnlyScript: React.FC<HomepageOnlyScriptProps> = ({ 
  src, 
  id, 
  strategy = 'afterInteractive' 
}) => {
  const pathname = usePathname()
  const [isHomePage, setIsHomePage] = useState(false)
  
  useEffect(() => {
    setIsHomePage(pathname === '/')
  }, [pathname])
  
  if (!isHomePage) return null
  
  return (
    <Script
      src={src}
      id={id}
      strategy={strategy}
    />
  )
}

export default HomepageOnlyScript