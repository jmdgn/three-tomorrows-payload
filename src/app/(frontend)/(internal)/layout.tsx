// src/app/(site)/layout.tsx
import React from 'react'
import { NewHeader as Header } from '@/components/Header/NewHeader'

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="site-container">
      <Header />
      <main className="main-content">
        {children}
      </main>
    </div>
  )
}
