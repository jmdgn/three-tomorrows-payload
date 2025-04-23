function isWebGL2Available() {
    try {
        const canvas = document.createElement('canvas');
        return !!(window.WebGL2RenderingContext && canvas.getContext('webgl2'));
    } catch (e) {
        return false;
    }
}

if (!isWebGL2Available()) {
    document.body.innerHTML = '<p>WebGL2 is not available in your browser. Please try a newer browser.</p>';
}

const DPR = window.devicePixelRatio * 0.5; // Reduced for performance
const BLUE_NOISE_URL = "https://cdn.maximeheckel.com/noises/blue-noise.png";
const NOISE_URL = "https://cdn.maximeheckel.com/noises/noise2.png";

// Shaders
const vertexShader = `
    varying vec2 vUv;
    void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

const fragmentShader = `
    precision highp float;
    
    uniform float uTime;
    uniform vec2 uResolution;
    uniform sampler2D uNoise;
    uniform sampler2D uBlueNoise;
    uniform int uFrame;
    
    varying vec2 vUv;
    
    #define MAX_STEPS 24
    
    float sdEllipsoid(vec3 p, vec3 r) {
        float k0 = length(p/r);
        return k0*(k0-1.0)/length(p/(r*r));
    }
    
    float noise(in vec3 x) {
        vec3 p = floor(x);
        vec3 f = fract(x);
        f = f*f*(3.0-2.0*f);
        vec2 uv = (p.xy + vec2(37.0, 239.0)*p.z) + f.xy;
        vec2 tex = texture2D(uNoise, (uv + 0.5)/256.0).yx;
        return mix(tex.x, tex.y, f.z) * 2.0 - 1.0;
    }
    
    float fbm(vec3 p) {
        vec3 q = p + uTime * 0.5 * vec3(1.0, -0.2, -1.0);
        float f = 0.0;
        float scale = 0.5;
        float factor = 2.02;
        
        for(int i = 0; i < 6; i++) {
            f += scale * noise(q);
            q *= factor;
            factor += 0.21;
            scale *= 0.5;
        }
        return f;
    }
    
    float scene(vec3 p) {
        // Using ellipsoid instead of sphere to make the cloud wider
        // Parameters: position, radii (x, y, z)
        // Increased x radius to make it wider horizontally
        return -sdEllipsoid(p, vec3(4.4, 2.6, 3.0)) + fbm(p);
    }
    
    const vec3 SUN_POSITION = vec3(1.0, 0.0, 0.0);
    const float MARCH_SIZE = 0.16;
    
    vec4 raymarch(vec3 rayOrigin, vec3 rayDirection, float offset) {
        float depth = MARCH_SIZE * offset;
        vec3 p = rayOrigin + depth * rayDirection;
        vec3 sunDirection = normalize(SUN_POSITION);
        vec4 res = vec4(0.0);
        
        for(int i = 0; i < MAX_STEPS; i++) {
            float density = scene(p);
            if(density > 0.0) {
                float diffuse = clamp((scene(p) - scene(p + 0.3 * sunDirection)) / 0.3, 0.0, 1.0);
                // Adjusted for lighter grey tones
                vec3 lin = vec3(0.70, 0.70, 0.80) * 1.1 +
                           vec3(0.8, 0.7, 0.6) * diffuse;
                
                // Mix between white and light grey instead of black
                vec4 color = vec4(mix(vec3(0.85), vec3(0.55), density * 0.6), density);
                
                // Moderate brightness boost
                color.rgb *= lin * color.a * 0.9;
                res += color * (1.0 - res.a);
            }
            depth += MARCH_SIZE;
            p = rayOrigin + depth * rayDirection;
        }
        return res;
    }
    
    void main() {
        // Calculate correct aspect ratio
        vec2 uv = vUv;
        float aspectRatio = uResolution.x / uResolution.y;
        
        // Correct way to handle aspect ratio in fullscreen quad
        vec2 newUV = uv * 2.0 - 1.0;
        newUV.x *= aspectRatio;
        
        // Modified camera position to move cloud to below the bottom of the viewport
        vec3 ro = vec3(0.0, 3.2, 5.0);
        vec3 rd = normalize(vec3(newUV, -1.0));
        vec3 color = vec3(0.7, 0.7, 0.90);
        
        // Sky gradient and sun
        color -= 0.8 * vec3(0.90, 0.75, 0.90) * rd.y;
        float sun = clamp(dot(normalize(SUN_POSITION), rd), 0.0, 1.0);
        color += 0.5 * vec3(1.0, 0.5, 0.3) * pow(sun, 10.0);
        
        // Cloud rendering
        float blueNoise = texture2D(uBlueNoise, fract(vUv * uResolution / 1024.0)).r;
        float offset = fract(blueNoise + float(uFrame % 32) / sqrt(0.5));
        vec4 res = raymarch(ro, rd, offset);
        
        gl_FragColor = vec4(color * (1.0 - res.a) + res.rgb, 1.0);
    }
`;

// Scene setup
const scene = new THREE.Scene();

// Create an orthographic camera instead of perspective to ensure full coverage
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
camera.position.z = 1;

// Create a canvas with WebGL2 context
const canvas = document.createElement('canvas');
const context = canvas.getContext('webgl2');

// Create renderer with the WebGL2 context
const renderer = new THREE.WebGLRenderer({ 
    antialias: true,
    canvas: canvas,
    context: context
});

// Force fullscreen rendering
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(DPR);
document.querySelector('.cloud-scene').appendChild(renderer.domElement);

// Textures with proper loading feedback
const textureLoader = new THREE.TextureLoader();
let blueNoiseTexture, noiseTexture;
let texturesLoaded = 0;
const totalTextures = 2;

function checkAllTexturesLoaded() {
    texturesLoaded++;
    if (texturesLoaded === totalTextures) {
        initScene();
    }
}

// Load textures with proper error handling
blueNoiseTexture = textureLoader.load(
    BLUE_NOISE_URL, 
    checkAllTexturesLoaded,
    undefined,
    (err) => {
        console.error('Error loading blue noise texture:', err);
        document.body.innerHTML = '<p>Error loading textures. Check console for details.</p>';
    }
);

noiseTexture = textureLoader.load(
    NOISE_URL, 
    checkAllTexturesLoaded,
    undefined,
    (err) => {
        console.error('Error loading noise texture:', err);
        document.body.innerHTML = '<p>Error loading textures. Check console for details.</p>';
    }
);

function initScene() {
    // Configure texture filtering and wrapping
    blueNoiseTexture.wrapS = blueNoiseTexture.wrapT = THREE.RepeatWrapping;
    noiseTexture.wrapS = noiseTexture.wrapT = THREE.RepeatWrapping;
    blueNoiseTexture.minFilter = blueNoiseTexture.magFilter = THREE.LinearFilter;
    noiseTexture.minFilter = noiseTexture.magFilter = THREE.LinearFilter;
    
    // Material setup with proper resolution
    const uniforms = {
        uTime: { value: 0 },
        uResolution: { value: new THREE.Vector2(window.innerWidth * DPR, window.innerHeight * DPR) },
        uNoise: { value: noiseTexture },
        uBlueNoise: { value: blueNoiseTexture },
        uFrame: { value: 0 }
    };

    const material = new THREE.ShaderMaterial({
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        uniforms: uniforms,
        transparent: true
    });

    // Create a fullscreen quad that fills the viewport
    // Using a PlaneGeometry with explicit sizing
    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Animation
    function animate() {
        requestAnimationFrame(animate);
        uniforms.uTime.value += 0.01;
        uniforms.uResolution.value.set(
            window.innerWidth * DPR,
            window.innerHeight * DPR
        );
        uniforms.uFrame.value++;
        renderer.render(scene, camera);
    }
    animate();

    // Handle window resize properly
    window.addEventListener('resize', onWindowResize, false);
    
    function onWindowResize() {
        // For orthographic camera, maintain the view size
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        renderer.setSize(width, height);
        
        // Update shader uniforms
        uniforms.uResolution.value.set(
            width * DPR, 
            height * DPR
        );
    }
}