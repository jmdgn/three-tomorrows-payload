import { useEffect } from "react";

const BackgroundTransition = ({ displayClientsSection = true, displayExpertiseSection = true }) => {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const styleTag = document.createElement("style");
    styleTag.innerHTML = `
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
        transition: opacity 0.4s cubic-bezier(0.22, 1, 0.36, 1);
      }
      .ocean-overlay {
        background-size: 20px 20px, 100% 100%;
        transition: background 0.2s ease-out;
      }
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
    const easeInOutCubic = (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    const interpolateColor = (color1, color2, factor) => {
      const hexToRgb = (hex) => {
        hex = hex.replace("#", "");
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        return { r, g, b };
      };

      const rgbToHex = ({ r, g, b }) => {
        const toHex = (c) => c.toString(16).padStart(2, "0");
        return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
      };

      const c1 = hexToRgb(color1);
      const c2 = hexToRgb(color2);
      const easedFactor = easeInOutCubic(factor);

      return rgbToHex({
        r: Math.round(c1.r + (c2.r - c1.r) * easedFactor),
        g: Math.round(c1.g + (c2.g - c1.g) * easedFactor),
        b: Math.round(c1.b + (c2.b - c1.b) * easedFactor),
      });
    };

    const updateBackground = () => {
      if (!isMounted) return;

      const overlay = document.querySelector(".ocean-overlay");
      const contactPanel = document.querySelector(".contactForm-panel");
      const expertiseSection = document.querySelector("#section-fourth.expertise-panel");

      if (!overlay || !contactPanel) {
        animationFrameId = requestAnimationFrame(updateBackground);
        return;
      }

      const viewportHeight = window.innerHeight;
      
      let greenProgress = 0;
      let contactProgress = 0;

      if (displayExpertiseSection && expertiseSection) {
        const expertiseRect = expertiseSection.getBoundingClientRect();
        const transitionStart = viewportHeight * 0.8;
        const transitionEnd = viewportHeight * 0.2;
        greenProgress = (transitionStart - expertiseRect.top) / (transitionStart - transitionEnd);
        greenProgress = clamp(greenProgress, 0, 1);
      }

      const contactRect = contactPanel.getBoundingClientRect();
      const contactInView = contactRect.top < viewportHeight;

      if (contactInView) {
        const contactStart = viewportHeight * 1.2;
        const contactEnd = viewportHeight * 0.1;
        contactProgress = (contactStart - contactRect.top) / (contactStart - contactEnd);
        contactProgress = clamp(contactProgress, 0, 1);
      }
      
      let topColor, bottomColor;

      if (contactProgress > 0) {
        if (displayExpertiseSection && greenProgress > 0) {
          topColor = interpolateColor(specialColor, contactTop, contactProgress);
          bottomColor = interpolateColor(specialColor, contactBottom, contactProgress);
        } else {
          topColor = interpolateColor(startGradientTop, contactTop, contactProgress);
          bottomColor = interpolateColor(startGradientBottom, contactBottom, contactProgress);
        }
      } else if (displayExpertiseSection && greenProgress > 0) {
        topColor = interpolateColor(startGradientTop, specialColor, greenProgress);
        bottomColor = interpolateColor(startGradientBottom, specialColor, greenProgress);
      } else {
        topColor = startGradientTop;
        bottomColor = startGradientBottom;
      }
      
      let finalBackground = `linear-gradient(180deg, ${topColor} 0%, ${bottomColor} 100%)`;
      overlay.style.background = finalBackground;
      
      const backgroundSection = document.querySelector("#background.bkgnd");
      const sectionFirst = document.querySelector("#section-first.intro-para");
      const sectionSecond = document.querySelector("#section-second.service-panel");
      const sectionThird = document.querySelector("#section-third.factoids-complete");
      const sectionFifth = document.querySelector("#section-fifth.contactForm-panel");

      if (backgroundSection && sectionFirst && sectionSecond && sectionFifth) {
        const firstRect = sectionFirst.getBoundingClientRect();
        const secondRect = sectionSecond.getBoundingClientRect();
        const thirdRect = sectionThird ? sectionThird.getBoundingClientRect() : null;
        const fifthRect = sectionFifth.getBoundingClientRect();
        const vh = window.innerHeight;

        let dotOpacity = 0;

        const initialFadeProgress = (vh - firstRect.bottom) / (vh * 0.5);
        dotOpacity = clamp(initialFadeProgress, 0, 1);

        if (thirdRect && thirdRect.top < vh) {
          const fadeOutProgress = (vh - thirdRect.top) / (vh * 0.2);
          dotOpacity = Math.min(dotOpacity, 1 - clamp(fadeOutProgress, 0, 1));
        } else {
          const serviceProgress = (vh - secondRect.top) / (secondRect.height + vh);
          if (serviceProgress > 0.6) {
            const fadeOutProgress = (serviceProgress - 0.6) / 0.4;
            dotOpacity = Math.min(dotOpacity, 1 - clamp(fadeOutProgress, 0, 1));
          }
        }

        if (fifthRect.top < vh) {
          const fadeInProgress = (vh - fifthRect.top) / (vh * 0.2);
          dotOpacity = Math.max(dotOpacity, clamp(fadeInProgress, 0, 1));
        }

        if (!displayClientsSection && !displayExpertiseSection) {
          const serviceBottomProgress = (vh - secondRect.bottom) / (vh * 0.3);
          if (serviceBottomProgress < 0) {
            dotOpacity = Math.max(dotOpacity, 0.8);
          }
        }

        backgroundSection.style.opacity = dotOpacity.toString();
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
  }, [displayClientsSection, displayExpertiseSection]);

  return null;
};

export default BackgroundTransition;