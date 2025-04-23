document.addEventListener('DOMContentLoaded', () => {
	let camera, scene, renderer, bubbles = [];
	const BUBBLE_COUNT = 30;
	const MAX_DEPTH = 100;

	const container = document.querySelector('.bubble-container');
	if (!container) {
		console.error('Bubble container not found!');
		return;
	}

	init();
	animate();

	function init() {
		scene = new THREE.Scene();

		camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 1, 1000);
		camera.position.set(0, -container.clientHeight * 0.5, 50);
		camera.lookAt(0, 0, 0);

		try {
			renderer = new THREE.WebGLRenderer({
				antialias: true,
				alpha: true,
				powerPreference: 'high-performance'
			});
		} catch (error) {
			console.error('WebGL context creation failed:', error);
			return;
		}

		renderer.setSize(container.clientWidth, container.clientHeight);
		renderer.setClearColor(0x000000, 0);
		container.appendChild(renderer.domElement);

		const geometry = new THREE.SphereGeometry(0.5, 32, 32);
		const material = new THREE.MeshPhongMaterial({
			color: 0xffffff,
			transparent: true,
			opacity: 0.8,
			specular: 0x555555,
			shininess: 100
		});

		for (let i = 0; i < BUBBLE_COUNT; i++) {
			const bubble = new THREE.Mesh(geometry, material.clone());
			resetBubble(bubble, true);
			scene.add(bubble);
			bubbles.push(bubble);
		}

		const ambientLight = new THREE.AmbientLight(0x4080ff, 0.5);
		scene.add(ambientLight);
		const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
		directionalLight.position.set(0, 50, 100);
		scene.add(directionalLight);
	}


	function resetBubble(bubble, initial = false) {
		bubble.position.x = (Math.random() - 0.5) * container.clientWidth * 0.1;
		bubble.position.z = (Math.random() - 0.5) * MAX_DEPTH;
		bubble.position.y = initial ?
			-container.clientHeight * 0.5 - Math.random() * 100 :
			-container.clientHeight * 0.5 - Math.random() * 50;

		bubble.scale.setScalar(0.5 + Math.random() * 0.5);
		bubble.speed = 0.5 + Math.random() * 1.5;
		bubble.rotationSpeed = (Math.random() - 0.5) * 0.02;
		bubble.material.opacity = 0.6 + Math.random() * 0.3;
	}

	function animate() {
		requestAnimationFrame(animate);

		bubbles.forEach(bubble => {
			bubble.position.y += bubble.speed;
			bubble.position.x += Math.sin(performance.now() * 0.001 * bubble.speed) * 0.1;
			bubble.rotation.x += bubble.rotationSpeed;
			bubble.rotation.y += bubble.rotationSpeed;

			const depthFactor = 1 - (bubble.position.z / MAX_DEPTH);
			bubble.scale.x = bubble.scale.y = bubble.scale.z * (0.8 + depthFactor * 0.4);
			bubble.material.opacity *= 0.995;

			if (bubble.position.y > container.clientHeight * 0.5 || bubble.material.opacity < 0.1) {
				resetBubble(bubble);
			}
		});

		camera.position.x = Math.sin(performance.now() * 0.001) * 2;
		camera.position.y = -container.clientHeight * 0.5 + Math.cos(performance.now() * 0.0007) * 1.5;
		renderer.render(scene, camera);
	}

	window.addEventListener('resize', () => {
		camera.aspect = container.clientWidth / container.clientHeight;
		camera.updateProjectionMatrix();
		renderer.setSize(container.clientWidth, container.clientHeight);
	});
});