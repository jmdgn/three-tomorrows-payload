import React from 'react'
import { Media } from '@/components/Media'
import { Hero as HeroType } from '@/payload-types'

type Props = {
  hero: HeroType
}

export const Hero: React.FC<Props> = ({ hero }) => {
  return (
    <section className="intro-section relative h-screen">
      <div className="foreground-elements absolute inset-0 flex flex-col justify-center items-center text-center z-10 px-4">
        <div className="heroTitle-container max-w-4xl">
          <div className="intro-title mb-6">
            <h1 className="text-5xl font-bold text-white">{hero.title}</h1>
          </div>
          <p className="body-large text-xl text-white mb-8">{hero.description}</p>
          <div className="anchorBtn-container">
            <div className="prompt-button text-white animate-bounce">
              Scroll to discover tomorrow
            </div>
          </div>
        </div>
      </div>

      {/* 3D Scene Containers */}
      <div className="midground-elements absolute inset-0 z-0">
        <div id="sphere-container" className="absolute inset-0"></div>
      </div>

      <div className="bubble-container absolute inset-0 z-0"></div>

      <div className="background-elements absolute inset-0 z-0">
        <div className="ocean-overlay absolute inset-0 bg-blue-900/20"></div>
        <div className="water-container absolute inset-0"></div>
      </div>
    </section>
  )
}
