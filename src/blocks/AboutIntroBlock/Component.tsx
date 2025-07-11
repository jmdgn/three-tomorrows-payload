'use client'

import React, { useMemo, useRef, useState, useEffect, Suspense } from 'react'
import { Canvas, extend, useFrame, useLoader, useThree } from '@react-three/fiber'
import { type AboutIntroBlock as AboutIntroBlockProps } from '@/payload-types'
import * as THREE from 'three'
import { Water } from 'three/examples/jsm/objects/Water.js'
import { Sky } from '@react-three/drei'
import { loadGSAP } from '@/utilities/gsapLoader'

extend({ Water })

function OceanWater() {
  const ref = useRef<Water>()
  const { gl } = useThree((state) => state)

  const waterNormals = useLoader(THREE.TextureLoader, '/assets/textures/waternormals.jpg')
  waterNormals.wrapS = waterNormals.wrapT = THREE.RepeatWrapping

  const config = useMemo(
    () => ({
      textureWidth: 512,
      textureHeight: 512,
      waterNormals,
      sunDirection: new THREE.Vector3(),
      sunColor: 0xffffff,
      waterColor: 0x556677,
      distortionScale: 3.0,
      format: gl.encoding,
    }),
    [waterNormals, gl.encoding],
  )

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.material.uniforms.time.value += delta * 0.5
    }
  })

  return (
    <water
      ref={ref}
      args={[useMemo(() => new THREE.PlaneGeometry(10000, 10000), []), config]}
      rotation-x={-Math.PI / 2}
    />
  )
}

function Scene() {
  const sunPosition = new THREE.Vector3(100, 10, 100)

  useFrame(({ camera, mouse }) => {
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, 30 + mouse.x * 15, 0.05)
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, 15 + mouse.y * 5, 0.05)
    camera.lookAt(0, 0, 0)
  })

  return (
    <>
      <Sky
        sunPosition={sunPosition}
        turbidity={3.0}
        rayleigh={1.5}
        mieCoefficient={0.006}
        mieDirectionalG={0.9}
        elevation={30}
        azimuth={180}
      />
      <directionalLight position={sunPosition} intensity={1.5} />
      <ambientLight intensity={0.1} />
      <OceanWater />
    </>
  )
}

export const AboutIntroBlock: React.FC<AboutIntroBlockProps> = ({ heroContent }) => {
  const { eyebrow, title } = heroContent || {}
  const [isClient, setIsClient] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setIsClient(true)

    loadGSAP().then((gsapModules) => {
      if (gsapModules && containerRef.current && canvasRef.current) {
        const { gsap } = gsapModules

        const calculateRadius = () => {
          const vw = window.innerWidth
          const vh = window.innerHeight
          const diagonal = Math.sqrt(vw * vw + vh * vh)
          return (diagonal / vw) * 100
        }

        const maxRadius = calculateRadius()

        gsap.set(canvasRef.current, {
          clipPath: `circle(${maxRadius}% at 50% 50%)`,
        })

        gsap.fromTo(
          canvasRef.current,
          {
            clipPath: `circle(${maxRadius}% at 50% 50%)`,
          },
          {
            // Animate to a small circle in the center
            clipPath: 'circle(0% at 50% 50%)',
            ease: 'power2.inOut',
            scrollTrigger: {
              trigger: containerRef.current,
              start: '0', // Absolute start position - triggers immediately
              end: '40%', // Complete animation within 30% of viewport height
              scrub: true, // Immediate response, no smoothing delay
              invalidateOnRefresh: true, // Ensure proper recalculation
              // Update radius on resize
              onRefresh: () => {
                const newRadius = calculateRadius()
                gsap.set(canvasRef.current, {
                  clipPath: `circle(${newRadius}% at 50% 50%)`,
                })
              },
            },
          },
        )

        // Alternative: Use ellipse for a more oval shape if desired
        // Uncomment the following and comment out the circle animation above
        /*
        gsap.fromTo(canvasRef.current, 
          {
            clipPath: 'ellipse(150% 150% at 50% 50%)',
          },
          {
            clipPath: 'ellipse(0% 0% at 50% 50%)',
            ease: 'power2.inOut',
            scrollTrigger: {
              trigger: containerRef.current,
              start: 'top top',
              end: '+=100%',
              scrub: 0.3,
            },
          }
        )
        */
      }
    })

    // Cleanup function to kill the ScrollTrigger instance when the component unmounts
    return () => {
      const { ScrollTrigger } = window
      if (ScrollTrigger) {
        // Find and kill all ScrollTriggers associated with our canvas element
        ScrollTrigger.getAll().forEach((trigger) => {
          if (trigger.animation?.targets().includes(canvasRef.current)) {
            trigger.kill()
          }
        })
      }
    }
  }, [])

  return (
    <>
      <style jsx>{`
        .intro-container {
          position: relative;
          width: 100%;
          height: 100vh;
          min-height: 500px;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          overflow: hidden;
          color: white;
          background-color: white;
        }
        .canvas-background {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 1;
        }
        .text-overlay {
          position: sticky;
          top: 12vh;
          z-index: 2;
          text-align: center;
          padding: 2rem;
          max-width: 1200px;
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }
      `}</style>
      <section ref={containerRef} className="intro-container">
        <div ref={canvasRef} className="canvas-background">
          {isClient && (
            <Canvas
              camera={{
                fov: 55,
                near: 1,
                far: 20000,
                position: [30, 15, 100],
              }}
            >
              <Suspense fallback={null}>
                <Scene />
              </Suspense>
            </Canvas>
          )}
        </div>
        <div className="text-overlay">
          {eyebrow && <h6 className="eyebrow-title">{eyebrow}</h6>}
          {title && <h2 className="main-title">{title}</h2>}
        </div>
      </section>
    </>
  )
}
