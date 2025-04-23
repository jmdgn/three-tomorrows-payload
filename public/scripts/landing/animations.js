(function() {
  // Check if we're running in a browser environment
  if (typeof window === 'undefined') return;

  // Global variables for animation control
  let animationId = null;
  let mouseX = 0.5;
  let mouseY = 0.5;
  let targetX = 0.5;
  let targetY = 0.5;
  const parallaxIntensity = 15;

  function initAnimations() {
    // Check THREE.js availability
    if (typeof THREE === 'undefined') {
      console.warn("THREE.js not loaded, retrying...");
      setTimeout(initAnimations, 100);
      return;
    }

    // Mouse move handler
    function handleMouseMove(e) {
      targetX = e.clientX / window.innerWidth;
      targetY = e.clientY / window.innerHeight;
    }
    window.addEventListener("mousemove", handleMouseMove);

    // Main animation loop
    function animate() {
      animationId = requestAnimationFrame(animate);
      const time = performance.now() * 0.0005;

      // Smooth mouse position
      mouseX += (targetX - mouseX) * 0.05;
      mouseY += (targetY - mouseY) * 0.05;

      if (window.sphere && window.water && window.camera && window.controls && window.renderer && window.scene) {
        const sp = window.scrollProgress || 0;

        // Parallax effect
        if (sp < 0.95) {
          const parallaxX = (mouseX - 0.5) * parallaxIntensity;
          const parallaxY = (0.5 - mouseY) * parallaxIntensity;
          window.camera.position.x += (parallaxX - window.camera.position.x) * 0.1;
          window.camera.position.y += (parallaxY - window.camera.position.y) * 0.1;
        }
        window.camera.lookAt(window.controls.target);

        // Scroll-based animations
        window.water.position.y = THREE.MathUtils.lerp(0, 30, sp);
        const baseScale = THREE.MathUtils.lerp(1, 0.2, sp);
        const finalScale = baseScale * (window.currentScale !== undefined ? window.currentScale : 1);
        window.sphere.scale.set(finalScale, finalScale, finalScale);

        // Time-based animations
        window.sphere.position.y = Math.sin(time) * 12 + 18;
        window.sphere.rotation.x = time * 0.3;
        window.sphere.rotation.z = time * 0.31;
        window.water.material.uniforms.time.value += 1.0 / 60.0;

        window.controls.update();
        window.renderer.render(window.scene, window.camera);
      }
    }

    // Start animation
    animate();

    // Cleanup function
    return function() {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }

  // Initialize when DOM is ready
  if (document.readyState !== 'loading') {
    const cleanup = initAnimations();
    if (cleanup) {
      window.addEventListener('beforeunload', cleanup);
    }
  } else {
    document.addEventListener('DOMContentLoaded', () => {
      const cleanup = initAnimations();
      if (cleanup) {
        window.addEventListener('beforeunload', cleanup);
      }
    });
  }
})();
