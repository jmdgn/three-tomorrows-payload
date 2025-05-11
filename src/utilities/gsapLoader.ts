let gsapLoaded = false
let scrollTriggerLoaded = false

export const loadGSAP = async () => {
  if (typeof window === 'undefined') return null

  if (gsapLoaded && scrollTriggerLoaded) {
    return { gsap: window.gsap, ScrollTrigger: window.ScrollTrigger }
  }

  try {
    // Dynamically import GSAP and ScrollTrigger
    const { gsap } = await import('gsap')
    const { ScrollTrigger } = await import('gsap/ScrollTrigger')

    // Register the plugin
    gsap.registerPlugin(ScrollTrigger)

    // Store references on window object for global access
    window.gsap = gsap
    window.ScrollTrigger = ScrollTrigger

    gsapLoaded = true
    scrollTriggerLoaded = true

    return { gsap, ScrollTrigger }
  } catch (error) {
    console.error('Error loading GSAP:', error)
    return null
  }
}

// Add this to your window type declarations (in a .d.ts file)
declare global {
  interface Window {
    gsap: any
    ScrollTrigger: any
  }
}
