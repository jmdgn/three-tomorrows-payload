'use client'

import { useEffect } from 'react'

export function FooterEffects() {
  useEffect(() => {
    // Flag to check if component is mounted
    let isMounted = true;
    
    // Storage for timeouts for cleanup
    const timeouts = [];
    
    /* Footer Load Delay - with check if already visible */
    const delayFooterLoad = () => {
      const footer = document.querySelector("footer");

      if (footer) {
        // Check if already visible
        const currentDisplay = window.getComputedStyle(footer).display;
        
        if (currentDisplay === "none") {
          // Delay the appearance of the footer
          const timeoutId = setTimeout(() => {
            if (!isMounted) return;
            
            footer.style.display = "block";

            // Fade in effect
            const fadeTimeoutId = setTimeout(() => {
              if (!isMounted) return;
              
              footer.style.transition = "opacity 0.5s ease-in-out";
              footer.style.opacity = "1";
            }, 50); // Small delay to ensure display change applies before transition
            
            timeouts.push(fadeTimeoutId);
          }, 2000);
          
          timeouts.push(timeoutId);
        }
      }
    };

    // Initialize footer animation
    delayFooterLoad();

    // Return cleanup function to remove timeouts
    return () => {
      isMounted = false;
      
      // Clean up timeouts
      timeouts.forEach(timeoutId => clearTimeout(timeoutId));
    };
  }, []); // Empty dependency array means this effect runs once on mount

  return null; // This component doesn't render anything
}