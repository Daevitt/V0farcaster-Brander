"use client"

import { useState, useEffect } from "react"
import { ActionTracker } from "@/components/action-tracker"
import { ActionNotifications } from "@/components/action-notifications"
import { PageHeader } from "@/components/page-header"
import { FarcasterAuth, type FarcasterUser } from "@/lib/farcaster-auth"
import { useRouter } from "next/navigation"

interface Notification {
  id: string
  type: "success" | "pending" | "error" | "info"
  title: string
  message: string
  actionUrl?: string
  timestamp: Date
  autoHide?: boolean
}

export default function ActionsPage() {
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [user, setUser] = useState<FarcasterUser | null>(null)
  const farcasterAuth = FarcasterAuth.getInstance()

  useEffect(() => {
    const currentUser = farcasterAuth.getCurrentUser()
    if (!currentUser) {
      router.push("/")
      return
    }
    setUser(currentUser)
  }, [])

  const addNotification = (
    type: Notification["type"],
    title: string,
    message: string,
    actionUrl?: string,
    autoHide = false,
  ) => {
    const notification: Notification = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      title,
      message,
      actionUrl,
      timestamp: new Date(),
      autoHide,
    }

    setNotifications((prev) => [...prev, notification])
  }

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  const handleNotificationAction = (notification: Notification) => {
    if (notification.actionUrl) {
      window.open(notification.actionUrl, "_blank")
    }
  }

  useEffect(() => {
    setTimeout(() => {
      addNotification("info", "Welcome!", "Complete actions to earn points and climb the leaderboards", undefined, true)
    }, 1000)

    setTimeout(() => {
      addNotification("pending", "Action Verification", "Checking your recent Farcaster activity...", undefined, false)
    }, 3000)
  }, [])

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="absolute inset-0 bg-[url('/abstract-geometric-pattern.png')] opacity-10"></div>

      <PageHeader title="Action Tracker" description="Complete actions to earn rewards" />

      <main className="relative z-10 container mx-auto px-4 py-8">
        <ActionTracker userFid={user.fid.toString()} username={user.username} />
      </main>

      <ActionNotifications
        notifications={notifications}
        onDismiss={dismissNotification}
        onAction={handleNotificationAction}
      />
    </div>
  )
}
