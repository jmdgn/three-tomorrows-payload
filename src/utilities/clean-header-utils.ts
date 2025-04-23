import { fetchPayloadData } from './fetchPayloadData'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

const HEADER_QUERY = `
  query {
    Header {
      navItems {
        id
        link {
          type
          label
          url
          newTab
        }
      }
    }
  }
`

export async function testHeaderAccess() {
  try {
    const response = await fetchPayloadData({
      query: `query { Header { __typename } }`
    })
    
    return Boolean(response?.data?.Header)
  } catch (error) {
    console.error('Error accessing Header collection:', error)
    return false
  }
}

export async function fetchHeader() {
  try {
    console.log('Starting header data fetch');
    
    const payload = await getPayload({ config: configPromise });
    
    const headerData = await payload.findGlobal({
      slug: 'header',
      depth: 2,
    });
    
    console.log('Header data fetched successfully');
    
    if (!headerData) {
      console.log('Warning: No header data returned from findGlobal');
      return null;
    }
    
    if (!headerData.navItems) {
      console.log('Warning: No navItems in header data');
    } else {
      console.log(`Found ${headerData.navItems.length} navItems in header`);
      
      if (headerData.navItems.length > 0) {
        console.log('Sample navItem structure:', JSON.stringify(headerData.navItems[0], null, 2));
      }
    }
    
    return headerData;
  } catch (error) {
    console.error('Error in fetchHeader:', error);
    return null;
  }
}