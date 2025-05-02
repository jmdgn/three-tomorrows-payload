document.addEventListener('DOMContentLoaded', () => {
  let camera, scene, renderer
  let pearlBubbles = []
  let orbitingSpheres = {}

  const BUBBLE_COUNT = 15
  const MAX_DEPTH = 100
  const ORBIT_SPEED_MULTIPLIER = 0.5

  const container = document.querySelector('.bubble-container')
  if (!container) {
    console.error('Bubble container not found!')
    return
  }

  init()
  animate()

  function init() {
    scene = new THREE.Scene()

    // Create a perspective camera
    camera = new THREE.PerspectiveCamera(
      75,
      container.clientWidth / container.clientHeight,
      1,
      1000,
    )
    camera.position.set(0, -container.clientHeight * 0.5, 50)
    camera.lookAt(0, 0, 0)

    try {
      // Set up the renderer with transparency and anti-aliasing
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      })
    } catch (error) {
      console.error('WebGL context creation failed:', error)
      return
    }

    renderer.setSize(container.clientWidth, container.clientHeight)
    renderer.setClearColor(0x000000, 0)
    container.appendChild(renderer.domElement)

    // Create lighting for the scene
    setupLights()

    // Create pearl bubbles
    createPearlBubbles()
  }

  function setupLights() {
    // Ambient light to provide overall illumination
    const ambientLight = new THREE.AmbientLight(0x4080ff, 0.5)
    scene.add(ambientLight)

    // Directional light for highlights and shadows
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(0, 50, 100)
    scene.add(directionalLight)

    // Add a soft point light to enhance the pearl effect
    const pointLight = new THREE.PointLight(0xffffff, 0.6)
    pointLight.position.set(30, 30, 50)
    scene.add(pointLight)
  }

  function createPearlBubbles() {
    // Create the pearl material with iridescent properties
    const pearlMaterial = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      specular: 0xffffff,
      shininess: 100,
      transparent: true,
      opacity: 0.8,
      reflectivity: 1,
    })

    // Material for the smaller orbiting spheres
    const orbitingSphereMaterial = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.8,
    })

    const pearlGeometry = new THREE.SphereGeometry(1, 32, 32)
    const orbitingSphereGeometry = new THREE.SphereGeometry(0.2, 16, 16)

    for (let i = 0; i < BUBBLE_COUNT; i++) {
      // Create the main pearl bubble
      const pearlBubble = new THREE.Mesh(pearlGeometry, pearlMaterial.clone())
      resetBubble(pearlBubble, true)
      scene.add(pearlBubble)
      pearlBubbles.push(pearlBubble)

      // Create orbiting spheres for each pearl bubble
      const orbiters = []
      for (let j = 0; j < 3; j++) {
        const orbiter = new THREE.Mesh(orbitingSphereGeometry, orbitingSphereMaterial.clone())
        // Set initial positions - will be updated in animation loop
        orbiter.position.set(0, 0, 0)
        scene.add(orbiter)
        orbiters.push(orbiter)
      }
      orbitingSpheres[pearlBubble.id] = orbiters
    }
  }

  function resetBubble(bubble, initial = false) {
    // Position bubbles at the bottom with random horizontal positions
    bubble.position.x = (Math.random() - 0.5) * container.clientWidth * 0.1
    bubble.position.z = (Math.random() - 0.5) * MAX_DEPTH
    bubble.position.y = initial
      ? -container.clientHeight * 0.5 - Math.random() * 100
      : -container.clientHeight * 0.5 - Math.random() * 50

    // Random size for each bubble
    const scale = 0.5 + Math.random() * 1.5
    bubble.scale.setScalar(scale)

    // Set movement properties
    bubble.speed = 0.3 + Math.random() * 1.0 // Upward speed
    bubble.wobbleSpeed = 0.2 + Math.random() * 0.5 // Side-to-side wobble speed
    bubble.wobbleAmount = 0.2 + Math.random() * 0.8 // How much it wobbles
    bubble.rotationSpeed = (Math.random() - 0.5) * 0.01 // Rotation speed

    // Set full opacity for fresh bubbles
    bubble.material.opacity = 0.8

    // Set up unique orbital properties for this bubble
    bubble.orbitConfig = {
      speed: 0.005 + Math.random() * 0.01,
      radius: scale * 1.2,
      phaseOffsets: [
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2,
      ],
      inclinations: [Math.random() * 0.5, Math.random() * 0.5 + 0.5, Math.random() * 0.5 + 1.0],
    }
  }

  function updateOrbitingSpheres(parentBubble, time) {
    const orbiters = orbitingSpheres[parentBubble.id]
    if (!orbiters) return

    const config = parentBubble.orbitConfig
    const speed = config.speed * ORBIT_SPEED_MULTIPLIER
    const radius = config.radius

    for (let i = 0; i < orbiters.length; i++) {
      const orbiter = orbiters[i]
      const phaseOffset = config.phaseOffsets[i]
      const inclination = config.inclinations[i]

      // Calculate orbiting position
      const angle = time * speed + phaseOffset
      orbiter.position.x = parentBubble.position.x + Math.cos(angle) * radius
      orbiter.position.y =
        parentBubble.position.y + Math.sin(angle) * radius * Math.cos(inclination)
      orbiter.position.z =
        parentBubble.position.z + Math.sin(angle) * radius * Math.sin(inclination)

      // Match parent bubble opacity for fading
      orbiter.material.opacity = parentBubble.material.opacity
    }
  }

  function animate() {
    requestAnimationFrame(animate)

    const time = performance.now() * 0.001

    pearlBubbles.forEach((bubble) => {
      // Upward movement
      bubble.position.y += bubble.speed

      // Side-to-side wobble motion
      bubble.position.x += Math.sin(time * bubble.wobbleSpeed) * bubble.wobbleAmount * 0.1

      // Gentle rotation
      bubble.rotation.x += bubble.rotationSpeed
      bubble.rotation.y += bubble.rotationSpeed * 0.7

      // Adjust size based on depth
      const depthFactor = 1 - bubble.position.z / MAX_DEPTH
      bubble.scale.x = bubble.scale.y = bubble.scale.z * (0.8 + depthFactor * 0.4)

      // Fade out as bubbles reach the top
      const viewHeight = container.clientHeight
      const distanceFromTop = viewHeight * 0.5 - bubble.position.y

      if (distanceFromTop < viewHeight * 0.2) {
        // Start fading out in the top 20% of the container
        const fadeProgress = Math.max(0, distanceFromTop / (viewHeight * 0.2))
        bubble.material.opacity = 0.8 * fadeProgress
      }

      // Update the orbiting spheres for this bubble
      updateOrbitingSpheres(bubble, time)

      // Reset bubble when it goes off-screen or becomes too transparent
      if (bubble.position.y > container.clientHeight * 0.5 || bubble.material.opacity < 0.05) {
        resetBubble(bubble)
      }
    })

    // Gentle camera movement for added underwater effect
    camera.position.x = Math.sin(time * 0.2) * 2
    camera.position.y = -container.clientHeight * 0.5 + Math.cos(time * 0.15) * 1.5
    camera.lookAt(Math.sin(time * 0.1) * 5, 0, 0)

    renderer.render(scene, camera)
  }

  // Handle window resize
  window.addEventListener('resize', () => {
    camera.aspect = container.clientWidth / container.clientHeight
    camera.updateProjectionMatrix()
    renderer.setSize(container.clientWidth, container.clientHeight)
  })

  // Expose scene elements to window for debugging or external interaction
  window.pearlBubblesScene = {
    renderer,
    camera,
    scene,
    pearlBubbles,
    orbitingSpheres,
  }
})
