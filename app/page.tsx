"use client"

import { useState, useEffect } from "react"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ColorPicker } from "@/components/color-picker"
import { SignInForm } from "@/components/sign-in-form"
import { UserHeader } from "@/components/user-header"
import { useUser } from "@/contexts/user-context"
import { getPlantedFlowers, plantFlower, loadFlowers, type PlantedFlower } from "@/lib/flower-storage"
import { Shuffle, PlusCircle, PencilIcon, X } from "lucide-react"
import { Switch } from "@/components/ui/switch"
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
  const [controlsVisible, setControlsVisible] = useState(false) // Default to closed

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
    // Hide controls when switching to garden view
    if (!isPlanted) {
      setControlsVisible(false)
    }
  }

  const toggleControls = () => {
    setControlsVisible(!controlsVisible)
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
      <div className="relative flex-1">
        {/* Full-width canvas */}
        <div className="w-full h-[calc(100vh-56px)]">
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
        </div>

        {/* View toggle switch */}
        <div className="absolute top-4 left-4 bg-white/80 dark:bg-gray-800/80 p-2 px-3 rounded-full shadow-md flex items-center gap-3">
          <Switch checked={isPlanted} onCheckedChange={toggleView} aria-label="Toggle view" />
          <span className="text-sm font-medium whitespace-nowrap">
            {isPlanted ? "Community Garden" : "Flower Editor"}
          </span>
        </div>

        {/* Show controls button (only visible when controls are hidden and in flower editor mode) */}
        {!controlsVisible && !isPlanted && (
          <button
            onClick={toggleControls}
            className="absolute top-4 right-4 bg-white/80 dark:bg-gray-800/80 p-2 rounded-full shadow-md hover:bg-white dark:hover:bg-gray-800 transition-colors"
            aria-label="Show controls"
          >
            <PencilIcon className="h-5 w-5 text-primary" />
          </button>
        )}

        {/* Floating control panel */}
        {controlsVisible && !isPlanted && (
          <div className="absolute top-4 right-4 w-full max-w-xs md:max-w-sm transition-all duration-300 ease-in-out">
            <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-lg border border-white/20 dark:border-gray-700/30">
              <CardHeader className="pb-2 relative">
                <button
                  onClick={toggleControls}
                  className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-colors"
                  aria-label="Hide controls"
                >
                  <X className="h-4 w-4" />
                </button>
                <CardTitle>Flower Generator</CardTitle>
                <CardDescription>Customize your 3D flower</CardDescription>
              </CardHeader>
              <CardContent className="max-h-[calc(100vh-200px)] overflow-y-auto">
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

                  <div className="border-t border-gray-200 dark:border-gray-700 my-4"></div>

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
        )}

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
                <span className="text-sm font-medium whitespace-nowrap">Random</span>
              </button>

              <button
                onClick={handlePlantFlower}
                className="bg-primary/90 hover:bg-primary text-white p-3 px-4 rounded-full shadow-md transition-colors flex items-center gap-2"
                aria-label="Plant this flower in the garden"
              >
                <PlusCircle className="h-5 w-5" />
                <span className="text-sm font-medium whitespace-nowrap">Plant Flower</span>
              </button>
            </>
          )}
        </div>
      </div>
    </main>
  )
}

