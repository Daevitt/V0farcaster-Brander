"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import {
  Search,
  TrendingUp,
  Clock,
  Users,
  Trophy,
  Zap,
  Star,
  DollarSign,
  Gift,
  ExternalLink,
  Heart,
  MessageCircle,
  Repeat,
  UserPlus,
} from "lucide-react"
import { ListManagementService, type RewardList } from "@/lib/list-management"
import { useRouter } from "next/navigation"

interface PublicFeedProps {
  currentUserFid?: string
}

interface ListStats {
  totalRewardValue: number
  participantCount: number
  completionRate: number
  timeRemaining: string
}

export function PublicFeed({ currentUserFid }: PublicFeedProps) {
  const [lists, setLists] = useState<RewardList[]>([])
  const [filteredLists, setFilteredLists] = useState<RewardList[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<"all" | "trending" | "new" | "ending">("all")
  const [listStats, setListStats] = useState<Map<string, ListStats>>(new Map())

  const router = useRouter()
  const listService = ListManagementService.getInstance()

  useEffect(() => {
    loadPublicFeed()
    const interval = setInterval(loadPublicFeed, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    filterLists()
  }, [lists, searchQuery, selectedCategory])

  const loadPublicFeed = () => {
    const activeLists = listService.getActiveLists()
    setLists(activeLists)

    // Calculate stats for each list
    const stats = new Map<string, ListStats>()
    activeLists.forEach((list) => {
      const totalRewardValue = list.rewards.reduce((sum, reward) => {
        if (reward.type === "token" && reward.amount) {
          return sum + reward.amount
        }
        return sum + 100 // Estimated NFT value
      }, 0)

      const timeRemaining = getTimeRemaining(list.endDate)
      const completionRate = Math.random() * 100 // Mock completion rate

      stats.set(list.id, {
        totalRewardValue,
        participantCount: list.totalParticipants,
        completionRate,
        timeRemaining,
      })
    })
    setListStats(stats)
  }

  const filterLists = () => {
    let filtered = [...lists]

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (list) =>
          list.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          list.description.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Apply category filter
    switch (selectedCategory) {
      case "trending":
        filtered = filtered.sort((a, b) => {
          const aStats = listStats.get(a.id)
          const bStats = listStats.get(b.id)
          return (bStats?.participantCount || 0) - (aStats?.participantCount || 0)
        })
        break
      case "new":
        filtered = filtered.sort((a, b) => b.startDate.getTime() - a.startDate.getTime())
        break
      case "ending":
        filtered = filtered.sort((a, b) => a.endDate.getTime() - b.endDate.getTime())
        break
      default:
        // Keep original order for "all"
        break
    }

    setFilteredLists(filtered)
  }

  const getTimeRemaining = (endDate: Date): string => {
    const now = new Date()
    const diff = endDate.getTime() - now.getTime()

    if (diff <= 0) return "Ended"

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

    if (days > 0) return `${days}d ${hours}h`
    return `${hours}h`
  }

  const getActionIcon = (type: string) => {
    switch (type) {
      case "cast":
        return <MessageCircle className="w-3 h-3" />
      case "recast":
        return <Repeat className="w-3 h-3" />
      case "follow":
        return <UserPlus className="w-3 h-3" />
      case "like":
        return <Heart className="w-3 h-3" />
      default:
        return <Zap className="w-3 h-3" />
    }
  }

  const joinList = (listId: string) => {
    if (currentUserFid) {
      listService.joinList(listId, currentUserFid, "user")
      router.push(`/actions`)
    } else {
      router.push("/") // Redirect to login
    }
  }

  const ListCard = ({ list }: { list: RewardList }) => {
    const stats = listStats.get(list.id)
    const progress = stats ? (stats.participantCount / (stats.participantCount + 50)) * 100 : 0 // Mock progress

    return (
      <Card className="bg-black/40 backdrop-blur-xl border-purple-500/20 hover:border-purple-400/40 transition-all duration-200 group">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <CardTitle className="text-white text-lg group-hover:text-purple-300 transition-colors">
                  {list.name}
                </CardTitle>
                {stats && stats.participantCount > 100 && (
                  <Badge variant="secondary" className="bg-orange-500/20 text-orange-300 border-orange-500/50">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Hot
                  </Badge>
                )}
              </div>
              <p className="text-gray-400 text-sm line-clamp-2">{list.description}</p>
            </div>

            <Avatar className="w-10 h-10 border-2 border-purple-400/50 ml-3">
              <AvatarImage
                src={`/creator-.jpg?key=creator-${list.creatorFid}&height=40&width=40&query=creator-avatar`}
              />
              <AvatarFallback className="bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs">
                {list.creatorFid.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Actions Preview */}
          <div className="flex flex-wrap gap-1">
            {list.actions.slice(0, 4).map((action) => (
              <Badge
                key={action.id}
                variant="secondary"
                className="bg-blue-500/20 text-blue-300 border-blue-500/50 text-xs"
              >
                {getActionIcon(action.type)}
                <span className="ml-1 capitalize">{action.type}</span>
              </Badge>
            ))}
            {list.actions.length > 4 && (
              <Badge variant="secondary" className="bg-gray-500/20 text-gray-300 text-xs">
                +{list.actions.length - 4} more
              </Badge>
            )}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-400" />
              <span className="text-gray-400">Participants:</span>
              <span className="text-white font-medium">{stats?.participantCount || 0}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-yellow-400" />
              <span className="text-gray-400">Ends:</span>
              <span className="text-white font-medium">{stats?.timeRemaining || "—"}</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-400" />
              <span className="text-gray-400">Rewards:</span>
              <span className="text-white font-medium">${stats?.totalRewardValue || 0}</span>
            </div>
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-purple-400" />
              <span className="text-gray-400">Actions:</span>
              <span className="text-white font-medium">{list.actions.length}</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Activity</span>
              <span className="text-white">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="bg-gray-700 h-2" />
          </div>

          {/* Rewards Preview */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-white flex items-center gap-2">
              <Gift className="w-4 h-4 text-purple-400" />
              Top Rewards
            </h4>
            <div className="space-y-1">
              {list.rewards.slice(0, 3).map((reward, index) => (
                <div key={index} className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">#{reward.position}</span>
                  <span className="text-white">
                    {reward.type === "token" ? `${reward.amount} ${reward.tokenSymbol}` : reward.nftName}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              onClick={() => joinList(list.id)}
              className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              <Zap className="w-4 h-4 mr-2" />
              Join Challenge
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/leaderboard?list=${list.id}`)}
              className="border-purple-500/50 text-purple-300 hover:bg-purple-500/20 bg-transparent"
            >
              <Trophy className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-purple-500/50 text-purple-300 hover:bg-purple-500/20 bg-transparent"
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-black/40 backdrop-blur-xl border-purple-500/20">
          <CardContent className="p-4 text-center">
            <Zap className="w-6 h-6 mx-auto mb-2 text-purple-400" />
            <div className="text-xl font-bold text-white">{lists.length}</div>
            <div className="text-xs text-gray-400">Active Lists</div>
          </CardContent>
        </Card>

        <Card className="bg-black/40 backdrop-blur-xl border-purple-500/20">
          <CardContent className="p-4 text-center">
            <Users className="w-6 h-6 mx-auto mb-2 text-blue-400" />
            <div className="text-xl font-bold text-white">
              {Array.from(listStats.values()).reduce((sum, stats) => sum + stats.participantCount, 0)}
            </div>
            <div className="text-xs text-gray-400">Total Participants</div>
          </CardContent>
        </Card>

        <Card className="bg-black/40 backdrop-blur-xl border-purple-500/20">
          <CardContent className="p-4 text-center">
            <DollarSign className="w-6 h-6 mx-auto mb-2 text-green-400" />
            <div className="text-xl font-bold text-white">
              $
              {Array.from(listStats.values())
                .reduce((sum, stats) => sum + stats.totalRewardValue, 0)
                .toLocaleString()}
            </div>
            <div className="text-xs text-gray-400">Total Rewards</div>
          </CardContent>
        </Card>

        <Card className="bg-black/40 backdrop-blur-xl border-purple-500/20">
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-6 h-6 mx-auto mb-2 text-orange-400" />
            <div className="text-xl font-bold text-white">
              {lists.filter((list) => (listStats.get(list.id)?.participantCount || 0) > 50).length}
            </div>
            <div className="text-xs text-gray-400">Trending Lists</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="bg-black/40 backdrop-blur-xl border-purple-500/20">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search reward lists..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-black/50 border-purple-500/30 text-white placeholder:text-gray-400"
              />
            </div>

            <Tabs value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as any)}>
              <TabsList className="bg-black/40 border border-purple-500/20">
                <TabsTrigger value="all" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                  All
                </TabsTrigger>
                <TabsTrigger
                  value="trending"
                  className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
                >
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Trending
                </TabsTrigger>
                <TabsTrigger value="new" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                  <Star className="w-3 h-3 mr-1" />
                  New
                </TabsTrigger>
                <TabsTrigger
                  value="ending"
                  className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
                >
                  <Clock className="w-3 h-3 mr-1" />
                  Ending Soon
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* Lists Grid */}
      {filteredLists.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLists.map((list) => (
            <ListCard key={list.id} list={list} />
          ))}
        </div>
      ) : (
        <Card className="bg-black/40 backdrop-blur-xl border-purple-500/20">
          <CardContent className="p-12 text-center">
            <Search className="w-16 h-16 mx-auto mb-4 text-gray-400 opacity-50" />
            <h3 className="text-xl font-semibold text-white mb-2">No Lists Found</h3>
            <p className="text-gray-400">
              {searchQuery
                ? `No reward lists match "${searchQuery}". Try a different search term.`
                : "No active reward lists available at the moment."}
            </p>
            {searchQuery && (
              <Button
                variant="outline"
                onClick={() => setSearchQuery("")}
                className="mt-4 border-purple-500/50 text-purple-300 hover:bg-purple-500/20 bg-transparent"
              >
                Clear Search
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Load More Button */}
      {filteredLists.length > 0 && filteredLists.length >= 9 && (
        <div className="text-center">
          <Button
            variant="outline"
            className="border-purple-500/50 text-purple-300 hover:bg-purple-500/20 bg-transparent"
          >
            Load More Lists
          </Button>
        </div>
      )}
    </div>
  )
}
