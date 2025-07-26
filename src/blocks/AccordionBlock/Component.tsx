'use client'

import React, { useState } from 'react'
import type { AccordionBlock as AccordionBlockProps } from '@/payload-types'

const PlusIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    stroke="currentColor"
    strokeWidth="1"
  >
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
)

const MinusIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    stroke="currentColor"
    strokeWidth="1"
  >
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
)

export const AccordionBlock: React.FC<AccordionBlockProps> = ({ title, accordionItems }) => {
  const [activeItem, setActiveItem] = useState(0)

  const handleItemClick = (index: number) => {
    setActiveItem(index)
  }

  return (
    <>
      <style jsx>{`
        .accordion-block-section {
          width: 100%;
          padding: 6rem 0;
        }
        .accordion-block-container {
          max-width: 100%;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
        }
        .accordion-block-title {
          font-size: 2.5rem;
          margin-bottom: 3rem;
          text-align: left; /* Align to left as per design */
        }
        .accordion-block-body {
          display: flex;
          width: 100%;
          gap: 8rem;
        }
        .accordion-items-container {
          width: 50%;
        }
        .accordion-image-container {
          width: 50%;
          position: sticky;
          top: 10vh;
          height: fit-content;
        }
        .accordion-image-wrapper {
          width: 100%;
          position: relative;
          aspect-ratio: 16 / 9;
        }
        .accordion-image-wrapper img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 24px;
        }
        .image-placeholder {
          width: 100%;
          height: 100%;
          background: #f0f0f0;
          border-radius: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #999;
          font-size: 1.2rem;
        }
        .accordion-block-item {
          border-bottom: 1px solid #191c1c;
        }
        .accordion-item-header {
          padding: 2.5rem 0;
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          align-items: center;
          user-select: none;
        }
        .accordion-item-title {
          font-family: 'Neue Montreal', sans-serif;
          font-size: 32px;
          line-height: 100%;
          text-transform: capitalize;
          margin: 0;
          transition: color 0.3s ease;
        }
        .accordion-item-icon {
          transition: transform 0.3s ease;
          color: #191c1c;
        }
        .accordion-item-content {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .accordion-item-content.active {
          max-height: 500px;
        }
        .accordion-item-content-inner {
          padding-bottom: 2rem;
          padding-right: 2rem; /* Add some padding to not touch the icon */
        }
        .accordion-item-description {
          line-height: 1.6;
          color: #333;
          font-size: 1rem;
        }

        /* Responsive Styles */
        @media (max-width: 1740px) {
          .accordion-block-section {
            padding: 2rem 0 6rem 0;
          }
          .accordion-image-wrapper {
            aspect-ratio: 5/4;
          }
        }
        @media (max-width: 1680px) {
          .accordion-image-wrapper {
            aspect-ratio: 4/3;
          }
        }
        @media (max-width: 1024px) {
          .accordion-block-body {
            flex-direction: column-reverse;
            gap: 2rem;
          }
          .accordion-items-container,
          .accordion-image-container {
            width: 100%;
          }
          .accordion-image-container {
            position: relative;
            top: 0;
          }
          .accordion-image-wrapper {
            aspect-ratio: 16/9;
          }
          .accordion-item-title {
            font-size: 24px;
          }
        }
        @media (max-width: 768px) {
          .accordion-block-section {
            padding: 0 0 2rem 0;
          }
          .accordion-block-body {
            flex-direction: column-reverse;
          }
          .accordion-image-container,
          .accordion-items-container {
            width: 100%;
            position: static;
          }
          .accordion-item-content-inner {
            padding-right: 0;
          }
          .accordion-image-wrapper {
            aspect-ratio: 3/2;
          }
          .image-placeholder {
            border-radius: 1rem;
            -webkit-border-radius: 1rem;
          }
          .accordion-item-header {
            padding: 1.5rem 0;
          }
          .accordion-item-title {
            font-size: 22px;
          }
        }
      `}</style>
      <section className="accordion-block-section">
        <div className="accordion-block-container">
          {title && <h2 className="accordion-block-title">{title}</h2>}
          <div className="accordion-block-body">
            <div className="accordion-items-container">
              {accordionItems &&
                accordionItems.length > 0 &&
                accordionItems.map((item, index) => (
                  <div key={item.id} className="accordion-block-item">
                    <div
                      className={`accordion-item-header ${activeItem === index ? 'active' : ''}`}
                      onClick={() => handleItemClick(index)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) =>
                        (e.key === 'Enter' || e.key === ' ') && handleItemClick(index)
                      }
                    >
                      <h3 className="accordion-item-title">{item.title}</h3>
                      <div className="accordion-item-icon">
                        {activeItem === index ? <MinusIcon /> : <PlusIcon />}
                      </div>
                    </div>
                    <div
                      className={`accordion-item-content ${activeItem === index ? 'active' : ''}`}
                    >
                      <div className="accordion-item-content-inner">
                        <p className="accordion-item-description">{item.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>

            <div className="accordion-image-container">
              <div className="accordion-image-wrapper">
                {accordionItems[activeItem]?.image?.url ? (
                  <img
                    key={accordionItems[activeItem].id}
                    src={accordionItems[activeItem].image.url}
                    alt={accordionItems[activeItem].image.alt || ''}
                  />
                ) : (
                  <div className="image-placeholder">
                    <span>Image Preview</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
