import React from 'react'
import { AdminBar } from '@/components/AdminBar'
import { Footer } from '@/Footer/Component'
import { NewHeader as Header } from '@/Header/Nav/dynamic'
import { draftMode } from 'next/headers'

export const dynamic = 'force-dynamic'

const LandingPageLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      {children}
      <Footer />
    </>
  )
}

export default async function LandingPage() {
  const { isEnabled } = await draftMode()

  return (
    <>
      <AdminBar adminBarProps={{ preview: isEnabled }} />
      <Header />
      <LandingPageLayout></LandingPageLayout>
    </>
  )
}
