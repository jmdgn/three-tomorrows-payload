const { THREE, OrbitControls } = window

let camera, scene, renderer, controls
let isInitialized = false

window.spheres = []

let mouseX = 0.5
let mouseY = 0.5
let targetX = 0.5
let targetY = 0.5
const mouseSensitivity = 15

const svgString = `<svg width="201" height="201" viewBox="0 0 201 201" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clip-path="url(#clip0_3129_727)">
<mask id="mask0_3129_727" style="mask-type:luminance" maskUnits="userSpaceOnUse" x="0" y="0" width="201" height="201">
<path d="M201 0H0V201H201V0Z" fill="white"/>
</mask>
<g mask="url(#mask0_3129_727)">
<foreignObject x="-20.5445" y="-20.5421" width="242.718" height="242.718"><div xmlns="http://www.w3.org/1999/xhtml" style="backdrop-filter:blur(10.68px);clip-path:url(#bgblur_1_3129_727_clip_path);height:100%;width:100%"></div></foreignObject><path data-figma-bg-blur-radius="21.357" d="M100.814 200.819C156.044 200.819 200.816 156.047 200.816 100.817C200.816 45.5874 156.044 0.814941 100.814 0.814941C45.5849 0.814941 0.8125 45.5874 0.8125 100.817C0.8125 156.047 45.5849 200.819 100.814 200.819Z" fill="url(#paint0_linear_3129_727)" fill-opacity="0.75"/>
<mask id="mask1_3129_727" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="201" height="201">
<path d="M100.822 200.819C156.052 200.819 200.824 156.047 200.824 100.817C200.824 45.5874 156.052 0.814941 100.822 0.814941C45.5927 0.814941 0.820312 45.5874 0.820312 100.817C0.820312 156.047 45.5927 200.819 100.822 200.819Z" fill="url(#paint1_linear_3129_727)"/>
</mask>
<g mask="url(#mask1_3129_727)">
<g filter="url(#filter1_f_3129_727)">
<path d="M72.1856 118.545C96.5371 118.545 116.278 98.8042 116.278 74.4528C116.278 50.1015 96.5371 30.3608 72.1856 30.3608C47.8344 30.3608 28.0938 50.1015 28.0938 74.4528C28.0938 98.8042 47.8344 118.545 72.1856 118.545Z" fill="white"/>
</g>
<g filter="url(#filter2_f_3129_727)">
<path fill-rule="evenodd" clip-rule="evenodd" d="M75.2529 201.273C130.483 201.273 175.255 156.501 175.255 101.271C175.255 75.603 165.585 52.1938 149.689 34.4878C176.098 52.4881 193.438 82.8091 193.438 117.18C193.438 172.41 148.665 217.182 93.4356 217.182C63.8737 217.182 37.3078 204.355 19 183.963C35.027 194.887 54.3942 201.273 75.2529 201.273Z" fill="white"/>
</g>
</g>
</g>
</g>
<defs>
<clipPath id="bgblur_1_3129_727_clip_path" transform="translate(20.5445 20.5421)"><path d="M100.814 200.819C156.044 200.819 200.816 156.047 200.816 100.817C200.816 45.5874 156.044 0.814941 100.814 0.814941C45.5849 0.814941 0.8125 45.5874 0.8125 100.817C0.8125 156.047 45.5849 200.819 100.814 200.819Z"/>
</clipPath><filter id="filter1_f_3129_727" x="-6.45225" y="-4.18516" width="157.276" height="157.276" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
<feGaussianBlur stdDeviation="17.273" result="effect1_foregroundBlur_3129_727"/>
</filter>
<filter id="filter2_f_3129_727" x="-15.546" y="-0.0582085" width="243.53" height="251.786" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
<feGaussianBlur stdDeviation="17.273" result="effect1_foregroundBlur_3129_727"/>
</filter>
<linearGradient id="paint0_linear_3129_727" x1="78.3005" y1="59.7119" x2="230.623" y2="184.567" gradientUnits="userSpaceOnUse">
<stop stop-color="#EAEAEA"/>
<stop offset="1" stop-color="#969696"/>
</linearGradient>
<linearGradient id="paint1_linear_3129_727" x1="78.3083" y1="59.7119" x2="230.631" y2="184.567" gradientUnits="userSpaceOnUse">
<stop stop-color="#EAEAEA"/>
<stop offset="1" stop-color="#C4C4C4"/>
</linearGradient>
<clipPath id="clip0_3129_727">
<rect width="201" height="201" fill="white"/>
</clipPath>
</defs>
</svg>`

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
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setClearColor(0x000000, 0)

  container.appendChild(renderer.domElement)

  createOrbs()
  setupLighting()
  setupControls()

  window.addEventListener('resize', onWindowResize)
  isInitialized = true
}

function createOrbs() {
  const spherePositions = [
    { x: -55, y: -20, z: -5, size: 14 },
    { x: 0, y: 40, z: 0, size: 18 },
    { x: 45, y: 15, z: -8, size: 16 },
  ]

  const svgDataUrl = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgString)))

  const textureLoader = new THREE.TextureLoader()
  const svgTexture = textureLoader.load(svgDataUrl)

  const orbMaterial = new THREE.MeshBasicMaterial({
    map: svgTexture,
    transparent: true,
    alphaTest: 0.1,
  })

  spherePositions.forEach((pos) => {
    const geometry = new THREE.PlaneGeometry(pos.size, pos.size)
    const plane = new THREE.Mesh(geometry, orbMaterial)
    plane.position.set(pos.x, pos.y, pos.z)
    scene.add(plane)

    window.spheres.push({
      mesh: plane,
      basePosition: new THREE.Vector3(pos.x, pos.y, pos.z),
      velocity: new THREE.Vector3((Math.random() - 0.5) * 0.02, (Math.random() - 0.5) * 0.02, 0),
      drift: new THREE.Vector3(0, 0, 0),
      maxDrift: 8.0,
    })
  })
}

function setupLighting() {
  const ambientLight = new THREE.AmbientLight(0xbbbbbb, 1.0)
  scene.add(ambientLight)
}

function setupControls() {
  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableZoom = false
  controls.enablePan = false
  controls.enableRotate = false
  controls.target.set(0, 12, 0)
  controls.update()
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

  mouseX += (targetX - mouseX) * 0.05
  mouseY += (targetY - mouseY) * 0.05

  if (window.spheres.length > 0) {
    const time = performance.now() * 0.0005

    window.spheres.forEach((sphereObj, index) => {
      const plane = sphereObj.mesh
      const basePos = sphereObj.basePosition
      const timeOffset = index * Math.PI

      plane.quaternion.copy(camera.quaternion)

      sphereObj.velocity.x += (Math.random() - 0.5) * 0.0008
      sphereObj.velocity.y += (Math.random() - 0.5) * 0.0008
      sphereObj.drift.add(sphereObj.velocity)
      const distanceFromBase = sphereObj.drift.length()
      const maxDrift = sphereObj.maxDrift || 8.0

      if (distanceFromBase > maxDrift) {
        const returnForce = sphereObj.drift.clone().normalize().multiplyScalar(-0.005)
        sphereObj.velocity.add(returnForce)
      }
      sphereObj.velocity.multiplyScalar(0.98)

      const mouseXOffset = (0.5 - mouseX) * mouseSensitivity
      const mouseYOffset = (mouseY - 0.5) * mouseSensitivity
      const timeVariationX = Math.sin(time + timeOffset) * 2
      const timeVariationY = Math.cos(time * 0.7 + timeOffset) * 2

      plane.position.x = basePos.x + mouseXOffset + timeVariationX + sphereObj.drift.x
      plane.position.y = basePos.y + mouseYOffset + timeVariationY + sphereObj.drift.y
      plane.position.z = basePos.z
    })
  }

  renderer.render(scene, camera)
}

if (document.readyState === 'complete' || document.readyState === 'interactive') {
  init()
} else {
  document.addEventListener('DOMContentLoaded', init)
}

animate()
