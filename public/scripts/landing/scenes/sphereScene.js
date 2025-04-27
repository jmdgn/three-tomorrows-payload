const { THREE, OrbitControls, RGBELoader } = window

let camera, scene, renderer, controls, sphere
let isInitialized = false
let hdrLoaded = false
let moons = []
let moonMaterial

let scrollProgress = 0

let mouseX = 0.5
let mouseY = 0.5
let targetX = 0.5
let targetY = 0.5
const mouseSensitivity = 30

window.addEventListener('scroll', () => {
  const scrollY = window.scrollY
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight
  scrollProgress = Math.min(scrollY / maxScroll, 1)
})

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

  createBasicSphere()
  createOrbitingMoons()
  setupBasicLighting()
  setupControls()

  loadHDR().then(() => {
    hdrLoaded = true
    updateMaterials()
    setupFinalLighting()
    if (moonMaterial) moonMaterial.envMap = scene.environment
  })

  window.addEventListener('resize', onWindowResize)
  isInitialized = true
}

function createBasicSphere() {
  const geometry = new THREE.SphereGeometry(6.4, 32, 32)
  const material = new THREE.MeshBasicMaterial({
    color: 0xf1f1f1,
    transparent: true,
    opacity: 0.8,
  })

  sphere = new THREE.Mesh(geometry, material)
  sphere.position.set(0, 18, 0)
  scene.add(sphere)
  window.sphere = sphere
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
  const sphereGeometry = new THREE.SphereGeometry(6.4, 64, 64)
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

  new THREE.TextureLoader().load('assets/images/home/swirl-texture.jpg', (texture) => {
    sphereMaterial.map = texture
    sphereMaterial.needsUpdate = true

    sphere.geometry = sphereGeometry
    sphere.material = sphereMaterial
  })
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
}

function createOrbitingMoons() {
  const geometry = new THREE.SphereGeometry(0.5, 64, 64)

  moonMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x111111,
    metalness: 1.0,
    roughness: 0.1,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,
    envMapIntensity: 2.0,
  })

  moons = []
  for (let i = 0; i < 3; i++) {
    const moon = new THREE.Mesh(geometry, moonMaterial)
    scene.add(moon)
    moons.push(moon)
  }
}

function animate() {
  requestAnimationFrame(animate)

  if (!isInitialized) {
    init()
    return
  }

  mouseX += (targetX - mouseX) * 0.05
  mouseY += (targetY - mouseY) * 0.05

  if (sphere) {
    const time = performance.now() * 0.0005

    const mouseXOffset = (mouseX - 0.5) * mouseSensitivity
    const mouseYOffset = (0.5 - mouseY) * mouseSensitivity
    const mouseZOffset = (mouseX - 0.5) * (mouseY - 0.5) * mouseSensitivity * 0.5

    sphere.position.x = mouseXOffset
    sphere.position.y = Math.sin(time) * 2 + 18 + mouseYOffset
    sphere.position.z = mouseZOffset

    sphere.rotation.x = time * 0.3 + mouseY * 0.2
    sphere.rotation.z = time * 0.31 + mouseX * 0.2

    const scaleFactor = 1 + 0.2 * Math.sin(time * 0.5)
    sphere.scale.set(scaleFactor, scaleFactor, scaleFactor)

    if (hdrLoaded) {
      controls.update()

      const orbitRadius = 12
      moons.forEach((moon, idx) => {
        const angle = time * (0.5 + idx * 0.2)
        moon.position.set(
          sphere.position.x + Math.cos(angle) * orbitRadius,
          sphere.position.y,
          sphere.position.z + Math.sin(angle) * orbitRadius,
        )
      })
    }
  }

  renderer.render(scene, camera)
}

window.initSphereScene = function () {
  console.log('Initializing sphere scene...')
  init()
}

animate()
