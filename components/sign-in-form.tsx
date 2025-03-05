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
    <Card className="w-full max-w-md mx-auto bg-custom-dark text-custom-text border-custom-secondary/30">
      <CardHeader>
        <CardTitle className="text-2xl text-custom-text">Welcome to Flower Garden</CardTitle>
        <CardDescription className="text-custom-text/70">
          Enter a username to start creating and planting flowers
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium text-custom-text">
                Username
              </label>
              <Input
                id="username"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-custom-input border-custom-secondary/30 text-custom-text placeholder:text-custom-text/50"
              />
              {error && <p className="text-sm text-red-400">{error}</p>}
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full bg-custom-primary hover:bg-custom-primary/90 text-custom-text">
            Sign In
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

