"use client"

import { useUser } from "@/contexts/user-context"
import { Button } from "@/components/ui/button"

export function UserHeader() {
  const { user, signOut } = useUser()

  if (!user) return null

  return (
    <div className="flex justify-between items-center p-4 bg-white dark:bg-gray-800 shadow-sm">
      <div className="font-medium">
        Welcome, <span className="text-primary">{user.username}</span>
      </div>
      <Button variant="outline" size="sm" onClick={signOut}>
        Sign Out
      </Button>
    </div>
  )
}

