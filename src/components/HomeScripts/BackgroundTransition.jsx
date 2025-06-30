import { useEffect } from "react";

const BackgroundTransition = () => {
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const styleTag = document.createElement('style');
    styleTag.innerHTML = `
      /* Background section with dots only */
      #background.bkgnd {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100vh;
        background: radial-gradient(circle at center, rgba(0,0,0,0.08) 1px, transparent 1px);
        background-size: 20px 20px;
        opacity: 0;
        z-index: 0;
        transition: opacity 0.8s cubic-bezier(0.22, 1, 0.36, 1);
      }
      
      .ocean-overlay {
        background: 
          radial-gradient(circle at center, rgba(0,0,0,0.08) 1px, transparent 1px),
          linear-gradient(180deg, #F9F9F9 0%, #F9F9F9 100%);
        background-size: 20px 20px, 100% 100%;
        transition: background 0.8s cubic-bezier(0.22, 1, 0.36, 1);
      }
      
      .ocean-overlay.green-phase {
        background: linear-gradient(180deg, #3BE494 0%, #3BE494 100%);
        background-size: 100% 100%;
      }
      
      .ocean-overlay.contact-phase {
        background: 
          radial-gradient(circle at center, rgba(0,0,0,0.08) 1px, transparent 1px),
          linear-gradient(180deg, #F9F9F9 0%, #F9F9F9 100%);
        background-size: 20px 20px, 100% 100%;
      }
      
      .ocean-overlay.transition-phase {
        /* This will be dynamically updated via JS */
      }
      
      /* Dot pattern variations for different phases */
      .ocean-overlay.dots-visible {
        background: 
          radial-gradient(circle at center, rgba(0,0,0,0.08) 1px, transparent 1px),
          linear-gradient(180deg, #F9F9F9 0%, #F9F9F9 100%);
        background-size: 20px 20px, 100% 100%;
      }
      
      .ocean-overlay.dots-hidden {
        background-size: 100% 100%;
      }
      
      /* Ensure main doesn't interfere */
      main {
        background: transparent !important;
      }
    `;
    document.head.appendChild(styleTag);
    
    let isMounted = true;
    let animationFrameId = null;
    
    const specialColor = "#3BE494";
    const startGradientTop = "#F9F9F9";
    const startGradientBottom = "#F9F9F9";
    const contactTop = "#F9F9F9";
    const contactBottom = "#F9F9F9";

    const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
    const easeOutCubic = (x) => 1 - Math.pow(1 - x, 3);

    const interpolateColor = (color1, color2, factor) => {
      const hexToRgb = (hex) => {
        hex = hex.replace("#", "");
        return {
          r: parseInt(hex.substring(0, 2), 16),
          g: parseInt(hex.substring(2, 4), 16),
          b: parseInt(hex.substring(4, 6), 16),
        };
      };

      const rgbToHex = ({ r, g, b }) => {
        const toHex = (c) => c.toString(16).padStart(2, "0");
        return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
      };

      const c1 = hexToRgb(color1);
      const c2 = hexToRgb(color2);
      return rgbToHex({
        r: Math.round(c1.r + (c2.r - c1.r) * factor),
        g: Math.round(c1.g + (c2.g - c1.g) * factor),
        b: Math.round(c1.b + (c2.b - c1.b) * factor),
      });
    };

    // Helper function to determine if a color is close to #F9F9F9 (should show dots)
    const shouldShowDots = (color) => {
      // Remove # and convert to RGB
      const hex = color.replace("#", "");
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      
      // #F9F9F9 is RGB(249, 249, 249)
      // Show dots if the color is close to this light gray
      const threshold = 30; // Adjust this to control when dots appear/disappear
      return Math.abs(r - 249) < threshold && Math.abs(g - 249) < threshold && Math.abs(b - 249) < threshold;
    };

    const updateBackground = () => {
      if (!isMounted) return;

      const backgroundSection = document.querySelector("#background.bkgnd");
      const overlay = document.querySelector(".ocean-overlay");
      const factTextContainer = document.querySelector(".factText-container");
      const factoidContent = document.querySelector(".factoidContent-full") || factTextContainer;
      const contactPanel = document.querySelector(".contactForm-panel");
      const servicePanel = document.querySelector("#section-second.service-panel");

      if (!overlay || !factTextContainer || !factoidContent || !servicePanel) {
        animationFrameId = requestAnimationFrame(updateBackground);
        return;
      }
      
      const viewportHeight = window.innerHeight;
      const viewportCenter = viewportHeight / 2;
      
      const hasScrolled = window.scrollY > 100;
      
      if (!hasScrolled) {
        animationFrameId = requestAnimationFrame(updateBackground);
        return;
      }

      // Check if service panel is in viewport
      const servicePanelRect = servicePanel.getBoundingClientRect();
      const servicePanelInViewport = servicePanelRect.bottom > 0 && servicePanelRect.top < viewportHeight;
      
      // Calculate fade progress based on service panel position
      let servicePanelFadeProgress = 0;
      if (servicePanelInViewport) {
        // When entering from bottom
        if (servicePanelRect.top < viewportHeight && servicePanelRect.top > 0) {
          servicePanelFadeProgress = Math.min(1, (viewportHeight - servicePanelRect.top) / (viewportHeight * 1.5));
        }
        // When fully in view
        else if (servicePanelRect.top <= 0 && servicePanelRect.bottom > 0) {
          servicePanelFadeProgress = 1;
        }
        // When exiting from top
        else if (servicePanelRect.bottom > 0 && servicePanelRect.top < 0) {
          servicePanelFadeProgress = Math.max(0, servicePanelRect.bottom / (viewportHeight * 0.3));
        }
      }
      
      servicePanelFadeProgress = clamp(servicePanelFadeProgress, 0, 1);
      servicePanelFadeProgress = easeOutCubic(servicePanelFadeProgress);

      const factoidRect = factoidContent.getBoundingClientRect();
      const elementCenter = factoidRect.top + factoidRect.height / 2;
      
      const isAtViewportCenter = 
          Math.abs(elementCenter - viewportCenter) < (viewportHeight * 0.1);
      
      const hasCrossedCenter = elementCenter < viewportCenter;
      
      let centerAlignmentProgress = 0;
      const transitionRange = viewportHeight * 0.2;
      
      if (elementCenter <= viewportCenter + transitionRange/2 && 
          elementCenter >= viewportCenter - transitionRange/2) {
        const distanceFromCenter = Math.abs(viewportCenter - elementCenter);
        centerAlignmentProgress = 1 - (distanceFromCenter / (transitionRange/2));
        centerAlignmentProgress = clamp(centerAlignmentProgress, 0, 1);
        centerAlignmentProgress = easeOutCubic(centerAlignmentProgress);
      }
      
      let contactInView = false;
      let contactProgress = 0;
      
      if (contactPanel) {
        const contactRect = contactPanel.getBoundingClientRect();
        contactInView = contactRect.top < viewportHeight;
        
        if (contactInView) {
          const contactStart = viewportHeight * 1.2;
          const contactEnd = viewportHeight * 0.1;
          contactProgress = clamp(
            (contactStart - contactRect.top) / (contactStart - contactEnd),
            0, 
            1
          );
          contactProgress = easeOutCubic(contactProgress);
        }
      }
      
      let finalBackground;
      let topColor, bottomColor;
      
      if (contactInView && contactProgress > 0) {
        topColor = interpolateColor(specialColor, contactTop, contactProgress);
        bottomColor = interpolateColor(specialColor, contactBottom, contactProgress);
      } else if (hasCrossedCenter || isAtViewportCenter) {
        let greenProgress = hasCrossedCenter ? 1 : centerAlignmentProgress;
        topColor = interpolateColor(startGradientTop, specialColor, greenProgress);
        bottomColor = interpolateColor(startGradientBottom, specialColor, greenProgress);
      } else {
        topColor = startGradientTop;
        bottomColor = startGradientBottom;
      }
      
      // Check if we should show dots based on the colors
      const showDots = shouldShowDots(topColor) && shouldShowDots(bottomColor);
      
      // Update ocean overlay (keep existing functionality)
      if (showDots) {
        finalBackground = `
          radial-gradient(circle at center, rgba(0,0,0,0.08) 1px, transparent 1px),
          linear-gradient(180deg, ${topColor} 0%, ${bottomColor} 100%)
        `;
        overlay.style.backgroundSize = '20px 20px, 100% 100%';
      } else {
        finalBackground = `linear-gradient(180deg, ${topColor} 0%, ${bottomColor} 100%)`;
        overlay.style.backgroundSize = '100% 100%';
      }
      
      overlay.style.background = finalBackground;
      
      // Update background section based on service panel visibility
      const sectionFirst = document.querySelector("#section-first.intro-para");
      const sectionSecond = document.querySelector("#section-second.service-panel");
      const sectionFifth = document.querySelector("#section-fifth.contactForm-panel");

      if (backgroundSection && sectionFirst && sectionSecond && sectionFifth) {
        const firstRect = sectionFirst.getBoundingClientRect();
        const secondRect = sectionSecond.getBoundingClientRect();
        const fifthRect = sectionFifth.getBoundingClientRect();
        const screenHeight = window.innerHeight;
      
        let fadeFromFirstToSecond = 0;
        let fadeInContact = 0;
        let fadeOutAboveFirst = 0;
      
        const lingerBuffer = screenHeight * 1.5;
        if (firstRect.bottom > 0 && secondRect.top < screenHeight + lingerBuffer) {
          const distanceFromStart = screenHeight - firstRect.bottom;
          fadeFromFirstToSecond = clamp(distanceFromStart / screenHeight, 0, 1);
        }
        if (secondRect.top < 0 && Math.abs(secondRect.top) < lingerBuffer) {
          fadeFromFirstToSecond = 1;
        }
        if (fifthRect.top < screenHeight && fifthRect.bottom > 0) {
          const distanceIntoView = screenHeight - fifthRect.top;
          fadeInContact = clamp(distanceIntoView / (screenHeight * 0.4), 0, 1);
        }
        if (firstRect.bottom < 0) {
          const distanceAbove = Math.abs(firstRect.bottom);
          fadeOutAboveFirst = clamp(1 - distanceAbove / (screenHeight * 0.5), 0, 1);
        }
        const finalOpacity = clamp(
          Math.max(fadeFromFirstToSecond, fadeInContact, fadeOutAboveFirst),
          0,
          1
        );
      
        backgroundSection.style.opacity = finalOpacity.toString();
      }      
      
      animationFrameId = requestAnimationFrame(updateBackground);
    };

    animationFrameId = requestAnimationFrame(updateBackground);

    return () => {
      isMounted = false;
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      if (styleTag.parentNode) {
        styleTag.parentNode.removeChild(styleTag);
      }
    };
  }, []);

  return null;
};

export default BackgroundTransition;