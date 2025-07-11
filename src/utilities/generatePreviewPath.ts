import type { PayloadRequest } from 'payload'

type GeneratePreviewPath = (args: {
  collection: 'pages' | 'posts'
  slug: null | string
  req: PayloadRequest
}) => string

export const generatePreviewPath: GeneratePreviewPath = ({ collection, slug, req }) => {
  const publicSiteUrl = process.env.PAYLOAD_PUBLIC_SITE_URL || process.env.PAYLOAD_PUBLIC_SERVER_URL

  const DRAFT_SECRET = process.env.PAYLOAD_PUBLIC_DRAFT_SECRET

  const previewPath = new URL(`${publicSiteUrl}/next/preview`)

  previewPath.searchParams.set('slug', slug || '')
  previewPath.searchParams.set('collection', collection)
  previewPath.searchParams.set('path', `/${slug}`)
  previewPath.searchParams.set('previewSecret', DRAFT_SECRET || '')

  return previewPath.href
}
