'use client'

import React, { Fragment, useEffect } from 'react'

import type { Props } from './types'

import { ImageMedia } from './ImageMedia'
import { VideoMedia } from './VideoMedia'

const isValidURL = (str: string): boolean => {
  try {
    new URL(str)
    return true
  } catch (e) {
    return false
  }
}

export const Media: React.FC<Props> = (props) => {
  const { className, htmlElement = 'div', resource, resourceId } = props

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      if (resourceId) {
        console.log('Media component with resourceId:', resourceId)
      }
      if (resource) {
        if (typeof resource === 'string') {
          console.log('Media component with resource string:', resource)
          console.log('Resource is a valid URL:', isValidURL(resource))
        } else if (typeof resource === 'object') {
          console.log(
            'Media component with resource object keys:',
            Object.keys(resource).join(', '),
          )
          if (resource.url) {
            console.log('- URL:', resource.url)
            console.log('- URL is valid:', isValidURL(resource.url))
          } else if (resource.filename) {
            console.log('- Filename:', resource.filename)
          }
        }
      }
    }
  }, [resource, resourceId])

  let resourceToUse = resource
  if (resourceId && !resource) {
    resourceToUse = {
      id: resourceId,
    }
  }

  const isVideo = typeof resourceToUse === 'object' && resourceToUse?.mimeType?.includes('video')
  const Tag = htmlElement || Fragment

  return (
    <Tag
      {...(htmlElement !== null
        ? {
            className,
          }
        : {})}
    >
      {isVideo ? (
        <VideoMedia {...props} resource={resourceToUse} />
      ) : (
        <ImageMedia {...props} resource={resourceToUse} />
      )}
    </Tag>
  )
}
