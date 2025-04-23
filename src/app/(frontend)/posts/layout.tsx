import React from 'react'
import Script from 'next/script'
import { Providers } from '@/providers'
import { InitTheme } from '@/providers/Theme/InitTheme'

export default async function PostsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <InitTheme />
      
      <Script 
        src="/scripts/blog/blog-scripts.js" 
        strategy="afterInteractive"
        id="landing-scripts"
      />
      
      <Providers>
        {children}
      </Providers>
    </>
  )
}