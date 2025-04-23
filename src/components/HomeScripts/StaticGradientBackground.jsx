'use client'

import React, { useEffect } from 'react';

export function StaticGradientBackground() {
  useEffect(() => {
    // Find the target container to modify
    const targetContainer = document.querySelector('.factAssets-container');
    if (!targetContainer) {
      console.warn('Target container .factAssets-container not found');
      return;
    }

    // Create and inject the CSS
    const styleElement = document.createElement('style');
    styleElement.innerHTML = `
      /* Static mesh gradient that matches the reference image */
      .static-gradient-container {
        position: relative;
        background-color: #000428;
        overflow: hidden;
        height: 100%;
        width: 100%;
      }
      
      .static-gradient-bg {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        overflow: hidden;
        z-index: 0;
      }
      
      /* Static gradient elements */
      .gradient-element {
        position: absolute;
        border-radius: 50%;
        filter: blur(60px);
      }
      
      /* Dark blue center */
      .gradient-element.dark-center {
        background-color: #000428;
        width: 70%;
        height: 70%;
        top: 15%;
        left: 15%;
        filter: blur(40px);
      }
      
      /* Bottom blue glow */
      .gradient-element.bottom-blue {
        background-color: #0046B8;
        width: 80%;
        height: 40%;
        bottom: -5%;
        left: 10%;
        filter: blur(80px);
        opacity: 0.7;
      }
      
      /* Top-right highlight */
      .gradient-element.top-light {
        background-color: #3B6AD8;
        width: 40%;
        height: 40%;
        top: -10%;
        right: 10%;
        filter: blur(70px);
        opacity: 0.5;
      }
      
      /* Left highlight */
      .gradient-element.left-light {
        background-color: #0B84D2;
        width: 30%;
        height: 35%;
        top: 30%;
        left: -10%;
        filter: blur(60px);
        opacity: 0.4;
      }
      
      /* Static overlay to enhance contrast in center */
      .vignette-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: radial-gradient(
          circle at center,
          transparent 30%,
          rgba(0, 4, 40, 0.4) 70%,
          rgba(0, 4, 40, 0.7) 100%
        );
        z-index: 1;
      }
    `;
    document.head.appendChild(styleElement);

    // Create wrapper element for maintaining existing structure
    const gradientContainer = document.createElement('div');
    gradientContainer.className = 'static-gradient-container';
    
    // Create the gradient elements
    const gradientElement = document.createElement('div');
    gradientElement.className = 'static-gradient-bg';
    
    // Create static blobs
    const elements = [
      { className: 'gradient-element dark-center' },
      { className: 'gradient-element bottom-blue' },
      { className: 'gradient-element top-light' },
      { className: 'gradient-element left-light' }
    ];
    
    elements.forEach(el => {
      const element = document.createElement('div');
      element.className = el.className;
      gradientElement.appendChild(element);
    });
    
    // Create vignette overlay for depth
    const vignette = document.createElement('div');
    vignette.className = 'vignette-overlay';
    gradientElement.appendChild(vignette);
    
    // Save original background
    const originalBackground = targetContainer.style.background;
    
    // Apply our gradient
    targetContainer.style.background = 'transparent';
    gradientContainer.appendChild(gradientElement);
    
    // Move existing children into our container to maintain structure
    Array.from(targetContainer.children).forEach(child => {
      gradientContainer.appendChild(child);
    });
    
    // Add our container to the target
    targetContainer.appendChild(gradientContainer);

    // Cleanup function
    return () => {
      document.head.removeChild(styleElement);
      
      // Restore original styles
      targetContainer.style.background = originalBackground;
      
      // Move all children back to the original container
      while (gradientContainer.firstChild) {
        targetContainer.appendChild(gradientContainer.firstChild);
      }
      
      // Remove our container
      if (gradientContainer.parentNode) {
        gradientContainer.parentNode.removeChild(gradientContainer);
      }
    };
  }, []);

  return null; // This component doesn't render any visible JSX
}

export default StaticGradientBackground;