'use client'

import React from 'react'
// Make sure the path to your payload-types is correct
import type { HeaderSectionBlock as HeaderSectionBlockProps } from '@/payload-types'

// The props are destructured from the block data provided by Payload
export const HeaderSectionBlock: React.FC<HeaderSectionBlockProps> = ({
  headline,
  subheadline,
  links,
  stats,
  backgroundImage,
  showBackgroundImage,
}) => {
  // Fallback data in case props are not provided, to prevent rendering errors
  const defaultLinks = [
    { id: '1', name: 'Open roles', href: '#' },
    { id: '2', name: 'Internship program', href: '#' },
    { id: '3', name: 'Our values', href: '#' },
    { id: '4', name: 'Meet our leadership', href: '#' },
  ]

  const defaultStats = [
    { id: '1', name: 'Offices worldwide', value: '12' },
    { id: '2', name: 'Full-time colleagues', value: '300+' },
    { id: '3', name: 'Hours per week', value: '40' },
    { id: '4', name: 'Paid time off', value: 'Unlimited' },
  ]

  // Use the data from Payload if available, otherwise use the defaults
  const finalLinks = links && links.length > 0 ? links : defaultLinks
  const finalStats = stats && stats.length > 0 ? stats : defaultStats

  // Default background image in case one isn't uploaded yet
  const backgroundUrl =
    typeof backgroundImage === 'object' && backgroundImage?.url
      ? backgroundImage.url
      : 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&crop=focalpoint&fp-y=.8&w=2830&h=1500&q=80&blend=111827&sat=-100&exp=15&blend-mode=multiply'

  const backgroundAlt =
    typeof backgroundImage === 'object' && backgroundImage?.alt
      ? backgroundImage.alt
      : 'People working in an office'

  return (
    <div className="relative isolate overflow-hidden bg-gray-900 py-24 sm:py-32">
      {/* Only show background image if showBackgroundImage is true */}
      {showBackgroundImage !== false && (
        <img
          alt={backgroundAlt}
          src={backgroundUrl}
          className="absolute inset-0 -z-10 size-full object-cover object-right md:object-center"
        />
      )}

      {/* Decorative shapes */}
      <div
        aria-hidden="true"
        className="hidden sm:absolute sm:-top-10 sm:right-1/2 sm:-z-10 sm:mr-10 sm:block sm:transform-gpu sm:blur-3xl"
      >
        <div
          style={{
            clipPath:
              'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
          }}
          className="aspect-[1097/845] w-[68.5625rem] bg-gradient-to-tr from-[#ff4694] to-[#776fff] opacity-20"
        />
      </div>
      <div
        aria-hidden="true"
        className="absolute -top-52 left-1/2 -z-10 -translate-x-1/2 transform-gpu blur-3xl sm:top-[-28rem] sm:ml-16 sm:translate-x-0 sm:transform-gpu"
      >
        <div
          style={{
            clipPath:
              'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
          }}
          className="aspect-[1097/845] w-[68.5625rem] bg-gradient-to-tr from-[#ff4694] to-[#776fff] opacity-20"
        />
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:mx-0">
          <h2 className="text-5xl font-semibold tracking-tight text-white sm:text-7xl">
            {headline}
          </h2>
          <p className="mt-8 text-lg font-medium text-pretty text-gray-300 sm:text-xl/8">
            {subheadline}
          </p>
        </div>
        <div className="mx-auto mt-10 max-w-2xl lg:mx-0 lg:max-w-none">
          <div className="grid grid-cols-1 gap-x-8 gap-y-6 text-base/7 font-semibold text-white sm:grid-cols-2 md:flex lg:gap-x-10">
            {/* Map over the links from Payload */}
            {finalLinks.map((link) => (
              <a key={link.id || link.name} href={link.href}>
                {link.name} <span aria-hidden="true">&rarr;</span>
              </a>
            ))}
          </div>
          <dl className="mt-16 grid grid-cols-1 gap-8 sm:mt-20 sm:grid-cols-2 lg:grid-cols-4">
            {/* Map over the stats from Payload */}
            {finalStats.map((stat) => (
              <div key={stat.id || stat.name} className="flex flex-col-reverse gap-1">
                <dt className="text-base/7 text-gray-300">{stat.name}</dt>
                <dd className="text-4xl font-semibold tracking-tight text-white">{stat.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  )
}
