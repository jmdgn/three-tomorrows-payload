const { THREE, OrbitControls, RGBELoader } = window;

let camera, scene, renderer, controls, sphere;
let isInitialized = false;
let hdrLoaded = false;
let moons = [];
let moonMaterial;

// Global scroll progress variable
let scrollProgress = 0;

// Mouse position tracking variables
let mouseX = 0.5;
let mouseY = 0.5;
let targetX = 0.5;
let targetY = 0.5;
const mouseSensitivity = 30; // Increased sensitivity for more movement

// Scroll listener to track scroll progress
window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    scrollProgress = Math.min(scrollY / maxScroll, 1);
});

// Mouse move listener
window.addEventListener('mousemove', (e) => {
    // Calculate normalized mouse position (0 to 1)
    targetX = e.clientX / window.innerWidth;
    targetY = e.clientY / window.innerHeight;
});

animate();

async function init() {
    if (isInitialized) return;

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 1, 20000);
    camera.position.set(30, 30, 100);

    renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    document.getElementById('sphere-container').appendChild(renderer.domElement);

    createBasicSphere();
    createOrbitingMoons();
    setupBasicLighting();
    setupControls();

    loadHDR().then(() => {
        hdrLoaded = true;
        updateMaterials();
        setupFinalLighting();
        if (moonMaterial) moonMaterial.envMap = scene.environment;
    });

    window.addEventListener('resize', onWindowResize);
    isInitialized = true;
}

function createBasicSphere() {
    window.sphere = sphere;
    const geometry = new THREE.SphereGeometry(6.4, 32, 32);
    const material = new THREE.MeshBasicMaterial({
        color: 0xF1F1F1,
        transparent: true,
        opacity: 0.8
    });

    sphere = new THREE.Mesh(geometry, material);
    sphere.position.set(0, 18, 0);
    scene.add(sphere);
}

function setupBasicLighting() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);
}

function setupFinalLighting() {
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
    directionalLight.position.set(0, 50, 100);
    scene.add(directionalLight);
}

function setupControls() {
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.maxPolarAngle = Math.PI * 0.495;
    controls.target.set(0, 12, 0);
    controls.minDistance = 40.0;
    controls.maxDistance = 200.0;
    controls.update();
}

async function loadHDR() {
    try {
        const texture = await new RGBELoader()
            .setPath('https://threejs.org/examples/textures/equirectangular/')
            .loadAsync('royal_esplanade_1k.hdr');

        const pmremGenerator = new THREE.PMREMGenerator(renderer);
        pmremGenerator.compileEquirectangularShader();
        const envMap = pmremGenerator.fromEquirectangular(texture).texture;

        texture.dispose();
        pmremGenerator.dispose();

        scene.environment = envMap;
    } catch (error) {
        console.error('Error loading HDR:', error);
    }
}

function updateMaterials() {
    // Create high-quality material
    const sphereGeometry = new THREE.SphereGeometry(6.4, 64, 64);
    const sphereMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xF1F1F1,
        roughness: 0.2,
        metalness: 0.2,
        transmission: 0.95,
        thickness: 1.0,
        reflectivity: 0.2,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1
    });

    new THREE.TextureLoader().load('assets/images/home/swirl-texture.jpg', (texture) => {
        sphereMaterial.map = texture;
        sphereMaterial.needsUpdate = true;

        sphere.geometry = sphereGeometry;
        sphere.material = sphereMaterial;
    });
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function createOrbitingMoons() {
    const geometry = new THREE.SphereGeometry(0.5, 64, 64);
    const material = new THREE.MeshBasicMaterial({ color: 0x000000 });

    moonMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x111111, // Very dark gray instead of pure black
        metalness: 1.0,  // Fully metallic
        roughness: 0.1,  // Smooth surface
        clearcoat: 1.0,  // Extra glossy layer
        clearcoatRoughness: 0.05,
        envMapIntensity: 2.0 // Boost environment reflections
    });

    moons = [];
    for (let i = 0; i < 3; i++) {
        const moon = new THREE.Mesh(geometry, moonMaterial);
        scene.add(moon);
        moons.push(moon);
    }
}

function animate() {
    requestAnimationFrame(animate);

    if (!isInitialized) {
        init();
        return;
    }

    // Smooth mouse movement interpolation
    mouseX += (targetX - mouseX) * 0.05;
    mouseY += (targetY - mouseY) * 0.05;

    if (sphere) {
        const time = performance.now() * 0.0005;
        
        // Calculate mouse-based position
        // Convert from 0-1 range to a wider range for movement
        // Centered at (0, 18, 0) with mouse influence
        const mouseXOffset = (mouseX - 0.5) * mouseSensitivity;
        const mouseYOffset = (0.5 - mouseY) * mouseSensitivity; // Invert Y axis
        
        // Add slight z-axis movement for more depth
        const mouseZOffset = ((mouseX - 0.5) * (mouseY - 0.5)) * mouseSensitivity * 0.5;
        
        // Update position based on mouse and gentle up/down wave motion
        sphere.position.x = mouseXOffset;
        sphere.position.y = Math.sin(time) * 2 + 18 + mouseYOffset; // Less dramatic bobbing
        sphere.position.z = mouseZOffset; // Add some depth movement
        
        // Add slight rotation based on movement direction
        sphere.rotation.x = time * 0.3 + mouseY * 0.2;
        sphere.rotation.z = time * 0.31 + mouseX * 0.2;

        const scaleFactor = 1 + 0.2 * Math.sin(time * 0.5); // Less dramatic scaling
        sphere.scale.set(scaleFactor, scaleFactor, scaleFactor);

        if (hdrLoaded) {
            controls.update();

            // Update moons' orbits relative to the pearl's new position
            const orbitRadius = 12;
            moons.forEach((moon, idx) => {
                const angle = time * (0.5 + idx * 0.2);
                moon.position.set(
                    sphere.position.x + Math.cos(angle) * orbitRadius,
                    sphere.position.y, 
                    sphere.position.z + Math.sin(angle) * orbitRadius
                );
            });
        }
    }

    renderer.render(scene, camera);
}