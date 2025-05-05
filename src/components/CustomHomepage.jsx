'use client'

import React, { useEffect, useRef, useState } from 'react';
import { HomepageScripts, HomepageSceneContainer } from '@/components/HomeScripts/HomepageScripts.tsx'
import { LandingScripts } from '@/components/HomeScripts/LandingScripts.tsx'
import { LandingEffects } from '@/components/HomeScripts/LandingEffects.client.tsx'
import { AnimationBottom } from '@/components/HomeScripts/AnimationBottom.tsx'
import { StaticGradientBackground } from '@/components/HomeScripts/StaticGradientBackground';
import BackgroundTransition from "@/components/HomeScripts/BackgroundTransition";
import AnimatedTitle from '@/components/HomeScripts/AnimatedTitle';
import { getMediaUrl } from '../utilities/media-utils';

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

const CustomHomepage = (props) => {
  const {
    heroSection = {},
    introSection = {},
    servicesSection = {},
    factoidsSection = {},
    expertiseSection = {},
    contactSection = {},
  } = props;

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
  
  const carouselRef = useRef(null);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const isDownRef = useRef(false);
  const [currentSlide, setCurrentSlide] = useState(0);
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
    },
  ];
  
  const totalSlides = serviceItems.length;

  const factoidItems = factoidsSection?.factoids || [
    { text: '70% of small businesses will transition to new ownership in the next decade' },
  ];

  const techExpertiseItems = expertiseSection?.techExpertise?.items || [
    { text: 'AI Integration', isImage: false },
  ];

  const sustainabilityExpertiseItems = expertiseSection?.sustainabilityExpertise?.items || [
    { text: 'Shared Value Creation', isImage: false },
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
    const initializeCarousel = () => {
      const carousel = document.querySelector('.service-carousel');
      if (!carousel) return;
      
      carouselRef.current = carousel;
      
      const containerWidth = carousel.parentElement.offsetWidth;
      const slidePeekAmount = 16;
      const slideWidth = containerWidth - slidePeekAmount;
      
      const slides = carousel.querySelectorAll('.carousel-slide');
      slides.forEach(slide => {
        slide.style.width = `${slideWidth}px`;
        slide.style.flex = `0 0 ${slideWidth}px`;
      });
      
      let isDragging = false;
      let startX = 0;
      let currentX = 0;
      let startScrollLeft = 0;
      let startTime = 0;
      
      carousel.addEventListener('mousedown', (e) => {
        isDragging = true;
        carousel.classList.add('active');
        startX = e.pageX - carousel.offsetLeft;
        startScrollLeft = carousel.scrollLeft;
        startTime = Date.now();
      });
      
      carousel.addEventListener('mouseleave', () => {
        isDragging = false;
        carousel.classList.remove('active');
      });
      
      carousel.addEventListener('mouseup', () => {
        isDragging = false;
        carousel.classList.remove('active');
        handleSwipeEnd();
      });
      
      carousel.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        e.preventDefault();
        currentX = e.pageX - carousel.offsetLeft;
        const walk = (currentX - startX) * 1.5;
        carousel.scrollLeft = startScrollLeft - walk;
      });
      
      carousel.addEventListener('touchstart', (e) => {
        isDragging = true;
        startX = e.touches[0].pageX - carousel.offsetLeft;
        startScrollLeft = carousel.scrollLeft;
        startTime = Date.now();
      }, { passive: false });
      
      carousel.addEventListener('touchend', () => {
        isDragging = false;
        handleSwipeEnd();
      });
      
      carousel.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        currentX = e.touches[0].pageX - carousel.offsetLeft;
        const walk = (currentX - startX) * 1;
        carousel.scrollLeft = startScrollLeft - walk;
      }, { passive: false });
      
      const handleSwipeEnd = () => {
        const endTime = Date.now();
        const swipeTime = endTime - startTime;
        const distance = Math.abs(currentX - startX);
        const velocity = distance / swipeTime;
        
        const swipeDirection = startX < currentX ? 'right' : 'left';
        
        if ((velocity > 0.2 && distance > 30) || distance > slideWidth * 0.2) {
          if (swipeDirection === 'left' && currentSlide < totalSlides - 1) {
            goToSlide(currentSlide + 1);
          } else if (swipeDirection === 'right' && currentSlide > 0) {
            goToSlide(currentSlide - 1);
          } else {
            snapToNearestSlide();
          }
        } else {
          snapToNearestSlide();
        }
      };
      
      carousel.addEventListener('scroll', throttle(() => {
        const currentIndex = Math.round(carousel.scrollLeft / slideWidth);
        setCurrentSlide(currentIndex);
      }, 100));
      
      carousel.scrollTo({
        left: 0,
        behavior: 'auto'
      });
    };
    
    if (isMobile) {
      setTimeout(initializeCarousel, 500);
    }
    
    return () => {
      if (carouselRef.current) {
        const carousel = carouselRef.current;
        carousel.removeEventListener('mousedown', () => {});
        carousel.removeEventListener('mouseleave', () => {});
        carousel.removeEventListener('mouseup', () => {});
        carousel.removeEventListener('mousemove', () => {});
        carousel.removeEventListener('touchstart', () => {});
        carousel.removeEventListener('touchend', () => {});
        carousel.removeEventListener('touchmove', () => {});
        carousel.removeEventListener('scroll', () => {});
      }
    };
  }, [isMobile]);
  
  const snapToNearestSlide = () => {
    if (!carouselRef.current) return;
    
    const carousel = carouselRef.current;
    const containerWidth = carousel.parentElement.offsetWidth;
    const slidePeekAmount = 16;
    const slideWidth = containerWidth - slidePeekAmount;
    
    const currentIndex = Math.round(carousel.scrollLeft / slideWidth);
    
    carousel.scrollTo({
      left: currentIndex * slideWidth,
      behavior: 'smooth'
    });
    
    setCurrentSlide(currentIndex);
  };
  
  const goToSlide = (index) => {
    if (!carouselRef.current || index < 0 || index >= totalSlides) return;
    
    const carousel = carouselRef.current;
    const containerWidth = carousel.parentElement.offsetWidth;
    const slidePeekAmount = 16;
    const slideWidth = containerWidth - slidePeekAmount;
    
    carousel.scrollTo({
      left: index * slideWidth,
      behavior: 'smooth'
    });
    
    setCurrentSlide(index);
  };

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
      
      // Remove scale from transform, only apply translation
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
    
          // Update opacity instead of scale
          waterContainerRef.current.style.opacity = opacity;
          
          // Still keep the same values in refs for other parts of the code that might use them
          currentScaleRef.current = opacity; // Using the same ref but for opacity now
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
    
          // Handle mouse movement separately
          const lastMouseEvent = window._lastMouseEvent;
          if (lastMouseEvent) {
            // Apply transform without scale
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
      <StaticGradientBackground />
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
                  </div>
                </div>
              </div>
              
              {isMobile ? (
                <>
                  <div className="service-carousel-container">
                    <div className="service-carousel">
                      {serviceItems.map((service, index) => (
                        <div className="carousel-slide" key={index}>
                          <div className="serviceCard">
                            <div className="serviceContent-panelTop">
                              <div className="serviceFt-image">
                                <img
                                  className="service-image"
                                  src={getImageSrc(service.image)}
                                  width={442}
                                  height={442}
                                  alt={`${service.breakTitle} ${service.title} Image`}
                                  loading="lazy"
                                  onError={(e) => {
                                    console.error('Image failed to load:', e.target.src);
                                    e.target.src = 'assets/images/services/trend.png';
                                  }}
                                />
                              </div>
                            </div>
                            <div className="serviceText-panelBottom">
                              <h6>{service.title}</h6>
                              <p>{service.description}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="carousel-dots">
                      {Array.from({ length: totalSlides }).map((_, index) => (
                        <div 
                          key={index} 
                          className={`carousel-dot ${currentSlide === index ? 'active' : ''}`}
                          onClick={() => goToSlide(index)}
                        />
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                /* Desktop Grid View - Original Layout */
                <div className="serviceGrid-container">
                  {serviceItems.map((service, index) => (
                    <div className="servicePanel-container" key={index}>

                        <div className="serviceContent-panelTop">
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
                                e.target.src = 'assets/images/services/trend.png'; // Fallback on error
                              }}
                            />
                          </div>
                        </div>
                        <div className="serviceText-panelBottom">
                          <h6>{service.title}</h6>
                          <p>{service.description}</p>
                        </div>

                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
        <section id="section-third" className="factoids-complete">
          <div className="factsContent-outer">
            <div className="factoidBkgnd-sticky">
              <div className="factAssets-container" />
            </div>
            
            <div className="factoidContent-full">
              <div className="factText-container">
                
                <div className="stickyContent-title">
                  <h1>{factoidsSection?.heading || 'We are entering an unprecedented age of change'}</h1>
                </div>
                
                <div className="factoidTitle-group">
                  {factoidItems.map((factoid, index) => (
                    <div className="factoidSingle-container" key={index}>
                      <div className="factCard-container">
                        <h2>{factoid.text}</h2>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="anchorBtn-container">
                  <div className="prompt-button" onClick={() => {
                    const expertisePanel = document.getElementById('section-fourth');
                    if (expertisePanel) {
                      const headerHeight = document.querySelector("header")?.offsetHeight || 0;
                      const offset = window.innerHeight * 0;
                      const targetPosition = expertisePanel.offsetTop - headerHeight + offset;
                      window.scrollTo({
                        top: targetPosition,
                        behavior: "smooth"
                      });
                    }
                  }}>{factoidsSection?.skipButtonText || 'Skip Industry Facts'}</div>
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
            </div>
          </div>
        </section>
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

              <div className="expertise-carousel">
                <div className="expertiseSubtitle-firstRow">
                  <h6>{expertiseSection?.techExpertise?.heading || 'Emerging Technology Futures'}</h6>
                </div>
                <div className="infinite-carousel-container">
                  <div className="infinite-carousel" id="tech-expertise-carousel">
                    {techExpertiseItems.map((item, index) => (
                      <div className={`carousel-item ${item.isImage ? 'square' : ''}`} key={index}>
                        <div className={`tech-card ${item.isImage ? 'square' : ''}`}>
                          {item.isImage ? (
                            <img
                              className="carousel-image"
                              src={getImageSrc(item.image)}
                              width={1024}
                              height={1024}
                              alt="Expertise Display"
                              loading="lazy"
                              onError={(e) => {
                                console.error('Image failed to load:', e.target.src);
                                e.target.src = 'assets/images/expertise/block.png';
                                e.target.style.opacity = '1';
                              }}
                            />
                          ) : (
                            <h3 className="thin">{item.text}</h3>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="expertise-carousel">
                <div className="expertiseSubtitle-firstRow">
                  <h6>{expertiseSection?.sustainabilityExpertise?.heading || 'Strategic Sustainability & Social Impact'}</h6>
                </div>
                <div className="infinite-carousel-container">
                  <div className="infinite-carousel" id="sustainability-expertise-carousel">
                    {sustainabilityExpertiseItems.map((item, index) => (
                      <div className={`carousel-item ${item.isImage ? 'square' : ''}`} key={index}>
                        <div className={`tech-card ${item.isImage ? 'square' : ''}`}>
                          {item.isImage ? (
                            <img
                              className="carousel-image"
                              src={getImageSrc(item.image)}
                              width={1024}
                              height={1024}
                              alt="Expertise Display"
                              onError={(e) => {
                                console.error('Image failed to load:', e.target.src);
                                e.target.src = 'assets/images/expertise/block.png';
                              }}
                            />
                          ) : (
                            <h3 className="thin">{item.text}</h3>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>
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
                <div 
                  className="body-button" 
                  onClick={() => window.location.href = contactLinkUrl}
                  role="button"
                  tabIndex={0}
                >
                  {contactSection?.ctaText || 'Talk To Us'}
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