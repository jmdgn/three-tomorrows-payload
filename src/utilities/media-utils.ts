export function getMediaUrl(mediaId: string): string {
  if (!mediaId) return ''

  return `/api/media/${mediaId}`
}
