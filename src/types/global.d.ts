interface Window {
  // ThreeJS related
  THREE?: any;
  OrbitControls?: any;
  RGBELoader?: any;
  Water?: any;
  Sky?: any;
  camera?: any;
  controls?: any;
  renderer?: any;
  scene?: any;
  sphere?: any;
  water?: any;
  
  // Animation related
  scrollProgress?: number;
  _isServicePanelVisible?: boolean;
  _frameCount?: number;
  mouseX?: number;
  mouseY?: number;
  targetX?: number;
  targetY?: number;
  parallaxIntensity?: number;
  
  // Other properties
  initThreeJS?: () => Promise<any>;
  currentScale?: number;
  targetScale?: number;
}