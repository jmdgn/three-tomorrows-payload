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
  
  const showDebugInfo = process.env.NODE_ENV === 'development';
  
  useEffect(() => {
    if (!isHomePage) {
      console.log('Not on homepage, skipping Three.js initialization');
      return;
    }
    
    if (initAttemptedRef.current) {
      console.log('Initialization already attempted');
      return;
    }
    
    initAttemptedRef.current = true;
    
    const loadManager = async () => {
      try {
        const { default: manager } = await import('@/utilities/ThreeJsManager.client.js');
        threeJsManagerRef.current = manager;
        
        if (document.readyState === 'complete') {
          initializeThreeJs();
        } else {
          window.addEventListener('load', initializeThreeJs, { once: true });
        }
      } catch (error) {
        console.error('Error loading ThreeJsManager:', error);
      }
    };
    
    const ensureContainers = () => {
      let sceneContainer = document.getElementById('scene-container');
      let waterContainer = document.querySelector('.water-container');
      let sphereContainer = document.getElementById('sphere-container');
      
      if (!sceneContainer) {
        console.log('Creating missing scene container');
        sceneContainer = document.createElement('div');
        sceneContainer.id = 'scene-container';
        document.body.appendChild(sceneContainer);
      }
      
      const backgroundElements = document.querySelector('.background-elements');
      if (!waterContainer) {
        console.log('Creating missing water container');
        waterContainer = document.createElement('div');
        waterContainer.className = 'water-container';
        
        if (backgroundElements) {
          backgroundElements.appendChild(waterContainer);
        } else {
          document.body.appendChild(waterContainer);
        }
      }
      
      if (waterContainer) {
        waterContainer.style.display = "block";
        waterContainer.style.width = "100%";
        waterContainer.style.height = "100%";
        waterContainer.style.position = "absolute";
        waterContainer.style.top = "0";
        waterContainer.style.left = "0";
        waterContainer.style.opacity = "1";
        waterContainer.style.transition = "opacity 0.2s ease-out";
      }
      
      if (!sphereContainer) {
        console.log('Creating missing sphere container');
        sphereContainer = document.createElement('div');
        sphereContainer.id = 'sphere-container';
        
        if (backgroundElements) {
          backgroundElements.appendChild(sphereContainer);
        } else {
          document.body.appendChild(sphereContainer);
        }
        
        sphereContainer.style.opacity = "0";
        sphereContainer.style.transition = "opacity 0.4s ease-in-out";
      }
      
      return {
        sceneContainer,
        waterContainer,
        sphereContainer
      };
    };
    
    const initializeThreeJs = async () => {
      if (!scriptsLoadedRef.current) {
        console.log('GSAP not loaded yet, deferring initialization');
        return;
      }
      
      if (!threeJsManagerRef.current) {
        console.log('ThreeJsManager not available yet');
        return;
      }
      
      console.log('Starting Three.js initialization');
      
      ensureContainers();
      
      threeJsManagerRef.current.setIsHomePage(true);
      
      if (showDebugInfo) {
        threeJsManagerRef.current.enableFpsMonitoring(true);
      }
      
      await threeJsManagerRef.current.initialize();
    };
    
    loadManager();
    
    return () => {
      if (isHomePage && threeJsManagerRef.current) {
        threeJsManagerRef.current.cleanup();
      }
      
      window.removeEventListener('load', initializeThreeJs);
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
        </div>
      )}
    </>
  );
}