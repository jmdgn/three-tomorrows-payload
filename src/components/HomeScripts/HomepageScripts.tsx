'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import Script from 'next/script'

export function HomepageScripts() {
  const [isHomePage, setIsHomePage] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const isCurrentlyHomePage = window.location.pathname === '/'
    setIsHomePage(isCurrentlyHomePage)
    
    if (isCurrentlyHomePage) {
      console.log('HomepageScripts: On homepage, preparing environment')
      
      if (window._sceneInitialized) {
        window._sceneInitialized = false
      }
      
      const shouldInitialize = !window.threeJSInitialized
      
      if (shouldInitialize && typeof window.initThreeJS === 'function') {
        console.log('HomepageScripts: Initializing Three.js')
        window.threeJSInitialized = true
        
        setTimeout(() => {
          window.initThreeJS().catch(err => {
            console.error('Error initializing Three.js:', err)
            window.threeJSInitialized = false
          })
        }, 100)
      }
    }
  }, [pathname])

  if (!isHomePage) return null

  return (
    <>
      <Script 
        src="https://code.jquery.com/jquery-3.6.4.min.js" 
        strategy="afterInteractive" 
        async
      />
      
      <Script 
        id="three-js-loader" 
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            // Performance optimization helpers
            function throttle(func, limit) {
              let inThrottle;
              return function(...args) {
                if (!inThrottle) {
                  func.apply(this, args);
                  inThrottle = true;
                  setTimeout(() => inThrottle = false, limit);
                }
              };
            }

            // Setup performance management functions
            function setupPerformanceManagement() {
              if (window._performanceSetup) return;
              window._performanceSetup = true;
              
              // Setup variables to track scene state
              window._isViewportFocused = true;
              window._isServicePanelVisible = false;
              window._frameCount = 0;
              
              // Monitor for service panel visibility
              const servicePanel = document.querySelector('.service-panel');
              if (servicePanel && 'IntersectionObserver' in window) {
                const servicePanelObserver = new IntersectionObserver((entries) => {
                  entries.forEach(entry => {
                    window._isServicePanelVisible = entry.isIntersecting;
                  });
                }, { threshold: 0.1 });
                
                servicePanelObserver.observe(servicePanel);
              }
              
              // Check if scene is visible in viewport
              if ('IntersectionObserver' in window) {
                const viewportObserver = new IntersectionObserver((entries) => {
                  entries.forEach(entry => {
                    window._isViewportFocused = entry.isIntersecting;
                  });
                }, { threshold: 0.05 });
                
                // Start observing the scene container
                const container = document.getElementById('scene-container');
                if (container) {
                  window._sceneContainer = container;
                  viewportObserver.observe(container);
                }
              }
              
              // Apply optimizations if renderer exists
              if (window.renderer) {
                applyRendererOptimizations();
              } else {
                // Set up a listener to apply optimizations when renderer is created
                window.addEventListener('renderer-created', applyRendererOptimizations, { once: true });
              }
            }
            
            function applyRendererOptimizations() {
              if (!window.renderer) return;
              
              // Enable power preference for better performance
              window.renderer.powerPreference = "high-performance";
              
              // Ensure pixelRatio is set appropriately
              const pixelRatio = Math.min(window.devicePixelRatio, 2);
              window.renderer.setPixelRatio(pixelRatio);
              
              // Apply appropriate antialias mode
              if (window._qualityLevel === 'high' && window.renderer.antialias !== undefined) {
                window.renderer.antialias = true;
              }
              
              // Optimize renderer settings
              if (window.THREE) {
                if (window.renderer.shadowMap) {
                  window.renderer.shadowMap.enabled = true;
                  window.renderer.shadowMap.type = window.THREE.PCFSoftShadowMap;
                }
                
                if (window.renderer.outputEncoding !== undefined) {
                  window.renderer.outputEncoding = window.THREE.sRGBEncoding;
                }
                
                if (window.renderer.toneMapping !== undefined) {
                  window.renderer.toneMapping = window.THREE.ACESFilmicToneMapping;
                  window.renderer.toneMappingExposure = 0.6;
                }
              }
            }
            
            // Memory management for Three.js scenes
            function setupMemoryManagement() {
              if (window._memoryManagementSetup) return;
              window._memoryManagementSetup = true;
              
              // Create LOD (Level of Detail) handler
              window._updateLOD = function() {
                if (!window.scene) return;
                
                const isServicePanelVisible = window._isServicePanelVisible === true;
                const isScrolling = window._isScrolling === true;
                
                // Reduce complexity when appropriate
                const shouldReduceDetail = isServicePanelVisible || isScrolling;
                
                // Apply LOD to water if it exists
                if (window.water && window.water.material) {
                  if (shouldReduceDetail && window.water.material.uniforms && window.water.material.uniforms.size) {
                    // Store original value if not already stored
                    if (!window._originalWaterSize && window.water.material.uniforms.size.value) {
                      window._originalWaterSize = window.water.material.uniforms.size.value;
                    }
                    
                    // Reduce detail during heavy load times
                    if (window._originalWaterSize) {
                      // Subtle change that maintains quality while improving performance
                      window.water.material.uniforms.size.value = window._originalWaterSize * 1.2;
                    }
                  } else if (window._originalWaterSize) {
                    // Restore original detail
                    window.water.material.uniforms.size.value = window._originalWaterSize;
                  }
                }
              };
              
              // Apply LOD updates on scroll
              let isScrolling = false;
              let scrollTimeout;
              
              const scrollHandler = () => {
                window._isScrolling = true;
                isScrolling = true;
                
                if (window._updateLOD) {
                  window._updateLOD();
                }
                
                clearTimeout(scrollTimeout);
                scrollTimeout = setTimeout(() => {
                  window._isScrolling = false;
                  isScrolling = false;
                  
                  if (window._updateLOD) {
                    window._updateLOD();
                  }
                }, 200);
              };
              
              window.addEventListener('scroll', throttle(scrollHandler, 100), { passive: true });
            }

            // Initialize Three.js when ready
            window.addEventListener('three-loaded', function() {
              console.log('Three.js loaded event received, setting up optimizations');
              setupPerformanceManagement();
              setupMemoryManagement();
            });
            
            // Check if quality should be reduced for mobile
            function detectDeviceCapabilities() {
              const isMobile = (window.innerWidth <= 768) || 
                              ('ontouchstart' in window) || 
                              (navigator.maxTouchPoints > 0);
                              
              const isLowEndDevice = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4;
              
              // Set quality level based on device capabilities
              window._qualityLevel = (isMobile || isLowEndDevice) ? 'low' : 'high';
              
              console.log('Device quality level set to:', window._qualityLevel);
            }
            
            // Run device detection
            detectDeviceCapabilities();
            
            // If THREE is already available, set up optimizations
            if (window.THREE) {
              setupPerformanceManagement();
              setupMemoryManagement();
            }
          `
        }}
      />
    </>
  )
}

export function HomepageSceneContainer() {
  const pathname = usePathname()
  const isHomePage = pathname === '/'
  
  if (!isHomePage) return null
  
  return <div id="scene-container" />
}