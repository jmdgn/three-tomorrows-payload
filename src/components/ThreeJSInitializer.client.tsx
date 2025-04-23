'use client'

import React, { useEffect } from 'react'
import Script from 'next/script'

export const ThreeJSInitializer = () => {
  useEffect(() => {
    const loadScripts = async () => {
      const sceneScripts = [
        '/scripts/landing/scenes/oceanScene.js',
        '/scripts/landing/scenes/sphereScene.js', 
        '/scripts/landing/scenes/bubblesScene.js'
      ]

      for (const script of sceneScripts) {
        try {
          await new Promise((resolve, reject) => {
            const scriptEl = document.createElement('script')
            scriptEl.src = script
            scriptEl.type = 'module'
            scriptEl.onload = resolve
            scriptEl.onerror = reject
            document.body.appendChild(scriptEl)
          })
        } catch (error) {
          console.error('Error loading script:', script, error)
        }
      }
    }

    loadScripts()
  }, [])

  return (
    <>
      <Script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js" strategy="beforeInteractive" />
      <Script src="https://esm.sh/three@0.155.0" strategy="beforeInteractive" />
      <Script src="https://esm.sh/three@0.155.0/examples/jsm/controls/OrbitControls.js" strategy="beforeInteractive" />
      <Script src="https://esm.sh/three@0.155.0/examples/jsm/loaders/RGBELoader.js" strategy="beforeInteractive" />
      <Script src="https://esm.sh/three@0.155.0/examples/jsm/objects/Water.js" strategy="beforeInteractive" />
      <Script src="https://esm.sh/three@0.155.0/examples/jsm/objects/Sky.js" strategy="beforeInteractive" />
    </>
  )
}
