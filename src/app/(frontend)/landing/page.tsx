import React from 'react'
import { AdminBar } from '@/components/AdminBar'
import { Footer } from '@/Footer/Component'
import { NewHeader as Header } from '@/components/Header/NewHeader'
import { draftMode } from 'next/headers'

const LandingPageLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      {children}
      <Footer />
    </>
  )
}

// This custom function helps avoid database calls during build
const isDuringBuild = () => {
  return process.env.NEXT_PUBLIC_IS_BUILD === 'true'
}

export default async function LandingPage() {
  // During build, return minimal content without database calls
  if (isDuringBuild()) {
    return (
      <>
        <div className="admin-bar-placeholder" />
        <header className="header-placeholder">Header Placeholder</header>
        <LandingPageLayout>
          <main>
            <h1>Landing Page</h1>
            <p>This is a build-time placeholder.</p>
          </main>
        </LandingPageLayout>
      </>
    )
  }

  // Only make this call at runtime, not during build
  const { isEnabled } = await draftMode()

  return (
    <>
      <AdminBar adminBarProps={{ preview: isEnabled }} />
      <Header />
      <LandingPageLayout>
        {/* Your actual landing page content here */}
      </LandingPageLayout>
    </>
  )
}

// Optional: Use generateStaticParams to control static generation
export function generateStaticParams() {
  // Either return an empty array during build or your actual params
  if (process.env.NEXT_PUBLIC_IS_BUILD === 'true') {
    return []
  }
  
  // At runtime, you could return actual parameters if needed
  return []
}