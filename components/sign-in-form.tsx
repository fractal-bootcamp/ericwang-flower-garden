"use client"

import type React from "react"

import { useState } from "react"
import { useUser } from "@/contexts/user-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export function SignInForm() {
  const [username, setUsername] = useState("")
  const [error, setError] = useState("")
  const { signIn } = useUser()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Simple validation
    if (!username.trim()) {
      setError("Please enter a username")
      return
    }

    if (username.length < 3) {
      setError("Username must be at least 3 characters")
      return
    }

    // Sign in the user
    signIn(username)
    setError("")
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Welcome to Flower Garden</CardTitle>
        <CardDescription>Enter a username to start creating and planting flowers</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium">
                Username
              </label>
              <Input
                id="username"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full">
            Sign In
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

