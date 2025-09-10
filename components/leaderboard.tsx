"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Trophy, Medal, Award, Crown, Star, TrendingUp, Users, Zap } from "lucide-react"
import { ListManagementService, type ParticipantScore, type RewardList } from "@/lib/list-management"

interface LeaderboardProps {
  currentUserFid: string
  selectedListId?: string
}

interface GlobalScore {
  fid: string
  username: string
  totalPoints: number
  listsParticipated: number
  position: number
}

export function Leaderboard({ currentUserFid, selectedListId }: LeaderboardProps) {
  const [activeLists, setActiveLists] = useState<RewardList[]>([])
  const [selectedList, setSelectedList] = useState<string>("")
  const [listLeaderboard, setListLeaderboard] = useState<ParticipantScore[]>([])
  const [globalLeaderboard, setGlobalLeaderboard] = useState<GlobalScore[]>([])
  const [currentUserPosition, setCurrentUserPosition] = useState<{
    list?: { position: number; points: number }
    global?: { position: number; points: number }
  }>({})

  const listService = ListManagementService.getInstance()

  useEffect(() => {
    loadLeaderboards()
    const interval = setInterval(loadLeaderboards, 10000) // Refresh every 10 seconds
    return () => clearInterval(interval)
  }, [selectedList, currentUserFid])

  useEffect(() => {
    if (selectedListId) {
      setSelectedList(selectedListId)
    } else if (activeLists.length > 0 && !selectedList) {
      setSelectedList(activeLists[0].id)
    }
  }, [selectedListId, activeLists, selectedList])

  const loadLeaderboards = () => {
    // Load active lists
    const lists = listService.getActiveLists()
    setActiveLists(lists)

    // Load list-specific leaderboard
    if (selectedList) {
      const leaderboard = listService.getLeaderboard(selectedList, 10)
      setListLeaderboard(leaderboard)

      // Find current user position in this list
      const userScore = listService.getUserScore(selectedList, currentUserFid)
      if (userScore) {
        setCurrentUserPosition((prev) => ({
          ...prev,
          list: { position: userScore.position, points: userScore.totalPoints },
        }))
      }
    }

    // Load global leaderboard
    const globalScores = listService.getGlobalLeaderboard(10)
    const globalWithPositions = globalScores.map((score, index) => ({
      ...score,
      position: index + 1,
    }))
    setGlobalLeaderboard(globalWithPositions)

    // Find current user position globally
    const allGlobalScores = listService.getGlobalLeaderboard(1000) // Get more to find user position
    const userGlobalIndex = allGlobalScores.findIndex((score) => score.fid === currentUserFid)
    if (userGlobalIndex !== -1) {
      setCurrentUserPosition((prev) => ({
        ...prev,
        global: {
          position: userGlobalIndex + 1,
          points: allGlobalScores[userGlobalIndex].totalPoints,
        },
      }))
    }
  }

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Crown className="w-5 h-5 text-yellow-400" />
      case 2:
        return <Trophy className="w-5 h-5 text-gray-300" />
      case 3:
        return <Medal className="w-5 h-5 text-amber-600" />
      default:
        return <Award className="w-5 h-5 text-purple-400" />
    }
  }

  const getRankBadgeColor = (position: number) => {
    switch (position) {
      case 1:
        return "bg-gradient-to-r from-yellow-500 to-yellow-600 text-white"
      case 2:
        return "bg-gradient-to-r from-gray-400 to-gray-500 text-white"
      case 3:
        return "bg-gradient-to-r from-amber-500 to-amber-600 text-white"
      default:
        return "bg-purple-500/20 text-purple-300 border-purple-500/50"
    }
  }

  const formatPoints = (points: number) => {
    if (points >= 1000000) return `${(points / 1000000).toFixed(1)}M`
    if (points >= 1000) return `${(points / 1000).toFixed(1)}K`
    return points.toString()
  }

  const LeaderboardEntry = ({
    position,
    fid,
    username,
    points,
    isCurrentUser = false,
    additionalInfo,
  }: {
    position: number
    fid: string
    username: string
    points: number
    isCurrentUser?: boolean
    additionalInfo?: string
  }) => (
    <div
      className={`flex items-center gap-4 p-4 rounded-lg transition-all duration-200 ${
        isCurrentUser
          ? "bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-400/50"
          : "bg-black/30 hover:bg-black/40"
      }`}
    >
      <div className="flex items-center gap-3">
        <Badge variant="secondary" className={getRankBadgeColor(position)}>
          #{position}
        </Badge>
        {getRankIcon(position)}
      </div>

      <Avatar className="w-10 h-10 border-2 border-purple-400/50">
        <AvatarImage src={`/user-.jpg?height=40&width=40&query=user-${fid}`} />
        <AvatarFallback className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
          {username.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className={`font-medium ${isCurrentUser ? "text-purple-300" : "text-white"}`}>{username}</span>
          {isCurrentUser && (
            <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 text-xs">
              You
            </Badge>
          )}
        </div>
        {additionalInfo && <p className="text-xs text-gray-400">{additionalInfo}</p>}
      </div>

      <div className="text-right">
        <div className={`font-bold ${isCurrentUser ? "text-purple-300" : "text-white"}`}>{formatPoints(points)}</div>
        <div className="text-xs text-gray-400">points</div>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-black/40 backdrop-blur-xl border-purple-500/20">
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-6 h-6 mx-auto mb-2 text-green-400" />
            <div className="text-xl font-bold text-white">{currentUserPosition.global?.position || "—"}</div>
            <div className="text-xs text-gray-400">Global Rank</div>
          </CardContent>
        </Card>

        <Card className="bg-black/40 backdrop-blur-xl border-purple-500/20">
          <CardContent className="p-4 text-center">
            <Star className="w-6 h-6 mx-auto mb-2 text-yellow-400" />
            <div className="text-xl font-bold text-white">{formatPoints(currentUserPosition.global?.points || 0)}</div>
            <div className="text-xs text-gray-400">Total Points</div>
          </CardContent>
        </Card>

        <Card className="bg-black/40 backdrop-blur-xl border-purple-500/20">
          <CardContent className="p-4 text-center">
            <Trophy className="w-6 h-6 mx-auto mb-2 text-purple-400" />
            <div className="text-xl font-bold text-white">{currentUserPosition.list?.position || "—"}</div>
            <div className="text-xs text-gray-400">List Rank</div>
          </CardContent>
        </Card>

        <Card className="bg-black/40 backdrop-blur-xl border-purple-500/20">
          <CardContent className="p-4 text-center">
            <Users className="w-6 h-6 mx-auto mb-2 text-blue-400" />
            <div className="text-xl font-bold text-white">{activeLists.length}</div>
            <div className="text-xs text-gray-400">Active Lists</div>
          </CardContent>
        </Card>
      </div>

      {/* Leaderboard Tabs */}
      <Tabs defaultValue="global" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 bg-black/40 border border-purple-500/20">
          <TabsTrigger
            value="global"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white"
          >
            <Trophy className="w-4 h-4 mr-2" />
            Global Rankings
          </TabsTrigger>
          <TabsTrigger
            value="list"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white"
          >
            <Zap className="w-4 h-4 mr-2" />
            List Rankings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="global" className="space-y-4">
          <Card className="bg-black/40 backdrop-blur-xl border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                Global Leaderboard
              </CardTitle>
              <p className="text-gray-400 text-sm">Top performers across all reward lists</p>
            </CardHeader>

            <CardContent className="space-y-3">
              {globalLeaderboard.length > 0 ? (
                <>
                  {globalLeaderboard.slice(0, 10).map((entry) => (
                    <LeaderboardEntry
                      key={entry.fid}
                      position={entry.position}
                      fid={entry.fid}
                      username={entry.username}
                      points={entry.totalPoints}
                      isCurrentUser={entry.fid === currentUserFid}
                      additionalInfo={`${entry.listsParticipated} lists participated`}
                    />
                  ))}

                  {/* Current user position if not in top 10 */}
                  {currentUserPosition.global &&
                    currentUserPosition.global.position > 10 &&
                    !globalLeaderboard.some((entry) => entry.fid === currentUserFid) && (
                      <>
                        <Separator className="bg-purple-500/20" />
                        <div className="text-center text-gray-400 text-sm">...</div>
                        <LeaderboardEntry
                          position={currentUserPosition.global.position}
                          fid={currentUserFid}
                          username="You"
                          points={currentUserPosition.global.points}
                          isCurrentUser={true}
                        />
                      </>
                    )}
                </>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <Trophy className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No global rankings yet. Complete actions to appear on the leaderboard!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="list" className="space-y-4">
          {/* List Selector */}
          {activeLists.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {activeLists.map((list) => (
                <Button
                  key={list.id}
                  variant={selectedList === list.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedList(list.id)}
                  className={
                    selectedList === list.id
                      ? "bg-gradient-to-r from-purple-600 to-blue-600 whitespace-nowrap"
                      : "border-purple-500/50 text-purple-300 hover:bg-purple-500/20 bg-transparent whitespace-nowrap"
                  }
                >
                  {list.name}
                </Button>
              ))}
            </div>
          )}

          <Card className="bg-black/40 backdrop-blur-xl border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-purple-400" />
                {activeLists.find((l) => l.id === selectedList)?.name || "List Rankings"}
              </CardTitle>
              <p className="text-gray-400 text-sm">
                {activeLists.find((l) => l.id === selectedList)?.description ||
                  "Rankings for this specific reward list"}
              </p>
            </CardHeader>

            <CardContent className="space-y-3">
              {listLeaderboard.length > 0 ? (
                <>
                  {listLeaderboard.slice(0, 10).map((entry) => (
                    <LeaderboardEntry
                      key={entry.fid}
                      position={entry.position}
                      fid={entry.fid}
                      username={entry.username}
                      points={entry.totalPoints}
                      isCurrentUser={entry.fid === currentUserFid}
                      additionalInfo={`${entry.completedActions.length} actions completed`}
                    />
                  ))}

                  {/* Current user position if not in top 10 */}
                  {currentUserPosition.list &&
                    currentUserPosition.list.position > 10 &&
                    !listLeaderboard.some((entry) => entry.fid === currentUserFid) && (
                      <>
                        <Separator className="bg-purple-500/20" />
                        <div className="text-center text-gray-400 text-sm">...</div>
                        <LeaderboardEntry
                          position={currentUserPosition.list.position}
                          fid={currentUserFid}
                          username="You"
                          points={currentUserPosition.list.points}
                          isCurrentUser={true}
                        />
                      </>
                    )}
                </>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <Zap className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No participants yet. Be the first to join this list!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
