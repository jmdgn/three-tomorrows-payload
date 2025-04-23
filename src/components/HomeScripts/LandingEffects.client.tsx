'use client'

import { useEffect, useRef } from 'react'
import { getThree } from '@/components/HomeScripts/ThreeProvider'

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

export function LandingEffects() {
  const animationRef = useRef(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const targetRef = useRef({ x: 0.5, y: 0.5 });
  const currentScaleRef = useRef(1);
  const carouselAnimationRef = useRef([]);
  const carouselIntervalRef = useRef(null);
  
  useEffect(() => {
    const threeModules = getThree();
    const THREE = threeModules ? threeModules.THREE : (window.THREE || null);
    
    window.scrollTo(0, 0);
    
    const timeouts = [];
    const observers = [];
    const eventListeners = [];
    
    let isMounted = true;

    window.currentScale = 1;
    
    let mouseX = 0.5;
    let mouseY = 0.5;
    let targetX = 0.5;
    let targetY = 0.5;
    const parallaxIntensity = 15;

    const handleAnchorLinks = () => {
      document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        const clickHandler = function(e) {
          e.preventDefault();
          const targetId = this.getAttribute("href");
          const targetElement = document.querySelector(targetId);

          if (targetElement) {
            const headerHeight = document.querySelector("header")?.offsetHeight || 0;
            const targetPosition = targetElement.offsetTop - headerHeight;

            window.scrollTo({
              top: targetPosition,
              behavior: "smooth",
            });

            history.replaceState(null, null, window.location.pathname);
          }
        };
        
        anchor.addEventListener("click", clickHandler);
        eventListeners.push({ element: anchor, event: "click", handler: clickHandler });
      });

      if (window.location.hash) {
        const targetElement = document.querySelector(window.location.hash);
        if (targetElement) {
          const timeoutId = setTimeout(() => {
            if (!isMounted) return;
            
            const headerHeight = document.querySelector("header")?.offsetHeight || 0;
            const targetPosition = targetElement.offsetTop - headerHeight;
            window.scrollTo(0, targetPosition);

            history.replaceState(null, null, window.location.pathname);
          }, 100);
          
          timeouts.push(timeoutId);
        }
      }
    };

    
    const delayMainLoad = () => {
      const mainElement = document.querySelector("main");
      
      if (mainElement) {
        const currentDisplay = window.getComputedStyle(mainElement).display;
        if (currentDisplay === "none") {
          const timeoutId = setTimeout(() => {
            if (!isMounted) return;
            
            mainElement.style.display = "block";
            mainElement.style.opacity = "1"; // Ensure it's visible
          }, 1000);
          
          timeouts.push(timeoutId);
        }
      }
    };

  
    /* Infinite Carousel Setup */
    const setupInfiniteCarousel = () => {
      const carouselElements = document.querySelectorAll('.infinite-carousel');
      if (carouselElements.length === 0) return;
    
      const carouselAnimationRefs = [];
    
      carouselElements.forEach((carouselElement, carouselIndex) => {
        const carouselItems = carouselElement.querySelectorAll('.carousel-item');
        if (carouselItems.length === 0) return;
    
        // Cleanup old clones
        carouselElement.querySelectorAll('.carousel-item-clone').forEach(clone => clone.remove());
    
        // Determine direction: First carousel LTR, second RTL
        const isReverse = carouselIndex === 1; // Second carousel has index 1
        const animationSpeed = isReverse ? -1.2 : 1.2; // Set direction based on index
    
        // --- Cloning ---
        const cloneCount = 2;
        
        // Clone items with direction-aware placement
        for (let i = 0; i < cloneCount; i++) {
          if (isReverse) {
            // For RTL, prepend clones in reverse order
            Array.from(carouselItems).reverse().forEach(item => {
              const clone = item.cloneNode(true);
              clone.classList.add('carousel-item-clone');
              carouselElement.prepend(clone);
            });
          } else {
            // For LTR, append clones normally
            carouselItems.forEach(item => {
              const clone = item.cloneNode(true);
              clone.classList.add('carousel-item-clone');
              carouselElement.appendChild(clone);
            });
          }
        }
    
        // --- Layout Measurements ---
        const originalCount = carouselItems.length;
        const itemWidth = carouselItems[0].offsetWidth;
        const originalSetWidth = originalCount * itemWidth;
    
        // Set initial scroll position
        carouselElement.scrollLeft = isReverse 
          ? originalSetWidth * (cloneCount - 1) 
          : originalSetWidth;
    
        // --- Scroll Control ---
        let isDragging = false;
        let startX = 0;
        let initialScroll = 0;
        let isHovering = false;
    
        const animationRef = { current: null };
        carouselAnimationRefs.push(animationRef);
    
        // Adjust scroll reset logic for direction
        const adjustScrollPosition = () => {
          const currentScroll = carouselElement.scrollLeft;
          const maxScroll = originalSetWidth * (cloneCount + 1);
          const minScroll = originalSetWidth * (cloneCount - 1);
          
          if (animationSpeed > 0) { // LTR
            if (currentScroll >= maxScroll) {
              carouselElement.scrollLeft = currentScroll - originalSetWidth;
            } else if (currentScroll <= minScroll) {
              carouselElement.scrollLeft = currentScroll + originalSetWidth;
            }
          } else { // RTL
            if (currentScroll <= minScroll) {
              carouselElement.scrollLeft = currentScroll + originalSetWidth * 2;
            } else if (currentScroll >= maxScroll) {
              carouselElement.scrollLeft = currentScroll - originalSetWidth * 2;
            }
          }
        };
    
        const startAutoScroll = () => {
          if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
          }
    
          const autoScroll = () => {
            if (!isHovering && !isDragging) {
              carouselElement.scrollLeft += animationSpeed;
              adjustScrollPosition();
            }
            animationRef.current = requestAnimationFrame(autoScroll);
          };
    
          animationRef.current = requestAnimationFrame(autoScroll);
        };
    
        // --- Event Handlers ---
        const onMouseEnter = () => (isHovering = true);
        const onMouseLeave = () => (isHovering = false);
        const onMouseDown = (e) => {
          isDragging = true;
          startX = e.pageX - carouselElement.offsetLeft;
          initialScroll = carouselElement.scrollLeft;
          carouselElement.classList.add('dragging');
        };
        const onMouseUp = () => {
          isDragging = false;
          carouselElement.classList.remove('dragging');
        };
        const onMouseMove = (e) => {
          if (!isDragging) return;
          e.preventDefault();
          const x = e.pageX - carouselElement.offsetLeft;
          const walk = (x - startX) * 2;
          carouselElement.scrollLeft = initialScroll - walk;
          adjustScrollPosition();
        };
    
        const onTouchStart = (e) => {
          isDragging = true;
          startX = e.touches[0].pageX - carouselElement.offsetLeft;
          initialScroll = carouselElement.scrollLeft;
          carouselElement.classList.add('dragging');
        };
        const onTouchEnd = () => {
          isDragging = false;
          carouselElement.classList.remove('dragging');
        };
        const onTouchMove = (e) => {
          if (!isDragging) return;
          const x = e.touches[0].pageX - carouselElement.offsetLeft;
          const walk = (x - startX) * 2;
          carouselElement.scrollLeft = initialScroll - walk;
          adjustScrollPosition();
        };
    
        const onScroll = () => {
          if (isDragging) adjustScrollPosition();
        };
    
        const onResize = () => {
          const newItemWidth = carouselItems[0].offsetWidth;
          const newOriginalSetWidth = originalCount * newItemWidth;
          carouselElement.scrollLeft = (carouselElement.scrollLeft / originalSetWidth) * newOriginalSetWidth;
        };
    
        // --- Event Listeners ---
        carouselElement.addEventListener('mouseenter', onMouseEnter);
        carouselElement.addEventListener('mouseleave', onMouseLeave);
        carouselElement.addEventListener('mousedown', onMouseDown);
        carouselElement.addEventListener('mouseup', onMouseUp);
        carouselElement.addEventListener('mousemove', onMouseMove);
        carouselElement.addEventListener('scroll', onScroll);
        carouselElement.addEventListener('touchstart', onTouchStart);
        carouselElement.addEventListener('touchend', onTouchEnd);
        carouselElement.addEventListener('touchmove', onTouchMove);
        window.addEventListener('resize', onResize);
    
        // --- Visibility Handling ---
        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'visible') {
            if (animationRef.current === null) startAutoScroll();
          } else if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
            animationRef.current = null;
          }
        });
    
        // --- Scroll Trigger: In View ---
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                if (animationRef.current === null) startAutoScroll();
              } else if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
                animationRef.current = null;
              }
            });
          },
          { threshold: 0.1 }
        );
    
        observer.observe(carouselElement);
      });
    
      // Store all animation refs if needed later
      if (typeof carouselAnimationRef !== 'undefined') {
        carouselAnimationRef.current = carouselAnimationRefs;
      }
    };

    /* Intro Text Animation - Using RAF for smoothness */
    const setupIntroTextAnimation = () => {
      const elementsToAnimate = [
        document.querySelector(".intro-title"),
        document.querySelector(".intro-subtitle"),
        document.querySelector(".body-intro"),
        document.querySelector(".anchorBtn-container"),
      ].filter(Boolean);

      const handleScroll = () => {
        if (!isMounted) return;
        
        // Use requestAnimationFrame for smoother updates
        requestAnimationFrame(() => {
          const scrollPosition = window.scrollY;
          const windowHeight = window.innerHeight;
          const maxScroll = windowHeight * 0.5; // Adjust this value to control when elements disappear

          // Calculate animation progress (0 to 1)
          let progress = Math.min(scrollPosition / maxScroll, 1);

          elementsToAnimate.forEach((element) => {
            // Move elements up and fade out
            element.style.transform = `translateY(-${progress * 10}%)`;
            element.style.opacity = 1 - progress;
          });
        });
      };

      // Use throttled version for better performance while keeping smooth feel
      const throttledHandleScroll = throttle(handleScroll, 10);

      if (elementsToAnimate.length > 0) {
        window.addEventListener("scroll", throttledHandleScroll);
        eventListeners.push({ element: window, event: "scroll", handler: throttledHandleScroll });

        // Trigger initial check
        handleScroll();
      }
    };

    /* Foreground Position Change - Optimized with single observer */
    const setupForegroundPositionChange = () => {
      const foregroundElements = document.querySelector(".foreground-elements");
      const introSection = document.querySelector(".intro-section");

      if (foregroundElements && introSection) {
        const observer = new IntersectionObserver(
          (entries) => {
            if (!isMounted) return;
            
            entries.forEach((entry) => {
              // Only update style if it's changed
              const newZIndex = entry.isIntersecting ? "2" : "-1";
              if (foregroundElements.style.zIndex !== newZIndex) {
                foregroundElements.style.zIndex = newZIndex;
              }
            });
          },
          {
            threshold: 0.1, // Trigger when at least 10% of element is visible
          }
        );

        // Observe the intro section container
        observer.observe(introSection);
        observers.push({ observer, element: introSection });
      }
    };

    /* Image Position Animation on Scroll */
    const setupImagePositionAnimation = () => {
      const introParaSection = document.querySelector('.intro-para');
      const topImage = document.querySelector('.introImage-supportTop');
      const bottomImage = document.querySelector('.introImage-supportBottom');
      
      if (!introParaSection || !topImage || !bottomImage) return;
      
      const topStartPos = -25;
      const rightStartPos = -10;
      const bottomStartPos = -30;
      const leftStartPos = -15;
      
      const topTargetPos = -5;
      const rightTargetPos = -5;
      const bottomTargetPos = -12;
      const leftTargetPos = -5;
      
      topImage.style.transition = 'top 0.6s cubic-bezier(0.23, 1, 0.32, 1), right 0.6s cubic-bezier(0.23, 1, 0.32, 1)';
      bottomImage.style.transition = 'bottom 0.6s cubic-bezier(0.23, 1, 0.32, 1), left 0.6s cubic-bezier(0.23, 1, 0.32, 1)';
      
      const handleScroll = () => {
        if (!isMounted) return;
        
        requestAnimationFrame(() => {
          const rect = introParaSection.getBoundingClientRect();
          const windowHeight = window.innerHeight;
          
          const totalDistance = rect.height + windowHeight;
          const distanceTraveled = windowHeight - rect.top;
          let progress = distanceTraveled / totalDistance;
          progress = Math.max(0, Math.min(1, progress));
          
          const effectIntensity = 1 - Math.abs(progress - 0.5) * 2;
          
          const topPos = topStartPos + (topTargetPos - topStartPos) * effectIntensity + '%';
          const rightPos = rightStartPos + (rightTargetPos - rightStartPos) * effectIntensity + '%';
          const bottomPos = bottomStartPos + (bottomTargetPos - bottomStartPos) * effectIntensity + '%';
          const leftPos = leftStartPos + (leftTargetPos - leftStartPos) * effectIntensity + '%';
          
          topImage.style.top = topPos;
          topImage.style.right = rightPos;
          bottomImage.style.bottom = bottomPos;
          bottomImage.style.left = leftPos;
        });
      };
      
      const throttledHandleScroll = throttle(handleScroll, 16); // ~60fps
      window.addEventListener('scroll', throttledHandleScroll);
      eventListeners.push({ element: window, event: 'scroll', handler: throttledHandleScroll });
      
      // Initial call to set positions
      handleScroll();
    };

    /* Parallax Mouse Movement - With throttling */
    const setupParallaxMouseMovement = () => {
      // Track last update time for throttling
      let lastUpdateTime = 0;
      
      const handleMouseMove = (e) => {
        // Simple throttling - only update every 16ms (approx 60fps)
        const now = Date.now();
        if (now - lastUpdateTime < 16) return;
        
        lastUpdateTime = now;
        targetRef.current.x = e.clientX / window.innerWidth;
        targetRef.current.y = e.clientY / window.innerHeight;
      };

      window.addEventListener("mousemove", handleMouseMove);
      eventListeners.push({ element: window, event: "mousemove", handler: handleMouseMove });
    };

    /* Consolidate animation loop - this will replace multiple animation loops */
    const animate = () => {
      if (!isMounted) return;
      
      const time = performance.now() * 0.0005;

      // Smooth mouse position
      mouseX += (targetRef.current.x - mouseX) * 0.05;
      mouseY += (targetRef.current.y - mouseY) * 0.05;

      if (window.sphere && window.water) {
        // Existing scroll animations
        const sp = window.scrollProgress || 0;

        // Mouse parallax effect - only calculate if we're still in view
        if (sp < 0.95) {
          const parallaxX = (mouseX - 0.5) * parallaxIntensity;
          const parallaxY = (0.5 - mouseY) * parallaxIntensity;

          // Apply to camera position
          if (window.camera && window.controls) {
            // Smooth camera movement
            window.camera.position.x += (parallaxX - window.camera.position.x) * 0.1;
            window.camera.position.y += (parallaxY - window.camera.position.y) * 0.1;
            window.camera.lookAt(window.controls.target);
          }
        }

        // Handle sphere scaling with smooth transitions
        const targetScale = window.targetScale !== undefined ? window.targetScale : 1;
        const lerpSpeed = targetScale === 0 ? 0.2 : 0.05;
        
        // Use THREE.MathUtils.lerp if available, otherwise use manual lerp
        if (THREE && THREE.MathUtils && THREE.MathUtils.lerp) {
          currentScaleRef.current = THREE.MathUtils.lerp(
            currentScaleRef.current,
            targetScale,
            lerpSpeed
          );
        } else {
          // Manual lerp implementation
          currentScaleRef.current = currentScaleRef.current + (targetScale - currentScaleRef.current) * lerpSpeed;
        }

        // Apply scale to sphere
        const baseScale = THREE && THREE.MathUtils && THREE.MathUtils.lerp 
          ? THREE.MathUtils.lerp(1, 0.2, sp)
          : 1 - 0.8 * sp;
        
        window.sphere.scale.setScalar(baseScale * currentScaleRef.current);

        // Apply smooth position updates
        window.sphere.position.y = Math.sin(time) * 12 + 18;
        
        // Update rotations
        window.sphere.rotation.x = time * 0.3;
        window.sphere.rotation.z = time * 0.31;
        
        // Update water
        window.water.material.uniforms.time.value += 0.8 / 60.0;

        // Render scene
        if (window.controls && window.renderer && window.scene && window.camera) {
          window.controls.update();
          window.renderer.render(window.scene, window.camera);
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    /* Intro Overlay Fade-In - With RAF for smoothness */
    const setupIntroOverlayFadeIn = () => {
      const handleScroll = () => {
        if (!isMounted) return;
        
        requestAnimationFrame(() => {
          const overlay = document.querySelector(".ocean-overlay");
          if (!overlay) return;
          
          const scrollTop = window.scrollY;
          let triggerDistance;

          // Device-based distance adjustment
          if (window.innerWidth < 768) {
            triggerDistance = 500;
          } else if (window.innerWidth < 1024) {
            triggerDistance = 800;
          } else if (window.innerWidth < 1280) {
            triggerDistance = 1000;
          } else if (window.innerWidth < 1740) {
            triggerDistance = 1400;
          } else {
            triggerDistance = 1800;
          }

          let opacity = scrollTop / triggerDistance;
          opacity = Math.min(opacity, 1);

          overlay.style.opacity = opacity.toString();
        });
      };

      // Use throttling for better performance while maintaining smoothness
      const throttledHandleScroll = throttle(handleScroll, 20);
      window.addEventListener("scroll", throttledHandleScroll);
      eventListeners.push({ element: window, event: "scroll", handler: throttledHandleScroll });
      
      // Initial call
      handleScroll();
    };

    /* Introduction Statement Fade-In - Optimized */
    const setupIntroStatementFadeIn = () => {
      const statementContainer = document.querySelector(".introState-inner");
      if (!statementContainer) return;
      
      const statement = statementContainer.querySelector("h2");
      if (!statement) return;
      
      // Only proceed with text splitting if not already done
      if (!statementContainer.dataset.processed) {
        const words = statement.textContent.split(" ");
        statement.innerHTML = words
          .map((word) => `<span class="fade-word">${word}</span>`)
          .join(" ");
          
        statementContainer.dataset.processed = "true";
      }

      const wordElements = document.querySelectorAll(".fade-word");

      // Helper functions
      const fadeInWordsRandomly = (words) => {
        if (!isMounted) return;
        
        const indices = Array.from(words.keys());
        // Use a more efficient shuffling algorithm
        for (let i = indices.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [indices[i], indices[j]] = [indices[j], indices[i]];
        }

        // Process in batches for better performance
        const batchSize = 5;
        for (let batch = 0; batch < indices.length; batch += batchSize) {
          const timeoutId = setTimeout(() => {
            if (!isMounted) return;
            
            const end = Math.min(batch + batchSize, indices.length);
            for (let i = batch; i < end; i++) {
              words[indices[i]].classList.add("fade-in");
            }
          }, batch * 10); // Reduce timing between batches
          
          timeouts.push(timeoutId);
        }
      };

      const resetWords = (words, hide = false) => {
        words.forEach((word) => {
          word.classList.remove("fade-in");
          if (hide) {
            word.classList.add("hidden");
          } else {
            word.classList.remove("hidden");
          }
        });
      };

      const observer = new IntersectionObserver(
        (entries) => {
          if (!isMounted) return;
          
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              if (!statementContainer.classList.contains("visible")) {
                statementContainer.classList.add("visible"); // Ensure container becomes visible
                resetWords(wordElements, false); // Reset without hiding
                
                const timeoutId = setTimeout(() => {
                  if (!isMounted) return;
                  fadeInWordsRandomly(wordElements);
                }, 200);
                
                timeouts.push(timeoutId);
              }
            } else {
              statementContainer.classList.remove("visible");
              resetWords(wordElements, true); // Hide words on exit
            }
          });
        },
        { threshold: 0.5 }
      );

      observer.observe(statementContainer);
      observers.push({ observer, element: statementContainer });
    };

    /* Fade in New Sphere Object - Matching original behavior */
    const setupSphereObjectFade = () => {
      const sphereContainer = document.getElementById("sphere-container");
      const introPara = document.querySelector(".intro-para");
      const factoidsSection = document.querySelector(".factoids-complete");
      
      // Ensure sphereContainer starts with opacity 0
      if (sphereContainer) {
        sphereContainer.style.opacity = '0';
        sphereContainer.style.transition = "opacity 0.4s ease-in-out";
      }

      if (!sphereContainer || !introPara || !factoidsSection) return;
      
      // Using the exact same logic as the original code
      const handleScroll = () => {
        if (!isMounted) return;
        
        requestAnimationFrame(() => {
          const viewportHeight = window.innerHeight;
          const introParaRect = introPara.getBoundingClientRect();
          const factoidsRect = factoidsSection.getBoundingClientRect();
          
          // EXACTLY matching the original code's fade in condition:
          // "if (introParaRect.bottom <= viewportHeight * 0.8)"
          if (introParaRect.bottom <= viewportHeight * 0.8) {
            sphereContainer.style.opacity = '1';
          } else {
            // If intro para is not in correct position, hide sphere
            sphereContainer.style.opacity = '0';
          }
          
          // EXACTLY matching the original code's fade out condition:
          // "if (approachSnippetRect.bottom <= viewportHeight * 0.7)"
          if (factoidsRect.bottom <= viewportHeight * 0.7) {
            sphereContainer.style.opacity = '0';
          }
        });
      };
      
      // Ensure smooth animation with throttling
      const throttledScrollHandler = throttle(handleScroll, 16); // 60fps
      window.addEventListener('scroll', throttledScrollHandler);
      eventListeners.push({ element: window, event: 'scroll', handler: throttledScrollHandler });
      
      // Run initial check
      handleScroll();
    };

    /* H3 Title Animation - Optimized */
    const setupTitleAnimation = () => {
      const titles = document.querySelectorAll(".animate-title");

      if (titles.length === 0) return;

      titles.forEach((title) => {
        // Only process if not already processed
        if (!title.dataset.processed) {
          const words = title.textContent.split(" ").map((word) => {
            const span = document.createElement("span");
            span.textContent = word + " ";
            span.style.opacity = "0";
            span.style.transform = "translateY(20px)";
            span.style.display = "inline-block";
            span.style.transition = "opacity 0.5s ease, transform 0.5s ease";
            return span;
          });

          title.innerHTML = "";
          words.forEach((span) => title.appendChild(span));
          
          title.dataset.processed = "true";
        }

        const words = title.querySelectorAll("span");
        
        const observer = new IntersectionObserver(
          (entries) => {
            if (!isMounted) return;
            
            entries.forEach((entry) => {
              if (entry.isIntersecting && !title.dataset.animated) {
                title.dataset.animated = "true";
                
                // Use fewer timeouts by processing in batches
                const batchSize = 3;
                for (let i = 0; i < words.length; i += batchSize) {
                  const timeoutId = setTimeout(() => {
                    if (!isMounted) return;
                    
                    const end = Math.min(i + batchSize, words.length);
                    for (let j = i; j < end; j++) {
                      words[j].style.opacity = "1";
                      words[j].style.transform = "translateY(0)";
                    }
                  }, i * 100); // Faster animation
                  
                  timeouts.push(timeoutId);
                }
                
                observer.unobserve(title);
              }
            });
          },
          { threshold: 0.5 }
        );

        observer.observe(title);
        observers.push({ observer, element: title });
      });
    };

    
    handleAnchorLinks();
    delayMainLoad();
    
    // Setup individual animations and interactions
    setupIntroTextAnimation();
    setupForegroundPositionChange();
    setupImagePositionAnimation();
    setupParallaxMouseMovement();
    setupIntroOverlayFadeIn();
    setupIntroStatementFadeIn();
    setupSphereObjectFade();
    setupTitleAnimation();
    setupInfiniteCarousel();
    
    // Start consolidated animation loop - replacing multiple loops
    animationRef.current = requestAnimationFrame(animate);

    // Return cleanup function to remove event listeners and observers
    return () => {
      isMounted = false;
      
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }

      if (carouselAnimationRef.current) {
        if (Array.isArray(carouselAnimationRef.current)) {
          carouselAnimationRef.current.forEach(ref => {
            if (ref && ref.current) {
              cancelAnimationFrame(ref.current);
            }
          });
        } else if (carouselAnimationRef.current) {
          cancelAnimationFrame(carouselAnimationRef.current);
        }
      }
      
      if (carouselIntervalRef.current) {
        clearInterval(carouselIntervalRef.current);
      }
      
      // Clean up timeouts
      timeouts.forEach(timeoutId => clearTimeout(timeoutId));
      
      // Clean up observers
      observers.forEach(({ observer, element }) => {
        if (observer && element) {
          observer.unobserve(element);
          observer.disconnect();
        }
      });
      
      // Clean up event listeners
      eventListeners.forEach(({ element, event, handler }) => {
        element.removeEventListener(event, handler);
      });
    };
  }, []); // Empty dependency array means this effect runs once on mount

  return null; // This hook doesn't render anything
}