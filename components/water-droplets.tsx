"use client"

import { useRef, useMemo, useEffect } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

interface WaterDropletsProps {
  active: boolean
  duration?: number
  height?: number
  onComplete?: () => void
}

export function WaterDroplets({ active, duration = 2, height = 3, onComplete }: WaterDropletsProps) {
  const groupRef = useRef<THREE.Group>(null)
  const startTimeRef = useRef<number | null>(null)

  // Create simple droplet positions - just a few spheres above the flower
  const droplets = useMemo(() => {
    const drops = []
    // Create 8 droplets in a circle around the flower
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2
      const radius = 0.4
      const x = Math.cos(angle) * radius
      const z = Math.sin(angle) * radius
      const y = height + 1.5 + Math.random() * 0.5 // Start above the flower

      // Add some randomness to the start delay so they don't all fall at once
      const delay = Math.random() * 0.5

      drops.push({
        position: [x, y, z],
        delay,
      })
    }
    return drops
  }, [height])

  // Reset the start time when the animation becomes active
  useEffect(() => {
    if (active) {
      startTimeRef.current = null
    }
  }, [active])

  // Animation using useFrame
  useFrame((state) => {
    // Only animate if active and ref exists
    if (!active || !groupRef.current) return

    const time = state.clock.getElapsedTime()

    // Initialize start time when animation begins
    if (startTimeRef.current === null) {
      startTimeRef.current = time
    }

    // Calculate elapsed time since animation started
    const elapsed = time - startTimeRef.current

    // End animation after duration
    if (elapsed > duration) {
      if (onComplete) onComplete()
      return
    }

    // Update each droplet
    const children = groupRef.current.children
    for (let i = 0; i < children.length; i++) {
      if (i >= droplets.length) continue

      const droplet = children[i] as THREE.Mesh
      const data = droplets[i]

      // Only start falling after the droplet's delay
      if (elapsed > data.delay) {
        const dropletElapsed = elapsed - data.delay

        // Simple gravity calculation
        const gravity = 9.8
        const newY = data.position[1] - 0.5 * gravity * dropletElapsed * dropletElapsed

        // Update position
        droplet.position.y = Math.max(0, newY)

        // Fade out as it reaches the ground
        if (newY <= 0.5) {
          const opacity = Math.max(0, newY / 0.5)
          const material = droplet.material as THREE.MeshStandardMaterial
          if (material && material.opacity !== undefined) {
            material.opacity = opacity
          }
        }
      }
    }
  })

  // Don't render anything when not active
  if (!active) return null

  return (
    <group ref={groupRef}>
      {droplets.map((droplet, i) => (
        <mesh key={i} position={new THREE.Vector3(...droplet.position)}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshStandardMaterial
            color="#64b5f6"
            transparent={true}
            opacity={0.8}
            emissive="#4fc3f7"
            emissiveIntensity={0.2}
          />
        </mesh>
      ))}
    </group>
  )
}

