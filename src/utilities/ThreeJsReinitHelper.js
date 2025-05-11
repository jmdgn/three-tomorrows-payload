'use client'

export function checkAnimationState() {
  if (typeof window === 'undefined') return false

  if (!window.renderer || !window.scene || !window.camera) {
    return false
  }

  return !!window.animationId
}

export function startAnimation() {
  if (typeof window === 'undefined') return false

  if (window.animationId) {
    return true
  }

  if (window.renderer && window.scene && window.camera) {
    if (typeof window.animate !== 'function') {
      window.animate = function () {
        if (window.water && window.water.material && window.water.material.uniforms) {
          window.water.material.uniforms.time.value += 0.3 / 60.0
        }

        if (window.controls) {
          window.controls.update()
        }

        if (window.renderer && window.scene && window.camera) {
          window.renderer.render(window.scene, window.camera)
        }

        window.animationId = requestAnimationFrame(window.animate)
      }
    }

    window.animationId = requestAnimationFrame(window.animate)
    console.log('Animation started')
    return true
  }

  return false
}

export function forcePageRefresh() {
  if (typeof window === 'undefined') return false

  if (!sessionStorage.getItem('homepage_refreshed')) {
    sessionStorage.setItem('homepage_refreshed', 'true')
    window.location.href = '/'
    return true
  }

  return false
}

if (typeof window !== 'undefined') {
  window.checkThreeJsAnimation = checkAnimationState
  window.startThreeJsAnimation = startAnimation
  window.forcePageRefresh = forcePageRefresh
}

export default {
  checkAnimationState,
  startAnimation,
  forcePageRefresh,
}
