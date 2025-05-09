let camera, scene, renderer, controls, water, sun, sphere
let animationId = null
let initialized = false

const SPHERE_START_Y = 18
const SPHERE_END_Y = -30
const SPHERE_START_SCALE = 1.0
const SPHERE_END_SCALE = 0.7

const MOBILE_SPHERE_START_Y = 18
const MOBILE_SPHERE_END_Y = -24
const MOBILE_SPHERE_START_SCALE = 0.7
const MOBILE_SPHERE_END_SCALE = 0.5

const SCROLL_START = 0.0
const SCROLL_END = 0.25

const PARALLAX_INTENSITY = 15
let mouseX = 0.5,
  mouseY = 0.5
let targetX = 0.5,
  targetY = 0.5

let scrollProgress = 0
let isMobile = false

function init() {
  console.log('Initializing ocean scene')

  if (initialized) {
    console.warn('Ocean scene already initialized')
    return
  }

  const container = document.querySelector('.water-container')
  if (!container) {
    console.error('Water container not found. Scene cannot initialize.')
    return
  }

  isMobile = window.innerWidth <= 768

  scene = new THREE.Scene()
  window.scene = scene

  camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 1, 20000)
  window.camera = camera
  camera.position.set(30, 30, 100)

  renderer = new THREE.WebGLRenderer({
    antialias: true,
  })
  window.renderer = renderer

  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 0.5

  container.appendChild(renderer.domElement)

  const waterGeometry = new THREE.PlaneGeometry(10000, 10000, 100, 100)

  water = new Water(waterGeometry, {
    textureWidth: 512,
    textureHeight: 512,
    waterNormals: new THREE.TextureLoader().load(
      'https://threejs.org/examples/textures/waternormals.jpg',
      function (texture) {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping
        texture.repeat.set(4, 4)
      },
    ),
    sunDirection: new THREE.Vector3(),
    sunColor: 0xffffff,
    waterColor: 0x001e42,
    distortionScale: 3.0,
    fog: scene.fog !== undefined,
  })

  window.water = water

  water.rotation.x = -Math.PI / 2

  water.material.onBeforeCompile = function (shader) {
    shader.vertexShader = shader.vertexShader.replace(
      '#include <begin_vertex>',
      `#include <begin_vertex>
      // Use a more complex wave pattern for realism
      float waveHeight = 0.04;  // Changed from 0.05
      float waveFreq = 0.015;   // Changed from 0.02
      float wavePeriod = 1.2;   // Changed from 2.0
      
      // Create a subtle, varied wave pattern
      transformed.z -= waveHeight * sin(position.x * waveFreq + time * wavePeriod) * 
                       cos(position.y * waveFreq * 0.7);
      transformed.z -= 0.003 * (position.x * position.x + position.y * position.y);`,
    )
  }

  water.material.needsUpdate = true
  scene.add(water)

  const sky = new Sky()
  sky.scale.setScalar(10000)
  scene.add(sky)

  const skyUniforms = sky.material.uniforms
  skyUniforms['turbidity'].value = 3.0
  skyUniforms['rayleigh'].value = 1.5
  skyUniforms['mieCoefficient'].value = 0.006
  skyUniforms['mieDirectionalG'].value = 0.9

  const pmremGenerator = new THREE.PMREMGenerator(renderer)
  const sceneEnv = new THREE.Scene()
  let renderTarget

  sun = new THREE.Vector3()
  const parameters = {
    elevation: 30,
    azimuth: 180,
  }

  function updateSun() {
    const phi = THREE.MathUtils.degToRad(90 - parameters.elevation)
    const theta = THREE.MathUtils.degToRad(parameters.azimuth)
    sun.setFromSphericalCoords(1, phi, theta)
    sky.material.uniforms['sunPosition'].value.copy(sun)
    water.material.uniforms['sunDirection'].value.copy(sun).normalize()
    if (renderTarget) renderTarget.dispose()
    sceneEnv.add(sky)
    renderTarget = pmremGenerator.fromScene(sceneEnv)
    scene.add(sky)
    scene.environment = renderTarget.texture
  }
  updateSun()

  const sphereRadius = isMobile ? 25 : 28
  const sphereGeometry = new THREE.SphereGeometry(sphereRadius, 32, 32)
  const sphereMaterial = new THREE.MeshStandardMaterial({
    color: 0x000000,
    roughness: 0.01,
    metalness: 1.0,
    envMapIntensity: 0.05,
  })

  sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
  sphere.position.set(0, isMobile ? MOBILE_SPHERE_START_Y : SPHERE_START_Y, 0)
  scene.add(sphere)
  window.sphere = sphere

  console.log('Sphere created at position:', sphere.position)

  controls = new OrbitControls(camera, renderer.domElement)
  window.controls = controls
  controls.maxPolarAngle = Math.PI * 0.495
  controls.target.set(0, 12, 0)
  controls.minDistance = 40.0
  controls.maxDistance = 200.0
  controls.update()

  window.addEventListener('resize', onWindowResize)

  window.addEventListener('scroll', handleScroll)

  window.addEventListener('mousemove', (e) => {
    targetX = e.clientX / window.innerWidth
    targetY = e.clientY / window.innerHeight
    window.targetX = targetX
    window.targetY = targetY
  })

  window.scrollProgress = 0
  window.parallaxIntensity = PARALLAX_INTENSITY
  window.mouseX = mouseX
  window.mouseY = mouseY
  window.targetX = targetX
  window.targetY = targetY

  window.sphereAnimation = {
    startY: isMobile ? MOBILE_SPHERE_START_Y : SPHERE_START_Y,
    endY: isMobile ? MOBILE_SPHERE_END_Y : SPHERE_END_Y,
    startScale: isMobile ? MOBILE_SPHERE_START_SCALE : SPHERE_START_SCALE,
    endScale: isMobile ? MOBILE_SPHERE_END_SCALE : SPHERE_END_SCALE,
    scrollStartThreshold: SCROLL_START,
    scrollEndThreshold: SCROLL_END,
  }

  initialized = true

  startStaticAnimation()

  handleScroll()
}

function onWindowResize() {
  const wasMobile = isMobile
  isMobile = window.innerWidth <= 768

  if (camera) {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
  }

  if (renderer) {
    renderer.setSize(window.innerWidth, window.innerHeight)
  }

  if (wasMobile !== isMobile) {
    window.sphereAnimation = {
      startY: isMobile ? MOBILE_SPHERE_START_Y : SPHERE_START_Y,
      endY: isMobile ? MOBILE_SPHERE_END_Y : SPHERE_END_Y,
      startScale: isMobile ? MOBILE_SPHERE_START_SCALE : SPHERE_START_SCALE,
      endScale: isMobile ? MOBILE_SPHERE_END_SCALE : SPHERE_END_SCALE,
      scrollStartThreshold: SCROLL_START,
      scrollEndThreshold: SCROLL_END,
    }

    handleScroll()
  }
}

function handleScroll() {
  const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
  scrollProgress = Math.min(window.scrollY / scrollHeight, 1)
  window.scrollProgress = scrollProgress

  const normalizedProgress = Math.min(
    1,
    Math.max(0, (scrollProgress - SCROLL_START) / (SCROLL_END - SCROLL_START)),
  )

  const easedProgress = easeOutCubic(normalizedProgress)

  const startY = isMobile ? MOBILE_SPHERE_START_Y : SPHERE_START_Y
  const endY = isMobile ? MOBILE_SPHERE_END_Y : SPHERE_END_Y
  const startScale = isMobile ? MOBILE_SPHERE_START_SCALE : SPHERE_START_SCALE
  const endScale = isMobile ? MOBILE_SPHERE_END_SCALE : SPHERE_END_SCALE

  if (sphere) {
    sphere.position.y = startY * (1 - easedProgress) + endY * easedProgress
    sphere.scale.setScalar(startScale * (1 - easedProgress) + endScale * easedProgress)
  }

  renderScene()
}

function animate() {
  animationId = requestAnimationFrame(animate)

  mouseX += (targetX - mouseX) * 0.05
  mouseY += (targetY - mouseY) * 0.05

  if (camera) {
    camera.position.x = 30 - (mouseX - 0.5) * PARALLAX_INTENSITY
    camera.position.y = 30 - (mouseY - 0.5) * PARALLAX_INTENSITY
    camera.lookAt(controls.target)
  }

  if (water && water.material && water.material.uniforms) {
    water.material.uniforms['time'].value += 0.02 / 60.0
  }

  renderScene()
}

function renderScene() {
  if (renderer && scene && camera) {
    renderer.render(scene, camera)
  }
}

function startStaticAnimation() {
  if (!animationId) {
    animationId = requestAnimationFrame(animate)
  }
}

function stopAnimation() {
  if (animationId) {
    cancelAnimationFrame(animationId)
    animationId = null
  }
}

function easeOutCubic(x) {
  return 1 - Math.pow(1 - x, 3)
}

window.initOceanScene = function () {
  console.log('Initializing ocean scene...')
  init()
}
