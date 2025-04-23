import { payload } from 'payload';

/**
 * Fetches the homepage data from Payload CMS
 */
export async function fetchHomepage() {
  try {
    // Access Payload directly from server component
    const homepageData = await payload.find({
      collection: 'homepage',
      limit: 1,
    });
    
    // Return the first document or an empty object if no documents exist
    return homepageData.docs && homepageData.docs.length > 0 ? homepageData.docs[0] : {};
  } catch (error) {
    console.error('Error fetching homepage data:', error);
    return {}; // Return empty object in case of error
  }
}

/**
 * Gets the media URL for a media item
 */
export function getMediaUrl(mediaId: string): string {
  if (!mediaId) return '';
  
  // Use absolute URL pattern for media
  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || '';
  return `${baseUrl}/api/media/${mediaId}`;
}