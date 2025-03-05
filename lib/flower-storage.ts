// Types for stored flowers
export interface PlantedFlower {
  id: string
  username: string
  petalCount: number
  petalLength: number
  petalWidth: number
  stemHeight: number
  petalColor: string
  centerColor: string
  stemColor: string
  seed: number
  position: [number, number, number] // [x, y, z]
  plantedAt: number // timestamp
}

// In-memory storage for flowers (in a real app, this would be a database)
let flowers: PlantedFlower[] = []

// Check if we're running on the client side
const isClient = typeof window !== "undefined"

// Load flowers from localStorage
export const loadFlowers = (): void => {
  if (!isClient) return

  try {
    const storedFlowers = localStorage.getItem("plantedFlowers")
    if (storedFlowers) {
      flowers = JSON.parse(storedFlowers)
    }
  } catch (error) {
    console.error("Failed to load flowers:", error)
  }
}

// Save flowers to localStorage
const saveFlowers = (): void => {
  if (!isClient) return

  try {
    localStorage.setItem("plantedFlowers", JSON.stringify(flowers))
  } catch (error) {
    console.error("Failed to save flowers:", error)
  }
}

// Get all planted flowers
export const getPlantedFlowers = (): PlantedFlower[] => {
  return flowers
}

// Plant a new flower
export const plantFlower = (flower: Omit<PlantedFlower, "id" | "plantedAt">): PlantedFlower => {
  // Adjust the y-position based on stem height to prevent tall flowers from getting too close to the top
  const position: [number, number, number] = [flower.position[0], flower.position[1], flower.position[2]]

  // If the stem is tall, lower the flower position, but with a more subtle adjustment
  if (flower.stemHeight > 4) {
    // Only adjust for very tall flowers (> 4)
    position[1] = -Math.max(0, (flower.stemHeight - 4) * 0.15)
  }

  const newFlower: PlantedFlower = {
    ...flower,
    position,
    id: Date.now().toString(),
    plantedAt: Date.now(),
  }

  flowers.push(newFlower)
  saveFlowers()
  return newFlower
}

// Initialize by loading flowers only on the client side
if (isClient) {
  loadFlowers()
}

