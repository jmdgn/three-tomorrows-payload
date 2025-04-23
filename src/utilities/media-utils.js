export function getMediaUrl(mediaId) {
  if (!mediaId) return null;
  
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
  return `${baseUrl}/media/${mediaId}`;
}