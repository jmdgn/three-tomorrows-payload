'use client'

import type { StaticImageData } from 'next/image'

import { cn } from '@/utilities/ui'
import NextImage from 'next/image'
import React from 'react'

import type { Props as MediaProps } from '../types'

import { cssVariables } from '@/cssVariables'
import { getClientSideURL } from '@/utilities/getURL'

const { breakpoints } = cssVariables

const placeholderBlur =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAABchJREFUWEdtlwtTG0kMhHtGM7N+AAdcDsjj///EBLzenbtuadbLJaZUTlHB+tRqSesETB3IABqQG1KbUFqDlQorBSmboqeEBcC1d8zrCixXYGZcgMsFmH8B+AngHdurAmXKOE8nHOoBrU6opcGswPi5KSP9CcBaQ9kACJH/ALAA1xm4zMD8AczvQCcAQeJVAZsy7nYApTSUzwCHUKACeUJi9TsFci7AHmDtuHYqQIC9AgQYKtDBUiCAgHM77hSo/1fguANgCxqsMqpKKrIVhQBwa8HCD+AIXIDrB7AQAALMHkigNZzbARN1oTRUyq7qkMh5DoAGYKnAYgLkgTSMyFFXckO2C0RSkfSMRMGtA+sAuA8QAfTBWYDlA1jfgXQBbAVKlgIn1o9TO6GViqoOkOMMcqECWUqI5YZCZ7UGsDqv1oHk36UA1w4wdZWGdgHWzlEOqBAG8AlMAK8CQAdrgQjmVxKAK5CtQELWECMBSlH1kwA0/N+ADJiSj+TaGEEF6gx0AO6eUMeCIHaYMdRYZ6DPAAWWAGQ3w6EYmhWF3FQVPQxQMsOUlZwA5OzJO0AFUB2iCqIKNGHvCMD5FYBYPkuBFegdsDJ5BKsnQFplxGwZU6YC6mZDNQtFpupT9QhQTYwCMuGYkEZE4mz1iNGGEWFFVOGH1dkVgOWEZplYc9a0KsBkmcn1CxPOjA5QgQFB9rMHHdA9cAPQAb4N2zcq4CgUzasiOdtVUXJCVchKyjLfJr8UyK9dlbHCowrn/xuASXkqMJEgmJQA9ItNfm5+5E4forYcYGIqcpM/IaXyFi1glYY+Ev8GQEgmFU5MdkRSnQnAr0VQJs8ZQ1IwuVSr2rkrd10Rl90H3gGt4L388SF2gIJCE8PvPVHUjsoW7OUfAURl28OIHLrbFdBk8wagcypcAe+SLQCCf2rCvb8JAEcg1BjPKbhHcgLwH1dCd9iHDvCFBsD2+P0LIIB2TzgqCAXEhMQlj+QjP6ZijN2OAQEiUqIK/kHJpl++AhqS3a7ahg9I9uEN2IBiQrhL7f5LzOhXj9+lgCsqAJJLCb3vNMCzj5ZnqCDr8546clRf85gBzyKgAnxDN71YXP8ZYXpBs2/agP67MYbhQ/1NtCEcvzk/dViMDLSUERt5eMAT+0B5zrT7AOCvVGEcHykQG5DvQyUtbd8iACIR1vktiQJQwZ0Cm7uh40bdnR8I7Ww/PwC8EfecZojcAyQbAHJy8K0dWBsOYN+PYUQGGmeeOEYmHH2wAGRIv+i6LdlQd/vR00lAPEVLhG7CpsJnAPtl+XACcKvRUMA90wYw+aZCKGCzQQD8cHPnGFGFnR8QwJ8ehANE84VPVOxM2fXIRR8fDfEe4LadAjBz6Dca7lKOtePXMoxI+QnAZA5wNnMBj63gMPYRTTAXkgAPckK0wYnn7xc9wDMqbiC+lTiw/y7A59Dky8KHAgsJdYNB81GB39s2AK4CBVcAVkEekKPi6uLz95cNhKxeByOybnbdfWmHB3xu9EDPheMM9Nl99bP7S8dPbkWvUqDiOHlzDrW4EUPnN+J/0QyTcn/8wFAAAAAASUVORK5CYII='

export const ImageMedia: React.FC<MediaProps> = (props) => {
  const {
    alt: altFromProps,
    fill,
    pictureClassName,
    imgClassName,
    priority,
    resource,
    size: sizeFromProps,
    src: srcFromProps,
    loading: loadingFromProps,
  } = props

  let width: number | undefined
  let height: number | undefined
  let alt = altFromProps
  let src: StaticImageData | string = srcFromProps || ''

  if (!src && resource && typeof resource === 'object') {
    const { alt: altFromResource, height: fullHeight, url, width: fullWidth } = resource

    width = fullWidth!
    height = fullHeight!
    alt = altFromResource || ''

    const cacheTag = resource.updatedAt

    if (url) {
      if (url.startsWith('http://') || url.startsWith('https://')) {
        src = url + (cacheTag ? `?${cacheTag}` : '')
      } else {
        const baseUrl = getClientSideURL()
        const sanitizedBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl
        const sanitizedUrl = url.startsWith('/') ? url : `/${url}`
        src = `${sanitizedBaseUrl}${sanitizedUrl}${cacheTag ? `?${cacheTag}` : ''}`
      }

      if (process.env.NODE_ENV === 'development') {
        console.log('Constructed image URL:', src)
      }
    }
  }

  if (!src || src === '') {
    return (
      <div
        className={cn(imgClassName, 'image-placeholder')}
        style={{
          aspectRatio: width && height ? `${width}/${height}` : '16/9',
          width: width || '100%',
          height: height || 'auto',
          backgroundColor: '#f0f0f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4 16L8.586 11.414C8.96106 11.0391 9.46967 10.8284 10 10.8284C10.5303 10.8284 11.0389 11.0391 11.414 11.414L16 16M14 14L15.586 12.414C15.9611 12.0391 16.4697 11.8284 17 11.8284C17.5303 11.8284 18.0389 12.0391 18.414 12.414L20 14M14 8H14.01M6 20H18C18.5304 20 19.0391 19.7893 19.4142 19.4142C19.7893 19.0391 20 18.5304 20 18V6C20 5.46957 19.7893 4.96086 19.4142 4.58579C19.0391 4.21071 18.5304 4 18 4H6C5.46957 4 4.96086 4.21071 4.58579 4.58579C4.21071 4.96086 4 5.46957 4 6V18C4 18.5304 4.21071 19.0391 4.58579 19.4142C4.96086 19.7893 5.46957 20 6 20Z"
            stroke="#888"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    )
  }

  const loading = loadingFromProps || (!priority ? 'lazy' : undefined)

  const sizes = sizeFromProps
    ? sizeFromProps
    : Object.entries(breakpoints)
        .map(([, value]) => `(max-width: ${value}px) ${value * 2}w`)
        .join(', ')

  return (
    <picture className={cn(pictureClassName)}>
      <NextImage
        alt={alt || ''}
        className={cn(imgClassName)}
        fill={fill}
        height={!fill ? height : undefined}
        placeholder="blur"
        blurDataURL={placeholderBlur}
        priority={priority}
        quality={100}
        loading={loading}
        sizes={sizes}
        src={src}
        width={!fill ? width : undefined}
      />
    </picture>
  )
}
