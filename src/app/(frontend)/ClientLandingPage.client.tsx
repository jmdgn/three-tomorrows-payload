'use client'

import React from 'react'
import { ThreeJSInitializer } from '../../components/ThreeJSInitializer.client'

export default function ClientLandingPage({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ThreeJSInitializer />
      {children}
    </>
  )
}
