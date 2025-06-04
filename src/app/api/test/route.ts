import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

export async function GET() {
  try {
    console.log('Test API route called')

    const payload = await getPayload({ config: configPromise })
    console.log('Payload instance created successfully')

    try {
      const header = await payload.findGlobal({
        slug: 'header',
        depth: 2,
      })
      console.log('Header global found:', !!header)
      console.log('Header navItems:', header?.navItems?.length || 0)
    } catch (error) {
      console.error('Error fetching header global:', error)
      return NextResponse.json(
        {
          error: 'Failed to fetch header global',
          details: error.message,
        },
        { status: 500 },
      )
    }

    try {
      const users = await payload.find({
        collection: 'users',
        limit: 1,
        depth: 1,
      })
      console.log('Users found:', users.totalDocs)
    } catch (error) {
      console.error('Error fetching users:', error)
      return NextResponse.json(
        {
          error: 'Failed to fetch users',
          details: error.message,
        },
        { status: 500 },
      )
    }

    try {
      const pages = await payload.find({
        collection: 'pages',
        limit: 1,
        depth: 3,
      })
      console.log('Pages found:', pages.totalDocs)

      if (pages.docs[0]?.layout) {
        console.log('First page layout blocks:', pages.docs[0].layout.length)
        const formBlocks = pages.docs[0].layout.filter((block) => block.blockType === 'formBlock')
        console.log('Form blocks found:', formBlocks.length)

        formBlocks.forEach((block, index) => {
          console.log(`Form block ${index} contactInfo:`, block.contactInfo)
          if (block.contactInfo?.contacts) {
            block.contactInfo.contacts.forEach((contact, contactIndex) => {
              console.log(`Contact ${contactIndex}:`, contact)
              console.log(`Person type:`, typeof contact.person)
              console.log(`Person data:`, contact.person)
            })
          }
        })
      }
    } catch (error) {
      console.error('Error fetching pages:', error)
      return NextResponse.json(
        {
          error: 'Failed to fetch pages',
          details: error.message,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: 'All API tests passed',
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Test API route error:', error)
    return NextResponse.json(
      {
        error: 'Test API route failed',
        details: error.message,
        stack: error.stack,
      },
      { status: 500 },
    )
  }
}
