/* Intro Text Animation */
(function() {
  function initTextAnimation() {
    const elementsToAnimate = [
      document.querySelector(".intro-title"),
      document.querySelector(".body-large"),
      document.querySelector(".anchorBtn-container"),
    ].filter(Boolean); // Filter out null elements

    if (elementsToAnimate.length === 0) return;

    function handleScroll() {
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      const maxScroll = windowHeight * 0.5;

      let progress = Math.min(scrollPosition / maxScroll, 1);

      elementsToAnimate.forEach((element) => {
        element.style.transform = `translateY(-${progress * 10}%)`;
        element.style.opacity = 1 - progress;
      });
    }

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Initial check
  }

  if (document.readyState !== 'loading') {
    initTextAnimation();
  } else {
    document.addEventListener('DOMContentLoaded', initTextAnimation);
  }
})();

/* Foreground Position Change */
(function() {
  function initForegroundObserver() {
    const foregroundElements = document.querySelector(".foreground-elements");
    const introSection = document.querySelector(".intro-section");

    if (foregroundElements && introSection) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            foregroundElements.style.zIndex = entry.isIntersecting ? "2" : "-1";
          });
        },
        { threshold: 0.1 }
      );
      observer.observe(introSection);
    }
  }

  if (document.readyState !== 'loading') {
    initForegroundObserver();
  } else {
    document.addEventListener('DOMContentLoaded', initForegroundObserver);
  }
})();

/* Intro Overlay Fade-In */
(function() {
  function initOverlayFade() {
    const overlay = document.querySelector(".ocean-overlay");
    if (!overlay) return;

    function handleScroll() {
      const scrollTop = window.scrollY;
      let triggerDistance;

      if (window.innerWidth < 768) triggerDistance = 500;
      else if (window.innerWidth < 1024) triggerDistance = 800;
      else if (window.innerWidth < 1280) triggerDistance = 1000;
      else if (window.innerWidth < 1740) triggerDistance = 1400;
      else triggerDistance = 1800;

      overlay.style.opacity = Math.min(scrollTop / triggerDistance, 1);
    }

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Initial check
  }

  if (document.readyState !== 'loading') {
    initOverlayFade();
  } else {
    document.addEventListener('DOMContentLoaded', initOverlayFade);
  }
})();

/* Introduction Statement Fade-In */
(function() {
  function initStatementFade() {
    const statementContainer = document.querySelector(".introState-inner");
    if (!statementContainer) return;

    const statement = statementContainer.querySelector("h2");
    if (!statement || !statement.textContent) return;

    const words = statement.textContent.split(" ");
    statement.innerHTML = words
      .map((word) => `<span class="fade-word">${word}</span>`)
      .join(" ");

    const wordElements = statement.querySelectorAll(".fade-word");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            statementContainer.classList.add("visible");
            resetWords(wordElements, false);
            setTimeout(() => fadeInWordsRandomly(wordElements), 200);
          } else {
            statementContainer.classList.remove("visible");
            resetWords(wordElements, true);
          }
        });
      },
      { threshold: 0.5 }
    );

    observer.observe(statementContainer);
  }

  function fadeInWordsRandomly(words) {
    Array.from(words)
      .sort(() => Math.random() - 0.5)
      .forEach((word, i) => {
        setTimeout(() => word.classList.add("fade-in"), i * 50);
      });
  }

  function resetWords(words, hide = false) {
    words.forEach((word) => {
      word.classList.remove("fade-in");
      word.classList.toggle("hidden", hide);
    });
  }

  if (document.readyState !== 'loading') {
    initStatementFade();
  } else {
    document.addEventListener('DOMContentLoaded', initStatementFade);
  }
})();

/* Fade in New Sphere Object */
(function() {
  function initSphereFade() {
    const sphereContainer = document.getElementById("sphere-container");
    const introPara = document.querySelector(".intro-para");
    const introElement = document.querySelector(".factoids-complete");

    if (!sphereContainer || !introPara || !introElement) return;

    sphereContainer.style.opacity = 0;
    sphereContainer.style.transition = "opacity 0.4s ease-in-out";

    function handleScroll() {
      const viewportHeight = window.innerHeight;
      const introParaRect = introPara.getBoundingClientRect();
      const approachSnippetRect = introElement.getBoundingClientRect();

      sphereContainer.style.opacity = introParaRect.bottom <= viewportHeight * 0.8 && 
        approachSnippetRect.bottom > viewportHeight * 0.7 ? 1 : 0;
    }

    window.addEventListener("scroll", handleScroll);
    handleScroll();
  }

  if (document.readyState !== 'loading') {
    initSphereFade();
  } else {
    document.addEventListener('DOMContentLoaded', initSphereFade);
  }
})();

/* Exit Animation for Pearl Sphere */
(function() {
  function initSphereExit() {
    const servicePanel = document.querySelector(".factoids-complete");
    if (!servicePanel) return;

    window.currentScale = 1;
    let targetScale = 1;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          targetScale = entry.intersectionRatio >= 0.6 ? 0 : 1;
        });
      },
      { threshold: 0.6 }
    );
    observer.observe(servicePanel);

    function checkThreeJS() {
      if (typeof THREE === 'undefined') {
        setTimeout(checkThreeJS, 100);
        return;
      }
      animateScale();
    }

    function animateScale() {
      requestAnimationFrame(animateScale);
      const lerpSpeed = targetScale === 0 ? 0.2 : 0.05;
      window.currentScale = THREE.MathUtils.lerp(
        window.currentScale,
        targetScale,
        lerpSpeed
      );

      if (window.sphere instanceof THREE.Object3D) {
        const baseScale = THREE.MathUtils.lerp(1, 0.2, window.scrollProgress || 0);
        window.sphere.scale.setScalar(baseScale * window.currentScale);
      }
    }

    checkThreeJS();
  }

  if (document.readyState !== 'loading') {
    initSphereExit();
  } else {
    document.addEventListener('DOMContentLoaded', initSphereExit);
  }
})();

/* H3 Title Animation */
(function() {
  function initTitleAnimation() {
    const titles = document.querySelectorAll(".animate-title");
    if (titles.length === 0) return;

    titles.forEach((title) => {
      if (!title.textContent?.trim()) return;

      const words = title.textContent.trim().split(" ").map((word) => {
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

      const observer = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              words.forEach((span, index) => {
                setTimeout(() => {
                  span.style.opacity = "1";
                  span.style.transform = "translateY(0)";
                }, index * 300);
              });
              observer.unobserve(title);
            }
          });
        },
        { threshold: 0.5 }
      );

      observer.observe(title);
    });
  }

  if (document.readyState !== 'loading') {
    initTitleAnimation();
  } else {
    document.addEventListener('DOMContentLoaded', initTitleAnimation);
  }
})();

/* Factoid Background Colour Transition */
(function() {
  function initColorTransition() {
    const overlay = document.querySelector(".ocean-overlay");
    const factoidsSection = document.querySelector("section.factoids-complete");
    if (!overlay || !factoidsSection) return;

    function interpolateColor(color1, color2, factor) {
      factor = Math.max(0, Math.min(1, factor));
      const c1 = parseInt(color1.slice(1), 16);
      const c2 = parseInt(color2.slice(1), 16);
      const r1 = (c1 >> 16) & 0xff, g1 = (c1 >> 8) & 0xff, b1 = c1 & 0xff;
      const r2 = (c2 >> 16) & 0xff, g2 = (c2 >> 8) & 0xff, b2 = c2 & 0xff;
      const r = Math.round(r1 + factor * (r2 - r1));
      const g = Math.round(g1 + factor * (g2 - g1));
      const b = Math.round(b1 + factor * (b2 - b1));
      return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
    }

    function updateOverlay() {
      const fifthSection = document.getElementById("section-fifth");
      const windowHeight = window.innerHeight;

      if (fifthSection) {
        const rectFifth = fifthSection.getBoundingClientRect();
        if (rectFifth.top < windowHeight * 0.8) {
          const startTransitionFifth = windowHeight * 0.8;
          const endTransitionFifth = windowHeight * 0.2;
          let progressExit = (startTransitionFifth - rectFifth.top) / (startTransitionFifth - endTransitionFifth);
          progressExit = Math.max(0, Math.min(1, progressExit));
          const currentColor = interpolateColor("#DBE5ED", "#EFF0F1", progressExit);
          overlay.style.background = `linear-gradient(180deg, #DBE5ED 0%, ${currentColor} 100%)`;
          return;
        }
      }

      const rectFactoids = factoidsSection.getBoundingClientRect();
      const startTransitionFactoids = windowHeight * 0.8;
      const endTransitionFactoids = windowHeight * 0.2;
      let progressEnter = (startTransitionFactoids - rectFactoids.top) / (startTransitionFactoids - endTransitionFactoids);
      progressEnter = Math.max(0, Math.min(1, progressEnter));
      const currentColor = interpolateColor("#EFF0F1", "#DBE5ED", progressEnter);
      overlay.style.background = `linear-gradient(180deg, #DBE5ED 0%, ${currentColor} 100%)`;
    }

    window.addEventListener("scroll", updateOverlay);
    window.addEventListener("resize", updateOverlay);
    updateOverlay();
  }

  if (document.readyState !== 'loading') {
    initColorTransition();
  } else {
    document.addEventListener('DOMContentLoaded', initColorTransition);
  }
})();
