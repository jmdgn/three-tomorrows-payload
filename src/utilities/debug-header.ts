import { getPayload } from 'payload';
import configPromise from '@payload-config';

export async function debugHeader() {
  try {
    console.log('=================== HEADER DEBUG ===================');
    console.log('Initializing Payload...');
    
    const payload = await getPayload({ config: configPromise });
    
    console.log('Fetching header data...');
    const headerData = await payload.findGlobal({
      slug: 'header',
      depth: 3,
    });
    
    console.log('Header data received. Analysis:');
    
    if (!headerData) {
      console.log('No header data found!');
      return null;
    }
    
    console.log('Header Object Keys:', Object.keys(headerData));
    
    // Check navItems
    if (!headerData.navItems) {
      console.log('No navItems found in header!');
    } else {
      console.log(`Found ${headerData.navItems.length} navItems:`);
      
      headerData.navItems.forEach((item, index) => {
        console.log(`\n--- Nav Item #${index + 1} ---`);
        console.log('Item Keys:', Object.keys(item));
        
        if (item.id) {
          console.log('ID:', item.id);
        } else {
          console.log('WARNING: No ID found for this nav item');
        }
        
        if (item.link) {
          console.log('Link:', item.link);
          console.log('Link type:', item.link.type);
          console.log('Link label:', item.link.label);
          console.log('Link URL:', item.link.url);
          console.log('Link newTab:', item.link.newTab);
          
          // Validation check
          const hasLabel = Boolean(item.link.label);
          const hasValidLink = Boolean(item.link.url) || item.link.type === 'custom';
          console.log('Is valid:', hasLabel && hasValidLink);
          console.log('Reason:', hasLabel ? (hasValidLink ? 'Valid' : 'Missing valid URL') : 'Missing label');
        } else {
          console.log('WARNING: No link object found for this nav item');
        }
      });
    }
    
    // Check logo
    if (headerData.logo) {
      console.log('\nLogo found:', typeof headerData.logo === 'object' ? 'Object' : headerData.logo);
    } else {
      console.log('\nNo logo found in header data');
    }
    
    // Check CTA
    if (headerData.ctaLink || headerData.ctaLabel) {
      console.log('\nCTA Information:');
      console.log('CTA Link:', headerData.ctaLink);
      console.log('CTA Label:', headerData.ctaLabel);
    } else {
      console.log('\nNo CTA information found in header data');
    }
    
    console.log('=================== END HEADER DEBUG ===================');
    
    return headerData;
  } catch (error) {
    console.error('Error debugging header:', error);
    return null;
  }
}