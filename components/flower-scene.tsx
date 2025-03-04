"use client"

import { useRef, useMemo, useEffect, useState } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { OrbitControls, Environment, Html } from "@react-three/drei"
import * as THREE from "three"
import type { PlantedFlower } from "@/lib/flower-storage"

interface FlowerProps {
  petalCount: number
  petalLength: number
  petalWidth: number
  stemHeight: number
  petalColor: string
  centerColor: string
  stemColor: string
  seed: number
  isPlanted?: boolean
  username?: string
  position?: [number, number, number]
}

interface FieldProps {
  plantedFlowers: PlantedFlower[]
}

function Field({ plantedFlowers = [], size = 30 }: FieldProps & { size?: number }) {
  return (
    <>
      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[size, size]} />
        <meshStandardMaterial color="#5d9e5f" roughness={0.8} />
      </mesh>

      {/* Planted flowers */}
      {plantedFlowers.map((flower) => (
        <PlantedFlowerWithLabel key={flower.id} {...flower} position={flower.position} username={flower.username} />
      ))}
    </>
  )
}

function PlantedFlowerWithLabel(props: FlowerProps) {
  const [hovered, setHovered] = useState(false)
  const groupRef = useRef<THREE.Group>(null)

  return (
    <group
      ref={groupRef}
      position={props.position || [0, 0, 0]}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <Flower {...props} isPlanted={true} />

      {/* Username label that appears on hover */}
      {hovered && props.username && (
        <Html position={[0, props.stemHeight + 1, 0]} center distanceFactor={8}>
          <div className="px-2 py-1 bg-black/70 text-white rounded text-sm whitespace-nowrap">{props.username}</div>
        </Html>
      )}
    </group>
  )
}

function Flower({
  petalCount,
  petalLength,
  petalWidth,
  stemHeight,
  petalColor,
  centerColor,
  stemColor,
  seed,
  isPlanted = false,
}: FlowerProps) {
  const flowerGroup = useRef<THREE.Group>(null)
  const stemGroup = useRef<THREE.Group>(null)
  const petalGroup = useRef<THREE.Group>(null)

  // Use seed to create deterministic randomness
  const random = (min: number, max: number, seedOffset = 0) => {
    const x = Math.sin(seed + seedOffset) * 10000
    return min + (x - Math.floor(x)) * (max - min)
  }

  // Create unique wind parameters for this flower
  const windParams = useMemo(() => {
    return {
      speed: random(0.5, 1.5, 42),
      strength: random(0.05, 0.15, 13),
      turbulence: random(0.1, 0.3, 27),
      direction: random(0, Math.PI * 2, 99),
    }
  }, [seed, random]) // Added seed and random to dependencies

  // Create petals\
  const petals = useMemo(() => {
    const items = []
    for (let i = 0; i < petalCount; i++) {
      const angle = (i / petalCount) * Math.PI * 2
      const petalSeed = seed + i

      // Add some randomness to petal shape
      const length = petalLength * (0.9 + random(0, 0.2, petalSeed))
      const width = petalWidth * (0.9 + random(0, 0.2, petalSeed + 0.1))
      const bend = random(0.1, 0.3, petalSeed + 0.2)

      items.push(
        <mesh key={i} position={[0, 0, 0]} rotation={[Math.PI / 2 - bend, 0, angle]}>
          <planeGeometry args={[width * 2, length * 2]} />
          <meshStandardMaterial color={petalColor} side={THREE.DoubleSide} roughness={0.6} metalness={0.1} />
        </mesh>,
      )
    }
    return items
  }, [petalCount, petalLength, petalWidth, petalColor, seed, random]) // Added random to dependencies

  // Animate the flower with wind effect
  useFrame((state) => {
    if (!flowerGroup.current || !stemGroup.current || !petalGroup.current) return

    const time = state.clock.getElapsedTime()

    // Base wind movement
    const windX = Math.sin(time * windParams.speed) * windParams.strength
    const windZ = Math.cos(time * windParams.speed + 0.3) * windParams.strength * 0.7

    // Add turbulence
    const turbulenceX = Math.sin(time * 2.5 * windParams.speed) * windParams.turbulence * 0.05
    const turbulenceZ = Math.cos(time * 2.7 * windParams.speed) * windParams.turbulence * 0.04

    // Apply wind direction
    const directedWindX = (windX + turbulenceX) * Math.cos(windParams.direction)
    const directedWindZ = (windZ + turbulenceZ) * Math.sin(windParams.direction)

    // Stem bends in the wind (more at the top, less at the bottom)
    stemGroup.current.rotation.x = directedWindZ * 0.2
    stemGroup.current.rotation.z = -directedWindX * 0.2

    // Flower head follows the stem but with more movement
    flowerGroup.current.position.x = directedWindX * stemHeight * 0.2
    flowerGroup.current.position.z = directedWindZ * stemHeight * 0.2

    // Petals flutter slightly in the wind
    petalGroup.current.rotation.y = Math.sin(time * 3) * 0.03
    petalGroup.current.rotation.x = Math.cos(time * 2.5) * 0.02
    petalGroup.current.rotation.z = Math.sin(time * 4) * 0.01
  })

  return (
    <group position={[0, isPlanted ? 0 : 0, 0]}>
      <group ref={stemGroup}>
        {/* Stem */}
        <mesh position={[0, stemHeight / 2, 0]} rotation={[0, 0, 0]}>
          <cylinderGeometry args={[0.1, 0.15, stemHeight, 8]} />
          <meshStandardMaterial color={stemColor} roughness={0.8} />
        </mesh>

        {/* Leaves */}
        <mesh position={[0, stemHeight * 0.3, 0]} rotation={[Math.PI / 2, 0, Math.PI / 4]}>
          <planeGeometry args={[0.4, 0.8]} />
          <meshStandardMaterial color={stemColor} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, stemHeight * 0.6, 0]} rotation={[Math.PI / 2, 0, -Math.PI / 4]}>
          <planeGeometry args={[0.4, 0.6]} />
          <meshStandardMaterial color={stemColor} side={THREE.DoubleSide} />
        </mesh>

        {/* Flower head group */}
        <group ref={flowerGroup} position={[0, stemHeight, 0]}>
          {/* Flower center */}
          <mesh>
            <sphereGeometry args={[0.3, 32, 32]} />
            <meshStandardMaterial color={centerColor} roughness={0.7} />
          </mesh>

          {/* Petals group */}
          <group ref={petalGroup}>{petals}</group>
        </group>
      </group>
    </group>
  )
}

function SceneSetup({ isPlanted }: { isPlanted: boolean }) {
  const { camera } = useThree()

  useEffect(() => {
    if (isPlanted) {
      // When planted, position camera to view the garden from a higher angle
      camera.position.set(5, 5, 5)
    } else {
      // When viewing a single flower, position camera to view it directly
      camera.position.set(0, 3, 6)
    }
    // Always look at the center point
    camera.lookAt(0, isPlanted ? 1 : 2, 0)
  }, [isPlanted, camera])

  return null
}

interface FlowerSceneProps extends FlowerProps {
  plantedFlowers?: PlantedFlower[]
}

export function FlowerScene(props: FlowerSceneProps) {
  const { isPlanted = false, plantedFlowers = [] } = props

  return (
    <Canvas shadows camera={{ position: [0, 3, 6], fov: 50 }} className="bg-gradient-to-b from-blue-100 to-blue-200">
      <SceneSetup isPlanted={isPlanted} />
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} castShadow />
      <directionalLight
        position={[5, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />

      {isPlanted && <Field plantedFlowers={plantedFlowers} />}
      {!isPlanted && <Flower {...props} />}

      <Environment preset={isPlanted ? "park" : "city"} />
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={2}
        maxDistance={isPlanted ? 30 : 15}
        minPolarAngle={isPlanted ? 0.1 : 0}
        maxPolarAngle={isPlanted ? Math.PI / 2 - 0.1 : Math.PI}
        target={[0, isPlanted ? 1 : 2, 0]} // Set the target to match the lookAt point
      />
    </Canvas>
  )
}

export default FlowerScene

