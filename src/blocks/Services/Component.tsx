import React from 'react'
import type { Block } from 'payload/types'
import type { Media } from '@/payload-types'

interface BlockProps {
  [key: string]: unknown
}

function isMedia(obj: any): obj is Media {
  return obj && typeof obj === 'object' && 'url' in obj
}

function getImageProps(image: string | Media) {
  return {
    src: isMedia(image) ? image.url : image,
    alt: isMedia(image) ? image.alt || '' : '',
  }
}

export type Service = {
  title: string
  description: string
  image: string | Media
}

export type ServicesBlockProps = BlockProps & {
  title?: string
  subtitle?: string
  services: Service[]
}

export const ServicesBlock: React.FC<ServicesBlockProps> = ({ title, subtitle, services }) => {
  return (
    <section className="service-panel">
      <div className="serviceContent-outer">
        <div className="serviceContent-inner">
          {title && (
            <div className="titleText center">
              <div className="txtContent-container">
                <h3 className="animate-title">{title}</h3>
                {subtitle && <p>{subtitle}</p>}
              </div>
            </div>
          )}

          <div className="serviceGrid-container">
            {services?.map((service: Service, index: number) => (
              <div key={index} className="servicePanel-container">
                <div className="serviceCard">
                  {service.image && (
                    <div className="serviceFt-image">
                      <img
                        className="service-image"
                        src={service.image.url}
                        width={503}
                        height={283}
                        alt={service.image.alt || ''}
                      />
                    </div>
                  )}
                  <h4>{service.title}</h4>
                  <p>{service.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export const ServicesConfig: Block = {
  slug: 'services',
  labels: {
    singular: 'Services Block',
    plural: 'Services Blocks',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
    },
    {
      name: 'subtitle',
      type: 'text',
    },
    {
      name: 'services',
      type: 'array',
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
        },
        {
          name: 'description',
          type: 'text',
          required: true,
        },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
      ],
    },
  ],
}
