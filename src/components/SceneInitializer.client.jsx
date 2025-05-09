'use client'

import React, { useEffect, useState, useRef } from 'react'
import Script from 'next/script'

/**
 * Final version of SceneInitializer that works with your specific setup
 */
export default function SceneInitializer() {
  // Track container status
  const [containers, setContainers] = useState({
    scene: false,
    water: false,
    sphere: false
  })
  
  const [initialized, setInitialized] = useState(false)
  const [debug, setDebug] = useState({
    message: 'Initializing...',
    threejs: false
  })
  
  // Refs to track initialization state
  const initAttemptedRef = useRef(false)
  const timeoutsRef = useRef([])
  
  // Main initialization effect
  useEffect(() => {
    if (initAttemptedRef.current) return
    initAttemptedRef.current = true
    
    // Clear timeouts on unmount
    return () => {
      timeoutsRef.current.forEach(clearTimeout)
    }
  }, [])
  
  // Effect to check containers and initialize Three.js
  useEffect(() => {
    // Find or create required containers
    const checkAndCreateContainers = () => {
      let sceneContainer = document.getElementById('scene-container')
      let waterContainer = document.querySelector('.water-container')
      let sphereContainer = document.getElementById('sphere-container')
      
      // Create any missing containers
      if (!sceneContainer) {
        console.log('Creating missing scene container')
        sceneContainer = document.createElement('div')
        sceneContainer.id = 'scene-container'
        document.body.appendChild(sceneContainer)
      }
      
      const backgroundElements = document.querySelector('.background-elements')
      if (!waterContainer) {
        console.log('Creating missing water container')
        waterContainer = document.createElement('div')
        waterContainer.className = 'water-container'
        
        // Add to background elements if available, otherwise to body
        if (backgroundElements) {
          backgroundElements.appendChild(waterContainer)
        } else {
          document.body.appendChild(waterContainer)
        }
      }
      
      // Apply critical styles
      if (waterContainer) {
        waterContainer.style.display = "block"
        waterContainer.style.width = "100%"
        waterContainer.style.height = "100%"
        waterContainer.style.position = "absolute"
        waterContainer.style.top = "0"
        waterContainer.style.left = "0"
        waterContainer.style.opacity = "1"
        waterContainer.style.transition = "opacity 0.2s ease-out"
      }
      
      if (!sphereContainer) {
        console.log('Creating missing sphere container')
        sphereContainer = document.createElement('div')
        sphereContainer.id = 'sphere-container'
        
        // Add to background elements if available, otherwise to body
        if (backgroundElements) {
          backgroundElements.appendChild(sphereContainer)
        } else {
          document.body.appendChild(sphereContainer)
        }
        
        // Set initial opacity
        sphereContainer.style.opacity = "0"
        sphereContainer.style.transition = "opacity 0.4s ease-in-out"
      }
      
      // Update container state
      setContainers({
        scene: !!sceneContainer,
        water: !!waterContainer,
        sphere: !!sphereContainer
      })
      
      return {
        sceneContainer,
        waterContainer,
        sphereContainer
      }
    }
    
    // Use Three.js from the ThreeProvider instead of loading from CDN
    const setupThreeJS = () => {
      // Wait for ThreeJS to be available through your original mechanism
      if (window.THREE) {
        setDebug(prev => ({ ...prev, threejs: true, message: 'THREE found globally' }))
        
        // Initialize the scenes directly
        initializeScenes()
        return true
      }
      
      // If THREE isn't available yet, schedule another check
      console.log('THREE not found yet, waiting...')
      setDebug(prev => ({ ...prev, message: 'Waiting for THREE to be available' }))
      
      const timeoutId = setTimeout(() => {
        if (window.THREE) {
          setDebug(prev => ({ ...prev, threejs: true, message: 'THREE now available' }))
          initializeScenes()
        } else {
          // Final fallback: Try to load THREE directly if not found after waiting
          console.log('THREE still not found, trying to load directly')
          setDebug(prev => ({ ...prev, message: 'Loading THREE from CDN' }))
          
          // Create a script element to load Three.js
          const threeScript = document.createElement('script')
          threeScript.src = 'https://cdn.jsdelivr.net/npm/three@0.155.0/build/three.min.js'
          threeScript.onload = () => {
            setDebug(prev => ({ ...prev, threejs: true, message: 'THREE loaded from CDN' }))
            
            // Load required modules after THREE is loaded
            const loadModules = () => {
              const modules = [
                { name: 'OrbitControls', path: 'https://cdn.jsdelivr.net/npm/three@0.155.0/examples/js/controls/OrbitControls.js' },
                { name: 'Water', path: 'https://cdn.jsdelivr.net/npm/three@0.155.0/examples/js/objects/Water.js' },
                { name: 'Sky', path: 'https://cdn.jsdelivr.net/npm/three@0.155.0/examples/js/objects/Sky.js' },
                { name: 'RGBELoader', path: 'https://cdn.jsdelivr.net/npm/three@0.155.0/examples/js/loaders/RGBELoader.js' }
              ]
              
              let modulesLoaded = 0
              
              modules.forEach(module => {
                const script = document.createElement('script')
                script.src = module.path
                script.onload = () => {
                  modulesLoaded++
                  if (modulesLoaded === modules.length) {
                    initializeScenes()
                  }
                }
                document.body.appendChild(script)
              })
            }
            
            loadModules()
          }
          document.body.appendChild(threeScript)
        }
      }, 1500)
      
      timeoutsRef.current.push(timeoutId)
      return false
    }
    
    // Initialize scene scripts when THREE is available
    const initializeScenes = () => {
      if (initialized) return
      setInitialized(true)
      
      console.log('Initializing scenes with THREE:', !!window.THREE)
      setDebug(prev => ({ ...prev, message: 'Initializing scenes' }))
      
      // Make sure containers exist
      const { sceneContainer, waterContainer, sphereContainer } = checkAndCreateContainers()
      
      // Create a safe initialization script
      const setupScript = document.createElement('script')
      setupScript.innerHTML = `
  // Safe initialization function
  function safeInitScenes() {
    console.log('Safe scene initialization started');
    
    // First try to use THREE from the global scope (your ThreeProvider)
    const hasThreeJS = typeof window.THREE !== 'undefined';
    
    // Log available constructors
    console.log('Available constructors:', {
      THREE: !!window.THREE,
      OrbitControls: !!window.OrbitControls,
      Water: !!window.Water,
      Sky: !!window.Sky,
      RGBELoader: !!window.RGBELoader
    });
    
    if (!hasThreeJS) {
      console.error('THREE is not available, cannot initialize scenes');
      return;
    }
    
    // Only initialize if scenes aren't already running
    if (window.renderer && window.animationId) {
      console.log('Scenes already running, skipping initialization');
      return;
    }
    
    // Clear existing animation frames to prevent conflicts
    if (window.animationId) {
      cancelAnimationFrame(window.animationId);
      window.animationId = null;
    }
    
    // Initialize ocean scene if possible
    if (typeof window.initOceanScene === 'function' && !window.renderer) {
      console.log('Initializing ocean scene');
      try {
        window.initOceanScene();
        console.log('Ocean scene initialized successfully');
      } catch(e) {
        console.error('Failed to initialize ocean scene:', e);
      }
    } else {
      if (window.renderer) {
        console.log('Renderer already exists, skipping ocean scene initialization');
      } else {
        console.log('Loading ocean scene script');
        const oceanScript = document.createElement('script');
        oceanScript.src = '/scripts/landing/scenes/oceanScene.js';
        oceanScript.type = 'module';
        oceanScript.onload = () => {
          if (typeof window.initOceanScene === 'function' && !window.renderer) {
            try {
              window.initOceanScene();
              console.log('Ocean scene initialized from loaded script');
            } catch(e) {
              console.error('Failed to initialize ocean scene:', e);
            }
          }
        };
        document.body.appendChild(oceanScript);
      }
    }
    
    // Initialize sphere scene only if needed
    if (typeof window.initSphereScene === 'function' && !window.sphere) {
      console.log('Initializing sphere scene');
      try {
        window.initSphereScene();
        console.log('Sphere scene initialized successfully');
      } catch(e) {
        console.error('Failed to initialize sphere scene:', e);
      }
    } else {
      if (window.sphere) {
        console.log('Sphere already exists, skipping sphere scene initialization');
      } else {
        console.log('Loading sphere scene script');
        const sphereScript = document.createElement('script');
        sphereScript.src = '/scripts/landing/scenes/sphereScene.js';
        sphereScript.type = 'module';
        sphereScript.onload = () => {
          if (typeof window.initSphereScene === 'function' && !window.sphere) {
            try {
              window.initSphereScene();
              console.log('Sphere scene initialized from loaded script');
            } catch(e) {
              console.error('Failed to initialize sphere scene:', e);
            }
          }
        };
        document.body.appendChild(sphereScript);
      }
    }
    
    // Monitor animation status
    window.addEventListener('visibilitychange', function() {
      if (document.visibilityState === 'hidden') {
        console.log('Page hidden, pausing animation');
        window._animationPaused = true;
      } else {
        console.log('Page visible, resuming animation');
        window._animationPaused = false;
        
        // Check if animation needs restarting
        if (!window.animationId && window.renderer && window.scene && window.camera) {
          console.log('Restarting animation loop');
          
          // Create a simple animation function if one doesn't exist
          if (typeof window.animate !== 'function') {
            window.animate = function() {
              if (window._animationPaused) return;
              
              if (window.water && window.water.material && window.water.material.uniforms) {
                window.water.material.uniforms.time.value += 0.3 / 60.0;
              }
              
              if (window.controls) {
                window.controls.update();
              }
              
              if (window.renderer && window.scene && window.camera) {
                window.renderer.render(window.scene, window.camera);
              }
              
              window.animationId = requestAnimationFrame(window.animate);
            };
          }
          
          window.animationId = requestAnimationFrame(window.animate);
        }
      }
    });
  }
  
  // Run initialization
  safeInitScenes();
  
  // Re-check animation status after a delay
  setTimeout(function() {
    if (!window.animationId && window.renderer && window.scene && window.camera) {
      console.log('Animation not running after initialization, restarting');
      if (typeof window.animate === 'function') {
        window.animationId = requestAnimationFrame(window.animate);
      }
    }
  }, 2000);
`
      document.body.appendChild(setupScript)
    }
    
    // Run the initialization sequence
    console.log('Starting initialization sequence')
    
    // First check and create containers
    checkAndCreateContainers()
    
    // Then setup ThreeJS
    const success = setupThreeJS()
    
    if (!success) {
      // If initial setup wasn't successful, try again after delay
      const timeoutId = setTimeout(() => {
        if (!initialized) {
          console.log('Retrying initialization after delay')
          setDebug(prev => ({ ...prev, message: 'Retrying initialization' }))
          setupThreeJS()
        }
      }, 2000)
      
      timeoutsRef.current.push(timeoutId)
    }
  }, [initialized])
  
  // Add a visual indicator for debugging - only in development
  const isDev = process.env.NODE_ENV === 'development'
  
  return (
    <>
      {/* Include GSAP for animations */}
      <Script 
        src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js" 
        strategy="beforeInteractive"
      />
      
      {isDev && (
        <div style={{ 
          position: 'fixed', 
          bottom: '10px', 
          right: '10px', 
          backgroundColor: initialized ? 'rgba(0,128,0,0.6)' : 'rgba(255,0,0,0.6)', 
          padding: '10px',
          borderRadius: '5px',
          fontSize: '14px',
          zIndex: 9999,
          color: 'white',
          fontFamily: 'monospace',
          maxWidth: '300px',
          boxShadow: '0 0 10px rgba(0,0,0,0.5)'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
            Three.js Status: {initialized ? '✅ Active' : '⏳ Loading'}
          </div>
          <div>Message: {debug.message}</div>
          <div>THREE.js: {debug.threejs ? '✅' : '❌'}</div>
          <div>
            Containers: scene: {containers.scene ? '✅' : '❌'}, 
            water: {containers.water ? '✅' : '❌'}, 
            sphere: {containers.sphere ? '✅' : '❌'}
          </div>
        </div>
      )}
    </>
  )
}