import { fetchPayloadData } from './fetchPayloadData'

// A more detailed introspection query for the Header type and specifically the ctaLink field
const DETAILED_HEADER_SCHEMA_QUERY = `
  query {
    headerType: __type(name: "Header") {
      fields {
        name
        type {
          name
          kind
          ofType {
            name
            kind
          }
        }
      }
    }
    ctaLinkType: __type(name: "Header_CtaLink") {
      fields {
        name
        type {
          name
          kind
          ofType {
            name
            kind
          }
        }
      }
    }
  }
`

export async function introspectHeaderSchema() {
  try {
    const schemaResponse = await fetchPayloadData({
      query: DETAILED_HEADER_SCHEMA_QUERY,
    })
    
    console.log('Header Fields:', JSON.stringify(schemaResponse?.data?.headerType?.fields, null, 2))
    console.log('Header_CtaLink Fields:', JSON.stringify(schemaResponse?.data?.ctaLinkType?.fields, null, 2))
    
    return schemaResponse?.data
  } catch (error) {
    console.error('Error fetching schema:', error)
    return null
  }
}