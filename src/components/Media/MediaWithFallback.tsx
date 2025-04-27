'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { Media } from '@/components/Media'

interface MediaWithFallbackProps {
  resource: any
  className?: string
  imgClassName?: string
  alt?: string
  width?: number
  height?: number
  priority?: boolean
  fill?: boolean
}

export const MediaWithFallback: React.FC<MediaWithFallbackProps> = ({
  resource,
  className,
  imgClassName,
  alt: altFromProps,
  width,
  height,
  priority,
  fill,
}) => {
  const [hasError, setHasError] = useState(false)
  const [fallbackAttempted, setFallbackAttempted] = useState(false)
  
  const getFilename = () => {
    if (!resource) return null;
    
    if (typeof resource === 'string') {
      const parts = resource.split('/');
      return parts[parts.length - 1];
    }
    
    if (resource.filename) return resource.filename;
    if (resource.url) {
      const parts = resource.url.split('/');
      return parts[parts.length - 1];
    }
    
    return null;
  }
  
  const getFallbackUrl = () => {
    const filename = getFilename();
    if (!filename) return '/assets/images/placeholder.jpg';
    
    return `/assets/images/${filename}`;
  }
  
  const handleError = () => {
    console.log('Image failed to load, trying fallback:', resource);
    
    if (!fallbackAttempted) {
      setFallbackAttempted(true);
      setHasError(true);
    }
  }
  
  if (hasError && fallbackAttempted) {
    const fallbackUrl = getFallbackUrl();
    
    return (
      <div className={className}>
        <img
          src={fallbackUrl}
          alt={altFromProps || 'Image'}
          className={imgClassName}
          width={width || 100}
          height={height || 100}
          onError={() => {
            console.log('Fallback image also failed, using placeholder');
          }}
          style={fill ? { objectFit: 'cover', width: '100%', height: '100%' } : {}}
        />
      </div>
    )
  }
  
  return (
    <Media
      resource={resource}
      className={className}
      imgClassName={imgClassName}
      alt={altFromProps}
      width={width}
      height={height}
      priority={priority}
      fill={fill}
      onError={handleError}
    />
  )
}

export default MediaWithFallback