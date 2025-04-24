import type { Metadata } from 'next/types'

import { CollectionArchive } from '@/components/CollectionArchive'
import { PageRange } from '@/components/PageRange'
import { Pagination } from '@/components/Pagination'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import PageClient from './page.client'
import '@/styles/blog-styles.css'

export const dynamic = 'force-dynamic'
export const revalidate = 600

export default async function Page() {
  const payload = await getPayload({ config: configPromise })

  const posts = await payload.find({
    collection: 'posts',
    depth: 2, // Increased depth to get category details
    limit: 12,
    overrideAccess: false,
    select: {
      title: true,
      slug: true,
      categories: true,
      meta: true,
      publishedAt: true,
    },
  })

  return (
    <div className="pt-24 pb-24">
      <div className="pt24-inner">
          <PageClient />
          <div className="mb-16">
            <div className="prose dark:prose-invert max-w-none">
              <h3>Blog</h3>
            </div>
          </div>

          <CollectionArchive posts={posts.docs} />

          <div className="container">
            {posts.totalPages > 1 && posts.page && (
              <Pagination page={posts.page} totalPages={posts.totalPages} />
            )}
          </div>
      </div>
    </div>
  )
}

export function generateMetadata(): Metadata {
  return {
    title: 'Three Tomorrows | Insights',
    description: 'Explore our latest insights and articles',
  }
}