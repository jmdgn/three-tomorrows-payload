const { THREE, OrbitControls, RGBELoader } = window

let camera, scene, renderer, controls
let isInitialized = false
let hdrLoaded = false
let spheres = [] // Array to hold all 3 pearl spheres

let mouseX = 0.5
let mouseY = 0.5
let targetX = 0.5
let targetY = 0.5
const mouseSensitivity = 15 // Reduced for subtle movement

window.addEventListener('mousemove', (e) => {
  targetX = e.clientX / window.innerWidth
  targetY = e.clientY / window.innerHeight
})

function init() {
  if (isInitialized) return

  const container = document.getElementById('sphere-container')
  if (!container) {
    console.error('Sphere container not found. Scene cannot initialize.')
    return
  }

  scene = new THREE.Scene()

  camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 1, 20000)
  camera.position.set(30, 30, 100)

  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
  })
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setClearColor(0x000000, 0)
  container.appendChild(renderer.domElement)

  createPearlSpheres()
  setupBasicLighting()
  setupControls()

  loadHDR().then(() => {
    hdrLoaded = true
    updateMaterials()
    setupFinalLighting()
  })

  window.addEventListener('resize', onWindowResize)
  isInitialized = true
}

function createPearlSpheres() {
  // Create 3 pearl spheres positioned across screen thirds with different sizes
  const spherePositions = [
    { x: -55, y: -20, z: -5, size: 4.6 }, // Left
    { x: 0, y: 40, z: 0, size: 6.0 }, // Center
    { x: 45, y: 15, z: -8, size: 5.2 }, // Right
  ]

  spherePositions.forEach((pos, index) => {
    const geometry = new THREE.SphereGeometry(pos.size, 32, 32)
    const material = new THREE.MeshBasicMaterial({
      color: 0xf1f1f1,
      transparent: true,
      opacity: 0.8,
    })

    const sphere = new THREE.Mesh(geometry, material)
    sphere.position.set(pos.x, pos.y, pos.z)
    scene.add(sphere)
    spheres.push({
      mesh: sphere,
      basePosition: new THREE.Vector3(pos.x, pos.y, pos.z),
      size: pos.size,
      index: index,
      // NEW: Add velocity for idle movement and a vector to track the drift
      velocity: new THREE.Vector3((Math.random() - 0.5) * 0.1, (Math.random() - 0.5) * 0.1, 0),
      drift: new THREE.Vector3(0, 0, 0),
    })
  })
}

function setupBasicLighting() {
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.3)
  scene.add(ambientLight)
}

function setupFinalLighting() {
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.7)
  directionalLight.position.set(0, 50, 100)
  scene.add(directionalLight)
}

function setupControls() {
  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableZoom = false
  controls.enablePan = false
  controls.maxPolarAngle = Math.PI * 0.495
  controls.target.set(0, 12, 0)
  controls.minDistance = 40.0
  controls.maxDistance = 200.0
  controls.update()
}

async function loadHDR() {
  try {
    const texture = await new RGBELoader()
      .setPath('https://threejs.org/examples/textures/equirectangular/')
      .loadAsync('royal_esplanade_1k.hdr')

    const pmremGenerator = new THREE.PMREMGenerator(renderer)
    pmremGenerator.compileEquirectangularShader()
    const envMap = pmremGenerator.fromEquirectangular(texture).texture

    texture.dispose()
    pmremGenerator.dispose()

    scene.environment = envMap
  } catch (error) {
    console.error('Error loading HDR:', error)
  }
}

function updateMaterials() {
  spheres.forEach((sphereObj) => {
    const sphereGeometry = new THREE.SphereGeometry(sphereObj.size, 64, 64)
    const sphereMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xf1f1f1,
      roughness: 0.2,
      metalness: 0.2,
      transmission: 0.95,
      thickness: 1.0,
      reflectivity: 0.2,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
    })

    // Using a simple color instead of a texture that needs to be loaded
    sphereMaterial.needsUpdate = true

    sphereObj.mesh.geometry = sphereGeometry
    sphereObj.mesh.material = sphereMaterial
  })
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
}

function animate() {
  requestAnimationFrame(animate)

  if (!isInitialized) {
    init()
    return
  }

  // Smooth mouse tracking
  mouseX += (targetX - mouseX) * 0.05
  mouseY += (targetY - mouseY) * 0.05

  if (spheres.length > 0) {
    const time = performance.now() * 0.0005

    spheres.forEach((sphereObj, index) => {
      const sphere = sphereObj.mesh
      const basePos = sphereObj.basePosition
      const timeOffset = index * Math.PI * 0.7

      // --- NEW: IDLE MOVEMENT AND BOUNDARY CHECK ---

      // Update the drift offset with the current velocity
      sphereObj.drift.add(sphereObj.velocity)

      // Add a tiny bit of random motion to the velocity to make it less predictable
      sphereObj.velocity.x += (Math.random() - 0.5) * 0.0005
      sphereObj.velocity.y += (Math.random() - 0.5) * 0.0005

      // Create a temporary test position (base + drift) to see if it's out of bounds
      const testPosition = new THREE.Vector3().addVectors(basePos, sphereObj.drift)

      // Project this test position to the screen
      const projectedPosition = testPosition.clone().project(camera)

      // Check if the projected position is outside the viewport boundaries (with a margin)
      // If it is, reverse the velocity on that axis to "bounce" it back.
      if (projectedPosition.x > 0.9 || projectedPosition.x < -0.9) {
        sphereObj.velocity.x *= -1
      }
      if (projectedPosition.y > 0.9 || projectedPosition.y < -0.9) {
        sphereObj.velocity.y *= -1
      }

      // Keep velocity in a reasonable range to prevent wild movements
      sphereObj.velocity.clampLength(0, 0.1)

      // --- END NEW LOGIC ---

      // Calculate mouse offset (opposite direction for parallax effect)
      const mouseXOffset = (0.5 - mouseX) * mouseSensitivity
      const mouseYOffset = (mouseY - 0.5) * mouseSensitivity
      const mouseZOffset = (0.5 - mouseX) * (0.5 - mouseY) * mouseSensitivity * 0.5

      // Add some time-based variation for each sphere for extra subtlety
      const timeVariationX = Math.sin(time + timeOffset) * 0.5
      const timeVariationY = Math.cos(time * 0.7 + timeOffset) * 0.3

      // Combine all movements: base position + mouse response + our new drift + time variations
      sphere.position.x = basePos.x + mouseXOffset + timeVariationX + sphereObj.drift.x
      sphere.position.y = basePos.y + mouseYOffset + timeVariationY + sphereObj.drift.y
      sphere.position.z = basePos.z + mouseZOffset + sphereObj.drift.z

      // Different rotation patterns for each sphere
      sphere.rotation.x = time * 0.3 + mouseY * 0.2 + timeOffset
      sphere.rotation.z = time * 0.31 + mouseX * 0.2 + timeOffset

      // Varied scale patterns with subtle breathing
      const scaleFactor = 1 + 0.05 * Math.sin(time * 0.5 + timeOffset)
      sphere.scale.set(scaleFactor, scaleFactor, scaleFactor)
    })

    if (hdrLoaded) {
      controls.update()
    }
  }

  renderer.render(scene, camera)
}

// Ensure the scene is initialized when the page is ready
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  init()
} else {
  document.addEventListener('DOMContentLoaded', init)
}

animate()
