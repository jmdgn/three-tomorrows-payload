document.addEventListener('DOMContentLoaded', () => {
  const sceneLoader = {
    loadedScenes: new Set(),
    
    loadScene: async (sceneName) => {
      if(sceneLoader.loadedScenes.has(sceneName)) return;

      try {
        const sceneModule = await import(`./scenes/${sceneName}.js`);
        if (sceneModule.init) sceneModule.init();
        sceneLoader.loadedScenes.add(sceneName);
        
        // Add loading state management
        const container = document.querySelector(`[data-scene="${sceneName}"]`);
        if (container) container.removeAttribute('data-loading');
        
      } catch (error) {
        console.error(`Error loading ${sceneName}:`, error);
      }
    }
  };

  // Configure scenes with data attributes
  const staggeredScenes = {
    '.bubble-container': {
      scene: 'bubblesScene',
      loadingClass: 'bubbles-loading'
    },
    '.cloud-scene': {
      scene: 'clouds',
      loadingClass: 'clouds-loading'
    }
  };

  Object.entries(staggeredScenes).forEach(([selector, config]) => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if(entry.isIntersecting) {
          const container = entry.target;
          container.setAttribute('data-loading', 'true');
          sceneLoader.loadScene(config.scene);
          observer.unobserve(container);
        }
      });
    }, { 
      rootMargin: '200px 0px',
      threshold: 0.01 
    });

    const target = document.querySelector(selector);
    if(target) {
      target.setAttribute('data-scene', config.scene);
      observer.observe(target);
    }
  });
});