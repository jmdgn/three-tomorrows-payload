import type { Metadata } from 'next'
import React from 'react'

import NewFooter from '../../Footer/SiteFooter.jsx'
import { Providers } from '../../providers'
import { PostHeaderProvider } from '../../providers/PostHeaderProvider'
import { mergeOpenGraph } from '../../utilities/mergeOpenGraph'
import { getServerSideURL } from '../../utilities/getURL'
import { testHeaderAccess, fetchHeader } from '../../utilities/clean-header-utils'
import '../../styles/global.css'
import '../../styles/media-queries.css'
import FooterProvider from '../../components/FooterProvider'
import ClientNavigationHandler from '../../components/HomeScripts/ClientNavigationHandler.client'
import DynamicHeaderWrapper from '../../components/Header/DynamicHeaderWrapper.client'

interface HeaderData {
  navItems?:
    | {
        id: string
        link?: {
          type?: string
          label?: string
          url?: string
          newTab?: boolean
        }
      }[]
    | null
}

function adaptHeaderToHeaderData(header: Header | null): HeaderData | null {
  if (!header) return null

  return {
    navItems:
      header.navItems?.map((item) => ({
        id: item.id || String(Math.random()),
        link: {
          type: item.link.type || undefined,
          label: item.link.label,
          url: item.link.url || undefined,
          newTab: item.link.newTab || undefined,
        },
      })) || null,
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  let headerData = null

  try {
    // Still try to fetch the header data in case it works
    const canAccessHeader = await testHeaderAccess()
    if (canAccessHeader) {
      headerData = await fetchHeader()
    }
  } catch (error) {
    console.error('Error in header access/fetching:', error)
  }

  return (
    <html lang="en">
      <head>
        <link href="/favicon/favicon.ico" rel="icon" sizes="32x32" />
      </head>
      <body suppressHydrationWarning>
        <ClientNavigationHandler />

        <PostHeaderProvider>
          {/* Client component wrapper that determines which header to show */}
          <DynamicHeaderWrapper headerData={headerData} useStaticHeader={false} />

          <Providers>{children}</Providers>
          <FooterProvider />
          <NewFooter />
        </PostHeaderProvider>
      </body>
    </html>
  )
}

export const metadata: Metadata = {
  title: 'Three Tomorrows | Digital Consultancy',
  description: 'Disruption By Design',
  metadataBase: new URL(getServerSideURL()),
  openGraph: mergeOpenGraph(),
  twitter: {
    card: 'summary_large_image',
    creator: '@payloadcms',
  },
}
