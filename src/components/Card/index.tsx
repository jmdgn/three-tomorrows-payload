'use client'
import { cn } from '@/utilities/ui'
import useClickableCard from '@/utilities/useClickableCard'
import Link from 'next/link'
import React, { Fragment, useEffect } from 'react'

import type { Post } from '@/payload-types'

import { Media } from '@/components/Media'

export type CardPostData = Pick<
  Post,
  'slug' | 'categories' | 'meta' | 'title' | 'publishedAt' | 'heroImage'
>

export const Card: React.FC<{
  alignItems?: 'center'
  className?: string
  doc?: CardPostData
  relationTo?: 'posts'
  showCategories?: boolean
  title?: string
}> = (props) => {
  const { card, link } = useClickableCard({})
  const { className, doc, relationTo, showCategories, title: titleFromProps } = props

  const { slug, categories, meta, title, publishedAt, createdAt, heroImage } = doc || {}
  const dateToUse = publishedAt || createdAt
  const { description, image: metaImage } = meta || {}

  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && doc && doc.slug) {
      console.log(`Card Component Data for "${doc.slug}":`)
      if (heroImage) {
        console.log('- heroImage type:', typeof heroImage)
        console.log('- heroImage data:', heroImage)
      } else {
        console.log('- heroImage: not provided')
      }

      if (metaImage) {
        console.log('- metaImage type:', typeof metaImage)
        console.log('- metaImage data:', metaImage)
      } else {
        console.log('- metaImage: not provided')
      }
    }
  }, [doc, heroImage, metaImage])

  const imageToUse = heroImage || metaImage

  const hasCategories = categories && Array.isArray(categories) && categories.length > 0
  const titleToUse = titleFromProps || title
  const href = `/${relationTo}/${slug}`

  return (
    <article className={cn('blogArticle-preview', className)} ref={card.ref}>
      <div className="relative w-full">
        {!imageToUse ? (
          <div
            className="no-image-placeholder p-4 flex items-center justify-center bg-gray-100"
            style={{ height: '200px' }}
          >
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4 16L8.586 11.414C8.96106 11.0391 9.46967 10.8284 10 10.8284C10.5303 10.8284 11.0389 11.0391 11.414 11.414L16 16M14 14L15.586 12.414C15.9611 12.0391 16.4697 11.8284 17 11.8284C17.5303 11.8284 18.0389 12.0391 18.414 12.414L20 14M14 8H14.01M6 20H18C18.5304 20 19.0391 19.7893 19.4142 19.4142C19.7893 19.0391 20 18.5304 20 18V6C20 5.46957 19.7893 4.96086 19.4142 4.58579C19.0391 4.21071 18.5304 4 18 4H6C5.46957 4 4.96086 4.21071 4.58579 4.58579C4.21071 4.96086 4 5.46957 4 6V18C4 18.5304 4.21071 19.0391 4.58579 19.4142C4.96086 19.7893 5.46957 20 6 20Z"
                stroke="#888"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        ) : typeof imageToUse === 'string' ? (
          <Media resourceId={imageToUse} size="33vw" />
        ) : (
          <Media resource={imageToUse} size="33vw" />
        )}
      </div>
      <div className="p-4">
        {titleToUse && (
          <div className="prose">
            <h5>
              <Link className="not-prose" href={href} ref={link.ref}>
                {titleToUse}
              </Link>
            </h5>
          </div>
        )}
        {publishedAt && (
          <div className="mt-2">
            <p className="text-sm text-gray-600">
              {new Date(publishedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
        )}
        {showCategories && hasCategories && (
          <div className="ct-full mb-4">
            {showCategories && hasCategories && (
              <div className="categoryTag">
                {categories?.map((category, index) => {
                  if (typeof category === 'object') {
                    const { title: titleFromCategory } = category

                    const categoryTitle = titleFromCategory || 'Untitled category'

                    const isLast = index === categories.length - 1

                    return (
                      <Fragment key={index}>
                        {categoryTitle}
                        {!isLast && <Fragment>, &nbsp;</Fragment>}
                      </Fragment>
                    )
                  }

                  return null
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </article>
  )
}
