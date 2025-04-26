import { fetchHeader } from '@/utilities/clean-header-utils'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const headerData = await fetchHeader()

    if (!headerData) {
      return NextResponse.json({ error: 'Header data not available' }, { status: 404 })
    }

    return NextResponse.json(headerData)
  } catch (error) {
    console.error('Error in header API route:', error)

    return NextResponse.json({ error: 'Failed to fetch header data' }, { status: 500 })
  }
}
