let threeInstance = null;
let isInitialized = false;

const isBrowser = typeof window !== 'undefined';

const resources = {
  renderers: [],
  scenes: [],
  geometries: [],
  materials: [],
  textures: [],
  animations: []
};

function debugLog(message) {
  console.log(`[ThreeProvider] ${message}`);
}

export function registerResource(type, resource) {
  if (resources[type] && resource) {
    resources[type].push(resource);
    debugLog(`Registered ${type} resource`);
  }
}

if (isBrowser) {
  window._threeProviderState = {
    isInitialized,
    resources
  };
  
  window.initThreeJS = async function() {
    debugLog(`initThreeJS called (isInitialized: ${isInitialized})`);
    
    if (isInitialized && window.THREE) {
      debugLog('THREE.js already initialized, returning existing instance');
      return window.THREE;
    }

    try {
      debugLog('Starting THREE.js initialization');
      
      const THREE = await import('three');
      debugLog('THREE core imported');
      
      const OrbitControlsModule = await import('three/examples/jsm/controls/OrbitControls.js');
      const RGBELoaderModule = await import('three/examples/jsm/loaders/RGBELoader.js');
      const WaterModule = await import('three/examples/jsm/objects/Water.js');
      const SkyModule = await import('three/examples/jsm/objects/Sky.js');
      
      debugLog('All THREE.js modules imported successfully');
      
      window.THREE = THREE;
      window.OrbitControls = OrbitControlsModule.OrbitControls;
      window.RGBELoader = RGBELoaderModule.RGBELoader;
      window.Water = WaterModule.Water;
      window.Sky = SkyModule.Sky;
      
      threeInstance = THREE;
      isInitialized = true;
      window._threeProviderState.isInitialized = true;
      
      window.dispatchEvent(new Event('three-loaded'));
      
      debugLog('THREE.js initialization complete - dispatched three-loaded event');
      
      loadSceneScripts();
      
      return THREE;
    } catch (error) {
      console.error('Error initializing THREE.js:', error);
      isInitialized = false;
      window._threeProviderState.isInitialized = false;
      throw error;
    }
  };
  
  function loadSceneScripts() {
    if (!window.oceanSceneLoaded) {
      debugLog('Loading ocean scene script');
      
      const oceanScript = document.createElement('script');
      oceanScript.src = '/scripts/landing/scenes/oceanScene.js';
      oceanScript.type = 'module';
      oceanScript.onload = () => {
        debugLog('Ocean scene script loaded');
        window.oceanSceneLoaded = true;

        if (typeof window.initOceanScene === 'function') {
          debugLog('Calling initOceanScene');
          try {
            window.initOceanScene();
          } catch (e) {
            console.error('Error initializing ocean scene:', e);
          }
        }
      };
      document.body.appendChild(oceanScript);
    }
    
    if (!window.sphereSceneLoaded) {
      debugLog('Loading sphere scene script');
      
      const sphereScript = document.createElement('script');
      sphereScript.src = '/scripts/landing/scenes/sphereScene.js';
      sphereScript.type = 'module';
      sphereScript.onload = () => {
        debugLog('Sphere scene script loaded');
        window.sphereSceneLoaded = true;
        
        if (typeof window.initSphereScene === 'function') {
          debugLog('Calling initSphereScene');
          try {
            window.initSphereScene();
          } catch (e) {
            console.error('Error initializing sphere scene:', e);
          }
        }
      };
      document.body.appendChild(sphereScript);
    }
  }
}

export function initThree() {
  if (isBrowser) {
    if (isInitialized && window.THREE) {
      debugLog('initThree: Returning existing THREE instance');
      return Promise.resolve(window.THREE);
    }
    
    if (window.initThreeJS) {
      debugLog('initThree: Calling window.initThreeJS()');
      return window.initThreeJS();
    }
    
    debugLog('initThree: No initialization method available');
    return Promise.resolve(null);
  }
  
  return Promise.resolve(null);
}

export function getThree() {
  if (isBrowser) {
    return window.THREE || null;
  }
  return null;
}

let disposeHandlers = [];

export function registerDisposeHandler(handler) {
  if (typeof handler === 'function') {
    disposeHandlers.push(handler);
    debugLog(`Registered dispose handler (total: ${disposeHandlers.length})`);
  }
}

export function resetThree() {
  if (!isBrowser) return;
  
  debugLog(`resetThree called (isInitialized: ${isInitialized})`);
  
  if (!isInitialized && !window.THREE) {
    debugLog('THREE.js not initialized, nothing to reset');
    return;
  }
  
  debugLog(`Executing ${disposeHandlers.length} dispose handlers`);
  for (const handler of disposeHandlers) {
    try {
      handler();
    } catch (err) {
      console.error('Error in dispose handler:', err);
    }
  }
  disposeHandlers = [];

  if (window.animationId) {
    debugLog('Canceling animation frame');
    cancelAnimationFrame(window.animationId);
    window.animationId = null;
  }
  
  if (window.renderer) {
    debugLog('Cleaning up renderer');
    try {
      if (window.renderer.domElement) {
        if (window.renderer.domElement.parentNode) {
          window.renderer.domElement.parentNode.removeChild(window.renderer.domElement);
        }
        debugLog('Removed renderer dom element');
      }
      
      window.renderer.dispose();
      if (window.renderer.renderLists) window.renderer.renderLists.dispose();
      if (window.renderer.info) window.renderer.info.reset();
      window.renderer = null;
      debugLog('Renderer disposed and nullified');
    } catch (err) {
      console.error('Error cleaning up renderer:', err);
    }
  }
  
  if (window.scene) {
    debugLog('Cleaning up scene');
    try {
      if (window.scene.traverse) {
        window.scene.traverse((object) => {
          if (object.geometry) {
            object.geometry.dispose();
          }
          
          if (object.material) {
            if (Array.isArray(object.material)) {
              object.material.forEach(material => {
                disposeMaterial(material);
              });
            } else {
              disposeMaterial(object.material);
            }
          }
        });
      }
      window.scene = null;
      debugLog('Scene disposed and nullified');
    } catch (err) {
      console.error('Error cleaning up scene:', err);
    }
  }
  
  function disposeMaterial(material) {
    if (!material) return;
    
    for (const key of Object.keys(material)) {
      const value = material[key];
      if (value && typeof value === 'object' && 'isTexture' in value) {
        value.dispose();
      }
    }
    
    material.dispose();
  }
  
  debugLog('Cleaning up camera, controls, water, and sphere');
  if (window.camera) window.camera = null;
  if (window.controls) {
    if (window.controls.dispose) window.controls.dispose();
    window.controls = null;
  }
  if (window.water) window.water = null;
  if (window.sphere) window.sphere = null;
  
  debugLog('Resetting initialization flags');
  window.threeJSInitialized = false;
  isInitialized = false;
  window._threeProviderState.isInitialized = false;
  
  for (const key in resources) {
    resources[key] = [];
  }
  
  debugLog('THREE.js state has been completely reset');
}

export function debugThreeState() {
  if (!isBrowser) return "Not in browser environment";
  
  return {
    isInitialized,
    hasThreeInstance: !!threeInstance,
    windowHasThree: !!window.THREE,
    windowObjects: {
      hasRenderer: !!window.renderer,
      hasScene: !!window.scene,
      hasCamera: !!window.camera,
      hasControls: !!window.controls,
      hasWater: !!window.water,
      hasSphere: !!window.sphere
    },
    resourceCounts: {
      renderers: resources.renderers.length,
      scenes: resources.scenes.length,
      geometries: resources.geometries.length,
      materials: resources.materials.length,
      textures: resources.textures.length,
      animations: resources.animations.length
    },
    disposeHandlersCount: disposeHandlers.length
  };
}

export default {
  initThree,
  getThree,
  resetThree,
  registerResource,
  registerDisposeHandler,
  debugThreeState
};