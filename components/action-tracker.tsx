"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  Clock,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  MessageCircle,
  Repeat,
  UserPlus,
  Heart,
  Trophy,
  Zap,
} from "lucide-react"
import { NeynarService } from "@/lib/neynar"
import { ListManagementService, type ActionConfig, type RewardList } from "@/lib/list-management"

interface ActionTrackerProps {
  userFid: string
  username: string
}

interface ActionStatus {
  actionId: string
  status: "available" | "pending" | "completed" | "failed"
  points: number
  completedAt?: Date
  verificationAttempts: number
}

export function ActionTracker({ userFid, username }: ActionTrackerProps) {
  const [activeLists, setActiveLists] = useState<RewardList[]>([])
  const [actionStatuses, setActionStatuses] = useState<Map<string, ActionStatus>>(new Map())
  const [isVerifying, setIsVerifying] = useState<Set<string>>(new Set())
  const [totalPoints, setTotalPoints] = useState(0)

  const neynarService = NeynarService.getInstance()
  const listService = ListManagementService.getInstance()

  useEffect(() => {
    loadActiveLists()
    startVerificationLoop()
  }, [])

  const loadActiveLists = async () => {
    const lists = listService.getActiveLists()
    setActiveLists(lists)

    // Initialize action statuses
    const statuses = new Map<string, ActionStatus>()
    lists.forEach((list) => {
      list.actions.forEach((action) => {
        statuses.set(action.id, {
          actionId: action.id,
          status: "available",
          points: action.points,
          verificationAttempts: 0,
        })
      })
    })
    setActionStatuses(statuses)

    // Join all lists automatically for demo
    lists.forEach((list) => {
      listService.joinList(list.id, userFid, username)
    })
  }

  const startVerificationLoop = () => {
    // Check pending actions every 30 seconds
    const interval = setInterval(async () => {
      await verifyPendingActions()
    }, 30000)

    return () => clearInterval(interval)
  }

  const verifyPendingActions = async () => {
    const pendingActions = Array.from(actionStatuses.entries()).filter(([_, status]) => status.status === "pending")

    for (const [actionId, status] of pendingActions) {
      if (isVerifying.has(actionId)) continue

      const action = findActionById(actionId)
      if (!action) continue

      setIsVerifying((prev) => new Set([...prev, actionId]))

      try {
        const isCompleted = await neynarService.verifyAction(userFid, {
          type: action.type,
          targetHash: action.targetUrl?.split("/").pop(),
          targetFid: action.targetUser,
          points: action.points,
          completed: false,
          pending: true,
        })

        if (isCompleted) {
          setActionStatuses((prev) => {
            const newMap = new Map(prev)
            newMap.set(actionId, {
              ...status,
              status: "completed",
              completedAt: new Date(),
            })
            return newMap
          })

          // Update score in list service
          const list = findListByActionId(actionId)
          if (list) {
            await listService.updateUserScore(list.id, userFid, actionId, action.points)
          }

          setTotalPoints((prev) => prev + action.points)

          // Show success notification
          showNotification(`Action completed! +${action.points} points`, "success")
        } else {
          // Increment verification attempts
          const newAttempts = status.verificationAttempts + 1
          if (newAttempts >= 120) {
            // After 1 hour of attempts, mark as failed
            setActionStatuses((prev) => {
              const newMap = new Map(prev)
              newMap.set(actionId, {
                ...status,
                status: "failed",
                verificationAttempts: newAttempts,
              })
              return newMap
            })
            showNotification("Action verification timed out", "error")
          } else {
            setActionStatuses((prev) => {
              const newMap = new Map(prev)
              newMap.set(actionId, {
                ...status,
                verificationAttempts: newAttempts,
              })
              return newMap
            })
          }
        }
      } catch (error) {
        console.error("Verification failed:", error)
      } finally {
        setIsVerifying((prev) => {
          const newSet = new Set(prev)
          newSet.delete(actionId)
          return newSet
        })
      }
    }
  }

  const findActionById = (actionId: string): ActionConfig | undefined => {
    for (const list of activeLists) {
      const action = list.actions.find((a) => a.id === actionId)
      if (action) return action
    }
    return undefined
  }

  const findListByActionId = (actionId: string): RewardList | undefined => {
    return activeLists.find((list) => list.actions.some((action) => action.id === actionId))
  }

  const performAction = async (actionId: string) => {
    const action = findActionById(actionId)
    if (!action) return

    // Mark as pending
    setActionStatuses((prev) => {
      const newMap = new Map(prev)
      newMap.set(actionId, {
        ...prev.get(actionId)!,
        status: "pending",
      })
      return newMap
    })

    // Open appropriate action URL
    let actionUrl = ""
    switch (action.type) {
      case "cast":
        actionUrl = "https://warpcast.com/~/compose"
        break
      case "recast":
        actionUrl = action.targetUrl || "https://warpcast.com"
        break
      case "follow":
        actionUrl = `https://warpcast.com/${action.targetUser}`
        break
      case "like":
        actionUrl = action.targetUrl || "https://warpcast.com"
        break
    }

    if (actionUrl) {
      window.open(actionUrl, "_blank")
    }

    showNotification(`Action started! Complete it on Farcaster to earn ${action.points} points`, "info")
  }

  const showNotification = (message: string, type: "success" | "error" | "info") => {
    // This would integrate with a proper notification system
    console.log(`[${type.toUpperCase()}] ${message}`)
  }

  const getActionIcon = (type: ActionConfig["type"]) => {
    switch (type) {
      case "cast":
        return MessageCircle
      case "recast":
        return Repeat
      case "follow":
        return UserPlus
      case "like":
        return Heart
      default:
        return Zap
    }
  }

  const getStatusColor = (status: ActionStatus["status"]) => {
    switch (status) {
      case "available":
        return "bg-blue-500/20 text-blue-300 border-blue-500/50"
      case "pending":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/50"
      case "completed":
        return "bg-green-500/20 text-green-300 border-green-500/50"
      case "failed":
        return "bg-red-500/20 text-red-300 border-red-500/50"
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/50"
    }
  }

  const completedActions = Array.from(actionStatuses.values()).filter((status) => status.status === "completed")
  const pendingActions = Array.from(actionStatuses.values()).filter((status) => status.status === "pending")

  return (
    <div className="space-y-6">
      {/* Stats Header */}
      <Card className="bg-black/40 backdrop-blur-xl border-purple-500/20">
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{totalPoints}</div>
              <div className="text-sm text-gray-400">Total Points</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{completedActions.length}</div>
              <div className="text-sm text-gray-400">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{pendingActions.length}</div>
              <div className="text-sm text-gray-400">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{activeLists.length}</div>
              <div className="text-sm text-gray-400">Active Lists</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Lists */}
      {activeLists.map((list) => (
        <Card key={list.id} className="bg-black/40 backdrop-blur-xl border-purple-500/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white">{list.name}</CardTitle>
                <p className="text-gray-400 text-sm mt-1">{list.description}</p>
              </div>
              <div className="text-right">
                <Badge variant="secondary" className="bg-purple-500/20 text-purple-300">
                  {list.actions.length} actions
                </Badge>
                <p className="text-xs text-gray-400 mt-1">Ends {list.endDate.toLocaleDateString()}</p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Progress</span>
                <span className="text-white">
                  {list.actions.filter((action) => actionStatuses.get(action.id)?.status === "completed").length} /{" "}
                  {list.actions.length}
                </span>
              </div>
              <Progress
                value={
                  (list.actions.filter((action) => actionStatuses.get(action.id)?.status === "completed").length /
                    list.actions.length) *
                  100
                }
                className="bg-gray-700"
              />
            </div>

            <Separator className="bg-purple-500/20" />

            {/* Actions */}
            <div className="space-y-3">
              {list.actions.map((action) => {
                const status = actionStatuses.get(action.id)
                if (!status) return null

                const ActionIcon = getActionIcon(action.type)

                return (
                  <div
                    key={action.id}
                    className="flex items-start gap-3 p-4 bg-black/30 rounded-lg border border-purple-500/10 overflow-hidden"
                  >
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <ActionIcon className="w-5 h-5 text-white" />
                    </div>

                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-white font-medium capitalize">{action.type}</h4>
                        <Badge variant="secondary" className={getStatusColor(status.status)}>
                          {status.status}
                        </Badge>
                      </div>

                      <p className="text-gray-400 text-sm">{action.description}</p>

                      {action.targetUrl && <p className="text-blue-400 text-xs truncate">{action.targetUrl}</p>}
                      {action.targetUser && <p className="text-blue-400 text-xs">@{action.targetUser}</p>}
                    </div>

                    <div className="flex flex-col items-end gap-2 flex-shrink-0 min-w-0">
                      <div className="text-right">
                        <div className="text-white font-semibold text-sm">+{action.points}</div>
                        <div className="text-gray-400 text-xs">points</div>
                      </div>

                      <div className="flex items-center gap-2">
                        {status.status === "pending" && (
                          <div className="flex items-center gap-1 text-yellow-400">
                            <Clock className="w-3 h-3 animate-pulse" />
                            <span className="text-xs hidden sm:inline">Verifying...</span>
                          </div>
                        )}

                        {status.status === "completed" && (
                          <div className="flex items-center gap-1 text-green-400">
                            <CheckCircle className="w-3 h-3" />
                            <span className="text-xs hidden sm:inline">Completed</span>
                          </div>
                        )}

                        {status.status === "failed" && (
                          <div className="flex items-center gap-1 text-red-400">
                            <AlertCircle className="w-3 h-3" />
                            <span className="text-xs hidden sm:inline">Failed</span>
                          </div>
                        )}

                        {status.status === "available" && (
                          <Button
                            onClick={() => performAction(action.id)}
                            size="sm"
                            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-xs px-2 py-1 h-auto"
                          >
                            <ExternalLink className="w-3 h-3 mr-1" />
                            <span className="hidden sm:inline">Start</span>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      ))}

      {activeLists.length === 0 && (
        <Card className="bg-black/40 backdrop-blur-xl border-purple-500/20">
          <CardContent className="p-12 text-center">
            <Trophy className="w-16 h-16 mx-auto mb-4 text-gray-400 opacity-50" />
            <h3 className="text-xl font-semibold text-white mb-2">No Active Lists</h3>
            <p className="text-gray-400">There are no active reward lists at the moment. Check back later!</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
