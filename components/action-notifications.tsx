"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X, CheckCircle, Clock, AlertTriangle, ExternalLink } from "lucide-react"

interface Notification {
  id: string
  type: "success" | "pending" | "error" | "info"
  title: string
  message: string
  actionUrl?: string
  timestamp: Date
  autoHide?: boolean
}

interface ActionNotificationsProps {
  notifications: Notification[]
  onDismiss: (id: string) => void
  onAction?: (notification: Notification) => void
}

export function ActionNotifications({ notifications, onDismiss, onAction }: ActionNotificationsProps) {
  const [visibleNotifications, setVisibleNotifications] = useState<Notification[]>([])

  useEffect(() => {
    setVisibleNotifications(notifications.slice(-3)) // Show only last 3 notifications

    // Auto-hide success notifications after 5 seconds
    notifications.forEach((notification) => {
      if (notification.autoHide && notification.type === "success") {
        setTimeout(() => {
          onDismiss(notification.id)
        }, 5000)
      }
    })
  }, [notifications, onDismiss])

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-400" />
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-400 animate-pulse" />
      case "error":
        return <AlertTriangle className="w-5 h-5 text-red-400" />
      case "info":
        return <ExternalLink className="w-5 h-5 text-blue-400" />
      default:
        return null
    }
  }

  const getNotificationBorder = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return "border-green-500/50"
      case "pending":
        return "border-yellow-500/50"
      case "error":
        return "border-red-500/50"
      case "info":
        return "border-blue-500/50"
      default:
        return "border-purple-500/50"
    }
  }

  if (visibleNotifications.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {visibleNotifications.map((notification) => (
        <Card
          key={notification.id}
          className={`bg-black/90 backdrop-blur-xl border ${getNotificationBorder(
            notification.type,
          )} shadow-2xl animate-in slide-in-from-right duration-300`}
        >
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">{getNotificationIcon(notification.type)}</div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-white font-medium text-sm">{notification.title}</h4>
                  <Badge
                    variant="secondary"
                    className={`text-xs ${
                      notification.type === "success"
                        ? "bg-green-500/20 text-green-300"
                        : notification.type === "pending"
                          ? "bg-yellow-500/20 text-yellow-300"
                          : notification.type === "error"
                            ? "bg-red-500/20 text-red-300"
                            : "bg-blue-500/20 text-blue-300"
                    }`}
                  >
                    {notification.type}
                  </Badge>
                </div>

                <p className="text-gray-300 text-sm mb-2">{notification.message}</p>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">{notification.timestamp.toLocaleTimeString()}</span>

                  {notification.actionUrl && onAction && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onAction(notification)}
                      className="text-xs border-purple-500/50 text-purple-300 hover:bg-purple-500/20 bg-transparent"
                    >
                      View
                    </Button>
                  )}
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDismiss(notification.id)}
                className="text-gray-400 hover:text-white hover:bg-white/10 p-1 h-auto"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
