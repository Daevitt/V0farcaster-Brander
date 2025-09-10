"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  BarChart3,
  Users,
  Trophy,
  DollarSign,
  Eye,
  Pause,
  Play,
  Edit,
  Trash2,
  Download,
  TrendingUp,
  Zap,
  Gift,
  CheckCircle,
} from "lucide-react"
import { ListManagementService, type RewardList } from "@/lib/list-management"
import { useRouter } from "next/navigation"

interface AdminDashboardProps {
  creatorFid: string
}

interface ListAnalytics {
  totalParticipants: number
  completedActions: number
  pendingActions: number
  rewardsClaimed: number
  totalRewards: number
  conversionRate: number
  dailyActivity: number[]
}

export default function AdminDashboard() {
  const [creatorLists, setCreatorLists] = useState<RewardList[]>([])
  const [analytics, setAnalytics] = useState<Map<string, ListAnalytics>>(new Map())
  const [selectedList, setSelectedList] = useState<string | null>(null)
  const [totalEarnings, setTotalEarnings] = useState(0)

  const router = useRouter()
  const listService = ListManagementService.getInstance()

  // Mock creator FID - in real app, get from auth
  const creatorFid = "12345"

  useEffect(() => {
    loadCreatorData()
    const interval = setInterval(loadCreatorData, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadCreatorData = () => {
    const lists = listService.getListsByCreator(creatorFid)
    setCreatorLists(lists)

    // Calculate analytics for each list
    const analyticsMap = new Map<string, ListAnalytics>()
    let earnings = 0

    lists.forEach((list) => {
      const totalParticipants = list.totalParticipants
      const completedActions = Math.floor(totalParticipants * 0.7) // Mock data
      const pendingActions = Math.floor(totalParticipants * 0.3)
      const rewardsClaimed = Math.floor(completedActions * 0.4)
      const totalRewards = list.rewards.reduce((sum, reward) => {
        return sum + (reward.type === "token" ? reward.amount || 0 : 100)
      }, 0)

      analyticsMap.set(list.id, {
        totalParticipants,
        completedActions,
        pendingActions,
        rewardsClaimed,
        totalRewards,
        conversionRate: (completedActions / totalParticipants) * 100,
        dailyActivity: Array.from({ length: 7 }, () => Math.floor(Math.random() * 50)),
      })

      earnings += 2 // 2 USDC per list
    })

    setAnalytics(analyticsMap)
    setTotalEarnings(earnings)
  }

  const toggleListStatus = (listId: string) => {
    const list = creatorLists.find((l) => l.id === listId)
    if (list) {
      listService.updateListStatus(listId, list.status === "active" ? "paused" : "active")
      loadCreatorData()
    }
  }

  const deleteList = (listId: string) => {
    if (confirm("Are you sure you want to delete this list? This action cannot be undone.")) {
      listService.deleteList(listId)
      loadCreatorData()
    }
  }

  const OverviewTab = () => {
    const totalParticipants = Array.from(analytics.values()).reduce((sum, a) => sum + a.totalParticipants, 0)
    const totalCompletedActions = Array.from(analytics.values()).reduce((sum, a) => sum + a.completedActions, 0)
    const totalRewardsClaimed = Array.from(analytics.values()).reduce((sum, a) => sum + a.rewardsClaimed, 0)
    const avgConversionRate =
      Array.from(analytics.values()).reduce((sum, a) => sum + a.conversionRate, 0) / analytics.size || 0

    return (
      <div className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-black/40 backdrop-blur-xl border-purple-500/20">
            <CardContent className="p-4 text-center">
              <Zap className="w-6 h-6 mx-auto mb-2 text-purple-400" />
              <div className="text-xl font-bold text-white">{creatorLists.length}</div>
              <div className="text-xs text-gray-400">Active Lists</div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 backdrop-blur-xl border-purple-500/20">
            <CardContent className="p-4 text-center">
              <Users className="w-6 h-6 mx-auto mb-2 text-blue-400" />
              <div className="text-xl font-bold text-white">{totalParticipants}</div>
              <div className="text-xs text-gray-400">Total Participants</div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 backdrop-blur-xl border-purple-500/20">
            <CardContent className="p-4 text-center">
              <Trophy className="w-6 h-6 mx-auto mb-2 text-yellow-400" />
              <div className="text-xl font-bold text-white">{totalCompletedActions}</div>
              <div className="text-xs text-gray-400">Completed Actions</div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 backdrop-blur-xl border-purple-500/20">
            <CardContent className="p-4 text-center">
              <DollarSign className="w-6 h-6 mx-auto mb-2 text-green-400" />
              <div className="text-xl font-bold text-white">${totalEarnings}</div>
              <div className="text-xs text-gray-400">Total Earnings</div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Chart */}
        <Card className="bg-black/40 backdrop-blur-xl border-purple-500/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-400" />
              Performance Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Conversion Rate</span>
                  <span className="text-white font-medium">{avgConversionRate.toFixed(1)}%</span>
                </div>
                <Progress value={avgConversionRate} className="bg-gray-700 h-3" />

                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Rewards Claimed</span>
                  <span className="text-white font-medium">{totalRewardsClaimed}</span>
                </div>
                <Progress value={(totalRewardsClaimed / totalCompletedActions) * 100} className="bg-gray-700 h-3" />
              </div>

              <div className="space-y-3">
                <h4 className="text-white font-medium">Recent Activity</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">New participants today</span>
                    <span className="text-green-400">+{Math.floor(Math.random() * 20)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Actions completed</span>
                    <span className="text-blue-400">+{Math.floor(Math.random() * 50)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Rewards distributed</span>
                    <span className="text-purple-400">+{Math.floor(Math.random() * 10)}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const ListsTab = () => (
    <div className="space-y-4">
      {creatorLists.map((list) => {
        const listAnalytics = analytics.get(list.id)
        return (
          <Card
            key={list.id}
            className="bg-black/40 backdrop-blur-xl border-purple-500/20 hover:border-purple-400/40 transition-all duration-200"
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <CardTitle className="text-white text-lg">{list.name}</CardTitle>
                    <Badge
                      variant={list.status === "active" ? "default" : "secondary"}
                      className={
                        list.status === "active"
                          ? "bg-green-500/20 text-green-300 border-green-500/50"
                          : "bg-gray-500/20 text-gray-300 border-gray-500/50"
                      }
                    >
                      {list.status === "active" ? (
                        <CheckCircle className="w-3 h-3 mr-1" />
                      ) : (
                        <Pause className="w-3 h-3 mr-1" />
                      )}
                      {list.status}
                    </Badge>
                  </div>
                  <p className="text-gray-400 text-sm">{list.description}</p>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/leaderboard?list=${list.id}`)}
                    className="border-purple-500/50 text-purple-300 hover:bg-purple-500/20 bg-transparent"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleListStatus(list.id)}
                    className="border-blue-500/50 text-blue-300 hover:bg-blue-500/20 bg-transparent"
                  >
                    {list.status === "active" ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-yellow-500/50 text-yellow-300 hover:bg-yellow-500/20 bg-transparent"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteList(list.id)}
                    className="border-red-500/50 text-red-300 hover:bg-red-500/20 bg-transparent"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <div className="grid md:grid-cols-4 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-white">{listAnalytics?.totalParticipants || 0}</div>
                  <div className="text-xs text-gray-400">Participants</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-400">{listAnalytics?.completedActions || 0}</div>
                  <div className="text-xs text-gray-400">Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-yellow-400">{listAnalytics?.pendingActions || 0}</div>
                  <div className="text-xs text-gray-400">Pending</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-purple-400">
                    {listAnalytics?.conversionRate.toFixed(1) || 0}%
                  </div>
                  <div className="text-xs text-gray-400">Conversion</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Progress</span>
                  <span className="text-white">
                    {listAnalytics?.completedActions || 0} / {listAnalytics?.totalParticipants || 0}
                  </span>
                </div>
                <Progress value={listAnalytics?.conversionRate || 0} className="bg-gray-700 h-2" />
              </div>
            </CardContent>
          </Card>
        )
      })}

      {creatorLists.length === 0 && (
        <Card className="bg-black/40 backdrop-blur-xl border-purple-500/20">
          <CardContent className="p-12 text-center">
            <Zap className="w-16 h-16 mx-auto mb-4 text-gray-400 opacity-50" />
            <h3 className="text-xl font-semibold text-white mb-2">No Lists Created</h3>
            <p className="text-gray-400 mb-4">
              Start creating reward lists to engage your Farcaster community and distribute tokens or NFTs.
            </p>
            <Button
              onClick={() => router.push("/")}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              Create Your First List
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )

  const AnalyticsTab = () => {
    const selectedAnalytics = selectedList ? analytics.get(selectedList) : null
    const selectedListData = selectedList ? creatorLists.find((l) => l.id === selectedList) : null

    return (
      <div className="space-y-6">
        {/* List Selector */}
        <Card className="bg-black/40 backdrop-blur-xl border-purple-500/20">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-2">
              {creatorLists.map((list) => (
                <Button
                  key={list.id}
                  variant={selectedList === list.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedList(list.id)}
                  className={
                    selectedList === list.id
                      ? "bg-purple-600 text-white"
                      : "border-purple-500/50 text-purple-300 hover:bg-purple-500/20 bg-transparent"
                  }
                >
                  {list.name}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {selectedAnalytics && selectedListData ? (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Detailed Stats */}
            <Card className="bg-black/40 backdrop-blur-xl border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white">Detailed Analytics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-400">Total Participants</div>
                    <div className="text-xl font-bold text-white">{selectedAnalytics.totalParticipants}</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Completed Actions</div>
                    <div className="text-xl font-bold text-green-400">{selectedAnalytics.completedActions}</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Pending Actions</div>
                    <div className="text-xl font-bold text-yellow-400">{selectedAnalytics.pendingActions}</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Rewards Claimed</div>
                    <div className="text-xl font-bold text-purple-400">{selectedAnalytics.rewardsClaimed}</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Conversion Rate</span>
                    <span className="text-white">{selectedAnalytics.conversionRate.toFixed(1)}%</span>
                  </div>
                  <Progress value={selectedAnalytics.conversionRate} className="bg-gray-700 h-3" />
                </div>
              </CardContent>
            </Card>

            {/* Rewards Breakdown */}
            <Card className="bg-black/40 backdrop-blur-xl border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Gift className="w-5 h-5 text-purple-400" />
                  Rewards Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {selectedListData.rewards.map((reward, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-black/30 rounded-lg">
                      <div>
                        <div className="text-white font-medium">Position #{reward.position}</div>
                        <div className="text-gray-400 text-sm">
                          {reward.type === "token" ? `${reward.amount} ${reward.tokenSymbol}` : reward.nftName}
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-green-500/20 text-green-300 border-green-500/50">
                        {Math.random() > 0.5 ? "Claimed" : "Available"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card className="bg-black/40 backdrop-blur-xl border-purple-500/20">
            <CardContent className="p-12 text-center">
              <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-400 opacity-50" />
              <h3 className="text-xl font-semibold text-white mb-2">Select a List</h3>
              <p className="text-gray-400">Choose a list above to view detailed analytics and performance metrics.</p>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Creator Dashboard</h1>
            <p className="text-gray-400">Manage your reward lists and track performance</p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="border-purple-500/50 text-purple-300 hover:bg-purple-500/20 bg-transparent"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </Button>
            <Button
              onClick={() => router.push("/")}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              <Zap className="w-4 h-4 mr-2" />
              Create New List
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-black/40 border border-purple-500/20">
            <TabsTrigger value="overview" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              <BarChart3 className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="lists" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              <Zap className="w-4 h-4 mr-2" />
              My Lists
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              <TrendingUp className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <OverviewTab />
          </TabsContent>

          <TabsContent value="lists">
            <ListsTab />
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
