let camera, scene, renderer, controls, water, sun, sphere
let scrollProgress = 0
const parallaxIntensity = 15
let mouseX = 0.5,
  mouseY = 0.5
let targetX = 0.5,
  targetY = 0.5

const sphereStartY = 18
const sphereEndY = -30
const sphereStartScale = 1.0
const sphereEndScale = 0.7

const mobileSphereStartY = 18
const mobileSphereEndY = -24
const mobileSphereStartScale = 0.7
const mobileSphereEndScale = 0.5

const isMobile = window.innerWidth <= 768

window.parallaxIntensity = parallaxIntensity
window.mouseX = mouseX
window.mouseY = mouseY
window.targetX = targetX
window.targetY = targetY

window.sphereAnimation = {
  startY: isMobile ? mobileSphereStartY : sphereStartY,
  endY: isMobile ? mobileSphereEndY : sphereEndY,
  startScale: isMobile ? mobileSphereStartScale : sphereStartScale,
  endScale: isMobile ? mobileSphereEndScale : sphereEndScale,
  scrollStartThreshold: 0.0,
  scrollEndThreshold: 0.25,
}

window.addEventListener('mousemove', (e) => {
  window.targetX = e.clientX / window.innerWidth
  window.targetY = e.clientY / window.innerHeight
})

const scrollStartThreshold = 0.0
const scrollEndThreshold = 0.25

window.addEventListener('scroll', () => {
  const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
  scrollProgress = Math.min(window.scrollY / scrollHeight, 1)
  window.scrollProgress = scrollProgress
})

function easeOutCubic(x) {
  return 1 - Math.pow(1 - x, 3)
}

function lerp(start, end, t) {
  return start * (1 - t) + end * t
}

function init() {
  console.log('Initializing scene')

  const container = document.querySelector('.water-container')
  if (!container) {
    console.error('Water container not found. Scene cannot initialize.')
    return
  }

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
      (texture) => {
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

  water.material.onBeforeCompile = (shader) => {
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

  const sphereRadius = isMobile ? 24 : 28
  const sphereGeometry = new THREE.SphereGeometry(sphereRadius, 32, 32)

  const sphereMaterial = new THREE.MeshStandardMaterial({
    color: 0x000000,
    roughness: 0.01,
    metalness: 1.0,
    envMapIntensity: 0.05,
  })

  sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
  sphere.position.set(0, window.sphereAnimation.startY, 0)
  scene.add(sphere)
  window.sphere = sphere

  sphere.material.needsUpdate = true

  console.log('Sphere created at position:', sphere.position)

  controls = new OrbitControls(camera, renderer.domElement)
  window.controls = controls
  controls.maxPolarAngle = Math.PI * 0.495
  controls.target.set(0, 12, 0)
  controls.minDistance = 40.0
  controls.maxDistance = 200.0
  controls.update()

  window.addEventListener('resize', onWindowResize)

  window.addEventListener('resize', () => {
    const isMobile = window.innerWidth <= 768

    window.sphereAnimation.startY = isMobile ? mobileSphereStartY : sphereStartY
    window.sphereAnimation.endY = isMobile ? mobileSphereEndY : sphereEndY
    window.sphereAnimation.startScale = isMobile ? mobileSphereStartScale : sphereStartScale
    window.sphereAnimation.endScale = isMobile ? mobileSphereEndScale : sphereEndScale

    if (sphere) {
    }
  })

  console.log('Starting animation loop')
  animate()
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
}

function animate() {
  requestAnimationFrame(animate)

  mouseX += (targetX - mouseX) * 0.05
  mouseY += (targetY - mouseY) * 0.05

  camera.position.x = 30 - (mouseX - 0.5) * parallaxIntensity
  camera.position.y = 30 - (mouseY - 0.5) * parallaxIntensity
  camera.lookAt(controls.target)

  water.material.uniforms['time'].value += 0.02 / 60.0
}

window.initOceanScene = function () {
  console.log('Initializing ocean scene...')
  init()
}
