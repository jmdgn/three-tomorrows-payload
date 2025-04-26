import type { FileData } from 'payload/dist/uploads/types'

export const vercelBlobAdapter = () => ({
  name: 'vercel-blob',

  async upload({ file, collection }) {
    // Dynamic import to avoid build issues
    const { put } = await import('@vercel/blob')

    try {
      const blob = await put(file.filename, file.buffer, {
        contentType: file.mimeType,
        access: 'public',
      })

      return {
        filename: file.filename,
        filesize: file.size,
        mimeType: file.mimeType,
        width: file.width,
        height: file.height,
        url: blob.url,
      }
    } catch (error) {
      console.error('Error uploading to Vercel Blob:', error)
      throw error
    }
  },

  async delete({ filename }) {
    try {
      const { del } = await import('@vercel/blob')
      await del(filename)
      return true
    } catch (error) {
      console.error('Error deleting from Vercel Blob:', error)
      return false
    }
  },
})
