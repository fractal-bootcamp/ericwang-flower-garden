"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

// Define types for our context
type User = {
  username: string
}

type UserContextType = {
  user: User | null
  signIn: (username: string) => void
  signOut: () => void
  isAuthenticated: boolean
}

// Create the context with a default value
const UserContext = createContext<UserContextType>({
  user: null,
  signIn: () => {},
  signOut: () => {},
  isAuthenticated: false,
})

// Custom hook to use the user context
export const useUser = () => useContext(UserContext)

// Provider component
export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isClient, setIsClient] = useState(false)

  // Set isClient to true once component mounts
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Check for existing user in localStorage on mount
  useEffect(() => {
    if (isClient) {
      const storedUser = localStorage.getItem("flowerUser")
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser))
        } catch (error) {
          console.error("Failed to parse user data:", error)
        }
      }
    }
  }, [isClient])

  // Sign in function
  const signIn = (username: string) => {
    const newUser = { username }
    setUser(newUser)
    if (isClient) {
      localStorage.setItem("flowerUser", JSON.stringify(newUser))
    }
  }

  // Sign out function
  const signOut = () => {
    setUser(null)
    if (isClient) {
      localStorage.removeItem("flowerUser")
    }
  }

  return (
    <UserContext.Provider
      value={{
        user,
        signIn,
        signOut,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

