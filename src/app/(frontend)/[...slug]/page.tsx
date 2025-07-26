import type { Metadata } from 'next'
import { cookies } from 'next/headers'

import { PayloadRedirects } from '@/components/PayloadRedirects'
import configPromise from '@payload-config'
import { getPayload, type RequiredDataFromCollectionSlug } from 'payload'
import { draftMode } from 'next/headers'
import React, { cache } from 'react'
import { homeStatic } from '@/endpoints/seed/home-static'

import { RenderBlocks } from '@/blocks/RenderBlocks'
import { RenderHero } from '@/heros/RenderHero'
import { generateMeta } from '@/utilities/generateMeta'
import PageClient from './page.client'
import { LivePreviewListener } from '@/components/LivePreviewListener'

export const dynamic = 'force-dynamic'

export async function generateStaticParams() {
  if (process.env.NODE_ENV === 'production' && process.env.PAYLOAD_BUILD !== 'true') {
    return []
  }

  const payload = await getPayload({ config: configPromise })

  const pages = await payload.find({
    collection: 'pages',
    draft: false,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: {
      slug: true,
      fullPath: true,
    },
  })

  const params = pages.docs
    ?.filter((doc) => doc.slug !== 'home')
    .map((doc) => ({ 
      // Handle both single segments and full paths
      slug: doc.fullPath ? doc.fullPath.split('/') : [doc.slug]
    }))
    .filter(param => param.slug.every(segment => segment)) // Remove empty segments

  console.log('Generated static params for [...slug]:', params)
  return params || []
}

type Args = {
  params: Promise<{
    slug?: string[]  // Array for catch-all route
  }>
}

export default async function Page({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { slug: slugArray = [] } = await paramsPromise
  
  // Convert array to string - handle both single and multiple segments
  const slug = slugArray.length === 0 ? 'home' : slugArray.join('/')
  const url = '/' + (slug === 'home' ? '' : slug)

  console.log('Catch-all route - slugArray:', slugArray)
  console.log('Catch-all route - final slug:', slug)

  let page: RequiredDataFromCollectionSlug<'pages'> | null

  const cookieStore = cookies()

  page = await queryPageBySlug({
    slug,
    cookie: cookieStore.toString(),
  })

  if (!page && slug === 'home') {
    page = homeStatic
  }

  if (!page) {
    return <PayloadRedirects url={url} />
  }

  const { hero, layout, backgroundColor } = page

  const getBackgroundClass = (bgColor?: string) => {
    switch (bgColor) {
      case '#3BE494':
        return 'bg-green'
      case '#171744':
        return 'bg-navy'
      case '#FBFCFD':
      default:
        return 'bg-light-grey'
    }
  }

  const backgroundClass = getBackgroundClass(backgroundColor)

  return (
    <article
      className={`pt-16 pb-24 ${backgroundClass}`}
      style={{ backgroundColor: backgroundColor || '#FBFCFD' }}
    >
      <div className="pt-16-inner">
        <PageClient />
        <PayloadRedirects disableNotFound url={url} />

        {draft && <LivePreviewListener />}

        <RenderHero {...hero} />
        <RenderBlocks blocks={layout} />
      </div>
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug: slugArray = [] } = await paramsPromise
  const slug = slugArray.length === 0 ? 'home' : slugArray.join('/')

  console.log('generateMetadata - slugArray:', slugArray)
  console.log('generateMetadata - final slug:', slug)

  try {
    const cookieStore = cookies()
    const page = await queryPageBySlug({
      slug,
      cookie: cookieStore.toString(),
    })
    if (page) {
      return generateMeta({ doc: page })
    }
  } catch (error) {
    console.error(`Error generating metadata for ${slug}:`, error)
  }

  const formattedTitle = slug
    .split('/')
    .map(segment => segment.split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
    )
    .join(' - ')

  return {
    title: `${formattedTitle} | Three Tomorrows`,
    description: 'Page preview',
  }
}

const queryPageBySlug = cache(async ({ slug, cookie }: { slug: string; cookie?: string }) => {
  try {
    console.log('Querying page by slug:', slug)

    const { isEnabled: draft } = await draftMode()
    console.log('Draft mode enabled:', draft)

    const payload = await getPayload({ config: configPromise })
    console.log('Payload instance obtained')

    const result = await payload.find({
      collection: 'pages',
      draft,
      limit: 1,
      pagination: false,
      overrideAccess: false,
      ...(cookie
        ? {
            req: {
              headers: {
                cookie,
              },
            },
          }
        : {}),
      where: {
        or: [
          {
            slug: {
              equals: slug,
            },
          },
          {
            fullPath: {
              equals: slug,
            },
          },
        ],
      },
      depth: 3,
    })

    console.log('Page query result:', result)
    console.log('Found docs:', result.docs?.length)

    if (result.docs?.[0]) {
      const page = result.docs[0]
      console.log('Page layout blocks:', page.layout?.length)

      page.layout?.forEach((block, index) => {
        console.log(`Block ${index}:`, block.blockType)
        if (block.blockType === 'formBlock') {
          console.log('Form block found:', block)
          console.log('Form block contactInfo:', block.contactInfo)
          if (block.contactInfo?.contacts) {
            console.log('Contacts in form block:', block.contactInfo.contacts)
            block.contactInfo.contacts.forEach((contact, contactIndex) => {
              console.log(`Contact ${contactIndex}:`, contact)
              console.log(`Contact person type:`, typeof contact.person)
              console.log(`Contact person data:`, contact.person)
            })
          }
        }
      })

      if (page.layout) {
        for (const block of page.layout) {
          if (block.blockType === 'formBlock' && block.contactInfo?.contacts) {
            for (const contact of block.contactInfo.contacts) {
              if (typeof contact.person === 'string') {
                console.log('Manually populating person:', contact.person)
                try {
                  const populatedPerson = await payload.findByID({
                    collection: 'users',
                    id: contact.person,
                    depth: 2,
                  })
                  console.log('Populated person data:', populatedPerson)
                  contact.person = populatedPerson
                } catch (error) {
                  console.error('Error populating person:', error)
                }
              }
            }
          }
        }
      }
    }

    return result.docs?.[0] || null
  } catch (error) {
    console.error('Error in queryPageBySlug:', error)
    return null
  }
})