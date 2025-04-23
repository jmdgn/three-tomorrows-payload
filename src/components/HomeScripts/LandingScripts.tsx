'use client'

import React from 'react'
import Script from 'next/script'

export function LandingScripts() {
  return (
    <Script
      id="landing-script"
      strategy="beforeInteractive" 
      src="/scripts/landing/landing-script.js"
    />
  )
}
