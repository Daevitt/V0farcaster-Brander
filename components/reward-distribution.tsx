"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import {
  Gift,
  Coins,
  Trophy,
  Clock,
  CheckCircle,
  ExternalLink,
  Copy,
  Share2,
  Sparkles,
  DollarSign,
  ImageIcon,
} from "lucide-react"
import { ListManagementService, type RewardConfig } from "@/lib/list-management"

interface RewardDistributionProps {
  userFid: string
  username: string
}

interface PendingReward {
  id: string
  listId: string
  listName: string
  reward: RewardConfig
  position: number
  earnedAt: Date
  status: "pending" | "ready" | "claimed"
  transactionHash?: string
}

function RewardDistribution({ userFid, username }: RewardDistributionProps) {
  const [pendingRewards, setPendingRewards] = useState<PendingReward[]>([])
  const [claimedRewards, setClaimedRewards] = useState<PendingReward[]>([])
  const [totalValue, setTotalValue] = useState({ tokens: 0, nfts: 0 })
  const [isProcessingClaim, setIsProcessingClaim] = useState<Set<string>>(new Set())

  const listService = ListManagementService.getInstance()

  useEffect(() => {
    loadUserRewards()
    const interval = setInterval(loadUserRewards, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [userFid])

  const loadUserRewards = () => {
    const activeLists = listService.getActiveLists()
    const pending: PendingReward[] = []
    const claimed: PendingReward[] = []
    let tokenValue = 0
    let nftCount = 0

    activeLists.forEach((list) => {
      const userScore = listService.getUserScore(list.id, userFid)
      if (userScore && userScore.rewards.length > 0) {
        userScore.rewards.forEach((reward) => {
          const rewardItem: PendingReward = {
            id: `${list.id}-${reward.position}`,
            listId: list.id,
            listName: list.name,
            reward,
            position: userScore.position,
            earnedAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000), // Random time in last 24h
            status: Math.random() > 0.3 ? "ready" : "pending", // 70% ready for demo
          }

          if (Math.random() > 0.7) {
            // 30% already claimed for demo
            rewardItem.status = "claimed"
            rewardItem.transactionHash = "0x" + Math.random().toString(16).substr(2, 64)
            claimed.push(rewardItem)
          } else {
            pending.push(rewardItem)
          }

          // Calculate total value
          if (reward.type === "token" && reward.amount) {
            tokenValue += reward.amount
          } else if (reward.type === "nft") {
            nftCount++
          }
        })
      }
    })

    setPendingRewards(pending)
    setClaimedRewards(claimed)
    setTotalValue({ tokens: tokenValue, nfts: nftCount })
  }

  const claimReward = async (rewardId: string) => {
    setIsProcessingClaim((prev) => new Set([...prev, rewardId]))

    // Simulate claim processing
    await new Promise((resolve) => setTimeout(resolve, 3000))

    setPendingRewards((prev) =>
      prev.map((reward) =>
        reward.id === rewardId
          ? {
              ...reward,
              status: "claimed",
              transactionHash: "0x" + Math.random().toString(16).substr(2, 64),
            }
          : reward,
      ),
    )

    // Move to claimed rewards
    const claimedReward = pendingRewards.find((r) => r.id === rewardId)
    if (claimedReward) {
      setClaimedRewards((prev) => [
        ...prev,
        { ...claimedReward, status: "claimed", transactionHash: "0x" + Math.random().toString(16).substr(2, 64) },
      ])
      setPendingRewards((prev) => prev.filter((r) => r.id !== rewardId))
    }

    setIsProcessingClaim((prev) => {
      const newSet = new Set(prev)
      newSet.delete(rewardId)
      return newSet
    })

    // Show success notification
    showNotification("Reward claimed successfully!", "success")
  }

  const shareReward = (reward: PendingReward) => {
    const shareText = `Just earned ${
      reward.reward.type === "token"
        ? `${reward.reward.amount} ${reward.reward.tokenSymbol} tokens`
        : `${reward.reward.nftName} NFT`
    } by ranking #${reward.position} in "${reward.listName}" on Farcaster Rewards! 🏆`

    if (navigator.share) {
      navigator.share({
        title: "Farcaster Rewards Achievement",
        text: shareText,
        url: window.location.origin,
      })
    } else {
      navigator.clipboard.writeText(shareText)
      showNotification("Achievement copied to clipboard!", "success")
    }
  }

  const copyTransactionHash = (hash: string) => {
    navigator.clipboard.writeText(hash)
    showNotification("Transaction hash copied!", "success")
  }

  const showNotification = (message: string, type: "success" | "error" | "info") => {
    console.log(`[${type.toUpperCase()}] ${message}`)
  }

  const getRewardIcon = (reward: RewardConfig) => {
    return reward.type === "token" ? (
      <Coins className="w-6 h-6 text-yellow-400" />
    ) : (
      <ImageIcon className="w-6 h-6 text-purple-400" />
    )
  }

  const getStatusBadge = (status: PendingReward["status"]) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-300 border-yellow-500/50">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        )
      case "ready":
        return (
          <Badge variant="secondary" className="bg-green-500/20 text-green-300 border-green-500/50">
            <Gift className="w-3 h-3 mr-1" />
            Ready
          </Badge>
        )
      case "claimed":
        return (
          <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-500/50">
            <CheckCircle className="w-3 h-3 mr-1" />
            Claimed
          </Badge>
        )
    }
  }

  const RewardCard = ({ reward, showClaimButton = true }: { reward: PendingReward; showClaimButton?: boolean }) => (
    <Card className="bg-black/30 border-purple-500/20 hover:border-purple-400/40 transition-all duration-200">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
            {getRewardIcon(reward.reward)}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-white font-semibold">
                {reward.reward.type === "token"
                  ? `${reward.reward.amount} ${reward.reward.tokenSymbol}`
                  : reward.reward.nftName}
              </h3>
              {getStatusBadge(reward.status)}
            </div>

            <p className="text-gray-400 text-sm mb-2">{reward.listName}</p>

            <div className="flex items-center gap-4 text-xs text-gray-400 mb-3">
              <div className="flex items-center gap-1">
                <Trophy className="w-3 h-3" />
                Position #{reward.position}
              </div>
              <div>Earned {reward.earnedAt.toLocaleDateString()}</div>
            </div>

            {reward.reward.type === "nft" && reward.reward.nftUrl && (
              <div className="mb-3">
                <img
                  src={`/nft-.jpg?height=80&width=80&query=nft-${reward.reward.nftName}`}
                  alt={reward.reward.nftName}
                  className="w-20 h-20 rounded-lg border border-purple-500/30"
                />
              </div>
            )}

            {reward.transactionHash && (
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs text-gray-400">TX:</span>
                <code className="text-xs text-blue-400 font-mono">
                  {reward.transactionHash.slice(0, 10)}...{reward.transactionHash.slice(-8)}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyTransactionHash(reward.transactionHash!)}
                  className="p-1 h-auto text-gray-400 hover:text-white"
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            )}

            <div className="flex gap-2">
              {showClaimButton && reward.status === "ready" && (
                <Button
                  onClick={() => claimReward(reward.id)}
                  disabled={isProcessingClaim.has(reward.id)}
                  size="sm"
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                >
                  {isProcessingClaim.has(reward.id) ? (
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin"></div>
                      Claiming...
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <Gift className="w-3 h-3" />
                      Claim
                    </div>
                  )}
                </Button>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={() => shareReward(reward)}
                className="border-purple-500/50 text-purple-300 hover:bg-purple-500/20 bg-transparent"
              >
                <Share2 className="w-3 h-3 mr-1" />
                Share
              </Button>

              {reward.transactionHash && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(`https://etherscan.io/tx/${reward.transactionHash}`, "_blank")}
                  className="border-purple-500/50 text-purple-300 hover:bg-purple-500/20 bg-transparent"
                >
                  <ExternalLink className="w-3 h-3" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      {/* Stats Header */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-black/40 backdrop-blur-xl border-purple-500/20">
          <CardContent className="p-4 text-center">
            <Sparkles className="w-6 h-6 mx-auto mb-2 text-yellow-400" />
            <div className="text-xl font-bold text-white">{pendingRewards.length}</div>
            <div className="text-xs text-gray-400">Pending Rewards</div>
          </CardContent>
        </Card>

        <Card className="bg-black/40 backdrop-blur-xl border-purple-500/20">
          <CardContent className="p-4 text-center">
            <CheckCircle className="w-6 h-6 mx-auto mb-2 text-green-400" />
            <div className="text-xl font-bold text-white">{claimedRewards.length}</div>
            <div className="text-xs text-gray-400">Claimed Rewards</div>
          </CardContent>
        </Card>

        <Card className="bg-black/40 backdrop-blur-xl border-purple-500/20">
          <CardContent className="p-4 text-center">
            <DollarSign className="w-6 h-6 mx-auto mb-2 text-green-400" />
            <div className="text-xl font-bold text-white">{totalValue.tokens.toLocaleString()}</div>
            <div className="text-xs text-gray-400">Total Tokens</div>
          </CardContent>
        </Card>

        <Card className="bg-black/40 backdrop-blur-xl border-purple-500/20">
          <CardContent className="p-4 text-center">
            <ImageIcon className="w-6 h-6 mx-auto mb-2 text-purple-400" />
            <div className="text-xl font-bold text-white">{totalValue.nfts}</div>
            <div className="text-xs text-gray-400">Total NFTs</div>
          </CardContent>
        </Card>
      </div>

      {/* Rewards Tabs */}
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 bg-black/40 border border-purple-500/20">
          <TabsTrigger
            value="pending"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white"
          >
            <Gift className="w-4 h-4 mr-2" />
            Pending ({pendingRewards.length})
          </TabsTrigger>
          <TabsTrigger
            value="claimed"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Claimed ({claimedRewards.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingRewards.length > 0 ? (
            <>
              {/* Ready to Claim */}
              {pendingRewards.filter((r) => r.status === "ready").length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Gift className="w-5 h-5 text-green-400" />
                    Ready to Claim ({pendingRewards.filter((r) => r.status === "ready").length})
                  </h3>
                  {pendingRewards
                    .filter((r) => r.status === "ready")
                    .map((reward) => (
                      <RewardCard key={reward.id} reward={reward} />
                    ))}
                </div>
              )}

              {/* Pending Verification */}
              {pendingRewards.filter((r) => r.status === "pending").length > 0 && (
                <div className="space-y-3">
                  {pendingRewards.filter((r) => r.status === "ready").length > 0 && (
                    <Separator className="bg-purple-500/20" />
                  )}
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Clock className="w-5 h-5 text-yellow-400" />
                    Pending Verification ({pendingRewards.filter((r) => r.status === "pending").length})
                  </h3>
                  <p className="text-gray-400 text-sm">
                    These rewards are being verified. They will be available to claim once verification is complete.
                  </p>
                  {pendingRewards
                    .filter((r) => r.status === "pending")
                    .map((reward) => (
                      <RewardCard key={reward.id} reward={reward} showClaimButton={false} />
                    ))}
                </div>
              )}
            </>
          ) : (
            <Card className="bg-black/40 backdrop-blur-xl border-purple-500/20">
              <CardContent className="p-12 text-center">
                <Gift className="w-16 h-16 mx-auto mb-4 text-gray-400 opacity-50" />
                <h3 className="text-xl font-semibold text-white mb-2">No Pending Rewards</h3>
                <p className="text-gray-400">Complete actions and climb leaderboards to earn tokens and NFTs!</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="claimed" className="space-y-4">
          {claimedRewards.length > 0 ? (
            <div className="space-y-3">
              {claimedRewards.map((reward) => (
                <RewardCard key={reward.id} reward={reward} showClaimButton={false} />
              ))}
            </div>
          ) : (
            <Card className="bg-black/40 backdrop-blur-xl border-purple-500/20">
              <CardContent className="p-12 text-center">
                <CheckCircle className="w-16 h-16 mx-auto mb-4 text-gray-400 opacity-50" />
                <h3 className="text-xl font-semibold text-white mb-2">No Claimed Rewards Yet</h3>
                <p className="text-gray-400">Your claimed rewards will appear here once you start earning them.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Claim All Button */}
      {pendingRewards.filter((r) => r.status === "ready").length > 1 && (
        <Card className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-semibold">Claim All Ready Rewards</h3>
                <p className="text-gray-400 text-sm">
                  Claim {pendingRewards.filter((r) => r.status === "ready").length} rewards in one transaction
                </p>
              </div>
              <Button
                onClick={() => {
                  pendingRewards.filter((r) => r.status === "ready").forEach((reward) => claimReward(reward.id))
                }}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                <Gift className="w-4 h-4 mr-2" />
                Claim All
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export { RewardDistribution }
export default RewardDistribution
