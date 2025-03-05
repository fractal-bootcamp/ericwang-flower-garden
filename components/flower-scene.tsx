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

      {/* Add some random flowers in the background */}
      {Array.from({ length: 15 }).map((_, i) => {
        const x = Math.random() * size - size / 2
        const z = Math.random() * size - size / 2
        // Don't place flowers too close to the center
        if (Math.abs(x) < 3 && Math.abs(z) < 3) return null

        const scale = 0.3 + Math.random() * 0.4
        return (
          <mesh key={i} position={[x, 0, z]} scale={[scale, scale, scale]}>
            <sphereGeometry args={[0.3, 8, 8]} />
            <meshStandardMaterial color={`hsl(${Math.random() * 360}, 70%, 60%)`} roughness={0.7} />
          </mesh>
        )
      })}

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

  // Calculate position with adjusted height for tall flowers
  const position: [number, number, number] = props.position
    ? [props.position[0], props.position[1], props.position[2]]
    : [0, 0, 0]

  // If the stem is tall, lower the flower position to keep it from getting too close to the top
  // Using a more subtle adjustment factor (0.15 instead of 0.3)
  if (props.stemHeight > 4) {
    // Only adjust for very tall flowers (> 4)
    position[1] = -Math.max(0, (props.stemHeight - 4) * 0.15)
  }

  return (
    <group
      ref={groupRef}
      position={position}
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

// Create a helper function to generate deterministic random numbers based on a seed
const createRandomGenerator = (seed: number) => {
  return (min: number, max: number, seedOffset = 0): number => {
    const x = Math.sin(seed + seedOffset) * 10000
    return min + (x - Math.floor(x)) * (max - min)
  }
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

  // Create a memoized random generator based on the seed
  const random = useMemo(() => createRandomGenerator(seed), [seed])

  // Create unique wind parameters for this flower
  const windParams = useMemo(() => {
    return {
      speed: random(0.5, 1.5, 42),
      strength: random(0.05, 0.15, 13),
      turbulence: random(0.1, 0.3, 27),
      direction: random(0, Math.PI * 2, 99),
    }
  }, [random])

  // Create petals
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
  }, [petalCount, petalLength, petalWidth, petalColor, seed, random])

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
    <group position={[0, 0, 0]}>
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

function CameraController({
  isPlanted,
  focusedFlowerPosition,
  stemHeight = 3, // Default stem height
}: {
  isPlanted: boolean
  focusedFlowerPosition?: [number, number, number] | null
  stemHeight?: number
}) {
  const { camera } = useThree()
  const controlsRef = useRef<any>(null)

  useEffect(() => {
    if (isPlanted) {
      if (focusedFlowerPosition) {
        // When a flower is just planted, position camera to view that specific flower
        const [x, y, z] = focusedFlowerPosition

        // Position the camera at an angle to the flower
        camera.position.set(x + 5, 5, z + 5)

        // Look at the flower
        camera.lookAt(x, y + 1, z)

        // Update the orbit controls target
        if (controlsRef.current) {
          controlsRef.current.target.set(x, y + 1, z)
        }
      } else {
        // Default garden view
        camera.position.set(5, 5, 5)
        camera.lookAt(0, 1, 0)

        if (controlsRef.current) {
          controlsRef.current.target.set(0, 1, 0)
        }
      }
    } else {
      // Calculate camera position based on stem height to ensure the entire flower is visible
      const flowerTotalHeight = stemHeight + 1 // Add 1 for the flower head

      // Position camera from a more downward angle
      // Increase height and decrease distance for a steeper angle
      const cameraHeight = Math.max(5, flowerTotalHeight * 1.2)
      const cameraDistance = Math.max(4, flowerTotalHeight * 1.0)

      // Position camera to center the flower in the visible area with a steeper angle
      camera.position.set(0, cameraHeight, cameraDistance)

      // Look at a point slightly above the base of the flower
      const lookAtHeight = stemHeight * 0.3
      camera.lookAt(0, lookAtHeight, 0)

      if (controlsRef.current) {
        controlsRef.current.target.set(0, lookAtHeight, 0)
      }
    }
  }, [isPlanted, camera, focusedFlowerPosition, stemHeight])

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={true}
      enableZoom={true}
      enableRotate={true}
      minDistance={2}
      maxDistance={isPlanted ? 30 : Math.max(15, stemHeight * 3)} // Adjust max distance based on stem height
      minPolarAngle={isPlanted ? 0.1 : 0}
      maxPolarAngle={isPlanted ? Math.PI / 2 - 0.1 : Math.PI}
    />
  )
}

interface FlowerSceneProps extends FlowerProps {
  plantedFlowers?: PlantedFlower[]
  focusedFlowerPosition?: [number, number, number] | null
  sidebarVisible?: boolean // Added this property to fix the type error
}

export function FlowerScene(props: FlowerSceneProps) {
  const {
    isPlanted = false,
    plantedFlowers = [],
    focusedFlowerPosition = null,
    stemHeight = 3,
    sidebarVisible = false, // Add default value
  } = props

  // Calculate the y-position offset based on stem height for the single flower view
  // Using a more subtle adjustment factor (0.25 instead of 0.5)
  const singleFlowerYOffset = -Math.max(0.5, stemHeight * 0.25)

  return (
    <Canvas
      shadows
      camera={{ position: [0, 5, 4], fov: 50 }} // Initial camera position with more downward angle
      className={`bg-gradient-to-b from-blue-100 to-blue-200 ${isPlanted ? "w-full h-full" : "w-full h-full"}`}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
      }}
    >
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
      {!isPlanted && (
        <group position={[0, singleFlowerYOffset, 0]}>
          <Flower {...props} />
        </group>
      )}

      <Environment preset={isPlanted ? "park" : "city"} />
      <CameraController isPlanted={isPlanted} focusedFlowerPosition={focusedFlowerPosition} stemHeight={stemHeight} />
    </Canvas>
  )
}

export default FlowerScene

