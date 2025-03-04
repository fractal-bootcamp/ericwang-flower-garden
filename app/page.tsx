"use client"

import { useState, useEffect } from "react"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ColorPicker } from "@/components/color-picker"
import { SignInForm } from "@/components/sign-in-form"
import { UserHeader } from "@/components/user-header"
import { useUser } from "@/contexts/user-context"
import { getPlantedFlowers, plantFlower, loadFlowers, type PlantedFlower } from "@/lib/flower-storage"
import { Flower, FlowerIcon as Garden, Shuffle, PlusCircle } from "lucide-react"
import dynamic from "next/dynamic"

// Dynamically import the FlowerScene component with no SSR
const DynamicFlowerScene = dynamic(
  () => import("@/components/flower-scene").then((mod) => ({ default: mod.FlowerScene })),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-blue-100 to-blue-200">
        <p className="text-lg font-medium">Loading 3D scene...</p>
      </div>
    ),
  },
)

export default function Home() {
  const { user, isAuthenticated } = useUser()
  const [petalCount, setPetalCount] = useState(8)
  const [petalLength, setPetalLength] = useState(1)
  const [petalWidth, setPetalWidth] = useState(0.5)
  const [stemHeight, setStemHeight] = useState(3)
  const [petalColor, setPetalColor] = useState("#ff6b6b")
  const [centerColor, setCenterColor] = useState("#feca57")
  const [stemColor, setStemColor] = useState("#1dd1a1")
  const [seed, setSeed] = useState(Math.random())
  const [isPlanted, setIsPlanted] = useState(false)
  const [plantedFlowers, setPlantedFlowers] = useState<PlantedFlower[]>([])
  const [isClient, setIsClient] = useState(false)
  const [focusedFlowerPosition, setFocusedFlowerPosition] = useState<[number, number, number] | null>(null)

  // Set isClient to true once component mounts
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Load planted flowers on mount and when authentication changes
  useEffect(() => {
    if (isClient) {
      loadFlowers()
      setPlantedFlowers(getPlantedFlowers())
    }
  }, [isClient])

  // Reset focused flower when switching to single flower view
  useEffect(() => {
    if (!isPlanted) {
      setFocusedFlowerPosition(null)
    }
  }, [isPlanted])

  const generateNewFlower = () => {
    // Randomize all flower parameters
    setPetalCount(Math.floor(Math.random() * 15) + 5) // 5-20 petals
    setPetalLength(0.5 + Math.random() * 1.5) // 0.5-2.0 length
    setPetalWidth(0.1 + Math.random() * 0.9) // 0.1-1.0 width
    setStemHeight(1 + Math.random() * 4) // 1-5 height

    // Generate random colors
    const randomColor = () => {
      const letters = "0123456789ABCDEF"
      let color = "#"
      for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)]
      }
      return color
    }

    setPetalColor(randomColor())
    setCenterColor(randomColor())
    setStemColor(randomColor())

    // Also change the seed for additional randomness in the geometry
    setSeed(Math.random())
  }

  const handlePlantFlower = () => {
    if (!user) return

    // Generate a random position within the field
    const x = Math.random() * 20 - 10 // -10 to 10
    const z = Math.random() * 20 - 10 // -10 to 10
    const position: [number, number, number] = [x, 0, z]

    // Plant the flower
    const newFlower = plantFlower({
      username: user.username,
      petalCount,
      petalLength,
      petalWidth,
      stemHeight,
      petalColor,
      centerColor,
      stemColor,
      seed,
      position,
    })

    // Update the local state
    setPlantedFlowers([...plantedFlowers, newFlower])

    // Set the focused flower position
    setFocusedFlowerPosition(position)

    // Switch to planted view
    setIsPlanted(true)

    // Generate a new flower for next time
    generateNewFlower()
  }

  const toggleView = () => {
    setIsPlanted(!isPlanted)
  }

  if (!isAuthenticated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-blue-100 to-blue-200 p-4">
        <SignInForm />
      </main>
    )
  }

  return (
    <main className="flex min-h-screen flex-col">
      <UserHeader />
      <div className="flex flex-col lg:flex-row flex-1">
        <div className="w-full lg:w-3/4 h-[60vh] lg:h-[calc(100vh-56px)] relative">
          {isClient && (
            <DynamicFlowerScene
              petalCount={petalCount}
              petalLength={petalLength}
              petalWidth={petalWidth}
              stemHeight={stemHeight}
              petalColor={petalColor}
              centerColor={centerColor}
              stemColor={stemColor}
              seed={seed}
              isPlanted={isPlanted}
              plantedFlowers={plantedFlowers}
              focusedFlowerPosition={focusedFlowerPosition}
            />
          )}

          {/* Floating view toggle */}
          <button
            onClick={toggleView}
            className="absolute top-4 right-4 bg-white/80 dark:bg-gray-800/80 p-2 rounded-full shadow-md hover:bg-white dark:hover:bg-gray-800 transition-colors flex items-center gap-2"
            aria-label={isPlanted ? "Switch to flower creation view" : "Switch to garden view"}
          >
            {isPlanted ? (
              <>
                <Flower className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">Edit Flower</span>
              </>
            ) : (
              <>
                <Garden className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">View Garden</span>
              </>
            )}
          </button>

          {/* Floating action buttons */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-4">
            {!isPlanted && (
              <>
                <button
                  onClick={generateNewFlower}
                  className="bg-white/80 dark:bg-gray-800/80 p-3 rounded-full shadow-md hover:bg-white dark:hover:bg-gray-800 transition-colors flex items-center gap-2"
                  aria-label="Generate random flower"
                >
                  <Shuffle className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">Random</span>
                </button>

                <button
                  onClick={handlePlantFlower}
                  className="bg-primary/90 hover:bg-primary text-white p-3 px-4 rounded-full shadow-md transition-colors flex items-center gap-2"
                  aria-label="Plant this flower in the garden"
                >
                  <PlusCircle className="h-5 w-5" />
                  <span className="text-sm font-medium">Plant Flower</span>
                </button>
              </>
            )}
          </div>
        </div>

        <div className="w-full lg:w-1/4 p-4 bg-gray-50 dark:bg-gray-900 h-[calc(100vh-56px)] flex flex-col">
          <Card className="flex-1 flex flex-col">
            <CardHeader className="flex-shrink-0">
              <CardTitle>Flower Generator</CardTitle>
              <CardDescription>Customize your 3D flower</CardDescription>
            </CardHeader>
            <CardContent className="overflow-y-auto flex-1">
              <div className="space-y-6">
                {/* Shape Section */}
                <div>
                  <h3 className="text-lg font-medium mb-3">Shape</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Petal Count: {petalCount}</label>
                      <Slider
                        min={3}
                        max={20}
                        step={1}
                        value={[petalCount]}
                        onValueChange={(value) => setPetalCount(value[0])}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Petal Length: {petalLength.toFixed(1)}</label>
                      <Slider
                        min={0.5}
                        max={2}
                        step={0.1}
                        value={[petalLength]}
                        onValueChange={(value) => setPetalLength(value[0])}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Petal Width: {petalWidth.toFixed(1)}</label>
                      <Slider
                        min={0.1}
                        max={1}
                        step={0.1}
                        value={[petalWidth]}
                        onValueChange={(value) => setPetalWidth(value[0])}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Stem Height: {stemHeight.toFixed(1)}</label>
                      <Slider
                        min={1}
                        max={5}
                        step={0.1}
                        value={[stemHeight]}
                        onValueChange={(value) => setStemHeight(value[0])}
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t my-4"></div>

                {/* Colors Section */}
                <div>
                  <h3 className="text-lg font-medium mb-3">Colors</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Petal Color</label>
                      <ColorPicker color={petalColor} onChange={setPetalColor} />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Center Color</label>
                      <ColorPicker color={centerColor} onChange={setCenterColor} />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Stem Color</label>
                      <ColorPicker color={stemColor} onChange={setStemColor} />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}

