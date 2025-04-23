import { Payload } from 'payload'
import { User } from '../payload-types'

export const getAuthorData = async (
  authorID: string,
  payload: Payload
): Promise<Partial<User> | null> => {
  if (!authorID) return null

  try {
    const author = await payload.findByID({
      collection: 'users',
      id: authorID,
      depth: 2,
      fields: [
        'id',
        'name',
        'authorProfile.biography',
        'authorProfile.photo',
        'authorProfile.isAuthor',
        'authorProfile.socialMedia.twitter',
        'authorProfile.socialMedia.linkedin',
        'authorProfile.socialMedia.bluesky',
        'authorProfile.socialMedia.website'
      ],
    });

    if (author && author.authorProfile?.isAuthor) {
      return {
        ...author,
        authorProfile: {
          ...author.authorProfile,
          photo: author.authorProfile.photo || null,
          socialMedia: author.authorProfile.socialMedia || {}
        }
      }
    }

    return null
  } catch (error) {
    console.error(`Error fetching author data: ${error}`)
    return null
  }
}