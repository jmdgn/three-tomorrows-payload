'use client'

import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { HomepageScripts, HomepageSceneContainer } from '@/components/HomeScripts/HomepageScripts.tsx'
import { LandingScripts } from '@/components/HomeScripts/LandingScripts.tsx'
import { LandingEffects } from '@/components/HomeScripts/LandingEffects.client.tsx'
import { AnimationBottom } from '@/components/HomeScripts/AnimationBottom.tsx'
import { StaticGradientBackground } from '@/components/HomeScripts/StaticGradientBackground';
import BackgroundTransition from "@/components/HomeScripts/BackgroundTransition";
import AnimatedTitle from '@/components/HomeScripts/AnimatedTitle';
import { getMediaUrl } from '../utilities/media-utils';
import MobileServiceCarousel from '@/components/MobileServiceCarousel';
import FactoidAnimation from './FactoidAnimation';

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

gsap.registerPlugin(ScrollTrigger);

const ClientGridAnimator = ({ clientItems, getImageSrc }) => {
  const gridRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const delayInMilliseconds = 500;

            setTimeout(() => {
              const columns = Array.from(gridRef.current.querySelectorAll('.client-column'));
              columns.forEach((column, index) => {
                column.style.transitionDelay = `${index * 150}ms`;
                column.classList.add('is-visible');
              });
            }, delayInMilliseconds);

            observer.disconnect();
          }
        });
      },
      {
        threshold: 0.1,
      }
    );

    if (gridRef.current) {
      observer.observe(gridRef.current);
    }

    return () => {
      if (gridRef.current) {
        observer.disconnect();
      }
    };
  }, [clientItems]);

  const handleImageError = (e) => {
    console.error('Client logo failed to load:', e.target.src);
    e.target.src = 'https://placehold.co/640x360/f0f0f0/ccc?text=Logo';
  };

  return (
    <div className="clientGrid-container" ref={gridRef}>
      {clientItems.map((client, index) => (
        <div className="client-column" key={index}>
          <div className="client-logo-aspect-ratio">
            <img
              src={getImageSrc(client.image)}
              alt={`Client Logo ${index + 1}`}
              loading="lazy"
              decoding="async"
              onError={handleImageError}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

const CustomHomepage = (props) => {
  const {
    heroSection = {},
    introSection = {},
    servicesSection = {},
    clientsSection = {},
    factoidsSection = {},
    expertiseSection = {},
    contactSection = {},
  } = props;

  // Read the new toggle values from props, defaulting to `true`.
  const displayClientsSection = clientsSection?.displaySection ?? true;
  const displayExpertiseSection = expertiseSection?.displaySection ?? true;

  const heroHeading = heroSection?.heading || 'Disruption By Design';
  const heroSubheading = heroSection?.subheading || 'Strategy Consultancy';
  const heroDescription = heroSection?.description || "Disruption isn't just inevitable—it's necessary. Today's business models aren't future-fit in a world transformed by technology, values, and changing expectations.";
  const heroDesktopDescription = heroSection?.desktopDescription || "Disruption isn't just inevitable—it's necessary. Today's business models aren't future-fit in a world transformed by technology, values, and changing expectations. The organisations that will thrive are those redesigning their relationship with people and planet—creating purposeful disruption rather than merely responding to it.";
  const heroCtaText = heroSection?.ctaText || 'Scroll to discover tomorrow';

  const eventListenersRef = useRef([]);
  const waterContainerRef = useRef(null);
  const animationRef = useRef(null);
  const lastScrollProgressRef = useRef(0);
  const currentScaleRef = useRef(1);
  const currentBorderRadiusRef = useRef(0);
  
  const [isMobile, setIsMobile] = useState(false);

  const servicesLinkUrl = servicesSection?.ctaLink || '/services';
  const contactLinkUrl = contactSection?.ctaLink || '/contact';
  
  const serviceItems = servicesSection?.services || [
    {
      number: '01',
      title: 'Intelligence',
      breakTitle: 'Trend',
      description: 'Cutting through noise to identify the signals that matter most for your future. Helping you see beyond the horizon and prepare for multiple possible tomorrows.',
      image: 'assets/images/services/trend.png',
      linkText: 'More on this service',
      linkUrl: '/services'
    },
  ];

  const clientsTitle = clientsSection?.title || 'Our Valued Clients';
  const clientItems = clientsSection?.clients || [
    { image: 'assets/images/clients/placeholder-logo-1.png' },
    { image: 'assets/images/clients/placeholder-logo-2.png' },
    { image: 'assets/images/clients/placeholder-logo-3.png' },
    { image: 'assets/images/clients/placeholder-logo-4.png' },
  ];

  const factoidItems = factoidsSection?.factoids || [
    { text: '70% of small businesses will transition to new ownership in the next decade' },
  ];

  const techExpertiseItems = expertiseSection?.techExpertise?.items || [
    { 
      text: 'AI Integration', 
      isImage: false,
      hoverText: 'Seamlessly integrate artificial intelligence into your business operations.' 
    },
  ];
  
  const sustainabilityExpertiseItems = expertiseSection?.sustainabilityExpertise?.items || [
    { 
      text: 'Shared Value Creation', 
      isImage: false,
      hoverText: 'Create business value while addressing social and environmental challenges.'
    },
  ];

  useEffect(() => {
    if (typeof window !== 'undefined' && window.initThreeJS && !window.threeJSInitialized) {
      console.log('CustomHomepage: Initializing Three.js');
      window.threeJSInitialized = true;
      window.initThreeJS().catch(err => {
        console.error('Error initializing Three.js:', err);
        window.threeJSInitialized = false;
      });
    }

    const checkContainers = () => {
      const sceneContainer = document.getElementById('scene-container');
      const waterContainer = document.querySelector('.water-container');
      
      if (sceneContainer) {
        console.log('Scene container found');
      } else {
        console.warn('Scene container not found');
      }
      
      if (waterContainer) {
        console.log('Water container found');
        waterContainerRef.current = waterContainer;
      } else {
        console.warn('Water container not found');
      }
    };
    
    const timeoutId = setTimeout(checkContainers, 500);
    
    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

  const getImageSrc = (image) => {
    if (image && typeof image === 'object') {
      if (image.filename) {
        return `/api/media/file/${image.filename}`;
      }
      
      if (image.id) {
        try {
          if (image.url) {
            return image.url;
          }
          
          return `/api/media/${image.id}`;
        } catch (error) {
          console.error('Error getting media URL:', error);
          return `/media/${image.id}`;
        }
      }
    }
    
    if (image && typeof image === 'string') {
      return image;
    }
    
    return 'assets/images/services/trend.png';
  };

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 880);
    };
    
    checkIfMobile();
    
    window.addEventListener('resize', checkIfMobile);
    
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  useEffect(() => {
    console.log("Initializing water container...");
    
    const ensureWaterContainer = () => {
      if (waterContainerRef.current) {
        console.log("Water container found, ensuring it's properly styled");
        
        waterContainerRef.current.style.display = "block";
        waterContainerRef.current.style.width = "100%";
        waterContainerRef.current.style.height = "100%";
        waterContainerRef.current.style.position = "absolute";
        waterContainerRef.current.style.top = "0";
        waterContainerRef.current.style.left = "0";
        waterContainerRef.current.style.opacity = "1"; // Add initial opacity
        waterContainerRef.current.style.transition = "opacity 0.2s ease-out"; // Add transition for smooth fade
        
        if (window.initOceanScene && !window.renderer) {
          console.log("Manually initializing ocean scene");
          setTimeout(() => {
            if (typeof window.initOceanScene === 'function') {
              window.initOceanScene();
            }
          }, 300);
        }
      } else {
        console.warn("Water container ref not available yet");
      }
    };
    
    ensureWaterContainer();
    
    const timeoutId = setTimeout(ensureWaterContainer, 1000);
    
    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    
    window._waterScale = 1;
    window._lastMouseEvent = null;
    
    const waterContainer = document.querySelector('.water-container');
    waterContainerRef.current = waterContainer;
    
    if (waterContainer) {
      waterContainer.style.transition = 'opacity 0.2s ease-out';
    }
    
    const movementFactor = 0.05;

    const handleMouseMove = throttle((e) => {
      if (!isMounted || !waterContainerRef.current) return;
      
      const { clientX, clientY } = e;
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      const offsetX = (centerX - clientX) * movementFactor;
      const offsetY = (centerY - clientY) * movementFactor;
      
      waterContainerRef.current.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
    }, 16);

    const handleScroll = () => {
      if (!isMounted) return;
    
      animationRef.current = requestAnimationFrame(() => {
        if (!waterContainerRef.current) return;
    
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight;
        const windowHeight = window.innerHeight;
        const scrollProgress = Math.min(scrollTop / (docHeight - windowHeight), 1);
    
        if (Math.abs(scrollProgress - lastScrollProgressRef.current) > 0.001) {
          const startFadeAt = 0;
          const endFadeAt = 0.1;
          let opacity = 1;
    
          if (scrollProgress > startFadeAt) {
            const normalizedProgress = Math.min(
              (scrollProgress - startFadeAt) / (endFadeAt - startFadeAt),
              1
            );
            opacity = 1 - normalizedProgress;
          }
    
          waterContainerRef.current.style.opacity = opacity;
          
          currentScaleRef.current = opacity;
          window._waterScale = opacity;
          lastScrollProgressRef.current = scrollProgress;
    
          const startRadiusAt = 0;
          const endRadiusAt = 0.04;
    
          let borderRadius = 0;
          if (scrollProgress > startRadiusAt) {
            const normalizedRadius = Math.min(
              (scrollProgress - startRadiusAt) / (endRadiusAt - startRadiusAt),
              1
            );
            borderRadius = normalizedRadius * 2;
          }
    
          currentBorderRadiusRef.current = borderRadius;
    
          const canvas = waterContainerRef.current?.querySelector('canvas');
          if (canvas) {
            canvas.style.borderRadius = `${borderRadius}rem`;
            canvas.style.transition = 'border-radius 0.2s ease-out';
          }
    
          const lastMouseEvent = window._lastMouseEvent;
          if (lastMouseEvent) {
            const { clientX, clientY } = lastMouseEvent;
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;
            const offsetX = (centerX - clientX) * movementFactor;
            const offsetY = (centerY - clientY) * movementFactor;
            
            waterContainerRef.current.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
          }
        }
      });
    };    
    
    const storeMousePosition = throttle((e) => {
      if (!isMounted) return;
      window._lastMouseEvent = e;
    }, 32);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousemove', storeMousePosition);
    window.addEventListener('scroll', handleScroll);
    
    eventListenersRef.current = [
      { target: window, event: 'mousemove', handler: handleMouseMove },
      { target: window, event: 'mousemove', handler: storeMousePosition },
      { target: window, event: 'scroll', handler: handleScroll }
    ];
    
    const setupSphereContainer = () => {
      const sphereContainer = document.getElementById('sphere-container');
      if (sphereContainer) {
        sphereContainer.style.opacity = '0';
        sphereContainer.style.transition = 'opacity 0.4s ease-in-out';
        
        if (window.scrollY < 100) {
          sphereContainer.style.opacity = '0';
        }
      }
    };
    
    setupSphereContainer();
    
    handleScroll();

    return () => {
      isMounted = false;
      
      eventListenersRef.current.forEach(({ target, event, handler }) => {
        target.removeEventListener(event, handler);
      });
      
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const optimizeImages = () => {
      const images = document.querySelectorAll('img');
      
      images.forEach(img => {
        if (img.dataset.optimized) return;
        
        img.dataset.optimized = true;
        
        if (!img.hasAttribute('loading')) {
          img.setAttribute('loading', 'lazy');
        }
        
        if (!img.hasAttribute('decoding')) {
          img.setAttribute('decoding', 'async');
        }
        
        if ((!img.hasAttribute('width') || !img.hasAttribute('height')) && 
            img.hasAttribute('src') && img.src) {
          const tempImg = new Image();
          tempImg.onload = () => {
            if (!img.hasAttribute('width')) {
              img.setAttribute('width', tempImg.naturalWidth);
            }
            if (!img.hasAttribute('height')) {
              img.setAttribute('height', tempImg.naturalHeight);
            }
          };
          tempImg.src = img.src;
        }
      });
    };
    
    optimizeImages();
    
    window.addEventListener('load', optimizeImages);
    document.addEventListener('DOMContentLoaded', optimizeImages);
    
    const handleScroll = throttle(() => {
      const visibleImages = Array.from(document.querySelectorAll('img[loading="lazy"]'))
        .filter(img => {
          const rect = img.getBoundingClientRect();
          return (
            rect.top >= -100 &&
            rect.left >= -100 &&
            rect.top <= (window.innerHeight + 300) &&
            rect.left <= (window.innerWidth + 100)
          );
        });
      
      visibleImages.forEach(img => {
        if (img.hasAttribute('loading')) {
          img.removeAttribute('loading');
        }
      });
    }, 300);
    
    window.addEventListener('scroll', handleScroll);
    
    const optimizeServicePanel = () => {
      const servicePanel = document.querySelector('.service-panel');
      if (!servicePanel) return;
      
      const serviceCards = servicePanel.querySelectorAll('.serviceCard');
      serviceCards.forEach((card, index) => {
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const image = card.querySelector('img');
              if (image && image.hasAttribute('loading')) {
                image.removeAttribute('loading');
              }
              
              card.style.transition = 'transform 0.5s ease-out';
              observer.disconnect();
            }
          });
        }, { threshold: 0.1 });
        
        observer.observe(card);
      });
    };
    
    optimizeServicePanel();
    
    return () => {
      window.removeEventListener('load', optimizeImages);
      document.removeEventListener('DOMContentLoaded', optimizeImages);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="homeBody">
      <>
      <HomepageScripts />
      <LandingScripts />
      <LandingEffects />
      <AnimationBottom />
      <BackgroundTransition />
      <HomepageSceneContainer />

      <section className="intro-section">
        <div className="foreground-elements">
          <div className="heroTitle-container">
            <div className="intro-title">
              <h1>{heroHeading}</h1>
            </div>
            <div className="intro-subtitle">
              <h4>{heroSubheading}</h4>
            </div>
          </div>
          <div className="heroSupport-container">
            <div className="introSupport-text">
              <p className="body-intro desktop">{heroDesktopDescription}</p>
              <p className="body-intro mobile">{heroDescription}</p>
            </div>
            <div className="anchorBtn-container">
              <div className="prompt-button">{heroCtaText}</div>
            </div>
          </div>
        </div>
        <div className="midground-elements">
          <div id="sphere-container" />
        </div>
        <div className="background-elements">
          <div className="ocean-overlay" />
          <div className="water-container" ref={waterContainerRef} />
        </div>
      </section>
      <main>
      <section id="background" className="bkgnd"></section>
        <section id="section-first" className="intro-para">
          <div className="introStatement-outer">
            <div className="introState-inner">
              <h2>{introSection?.statement || "Our approach isn't about predicting tomorrow—it's about building your capability to shape it. We focus your attention on what truly matters, guiding teams to see possibility where others see only challenges."}</h2>
            </div>
          </div>
        </section>
        <section id="section-second" className="service-panel">
          <div className="serviceContent-outer">
            <div className="serviceContent-inner">
              <div className="titleText center">
                <div className="titleContent-container">
                  <h4 className="xlarge animate-title">{servicesSection?.heading || 'Our Services'}</h4>
                </div>
                <div className="txtContent-container">
                  <p className="xlarge"><AnimatedTitle staggerDelay={0.02} duration={0.6}>{servicesSection?.subheading || 'Our services form a natural progression from understanding to action.'}</AnimatedTitle></p>
                  <div 
                    className="body-button" 
                    onClick={() => window.location.href = servicesLinkUrl}
                    role="button"
                    tabIndex={0}
                  >
                    {servicesSection?.ctaText || 'How our services can help you'}
                    <div className="ctaButton-iconContainer">
                      <svg className="first" width="12" height="12" viewBox="0 0 12 12" fill="#000" xmlns="http://www.w3.org/2000/svg"><path d="M0.46967 10.5703C0.176777 10.8631 0.176777 11.338 0.46967 11.6309C0.762563 11.9238 1.23744 11.9238 1.53033 11.6309L0.46967 10.5703ZM11.75 1.10059C11.75 0.686372 11.4142 0.350586 11 0.350586L4.25 0.350587C3.83579 0.350587 3.5 0.686373 3.5 1.10059C3.5 1.5148 3.83579 1.85059 4.25 1.85059L10.25 1.85059L10.25 7.85058C10.25 8.2648 10.5858 8.60058 11 8.60058C11.4142 8.60058 11.75 8.2648 11.75 7.85058L11.75 1.10059ZM1.53033 11.6309L11.5303 1.63092L10.4697 0.570256L0.46967 10.5703L1.53033 11.6309Z"></path></svg>
                      <svg className="second" width="12" height="12" viewBox="0 0 12 12" fill="#FFF" xmlns="http://www.w3.org/2000/svg"><path d="M0.46967 10.5703C0.176777 10.8631 0.176777 11.338 0.46967 11.6309C0.762563 11.9238 1.23744 11.9238 1.53033 11.6309L0.46967 10.5703ZM11.75 1.10059C11.75 0.686372 11.4142 0.350586 11 0.350586L4.25 0.350587C3.83579 0.350587 3.5 0.686373 3.5 1.10059C3.5 1.5148 3.83579 1.85059 4.25 1.85059L10.25 1.85059L10.25 7.85058C10.25 8.2648 10.5858 8.60058 11 8.60058C11.4142 8.60058 11.75 8.2648 11.75 7.85058L11.75 1.10059ZM1.53033 11.6309L11.5303 1.63092L10.4697 0.570256L0.46967 10.5703L1.53033 11.6309Z"></path></svg>
                    </div>
                  </div>
                </div>
              </div>
              
              {isMobile ? (
                <MobileServiceCarousel 
                  serviceItems={serviceItems}
                  getImageSrc={getImageSrc}
                />
              ) : (
                /* Desktop Grid View - Original Layout */
                <div className="serviceGrid-container">
                  {serviceItems.map((service, index) => (
                    <div className="servicePanel-container" key={index}>
                      <div className="serviceText-panelTop">
                        <h4>{service.title}</h4>
                        <p>{service.description}</p>
                      </div>
                      <div className="serviceText-panelBottom">
                        <a href={service.linkUrl || '/services'}>
                          {service.linkText || 'More on this service'}
                          <svg width="7" height="12" viewBox="0 0 7 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1L6 6L1 11" stroke="white" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </a>
                      </div>
                      <div className="serviceFt-image">
                        <img
                          className="service-image"
                          src={getImageSrc(service.image)}
                          width={582}
                          height={466}
                          alt={`${service.breakTitle} ${service.title} Image`}
                          loading="lazy"
                          onError={(e) => {
                            console.error('Image failed to load:', e.target.src);
                            e.target.src = 'assets/images/services/trend.png';
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {displayClientsSection && (
            <div className="clientContent-outer">
              <div className="clientContent-inner">
                <div className="titleText center">
                  <div className="titleContent-container">
                    <h4 className="xlarge animate-title">{clientsTitle}</h4>
                  </div>
                </div>
                <ClientGridAnimator clientItems={clientItems} getImageSrc={getImageSrc} />
              </div>
            </div>
          )}
        </section>
        
        <FactoidAnimation 
            factoidsSection={factoidsSection} 
            factoidItems={factoidItems}
            skipButtonTarget={displayExpertiseSection ? "#section-fourth" : "#section-fifth"}
            skipButtonText={displayExpertiseSection ? "Skip Industry Facts" : "Skip to Contact"}
        />
        
        {displayExpertiseSection && (
          <section id="section-fourth" className="expertise-panel">
            <div className="expertiseContent-outer">
              <div className="expertiseContent-inner">
                
                <div className="expertise-title">
                  <div className="titleText center">
                    <div className="titleContent-container">
                      <h4>{expertiseSection?.heading || 'Specialised Expertise Areas'}</h4>
                    </div>
                    <div className="txtContent-container">
                      <p className="xlarge"><AnimatedTitle staggerDelay={0.02} duration={0.6}>{expertiseSection?.subheading || 'Beyond our core strategic approach, we offer specialised expertise in two transformative domains:'}</AnimatedTitle></p>
                    </div>
                  </div>
                </div>
                  
                <div className="expertise-grid">
                  <div className="expertise-column">
                    <h4>{expertiseSection?.techExpertise?.heading || 'Emerging Technology Futures'}</h4>
                    <div className="expertise-items">
                      {techExpertiseItems.filter(item => !item.isImage).map((item, index) => (
                        <a 
                          href={item.link || '#'} 
                          className="expertise-panel" 
                          key={index}
                          onClick={(e) => {
                            if (!item.link || item.link === '#') {
                              e.preventDefault();
                            }
                          }}
                        >
                          <div className="expertise-content">
                            <h5>{item.text}</h5>
                            <p>{item.hoverText || ''}</p>
                          </div>
                          <div className="expertise-arrow">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M0.292893 14.2929C-0.097631 14.6834 -0.097631 15.3166 0.292893 15.7071C0.683418 16.0976 1.31658 16.0976 1.70711 15.7071L0.292893 14.2929ZM16 1C16 0.447715 15.5523 -9.44832e-09 15 -9.44832e-09L6 -9.44832e-09C5.44772 -9.44832e-09 5 0.447715 5 1C5 1.55228 5.44772 2 6 2H14L14 10C14 10.5523 14.4477 11 15 11C15.5523 11 16 10.5523 16 10L16 1ZM1 15L1.70711 15.7071L15.7071 1.70711L15 1L14.2929 0.292893L0.292893 14.2929L1 15Z" fill="#191C1C"/>
                            </svg>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>

                  <div className="expertise-column">
                    <h4>{expertiseSection?.sustainabilityExpertise?.heading || 'Strategic Sustainability & Social Impact'}</h4>
                    <div className="expertise-items">
                      {sustainabilityExpertiseItems.filter(item => !item.isImage).map((item, index) => (
                        <a 
                          href={item.link || '#'} 
                          className="expertise-panel" 
                          key={index}
                          onClick={(e) => {
                            if (!item.link || item.link === '#') {
                              e.preventDefault();
                            }
                          }}
                        >
                          <div className="expertise-content">
                            <h5>{item.text}</h5>
                            <p>{item.hoverText || ''}</p>
                          </div>
                          <div className="expertise-arrow">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M0.292893 14.2929C-0.097631 14.6834 -0.097631 15.3166 0.292893 15.7071C0.683418 16.0976 1.31658 16.0976 1.70711 15.7071L0.292893 14.2929ZM16 1C16 0.447715 15.5523 -9.44832e-09 15 -9.44832e-09L6 -9.44832e-09C5.44772 -9.44832e-09 5 0.447715 5 1C5 1.55228 5.44772 2 6 2H14L14 10C14 10.5523 14.4477 11 15 11C15.5523 11 16 10.5523 16 10L16 1ZM1 15L1.70711 15.7071L15.7071 1.70711L15 1L14.2929 0.292893L0.292893 14.2929L1 15Z" fill="#191C1C"/>
                            </svg>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </section>
        )}
        
        <section id="section-fifth" className="contactForm-panel">
          <div className="contactContent-outer">
            <div className="contactContent-inner">
              <div className="contactPanel-home">
                <h4>{contactSection?.heading || 'Contact Us'}</h4>
                <p className="xlarge">
                  <AnimatedTitle staggerDelay={0.02} duration={0.6}>
                    {contactSection?.description || "Let's talk about how we can implement strategy and transformation into your business to help you shape tomorrow."}
                  </AnimatedTitle>
                </p>
                <div className="body-button" onClick={() => window.location.href = contactLinkUrl} role="button" tabIndex={0} >
                  {contactSection?.ctaText || 'Talk To Us'}
                  <div className="ctaButton-iconContainer">
                    <svg className="first" width="12" height="12" viewBox="0 0 12 12" fill="#000" xmlns="http://www.w3.org/2000/svg"><path d="M0.46967 10.5703C0.176777 10.8631 0.176777 11.338 0.46967 11.6309C0.762563 11.9238 1.23744 11.9238 1.53033 11.6309L0.46967 10.5703ZM11.75 1.10059C11.75 0.686372 11.4142 0.350586 11 0.350586L4.25 0.350587C3.83579 0.350587 3.5 0.686373 3.5 1.10059C3.5 1.5148 3.83579 1.85059 4.25 1.85059L10.25 1.85059L10.25 7.85058C10.25 8.2648 10.5858 8.60058 11 8.60058C11.4142 8.60058 11.75 8.2648 11.75 7.85058L11.75 1.10059ZM1.53033 11.6309L11.5303 1.63092L10.4697 0.570256L0.46967 10.5703L1.53033 11.6309Z"></path></svg>
                    <svg className="second" width="12" height="12" viewBox="0 0 12 12" fill="#FFF" xmlns="http://www.w3.org/2000/svg"><path d="M0.46967 10.5703C0.176777 10.8631 0.176777 11.338 0.46967 11.6309C0.762563 11.9238 1.23744 11.9238 1.53033 11.6309L0.46967 10.5703ZM11.75 1.10059C11.75 0.686372 11.4142 0.350586 11 0.350586L4.25 0.350587C3.83579 0.350587 3.5 0.686373 3.5 1.10059C3.5 1.5148 3.83579 1.85059 4.25 1.85059L10.25 1.85059L10.25 7.85058C10.25 8.2648 10.5858 8.60058 11 8.60058C11.4142 8.60058 11.75 8.2648 11.75 7.85058L11.75 1.10059ZM1.53033 11.6309L11.5303 1.63092L10.4697 0.570256L0.46967 10.5703L1.53033 11.6309Z"></path></svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      </>
    </div>
  );
};

export default CustomHomepage;