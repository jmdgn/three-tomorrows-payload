'use client';

import React, { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Script from 'next/script';

export default function SceneInitializer() {
  const initAttemptedRef = useRef(false);
  const scriptsLoadedRef = useRef(false);
  const threeJsManagerRef = useRef(null);
  const pathname = usePathname();
  const isHomePage = pathname === '/';
  const containerCreationAttemptsRef = useRef(0);
  
  const showDebugInfo = process.env.NODE_ENV === 'development';
  
  // Create containers function - enhanced version
  const ensureContainers = () => {
    containerCreationAttemptsRef.current++;
    console.log(`Container creation attempt ${containerCreationAttemptsRef.current}`);
    
    let sceneContainer = document.getElementById('scene-container');
    let waterContainer = document.querySelector('.water-container');
    let sphereContainer = document.getElementById('sphere-container');
    
    // Create scene container if needed
    if (!sceneContainer) {
      console.log('Creating missing scene container');
      sceneContainer = document.createElement('div');
      sceneContainer.id = 'scene-container';
      sceneContainer.style.position = 'fixed';
      sceneContainer.style.top = '0';
      sceneContainer.style.left = '0';
      sceneContainer.style.width = '100%';
      sceneContainer.style.height = '100%';
      sceneContainer.style.zIndex = '-1';
      document.body.appendChild(sceneContainer);
    }
    
    // Find proper parent elements
    const introSection = document.querySelector('.intro-section');
    const backgroundElements = document.querySelector('.background-elements');
    const midgroundElements = document.querySelector('.midground-elements');
    
    // Create water container if needed
    if (!waterContainer) {
      console.log('Creating missing water container');
      waterContainer = document.createElement('div');
      waterContainer.className = 'water-container';
      waterContainer.style.display = "block";
      waterContainer.style.width = "100%";
      waterContainer.style.height = "100%";
      waterContainer.style.position = "absolute";
      waterContainer.style.top = "0";
      waterContainer.style.left = "0";
      waterContainer.style.opacity = "1";
      waterContainer.style.transition = "opacity 0.2s ease-out";
      
      // Try to place in the appropriate element
      if (backgroundElements) {
        backgroundElements.appendChild(waterContainer);
      } else if (sceneContainer) {
        sceneContainer.appendChild(waterContainer);
      } else {
        document.body.appendChild(waterContainer);
      }
    }
    
    // Create sphere container if needed
    if (!sphereContainer) {
      console.log('Creating missing sphere container');
      sphereContainer = document.createElement('div');
      sphereContainer.id = 'sphere-container';
      sphereContainer.style.opacity = "0";
      sphereContainer.style.transition = "opacity 0.4s ease-in-out";
      
      // Try to place in the appropriate element
      if (midgroundElements) {
        midgroundElements.appendChild(sphereContainer);
      } else if (sceneContainer) {
        sceneContainer.appendChild(sphereContainer);
      } else {
        document.body.appendChild(sphereContainer);
      }
    }
    
    return sceneContainer && waterContainer && sphereContainer;
  };
  
  // Main initialization function with retries
  const initializeThreeJs = async () => {
    if (!threeJsManagerRef.current) {
      try {
        const { default: manager } = await import('@/utilities/ThreeJsManager.client.js');
        threeJsManagerRef.current = manager;
      } catch (error) {
        console.error('Error loading ThreeJsManager:', error);
        return;
      }
    }
    
    if (!threeJsManagerRef.current) {
      console.error('ThreeJsManager not available');
      return;
    }
    
    console.log('Starting Three.js initialization');
    
    // Ensure containers exist first
    const containersExist = ensureContainers();
    
    if (containersExist) {
      threeJsManagerRef.current.setIsHomePage(true);
      
      if (showDebugInfo) {
        threeJsManagerRef.current.enableFpsMonitoring(true);
      }
      
      await threeJsManagerRef.current.initialize();
    } else {
      console.warn('Containers not available, could not initialize Three.js');
    }
  };
  
  useEffect(() => {
    if (!isHomePage) return;
    
    // Setup initialization with multiple retries
    const setupWithRetries = () => {
      // First attempt after load
      const initialDelayId = setTimeout(() => {
        if (!initAttemptedRef.current) {
          initAttemptedRef.current = true;
          initializeThreeJs();
        }
      }, 500);
      
      // Second attempt after 2 seconds
      const secondDelayId = setTimeout(() => {
        ensureContainers();
        if (scriptsLoadedRef.current) {
          initializeThreeJs();
        }
      }, 2000);
      
      // Final attempt after 5 seconds
      const finalDelayId = setTimeout(() => {
        ensureContainers();
        initializeThreeJs();
      }, 5000);
      
      return [initialDelayId, secondDelayId, finalDelayId];
    };
    
    const timeoutIds = setupWithRetries();
    
    return () => {
      timeoutIds.forEach(id => clearTimeout(id));
      
      if (isHomePage && threeJsManagerRef.current) {
        threeJsManagerRef.current.cleanup();
      }
    };
  }, [isHomePage]);
  
  useEffect(() => {
    if (!isHomePage && initAttemptedRef.current && threeJsManagerRef.current) {
      threeJsManagerRef.current.setIsHomePage(false);
      threeJsManagerRef.current.cleanup();
      initAttemptedRef.current = false;
    }
  }, [isHomePage]);
  
  if (!isHomePage) return null;
  
  return (
    <>
      {/* Load GSAP first - this is needed for animations */}
      <Script 
        id="gsap-script"
        src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js" 
        strategy="afterInteractive"
        onLoad={() => {
          console.log('GSAP loaded');
          scriptsLoadedRef.current = true;
          
          // Try initialization after scripts are loaded
          if (!initAttemptedRef.current) {
            initAttemptedRef.current = true;
            initializeThreeJs();
          }
        }}
      />
      
      {/* Optional debug info for development */}
      {showDebugInfo && (
        <div style={{ 
          position: 'fixed', 
          bottom: '10px', 
          right: '10px', 
          backgroundColor: 'rgba(0,0,0,0.5)', 
          color: 'white',
          padding: '10px',
          borderRadius: '5px',
          fontSize: '14px',
          zIndex: 9999,
          fontFamily: 'monospace',
          maxWidth: '300px',
          boxShadow: '0 0 10px rgba(0,0,0,0.5)'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
            Three.js Status: {initAttemptedRef.current ? '✅ Attempting' : '⏳ Waiting'}
          </div>
          <div>Homepage: {isHomePage ? '✅' : '❌'}</div>
          <div>Scripts Loaded: {scriptsLoadedRef.current ? '✅' : '❌'}</div>
          <div>Manager: {threeJsManagerRef.current ? '✅' : '❌'}</div>
          <div>Container Attempts: {containerCreationAttemptsRef.current}</div>
        </div>
      )}
    </>
  );
}