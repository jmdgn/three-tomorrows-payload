import type { Metadata } from 'next'

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
    },
  })

  const params = pages.docs?.filter((doc) => doc.slug !== 'home').map(({ slug }) => ({ slug }))

  return params
}

type Args = {
  params: Promise<{
    slug?: string
  }>
}

export default async function Page({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { slug = 'home' } = await paramsPromise
  const url = '/' + slug

  let page: RequiredDataFromCollectionSlug<'pages'> | null

  page = await queryPageBySlug({
    slug,
  })

  if (!page && slug === 'home') {
    page = homeStatic
  }

  if (!page) {
    return <PayloadRedirects url={url} />
  }

  const { hero, layout } = page

  return (
    <article className="pt-16 pb-24">
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
  const { slug = 'home' } = await paramsPromise

  try {
    const page = await queryPageBySlug({ slug })
    if (page) {
      return generateMeta({ doc: page })
    }
  } catch (error) {
    console.error(`Error generating metadata for ${slug}:`, error)
  }

  const formattedTitle = slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

  return {
    title: `${formattedTitle} | Three Tomorrows`,
    description: 'Page preview',
  }
}

const queryPageBySlug = cache(async ({ slug }: { slug: string }) => {
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
      overrideAccess: draft,
      where: {
        slug: {
          equals: slug,
        },
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
