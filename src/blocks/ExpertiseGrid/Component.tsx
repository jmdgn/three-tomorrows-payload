'use client'

import React from 'react'
import type { ExpertiseGridBlock as ExpertiseGridBlockProps } from '@/payload-types'
import AnimatedTitle from '@/components/HomeScripts/AnimatedTitle'

export const ExpertiseGridBlock: React.FC<ExpertiseGridBlockProps> = ({
  title,
  subtitle,
  leftColumn,
  rightColumn,
}) => {
  const renderColumn = (column: typeof leftColumn, columnIndex: number) => {
    if (!column || !column.items || column.items.length === 0) return null

    return (
      <div className="expertise-column" key={columnIndex}>
        <h4 style={{ color: column.headingColor || '#171744' }}>{column.heading}</h4>
        <div className="expertise-items">
          {column.items.map((item, index) => (
            <a
              href={item.link || '#'}
              className="expertise-panel"
              key={index}
              onClick={(e) => {
                if (!item.link || item.link === '#') {
                  e.preventDefault()
                }
              }}
            >
              <div className="expertise-content">
                <h5>{item.text}</h5>
                <p>{item.hoverText || ''}</p>
              </div>
              <div className="expertise-arrow">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M0.292893 14.2929C-0.097631 14.6834 -0.097631 15.3166 0.292893 15.7071C0.683418 16.0976 1.31658 16.0976 1.70711 15.7071L0.292893 14.2929ZM16 1C16 0.447715 15.5523 -9.44832e-09 15 -9.44832e-09L6 -9.44832e-09C5.44772 -9.44832e-09 5 0.447715 5 1C5 1.55228 5.44772 2 6 2H14L14 10C14 10.5523 14.4477 11 15 11C15.5523 11 16 10.5523 16 10L16 1ZM1 15L1.70711 15.7071L15.7071 1.70711L15 1L14.2929 0.292893L0.292893 14.2929L1 15Z"
                    fill="#191C1C"
                  />
                </svg>
              </div>
            </a>
          ))}
        </div>
      </div>
    )
  }

  return (
    <section className="expertise-panel-section">
      <div className="expertise-content-outer">
        <div className="expertise-content-inner">
          {(title || subtitle) && (
            <div className="expertise-title">
              <div className="titleText center">
                {title && (
                  <div className="titleContent-container">
                    <h4>{title}</h4>
                  </div>
                )}
                {subtitle && (
                  <div className="txtContent-container">
                    <p>
                      <AnimatedTitle staggerDelay={0.02} duration={0.6}>
                        {subtitle}
                      </AnimatedTitle>
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="expertise-grid">
            {renderColumn(leftColumn, 0)}
            {renderColumn(rightColumn, 1)}
          </div>
        </div>
      </div>
    </section>
  )
}
