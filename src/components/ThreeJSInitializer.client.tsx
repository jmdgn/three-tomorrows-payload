'use client'

import React, { useEffect, useState } from 'react'
import Script from 'next/script'
import { usePathname } from 'next/navigation'

export const ThreeJSInitializer = () => {
  const pathname = usePathname()
  const isHomePage = pathname === '/'
  const [scriptsLoaded, setScriptsLoaded] = useState(false)

  // Only perform initialization on homepage
  if (!isHomePage) return null

  const handleScriptsLoaded = () => {
    setScriptsLoaded(true)
    console.log('ThreeJSInitializer: All Three.js libraries loaded')
  }

  return (
    <>
      {/* Load Three.js dependencies sequentially */}
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"
        strategy="beforeInteractive"
        onLoad={() => console.log('GSAP loaded')}
      />

      <Script
        src="https://esm.sh/three@0.155.0"
        strategy="beforeInteractive"
        onLoad={() => console.log('THREE core loaded')}
      />

      <Script
        src="https://esm.sh/three@0.155.0/examples/jsm/controls/OrbitControls.js"
        strategy="beforeInteractive"
        onLoad={() => console.log('OrbitControls loaded')}
      />

      <Script
        src="https://esm.sh/three@0.155.0/examples/jsm/loaders/RGBELoader.js"
        strategy="beforeInteractive"
        onLoad={() => console.log('RGBELoader loaded')}
      />

      <Script
        src="https://esm.sh/three@0.155.0/examples/jsm/objects/Water.js"
        strategy="beforeInteractive"
        onLoad={() => console.log('Water loaded')}
      />

      <Script
        src="https://esm.sh/three@0.155.0/examples/jsm/objects/Sky.js"
        strategy="beforeInteractive"
        onLoad={handleScriptsLoaded}
      />

      {/* Separate initialization script that runs after all dependencies are loaded */}
      <Script
        id="threejs-initializer-script"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            // Set up a more reliable initialization function
            window._initThreeJSComplete = false;
            
            window.initThreeJSFully = function() {
              if (window._initThreeJSComplete) {
                console.log('ThreeJS already fully initialized');
                return;
              }
              
              // 1. Check if all required global variables are available
              if (!window.THREE || !window.OrbitControls || !window.Water || !window.Sky) {
                console.warn('ThreeJS libraries not fully loaded yet, scheduling retry');
                setTimeout(window.initThreeJSFully, 100);
                return;
              }
              
              // 2. Check if containers exist
              const sceneContainer = document.getElementById('scene-container');
              const waterContainer = document.querySelector('.water-container');
              const sphereContainer = document.getElementById('sphere-container');
              
              if (!sceneContainer || !waterContainer || !sphereContainer) {
                console.warn('Scene containers not ready yet', { 
                  scene: !!sceneContainer, 
                  water: !!waterContainer, 
                  sphere: !!sphereContainer 
                });
                
                // Try again after a short delay
                setTimeout(window.initThreeJSFully, 100);
                return;
              }
              
              console.log('All ThreeJS dependencies and containers are ready');
              
              // Now we can safely call the regular initialization
              if (window.initThreeJS && !window.threeJSInitialized) {
                window.threeJSInitialized = true;
                window.initThreeJS()
                  .then(() => {
                    console.log('ThreeJS initialized successfully');
                    window._initThreeJSComplete = true;
                    
                    // Now load scene scripts
                    if (typeof window.initOceanScene !== 'function') {
                      const oceanScript = document.createElement('script');
                      oceanScript.src = '/scripts/landing/scenes/oceanScene.js';
                      oceanScript.type = 'module';
                      document.body.appendChild(oceanScript);
                    }
                    
                    if (typeof window.initSphereScene !== 'function') {
                      const sphereScript = document.createElement('script');
                      sphereScript.src = '/scripts/landing/scenes/sphereScene.js';
                      sphereScript.type = 'module';
                      document.body.appendChild(sphereScript);
                    }
                  })
                  .catch(err => {
                    console.error('Error initializing ThreeJS:', err);
                    window.threeJSInitialized = false;
                  });
              }
            };
            
            // Schedule initialization when DOM is fully loaded
            if (document.readyState === 'complete') {
              setTimeout(window.initThreeJSFully, 100);
            } else {
              window.addEventListener('load', function() {
                setTimeout(window.initThreeJSFully, 100);
              });
              
              // Backup initialization after a delay
              setTimeout(window.initThreeJSFully, 1000);
            }
          `,
        }}
      />
    </>
  )
}

export default ThreeJSInitializer
