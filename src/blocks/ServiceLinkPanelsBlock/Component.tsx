'use client'

import React from 'react'
import Link from 'next/link'
import type { ServiceLinkPanelsBlock as ServiceLinkPanelsBlockProps } from '@/payload-types'
import { Page } from '@/payload-types'

const ArrowIcon = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M0.93934 24.9393C0.353554 25.5251 0.353554 26.4749 0.93934 27.0607C1.52513 27.6464 2.47487 27.6464 3.06066 27.0607L0.93934 24.9393ZM27.5 2C27.5 1.17157 26.8284 0.499999 26 0.499999H12.5C11.6716 0.499999 11 1.17157 11 2C11 2.82843 11.6716 3.5 12.5 3.5L24.5 3.5V15.5C24.5 16.3284 25.1716 17 26 17C26.8284 17 27.5 16.3284 27.5 15.5V2ZM2 26L3.06066 27.0607L27.0607 3.06066L26 2L24.9393 0.939339L0.93934 24.9393L2 26Z"
      fill="currentColor"
    />
  </svg>
)

const getHref = (link: any): string => {
  if (!link) return '#'

  if (link.type === 'reference' && link.reference) {
    const page = link.reference as Page
    return page.fullPath || `/${page.slug}`
  }

  if (link.type === 'custom' && link.url) {
    return link.url
  }

  return '#'
}

export const ServiceLinkPanelsBlock: React.FC<ServiceLinkPanelsBlockProps> = ({ panels }) => {
  return (
    <>
      <style jsx>{`
        .panels-section {
          width: 100%;
          padding: 0;
        }
        .panels-container {
          display: flex;
          flex-direction: row;
          gap: 2rem;
          max-width: 100%;
          margin: 0 auto;
        }
        :global(.link-panel) {
          flex: 1;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 2rem 2.5rem;
          gap: 2rem;
          background-color: #191c1c;
          color: #ffffff;
          border-radius: 1rem;
          text-decoration: none;
          transition:
            transform 0.3s ease,
            box-shadow 0.3s ease;
        }
        :global(.link-panel:hover) {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
        }
        .text-group {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .text-group h3.panel-title {
          color: #fff;
          font-family: 'NaNHoloX Condensed Black';
          font-size: 32px;
          font-style: normal;
          font-weight: normal;
          line-height: 32px;
          letter-spacing: 0.25px;
          text-transform: uppercase;
          margin: 0;
        }
        .text-group p.panel-subtext {
          color: #ccc;
          font-family: 'Neue Montreal';
          font-size: 32px;
          font-style: normal;
          font-weight: 400;
          line-height: 100%;
          letter-spacing: 0.64px;
          margin: 0;
        }
        .icon-container {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          max-width: 84px;
          max-height: 84px;
          aspect-ratio: 1/1;
          background-color: #ffffff;
          color: #191c1c;
          border-radius: 50%;
          flex-shrink: 0;
          transition: transform 0.3s ease;
        }
        .link-panel:hover .icon-container {
          transform: scale(1.05);
        }

        /* --- Animation Styles Start --- */
        .icon-wrapper {
          position: relative;
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .arrow-first,
        .arrow-second {
          position: absolute;
          transition: all 0.3s ease-out;
        }

        .arrow-first {
          opacity: 1;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }

        .arrow-second {
          opacity: 0;
          bottom: -50%;
          left: -100%;
          transform: translate(0, 50%);
        }

        :global(.link-panel:hover) .arrow-first {
          opacity: 0;
          top: 0;
          left: 100%;
          transform: translate(0, -100%);
        }

        :global(.link-panel:hover) .arrow-second {
          opacity: 1;
          bottom: 0;
          left: 50%;
          transform: translate(-50%, 0);
        }
        /* --- Animation Styles End --- */

        /* Responsive Styles */
        @media (max-width: 1920px) {
          .text-group p.panel-subtext {
            font-size: 28px;
          }
        }

        @media (max-width: 1740px) {
          .text-group h3.panel-title {
            font-size: 28px;
            line-height: 28px;
          }
        }

        @media (max-width: 1280px) {
          :global(.link-panel) {
            padding: 2rem;
          }
        }

        @media (max-width: 1024px) {
          .panels-container {
            flex-direction: column;
          }
        }

        @media (max-width: 768px) {
          .panels-container {
            flex-direction: column;
            gap: 1.5rem;
          }
          :global(.link-panel) {
            padding: 1.5rem;
          }
          .text-group h3.panel-title {
            font-size: 24px;
            line-height: 24px;
          }
          .text-group p.panel-subtext {
            font-size: 24px;
          }
          .icon-container {
            display: none;
          }
        }
      `}</style>
      <div className="panels-section">
        <div className="panels-container">
          {panels?.map((panel, index) => {
            const href = getHref(panel.link)
            const newTab = panel.link?.newTab || false

            return (
              <Link
                href={href}
                key={index}
                className="link-panel"
                target={newTab ? '_blank' : '_self'}
              >
                <div className="text-group">
                  <h3 className="panel-title">{panel.title}</h3>
                  <p className="panel-subtext">{panel.subtext}</p>
                </div>
                <div className="icon-container">
                  <div className="icon-wrapper">
                    <div className="arrow-first">
                      <ArrowIcon />
                    </div>
                    <div className="arrow-second">
                      <ArrowIcon />
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </>
  )
}
