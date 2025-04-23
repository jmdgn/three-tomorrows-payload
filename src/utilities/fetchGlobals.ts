import { fetchPayloadData } from './fetchPayloadData'

// Minimal header query - this should work regardless of the schema
const MINIMAL_HEADER_QUERY = `
  query {
    Header {
      ctaLabel
    }
  }
`

export async function fetchGlobals() {
  try {
    console.log('Attempting to fetch header data with minimal query...')
    
    // First, let's try a minimal header query just to get something working
    const headerResponse = await fetchPayloadData({
      query: MINIMAL_HEADER_QUERY,
    })
    
    if (headerResponse?.data?.Header) {
      console.log('Successfully fetched header data:', JSON.stringify(headerResponse.data.Header, null, 2))
      return {
        header: headerResponse.data.Header,
        footer: null,
      }
    } else {
      console.log('Header data not found in response:', headerResponse)
      return {
        header: {},
        footer: null,
      }
    }
  } catch (error) {
    console.error('Error fetching global data:', error)
    return {
      header: {},
      footer: null,
    }
  }
}