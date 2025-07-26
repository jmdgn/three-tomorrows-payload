'use client'

import React, { useLayoutEffect, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Helper function to determine card dimensions based on screen size
const getResponsiveDimensions = (conditions) => {
  const { is1680, is1440, is1280, is1080, is768 } = conditions;

  if (is1680) { // For screens 1681px and wider
    return { width: '35vw', height: '28vw', maxWidth: '700px', maxHeight: '560px' };
  }
  if (is1440) { // 1441px to 1680px
    return { width: '45vw', height: '36vw', maxWidth: '600px', maxHeight: '480px' };
  }
  if (is1280) { // 1281px to 1440px
    return { width: '50vw', height: '40vw', maxWidth: '520px', maxHeight: '416px' };
  }
  if (is1080) { // 1081px to 1280px
    return { width: '60vw', height: '48vw', maxWidth: '440px', maxHeight: '352px' };
  }
  if (is768) { // 769px to 1080px
    return { width: '70vw', height: '56vw', maxWidth: '380px', maxHeight: '304px' };
  }
  // Default for mobile (768px and smaller)
  return { width: '70vw', height: '56vw', maxWidth: '280px', maxHeight: '224px' };
};


const FactoidAnimation = ({ 
  factoidsSection, 
  factoidItems, 
  skipButtonTarget = "#section-fourth", 
  skipButtonText = "Skip Industry Facts" 
}) => {
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const cardsWrapperRef = useRef(null);
  const gsapContext = useRef(null);

  useLayoutEffect(() => {
    // Set up GSAP's matchMedia for responsive animations
    gsapContext.current = gsap.matchMedia();

    // Define the breakpoints
    gsapContext.current.add({
      is1680: "(min-width: 1681px)",
      is1440: "(min-width: 1441px) and (max-width: 1680px)",
      is1280: "(min-width: 1281px) and (max-width: 1440px)",
      is1080: "(min-width: 1081px) and (max-width: 1280px)",
      is768:  "(min-width: 769px) and (max-width: 1080px)",
      isMobile: "(max-width: 768px)"
    }, (context) => {
      // Get the correct dimensions for the current screen size
      const dimensions = getResponsiveDimensions(context.conditions);

      const setupGsap = () => {
        const section = sectionRef.current;
        const title = titleRef.current;
        const cardsWrapper = cardsWrapperRef.current;
        const cards = gsap.utils.toArray(cardsWrapper.children);

        if (!section || !title || !cardsWrapper || cards.length === 0) return;
        
        // Apply the responsive dimensions from our helper function
        gsap.set(cardsWrapper, {
          position: 'absolute',
          top: '55%',
          left: '50%',
          xPercent: -50,
          yPercent: -50,
          ...dimensions
        });
        
        // Set the initial vertical offset so cards "poke" from the bottom
        gsap.set(cardsWrapper, { y: '40svh' });

        gsap.set(cardsWrapper, { perspective: 800 });
        gsap.set(cards, {
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
        });

        cards.forEach((card, index) => {
          const zIndex = cards.length - index;
          const rotation = (index * 5) - 5; 

          let initialProps = { zIndex, autoAlpha: 0, scale: 0.8, x: 40 + (index * 10), y: 40 + (index * 10), rotation: rotation + 5 };
          if (index === 0) { initialProps = { ...initialProps, autoAlpha: 1, scale: 1, x: 0, y: 0, rotation: -5 } }
          else if (index === 1) { initialProps = { ...initialProps, autoAlpha: 1, scale: 0.95, x: 20, y: 20, rotation: 0 } }
          else if (index === 2) { initialProps = { ...initialProps, autoAlpha: 1, scale: 0.9, x: 40, y: 40, rotation: 5 } }
          else if (index === 3) { initialProps = { ...initialProps, autoAlpha: 1, scale: 0.85, x: 60, y: 60, rotation: 10 } }
          gsap.set(card, initialProps);
        });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            pin: true,
            scrub: 1,
            start: "top top",
            end: () => `+=${cards.length * 400}`,
            invalidateOnRefresh: true,
          },
        });

        tl.to(cardsWrapper, { y: 0, ease: 'power2.inOut' })
          .to(title, { top: '10svh', yPercent: 0, ease: 'power2.inOut' }, "<");

        const shuffleStartTime = "shuffleStart";
        tl.add(shuffleStartTime, ">"); 

        cards.forEach((card, index) => {
          if (index === cards.length - 1) return;
          const startTime = `${shuffleStartTime}+=${index * 1.0}`;
          tl.to(card, { xPercent: -110, yPercent: 10, rotation: -15, autoAlpha: 0, ease: 'power2.inOut', duration: 1.2 }, startTime)
            .to(cards[index + 1], { scale: 1, x: 0, y: 0, rotation: -5, ease: 'power2.out', duration: 1.2 }, startTime)
            .to(cards[index + 2], { scale: 0.95, x: 20, y: 20, rotation: 0, autoAlpha: 1, ease: 'power2.out', duration: 1.2 }, startTime)
            .to(cards[index + 3], { scale: 0.9, x: 40, y: 40, rotation: 5, autoAlpha: 1, ease: 'power2.out', duration: 1.2 }, startTime);
        });
      };

      const initiationTimeout = setTimeout(setupGsap, 1200);
      return () => clearTimeout(initiationTimeout);
    });

    return () => { if (gsapContext.current) gsapContext.current.revert(); };
  }, [factoidItems]);

  // Initial Fade-In Animation for the Title
  useEffect(() => {
    const titleH2 = titleRef.current?.querySelector('h2');
    const titleContainer = titleRef.current;
    if (!titleH2 || !titleContainer) return;

    if (!titleContainer.dataset.processed) {
        const words = titleH2.textContent.split(' ');
        titleH2.innerHTML = words.map(word => `<span class="fade-word">${word}</span>`).join(' ');
        titleContainer.dataset.processed = 'true';
    }

    const wordElements = titleH2.querySelectorAll('.fade-word');
    const resetWords = () => wordElements.forEach(word => word.classList.remove('fade-in'));
    const fadeInWords = () => {
        wordElements.forEach((word, i) => {
            setTimeout(() => word.classList.add('fade-in'), i * 75 + Math.random() * 100);
        });
    };

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) { if (!titleContainer.classList.contains('has-faded-in')) { titleContainer.classList.add('has-faded-in'); fadeInWords(); } }
                else { titleContainer.classList.remove('has-faded-in'); resetWords(); }
            });
        },
        { threshold: 0.1 }
    );

    observer.observe(titleContainer);

    return () => observer.disconnect();
  }, []);

  // Helper function to handle the skip button click
  const handleSkipClick = () => {
    // Remove the # from the target if it exists, since getElementById doesn't need it
    const targetId = skipButtonTarget.replace('#', '');
    const targetSection = document.getElementById(targetId);
    
    if (targetSection) {
      // Use similar logic to the existing scroll functions in your code
      const headerHeight = document.querySelector("header")?.offsetHeight || 0;
      
      // Calculate the end of the factoids section first
      const section = sectionRef.current;
      const factoidsSectionScrollDistance = factoidItems.length * 400;
      const sectionTop = section.offsetTop;
      const endOfFactoidsSection = sectionTop + factoidsSectionScrollDistance;
      
      // Get target section position and add some offset to land properly in the section
      const targetSectionTop = targetSection.offsetTop;
      const offset = 100; // Buffer to ensure we land in the section, not just at its edge
      
      // Choose the greater of the two: end of factoids or target section position
      const targetPosition = Math.max(endOfFactoidsSection + offset, targetSectionTop - headerHeight + offset);
      
      window.scrollTo({
        top: targetPosition,
        behavior: "smooth"
      });
    }
  };

  return (
    <section id="section-third" className="factoids-complete" ref={sectionRef}>
      <div className="factoid-sticky-container">
        <div className="stickyContent-title" ref={titleRef}>
          <h2>{factoidsSection?.heading || 'We are entering an unprecedented age of change'}</h2>
        </div>

        <div className="factoid-cards-wrapper" ref={cardsWrapperRef}>
          {factoidItems.map((factoid, index) => (
            <div className="factoid-card gsap-card" key={index}>
              <div className="factCard-container">
                <h2>{factoid.text}</h2>
              </div>
            </div>
          ))}
        </div>

        <div 
          className="anchorBtn-container"
        >
            <div className="prompt-button" onClick={handleSkipClick}>
                {skipButtonText}
            </div>
            <div className="prompt-buttonIcon" onClick={() => {
                const expertisePanel = document.getElementById('section-second');
                if (expertisePanel) {
                    const headerHeight = document.querySelector("header")?.offsetHeight || 0.8;
                    const offset = window.innerHeight * 0.8;
                    const targetPosition = expertisePanel.offsetTop - headerHeight + offset;
                    window.scrollTo({
                        top: targetPosition,
                        behavior: "smooth"
                    });
                }
            }}></div>
        </div>

      </div>
    </section>
  );
};

export default FactoidAnimation;