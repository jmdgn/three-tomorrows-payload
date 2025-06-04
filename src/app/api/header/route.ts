import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log('Header API route called')

    const payload = await getPayload({ config: configPromise })
    console.log('Payload instance created for header')

    const header = await payload.findGlobal({
      slug: 'header',
      depth: 2,
    })

    console.log('Header data found:', !!header)
    console.log('Header navItems:', header?.navItems?.length || 0)

    return NextResponse.json(header)
  } catch (error) {
    console.error('Error in header API route:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch header',
        details: error.message,
      },
      { status: 500 },
    )
  }
}

export async function HEAD() {
  try {
    const payload = await getPayload({ config: configPromise })

    const header = await payload.findGlobal({
      slug: 'header',
      depth: 1,
    })

    if (header) {
      return new NextResponse(null, { status: 200 })
    } else {
      return new NextResponse(null, { status: 404 })
    }
  } catch (error) {
    console.error('Error in header HEAD request:', error)
    return new NextResponse(null, { status: 500 })
  }
}
