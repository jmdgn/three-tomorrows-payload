/* Scroll to the top of the page on refresh */
(function() {
  if (document.readyState === 'complete') {
    window.scrollTo(0, 0);
  } else {
    window.addEventListener('load', function() {
      window.scrollTo(0, 0);
    });
  }
})();

/* Anchor Link Correction Scripts */
(function() {
  function initAnchorLinks() {
    // Handle anchor link clicks
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", function (e) {
        e.preventDefault();
        const targetId = this.getAttribute("href");
        const targetElement = document.querySelector(targetId);

        if (targetElement) {
          const header = document.querySelector("header");
          const headerHeight = header ? header.offsetHeight : 0;
          const targetPosition = targetElement.offsetTop - headerHeight;

          window.scrollTo({
            top: targetPosition,
            behavior: "smooth",
          });

          history.replaceState(null, null, window.location.pathname);
        }
      });
    });

    // Handle initial page load with hash in URL
    if (window.location.hash) {
      const targetElement = document.querySelector(window.location.hash);
      if (targetElement) {
        setTimeout(() => {
          const header = document.querySelector("header");
          const headerHeight = header ? header.offsetHeight : 0;
          const targetPosition = targetElement.offsetTop - headerHeight;
          window.scrollTo(0, targetPosition);
          history.replaceState(null, null, window.location.pathname);
        }, 100);
      }
    }
  }

  if (document.readyState !== 'loading') {
    initAnchorLinks();
  } else {
    document.addEventListener('DOMContentLoaded', initAnchorLinks);
  }
})();

/* Delay Main Load on Homepage */
(function() {
  function initMainLoad() {
    setTimeout(() => {
      const mainElement = document.querySelector("main");
      if (mainElement) {
        mainElement.style.display = "block";
        mainElement.style.opacity = "1";
      }
    }, 1000);
  }

  if (document.readyState !== 'loading') {
    initMainLoad();
  } else {
    document.addEventListener('DOMContentLoaded', initMainLoad);
  }
})();

/* Footer Load Delay */
(function() {
  function initFooterLoad() {
    const footer = document.querySelector("footer");
    if (footer) {
      footer.style.display = "none";
      footer.style.opacity = "0";

      setTimeout(() => {
        footer.style.display = "block";
        setTimeout(() => {
          footer.style.transition = "opacity 0.5s ease-in-out";
          footer.style.opacity = "1";
        }, 50);
      }, 2000);
    }
  }

  if (document.readyState !== 'loading') {
    initFooterLoad();
  } else {
    document.addEventListener('DOMContentLoaded', initFooterLoad);
  }
})();
