import { useEffect } from "react";

const BackgroundTransition = () => {
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const styleTag = document.createElement('style');
    styleTag.innerHTML = `
      .ocean-overlay {
        /* Default/initial background - explicit !important to override any inline styles */
        background: linear-gradient(180deg, #DBE5ED 0%, #EFF0F1 100%);
        transition: background 0.8s cubic-bezier(0.22, 1, 0.36, 1);
      }
      
      .ocean-overlay.green-phase {
        background: linear-gradient(180deg, #3BE494 0%, #3BE494 100%);
      }
      
      .ocean-overlay.contact-phase {
        background: linear-gradient(180deg, #DBE5ED 0%, #EFF0F1 100%);
      }
      
      .ocean-overlay.transition-phase {
        /* This will be dynamically updated via JS */
      }
    `;
    document.head.appendChild(styleTag);
    
    let isMounted = true;
    let animationFrameId = null;
    
    const specialColor = "#3BE494";
    const startGradientTop = "#DBE5ED";
    const startGradientBottom = "#EFF0F1";
    const contactTop = "#DBE5ED";
    const contactBottom = "#EFF0F1";

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

    const updateBackground = () => {
      if (!isMounted) return;

      const overlay = document.querySelector(".ocean-overlay");
      const factTextContainer = document.querySelector(".factText-container");
      const factoidContent = document.querySelector(".factoidContent-full") || factTextContainer;
      const contactPanel = document.querySelector(".contactForm-panel");

      if (!overlay || !factTextContainer || !factoidContent) {
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

      const factoidRect = factoidContent.getBoundingClientRect();
      const elementCenter = factoidRect.top + factoidRect.height / 2;
      
      const isAtViewportCenter = 
          Math.abs(elementCenter - viewportCenter) < (viewportHeight * 0.1); // Within 10% of center
      
      const hasCrossedCenter = elementCenter < viewportCenter;
      
      let centerAlignmentProgress = 0;
      const transitionRange = viewportHeight * 0.2; // 20% of viewport for transition
      
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
      
      if (contactInView && contactProgress > 0) {
        const topColor = interpolateColor(specialColor, contactTop, contactProgress);
        const bottomColor = interpolateColor(specialColor, contactBottom, contactProgress);
        finalBackground = `linear-gradient(180deg, ${topColor} 0%, ${bottomColor} 100%)`;
      } else if (hasCrossedCenter || isAtViewportCenter) {
        let greenProgress = hasCrossedCenter ? 1 : centerAlignmentProgress;
        const topColor = interpolateColor(startGradientTop, specialColor, greenProgress);
        const bottomColor = interpolateColor(startGradientBottom, specialColor, greenProgress);
        finalBackground = `linear-gradient(180deg, ${topColor} 0%, ${bottomColor} 100%)`;
      } else {
        finalBackground = `linear-gradient(180deg, ${startGradientTop} 0%, ${startGradientBottom} 100%)`;
      }
      
      overlay.style.background = finalBackground;
      
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