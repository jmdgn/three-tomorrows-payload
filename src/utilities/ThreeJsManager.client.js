'use client'

/**
 * ThreeJsManager.client.js - Centralized Three.js management system
 *
 * IMPORTANT: This file must be imported only on the client side
 * Use dynamic imports to ensure this doesn't run during server-side rendering
 */

// Create a dummy interface for server-side context
const createDummyManager = () => ({
  initialize: () => Promise.resolve(false),
  setIsHomePage: () => null,
  cleanup: () => null,
  enableFpsMonitoring: () => null,
  pauseAnimation: () => null,
  resumeAnimation: () => null,
})

// Singleton instance - will only be created in browser context
let instance = null

// Main ThreeJsManager class
class ThreeJsManager {
  constructor() {
    if (instance) {
      return instance
    }

    instance = this

    this.initialized = false
    this.isHomePage = false
    this.animationId = null
    this.scenes = {
      ocean: { initialized: false },
      sphere: { initialized: false },
    }

    // Performance monitoring
    this.fpsMonitoring = false
    this.frameCount = 0
    this.lastFpsUpdate = 0
    this.currentFps = 0

    // Performance optimization flags
    this.isViewportVisible = true
    this.isScrolling = false
    this.scrollTimeout = null
    this.targetFrameRate = 60 // Target frame rate (will be adjusted based on device)
    this.frameInterval = 1000 / this.targetFrameRate
    this.lastFrameTime = 0

    // LOD (Level of Detail) settings
    this.qualityLevel = this.detectDeviceCapabilities()

    // Debug flags
    this.debug = process.env.NODE_ENV === 'development'
  }

  /**
   * Initialize the Three.js environment and scenes.
   * This should be called once when the homepage loads.
   */
  async initialize() {
    if (this.initialized) {
      console.log('ThreeJs already initialized')
      return true
    }

    if (!this.isHomePage) {
      console.log('Not on homepage, skipping Three.js initialization')
      return false
    }

    console.log('Starting Three.js initialization')

    try {
      // Check if THREE is already available globally
      if (window.THREE) {
        console.log('THREE already available globally')
      } else {
        // Import THREE and make it globally available
        const THREE = await import('three')
        window.THREE = THREE

        // Import required modules
        const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls.js')
        const { Water } = await import('three/examples/jsm/objects/Water.js')
        const { Sky } = await import('three/examples/jsm/objects/Sky.js')
        const { RGBELoader } = await import('three/examples/jsm/loaders/RGBELoader.js')

        window.OrbitControls = OrbitControls
        window.Water = Water
        window.Sky = Sky
        window.RGBELoader = RGBELoader

        console.log('THREE and required modules imported')
      }

      // Setup visibility and resize handlers
      this._setupEventListeners()

      // Initialize scenes if containers exist
      this._initializeScenes()

      // Start the animation loop
      this._startAnimationLoop()

      this.initialized = true
      window.threeJSInitialized = true

      return true
    } catch (error) {
      console.error('Error initializing Three.js:', error)
      this.initialized = false
      return false
    }
  }

  /**
   * Check if the current page is the homepage
   * Call this before initialization
   */
  setIsHomePage(isHomePage) {
    this.isHomePage = isHomePage

    if (!isHomePage && this.initialized) {
      this.cleanup()
    }

    return this
  }

  /**
   * Enable or disable FPS monitoring for debugging
   */
  enableFpsMonitoring(enable = true) {
    this.fpsMonitoring = enable

    if (enable && !this.fpsDisplay) {
      this.fpsDisplay = document.createElement('div')
      this.fpsDisplay.style.position = 'fixed'
      this.fpsDisplay.style.bottom = '10px'
      this.fpsDisplay.style.left = '10px'
      this.fpsDisplay.style.backgroundColor = 'rgba(0,0,0,0.5)'
      this.fpsDisplay.style.color = 'white'
      this.fpsDisplay.style.padding = '5px'
      this.fpsDisplay.style.fontFamily = 'monospace'
      this.fpsDisplay.style.fontSize = '12px'
      this.fpsDisplay.style.zIndex = '9999'
      document.body.appendChild(this.fpsDisplay)
    } else if (!enable && this.fpsDisplay) {
      if (this.fpsDisplay.parentNode) {
        this.fpsDisplay.parentNode.removeChild(this.fpsDisplay)
      }
      this.fpsDisplay = null
    }

    return this
  }

  /**
   * Clean up all Three.js resources
   * Call this when navigating away from the homepage
   */
  cleanup() {
    if (!this.initialized) return

    console.log('Cleaning up Three.js resources')

    // Stop animation loop
    if (this.animationId) {
      cancelAnimationFrame(this.animationId)
      this.animationId = null
    }

    // Clean up renderer
    if (window.renderer) {
      if (window.renderer.domElement && window.renderer.domElement.parentNode) {
        window.renderer.domElement.parentNode.removeChild(window.renderer.domElement)
      }
      window.renderer.dispose()
      if (window.renderer.renderLists) window.renderer.renderLists.dispose()
      window.renderer = null
    }

    // Clean up scene objects
    if (window.scene) {
      this._disposeSceneObjects(window.scene)
      window.scene = null
    }

    // Cleanup other objects
    window.camera = null
    if (window.controls && window.controls.dispose) {
      window.controls.dispose()
    }
    window.controls = null
    window.water = null
    window.sphere = null

    // Remove event listeners
    this._removeEventListeners()

    // Reset state
    this.scenes.ocean.initialized = false
    this.scenes.sphere.initialized = false
    this.initialized = false
    window.threeJSInitialized = false

    console.log('Three.js resources cleaned up')
  }

  /**
   * Pause animation when the page is not visible
   */
  pauseAnimation() {
    this.isViewportVisible = false
    console.log('Animation paused')
  }

  /**
   * Resume animation when the page becomes visible again
   */
  resumeAnimation() {
    if (!this.isViewportVisible) {
      this.isViewportVisible = true
      console.log('Animation resumed')

      // If animation has stopped, restart it
      if (this.initialized && !this.animationId) {
        this._startAnimationLoop()
      }
    }
  }

  // Private methods

  /**
   * Setup all event listeners for performance management
   */
  _setupEventListeners() {
    // Handle visibility changes (tab switching)
    document.addEventListener('visibilitychange', this._handleVisibilityChange.bind(this))

    // Handle resize events
    window.addEventListener('resize', this._handleResize.bind(this))

    // Handle scroll events (for performance optimization)
    window.addEventListener('scroll', this._handleScroll.bind(this), { passive: true })

    // Setup intersection observers for elements
    this._setupIntersectionObservers()
  }

  /**
   * Remove all event listeners
   */
  _removeEventListeners() {
    document.removeEventListener('visibilitychange', this._handleVisibilityChange.bind(this))
    window.removeEventListener('resize', this._handleResize.bind(this))
    window.removeEventListener('scroll', this._handleScroll.bind(this))

    // Clean up observers
    if (this.containerObserver) {
      this.containerObserver.disconnect()
      this.containerObserver = null
    }
  }

  /**
   * Handle document visibility changes
   */
  _handleVisibilityChange() {
    if (document.visibilityState === 'visible') {
      this.resumeAnimation()
    } else {
      this.pauseAnimation()
    }
  }

  /**
   * Handle window resize
   */
  _handleResize() {
    if (!this.initialized) return

    // Throttle resize handling
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout)
    }

    this.resizeTimeout = setTimeout(() => {
      if (window.renderer && window.camera) {
        const width = window.innerWidth
        const height = window.innerHeight

        window.renderer.setSize(width, height)

        if (window.camera.isPerspectiveCamera) {
          window.camera.aspect = width / height
          window.camera.updateProjectionMatrix()
        }
      }
    }, 100)
  }

  /**
   * Handle scroll events
   */
  _handleScroll() {
    if (!this.initialized) return

    this.isScrolling = true

    // Update scroll progress for animations
    const scrollY = window.scrollY
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight
    window.scrollProgress = Math.min(scrollY / maxScroll, 1)

    // Apply LOD changes during scrolling for better performance
    this._updateLOD()

    // Reset scrolling flag after scrolling stops
    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout)
    }

    this.scrollTimeout = setTimeout(() => {
      this.isScrolling = false
      this._updateLOD()
    }, 200)
  }

  /**
   * Set up intersection observers to monitor when Three.js containers are visible
   */
  _setupIntersectionObservers() {
    // Observe scene containers to optimize performance
    this.containerObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = entry.target.id

          if (id === 'scene-container' || entry.target.classList.contains('water-container')) {
            this.isViewportVisible = entry.isIntersecting

            if (entry.isIntersecting) {
              this.resumeAnimation()
            } else {
              // Don't pause immediately to avoid flickering during minor scroll adjustments
              if (this.containerVisibilityTimeout) {
                clearTimeout(this.containerVisibilityTimeout)
              }

              this.containerVisibilityTimeout = setTimeout(() => {
                if (!this.isViewportVisible) {
                  this.pauseAnimation()
                }
              }, 1000)
            }
          }
        })
      },
      { threshold: 0.1 },
    )

    // Observe scene container
    const sceneContainer = document.getElementById('scene-container')
    if (sceneContainer) {
      this.containerObserver.observe(sceneContainer)
    }

    // Observe water container
    const waterContainer = document.querySelector('.water-container')
    if (waterContainer) {
      this.containerObserver.observe(waterContainer)
    }
  }

  /**
   * Start the main animation loop
   */
  _startAnimationLoop() {
    if (!this.initialized || this.animationId) return

    const animate = (timestamp) => {
      if (!this.initialized) return

      // Skip frames based on current framerate settings
      const elapsed = timestamp - this.lastFrameTime

      if (elapsed < this.frameInterval) {
        this.animationId = requestAnimationFrame(animate)
        return
      }

      this.lastFrameTime = timestamp - (elapsed % this.frameInterval)

      // Skip animation if page is not visible
      if (!this.isViewportVisible) {
        this.animationId = requestAnimationFrame(animate)
        return
      }

      // FPS monitoring
      if (this.fpsMonitoring) {
        this.frameCount++
        if (timestamp - this.lastFpsUpdate > 1000) {
          this.currentFps = Math.round((this.frameCount * 1000) / (timestamp - this.lastFpsUpdate))
          this.lastFpsUpdate = timestamp
          this.frameCount = 0

          if (this.fpsDisplay) {
            this.fpsDisplay.textContent = `FPS: ${this.currentFps}`
          }
        }
      }

      // Update water time (keep water animation)
      if (window.water && window.water.material && window.water.material.uniforms) {
        // Adjust water animation speed based on quality
        const speedMultiplier = this.isScrolling ? 0.2 : 1.0
        window.water.material.uniforms.time.value += (0.3 / 60.0) * speedMultiplier
      }

      // Update controls
      if (window.controls) {
        window.controls.update()
      }

      // Calculate scrolling effects
      const time = timestamp * 0.0005
      const sp = window.scrollProgress || 0

      // Update sphere based ONLY on scroll - absolutely NO animation except scroll
      if (window.sphere) {
        // Base scale adjustments with scrolling
        const baseScale = window.THREE?.MathUtils?.lerp
          ? window.THREE.MathUtils.lerp(1, 0.2, sp)
          : 1 - 0.8 * sp

        // Apply scale
        window.sphere.scale.setScalar(baseScale)

        // CRITICAL: Set default sphere position at perfect halfway in water
        const initialYPosition = -5 // This makes it properly submerged

        // When scroll progresses, move sphere downwards (deeper submersion)
        // sp goes from 0 to 1 based on scroll, multiplying by -20 means moving down 20 units
        const submersionAmount = sp * -20

        // Final Y position: starts at -5, can go down to -25 when fully scrolled
        window.sphere.position.y = initialYPosition + submersionAmount

        // No rotation animation - fixed rotation angles
        // This removes ALL automatic animation, it will only move when scrolling
        window.sphere.rotation.x = 0.2
        window.sphere.rotation.z = 0.3
      }

      // Apply camera adjustments from scrolling
      if (window.camera && sp > 0) {
        if (window.THREE?.MathUtils?.lerp) {
          window.camera.position.y = window.THREE.MathUtils.lerp(30, 5, sp * 1.2)
          window.camera.position.z = window.THREE.MathUtils.lerp(100, 40, sp * 1.1)
        } else {
          window.camera.position.y = 30 - 25 * (sp * 1.2)
          window.camera.position.z = 100 - 60 * (sp * 1.1)
        }

        window.camera.updateProjectionMatrix()
      }

      // Update controls target with scrolling
      if (window.controls && window.controls.target && sp > 0) {
        if (window.THREE?.MathUtils?.lerp) {
          window.controls.target.y = window.THREE.MathUtils.lerp(12, -10, sp)
        } else {
          window.controls.target.y = 12 - 22 * sp
        }
      }

      // Render the scene
      if (window.renderer && window.scene && window.camera) {
        window.renderer.render(window.scene, window.camera)
      }

      // Request next frame
      this.animationId = requestAnimationFrame(animate)
    }

    // Start animation loop
    this.animationId = requestAnimationFrame(animate)
    console.log('Animation loop started')

    // Force proper sphere positioning after starting animation
    setTimeout(() => {
      this._ensureCorrectSpherePosition()
    }, 500)
  }

  /**
   * Initialize Ocean and Sphere scenes if their containers exist
   */
  _initializeScenes() {
    const sceneContainer = document.getElementById('scene-container')
    const waterContainer = document.querySelector('.water-container')
    const sphereContainer = document.getElementById('sphere-container')

    console.log('Initializing scenes - containers check:', {
      sceneContainer: !!sceneContainer,
      waterContainer: !!waterContainer,
      sphereContainer: !!sphereContainer,
    })

    if (!sceneContainer || !waterContainer) {
      console.warn('Required containers not found, creating containers and retrying')

      // Create containers if needed
      this._createMissingContainers()

      // Setup retry with increasing delays
      setTimeout(() => {
        if (this.initialized && !this.scenes.ocean.initialized) {
          this._initializeScenes()
        }
      }, 500)

      return
    }

    // Always initialize ocean scene first
    if (!this.scenes.ocean.initialized) {
      if (typeof window.initOceanScene === 'function') {
        try {
          // Add a small delay to ensure DOM is ready
          setTimeout(() => {
            window.initOceanScene()
            this.scenes.ocean.initialized = true
            console.log('Ocean scene initialized')

            // Make sure ocean positioning is setup properly
            if (window.water) {
              window.water.position.y = 0
            }

            // Initialize sphere after water to ensure proper z-ordering
            this._initializeSphereScene()
          }, 100)
        } catch (error) {
          console.error('Failed to initialize ocean scene:', error)
        }
      } else {
        // Load ocean scene script
        const oceanScript = document.createElement('script')
        oceanScript.src = '/scripts/landing/scenes/oceanScene.js'
        oceanScript.type = 'module'
        oceanScript.onload = () => {
          if (typeof window.initOceanScene === 'function') {
            try {
              // Add a delay after script is loaded
              setTimeout(() => {
                window.initOceanScene()
                this.scenes.ocean.initialized = true
                console.log('Ocean scene initialized from loaded script')

                // Make sure ocean is at y=0
                if (window.water) {
                  window.water.position.y = 0
                }

                // Initialize sphere after water
                this._initializeSphereScene()
              }, 100)
            } catch (error) {
              console.error('Failed to initialize ocean scene:', error)
            }
          }
        }
        document.body.appendChild(oceanScript)
      }
    } else {
      // If ocean is already initialized, initialize sphere
      this._initializeSphereScene()
    }

    // Apply performance optimizations based on device
    this._applyRendererOptimizations()

    // Final verification of positions
    setTimeout(() => {
      this._ensureCorrectSpherePosition()
    }, 1000)
  }

  /**
   * Create missing containers when needed
   */
  _createMissingContainers() {
    let sceneContainer = document.getElementById('scene-container')
    let waterContainer = document.querySelector('.water-container')
    let sphereContainer = document.getElementById('sphere-container')

    // Create scene container if needed
    if (!sceneContainer) {
      console.log('Creating missing scene container')
      sceneContainer = document.createElement('div')
      sceneContainer.id = 'scene-container'
      sceneContainer.style.position = 'fixed'
      sceneContainer.style.top = '0'
      sceneContainer.style.left = '0'
      sceneContainer.style.width = '100%'
      sceneContainer.style.height = '100%'
      sceneContainer.style.zIndex = '-1'
      document.body.appendChild(sceneContainer)
    }

    // Find parent elements
    const introSection = document.querySelector('.intro-section')
    const backgroundElements = document.querySelector('.background-elements')
    const midgroundElements = document.querySelector('.midground-elements')

    // Create water container if needed
    if (!waterContainer) {
      console.log('Creating missing water container')
      waterContainer = document.createElement('div')
      waterContainer.className = 'water-container'
      waterContainer.style.display = 'block'
      waterContainer.style.width = '100%'
      waterContainer.style.height = '100%'
      waterContainer.style.position = 'absolute'
      waterContainer.style.top = '0'
      waterContainer.style.left = '0'
      waterContainer.style.opacity = '1'
      waterContainer.style.transition = 'opacity 0.2s ease-out'

      // Add to appropriate parent
      if (backgroundElements) {
        backgroundElements.appendChild(waterContainer)
      } else if (sceneContainer) {
        sceneContainer.appendChild(waterContainer)
      } else {
        document.body.appendChild(waterContainer)
      }
    }

    // Create sphere container if needed
    if (!sphereContainer) {
      console.log('Creating missing sphere container')
      sphereContainer = document.createElement('div')
      sphereContainer.id = 'sphere-container'
      sphereContainer.style.opacity = '0'
      sphereContainer.style.transition = 'opacity 0.4s ease-in-out'

      // Add to appropriate parent
      if (midgroundElements) {
        midgroundElements.appendChild(sphereContainer)
      } else if (sceneContainer) {
        sceneContainer.appendChild(sphereContainer)
      } else {
        document.body.appendChild(sphereContainer)
      }
    }
  }

  /**
   * Initialize sphere scene
   */
  _initializeSphereScene() {
    const sphereContainer = document.getElementById('sphere-container')
    if (!sphereContainer) return

    if (!this.scenes.sphere.initialized) {
      if (typeof window.initSphereScene === 'function') {
        try {
          window.initSphereScene()
          this.scenes.sphere.initialized = true
          console.log('Sphere scene initialized')

          // Ensure proper positioning right after initialization
          this._ensureCorrectSpherePosition()
        } catch (error) {
          console.error('Failed to initialize sphere scene:', error)
        }
      } else {
        // Load sphere scene script
        const sphereScript = document.createElement('script')
        sphereScript.src = '/scripts/landing/scenes/sphereScene.js'
        sphereScript.type = 'module'
        sphereScript.onload = () => {
          if (typeof window.initSphereScene === 'function') {
            try {
              window.initSphereScene()
              this.scenes.sphere.initialized = true
              console.log('Sphere scene initialized from loaded script')

              // Ensure proper positioning right after initialization
              setTimeout(() => {
                this._ensureCorrectSpherePosition()
              }, 100)
            } catch (error) {
              console.error('Failed to initialize sphere scene:', error)
            }
          }
        }
        document.body.appendChild(sphereScript)
      }
    } else {
      // Reposition sphere if it's already initialized
      this._ensureCorrectSpherePosition()
    }
  }

  /**
   * Apply performance optimizations to the renderer based on device capabilities
   */
  _applyRendererOptimizations() {
    if (!window.renderer) return

    // Set pixelRatio based on device and quality level
    const pixelRatio =
      this.qualityLevel === 'low'
        ? Math.min(1.5, window.devicePixelRatio)
        : Math.min(2, window.devicePixelRatio)

    window.renderer.setPixelRatio(pixelRatio)

    // Apply other optimizations
    if (window.renderer.shadowMap) {
      if (this.qualityLevel === 'low') {
        window.renderer.shadowMap.enabled = false
      } else {
        window.renderer.shadowMap.enabled = true
        window.renderer.shadowMap.type = window.THREE?.PCFSoftShadowMap
      }
    }

    // Power preference
    window.renderer.powerPreference = 'high-performance'

    // Adjust target framerate based on device
    this.targetFrameRate = this.qualityLevel === 'low' ? 30 : 60
    this.frameInterval = 1000 / this.targetFrameRate

    console.log(
      `Applied ${this.qualityLevel} quality optimizations, target ${this.targetFrameRate} FPS`,
    )
  }

  /**
   * Force correct sphere position
   * This is the critical function that ensures the sphere is positioned consistently
   */
  _ensureCorrectSpherePosition() {
    if (!window.sphere) {
      console.warn('Cannot set sphere position - sphere not initialized')
      return
    }

    if (!window.water) {
      console.warn('Cannot reference water - water not initialized')
      return
    }

    console.log('Setting sphere to correct initial position')

    // Explicitly set sphere to be partially submerged
    // -5 is the perfect value to be half-submerged in the water
    window.sphere.position.y = -5

    // Ensure water is at the correct y position (0)
    window.water.position.y = 0

    // Force material updates
    if (window.sphere.material) {
      window.sphere.material.needsUpdate = true
    }

    if (window.water.material) {
      window.water.material.needsUpdate = true
    }

    // Ensure camera is properly positioned
    if (window.camera) {
      window.camera.position.set(0, 30, 100)
      window.camera.lookAt(0, 0, 0)
      window.camera.updateProjectionMatrix()
    }

    // Force a render to update positions
    if (window.renderer && window.scene && window.camera) {
      window.renderer.render(window.scene, window.camera)
    }

    // Log current state for debugging
    if (this.debug) {
      console.log('Current scene state:', {
        sphere: window.sphere ? window.sphere.position.toArray() : null,
        water: window.water ? window.water.position.toArray() : null,
        camera: window.camera ? window.camera.position.toArray() : null,
      })
    }
  }

  /**
   * Update Level of Detail based on current state (scrolling, visibility)
   */
  _updateLOD() {
    if (!window.water || !window.water.material) return

    // Water quality adjustments
    if (window.water.material.uniforms && window.water.material.uniforms.size) {
      // Store original size value if not stored yet
      if (!this._originalWaterSize && window.water.material.uniforms.size.value) {
        this._originalWaterSize = window.water.material.uniforms.size.value
      }

      // Apply size change based on scrolling and quality level
      if (this.isScrolling || this.qualityLevel === 'low') {
        window.water.material.uniforms.size.value = this._originalWaterSize * 1.5
      } else if (this._originalWaterSize) {
        window.water.material.uniforms.size.value = this._originalWaterSize
      }
    }
  }

  /**
   * Dispose of all objects in a scene to prevent memory leaks
   */
  _disposeSceneObjects(scene) {
    scene.traverse((object) => {
      if (object.geometry) {
        object.geometry.dispose()
      }

      if (object.material) {
        if (Array.isArray(object.material)) {
          object.material.forEach(this._disposeMaterial)
        } else {
          this._disposeMaterial(object.material)
        }
      }
    })
  }

  /**
   * Dispose of a material and its textures
   */
  _disposeMaterial(material) {
    if (!material) return

    // Dispose of any textures
    for (const key of Object.keys(material)) {
      const value = material[key]
      if (value && typeof value === 'object' && value.isTexture) {
        value.dispose()
      }
    }

    material.dispose()
  }

  /**
   * Detect device capabilities to determine appropriate quality level
   */
  detectDeviceCapabilities() {
    let qualityLevel = 'high'

    // Check if this is a mobile device
    const isMobile =
      /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth <= 768

    // Check for low-end hardware
    const isLowEndDevice = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4

    // Check for Safari which often has WebGL limitations
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)

    if (isMobile || isLowEndDevice || isSafari) {
      qualityLevel = 'low'
    }

    console.log(`Device quality level set to: ${qualityLevel}`)
    return qualityLevel
  }
}

// Conditional exports based on environment
let threeJsManager

// Safety check to ensure we're in browser context
if (typeof window === 'undefined') {
  // Server-side: export a dummy manager
  threeJsManager = createDummyManager()
} else {
  // Client-side: create and export the singleton instance
  threeJsManager = new ThreeJsManager()
}

// Use ES modules export
export default threeJsManager
