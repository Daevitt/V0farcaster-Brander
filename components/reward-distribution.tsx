"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Coins, Trophy, Gift, ExternalLink, Download, Clock, CheckCircle, Wallet, Star } from "lucide-react"

interface RewardDistributionProps {
  userFid: string
  username: string
}

interface TokenReward {
  id: string
  tokenSymbol: string
  amount: number
  usdValue: number
  status: "pending" | "claimable" | "claimed"
  earnedFrom: string
  earnedAt: Date
  claimableAt?: Date
  txHash?: string
}

interface NFTReward {
  id: string
  name: string
  description: string
  imageUrl: string
  status: "pending" | "claimable" | "claimed"
  earnedFrom: string
  earnedAt: Date
  claimableAt?: Date
  tokenId?: string
  contractAddress?: string
}

export function RewardDistribution({ userFid, username }: RewardDistributionProps) {
  const [tokenRewards, setTokenRewards] = useState<TokenReward[]>([])
  const [nftRewards, setNFTRewards] = useState<NFTReward[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [claimingReward, setClaimingReward] = useState<string | null>(null)

  useEffect(() => {
    loadRewards()
  }, [userFid])

  const loadRewards = async () => {
    setIsLoading(true)

    try {
      // In production, fetch from your API endpoint
      const response = await fetch(`/api/rewards/${userFid}`)
      if (response.ok) {
        const data = await response.json()
        setTokenRewards(data.tokenRewards || [])
        setNFTRewards(data.nftRewards || [])
      } else {
        // No rewards found or API error
        setTokenRewards([])
        setNFTRewards([])
      }
    } catch (error) {
      console.error("Failed to load rewards:", error)
      setTokenRewards([])
      setNFTRewards([])
    } finally {
      setIsLoading(false)
    }
  }

  const claimReward = async (rewardId: string, type: "token" | "nft") => {
    setClaimingReward(rewardId)

    try {
      const response = await fetch(`/api/rewards/claim`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rewardId,
          type,
          userFid,
        }),
      })

      if (response.ok) {
        const result = await response.json()

        if (type === "token") {
          setTokenRewards((prev) =>
            prev.map((reward) =>
              reward.id === rewardId ? { ...reward, status: "claimed", txHash: result.txHash } : reward,
            ),
          )
        } else {
          setNFTRewards((prev) =>
            prev.map((reward) =>
              reward.id === rewardId
                ? {
                    ...reward,
                    status: "claimed",
                    tokenId: result.tokenId,
                    contractAddress: result.contractAddress,
                  }
                : reward,
            ),
          )
        }
      } else {
        throw new Error("Failed to claim reward")
      }
    } catch (error) {
      console.error("Failed to claim reward:", error)
      alert("Failed to claim reward. Please try again.")
    } finally {
      setClaimingReward(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "claimable":
        return "bg-green-500/20 text-green-300 border-green-500/50"
      case "claimed":
        return "bg-blue-500/20 text-blue-300 border-blue-500/50"
      case "pending":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/50"
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/50"
    }
  }

  const totalTokenValue = tokenRewards
    .filter((reward) => reward.status === "claimed")
    .reduce((sum, reward) => sum + reward.usdValue, 0)

  const claimableTokenValue = tokenRewards
    .filter((reward) => reward.status === "claimable")
    .reduce((sum, reward) => sum + reward.usdValue, 0)

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="bg-black/40 backdrop-blur-xl border-purple-500/20">
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-gray-600 rounded w-3/4"></div>
                  <div className="h-8 bg-gray-600 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-black/40 backdrop-blur-xl border-purple-500/20">
          <CardContent className="p-4 text-center">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-2">
              <Coins className="w-5 h-5 text-white" />
            </div>
            <div className="text-lg font-bold text-white">${totalTokenValue.toFixed(2)}</div>
            <div className="text-xs text-gray-400">Total Claimed</div>
          </CardContent>
        </Card>

        <Card className="bg-black/40 backdrop-blur-xl border-purple-500/20">
          <CardContent className="p-4 text-center">
            <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-2">
              <Gift className="w-5 h-5 text-white" />
            </div>
            <div className="text-lg font-bold text-white">${claimableTokenValue.toFixed(2)}</div>
            <div className="text-xs text-gray-400">Ready to Claim</div>
          </CardContent>
        </Card>

        <Card className="bg-black/40 backdrop-blur-xl border-purple-500/20">
          <CardContent className="p-4 text-center">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-2">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <div className="text-lg font-bold text-white">{nftRewards.length}</div>
            <div className="text-xs text-gray-400">NFTs Earned</div>
          </CardContent>
        </Card>

        <Card className="bg-black/40 backdrop-blur-xl border-purple-500/20">
          <CardContent className="p-4 text-center">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-2">
              <Star className="w-5 h-5 text-white" />
            </div>
            <div className="text-lg font-bold text-white">{tokenRewards.length + nftRewards.length}</div>
            <div className="text-xs text-gray-400">Total Rewards</div>
          </CardContent>
        </Card>
      </div>

      {/* Token Rewards */}
      <Card className="bg-black/40 backdrop-blur-xl border-purple-500/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Coins className="w-5 h-5 text-green-400" />
            Token Rewards
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {tokenRewards.map((reward) => (
            <div
              key={reward.id}
              className="flex items-center gap-3 p-3 bg-black/30 rounded-lg border border-purple-500/10"
            >
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Coins className="w-5 h-5 text-white" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-white font-medium text-sm">
                    {reward.amount.toLocaleString()} {reward.tokenSymbol}
                  </h4>
                  <Badge variant="secondary" className={getStatusColor(reward.status)}>
                    {reward.status}
                  </Badge>
                </div>
                <p className="text-gray-400 text-xs truncate">{reward.earnedFrom}</p>
                <p className="text-green-400 text-xs">${reward.usdValue.toFixed(2)} USD</p>
              </div>

              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                {reward.status === "pending" && reward.claimableAt && (
                  <div className="flex items-center gap-1 text-yellow-400">
                    <Clock className="w-3 h-3" />
                    <span className="text-xs hidden sm:inline">{reward.claimableAt.toLocaleDateString()}</span>
                  </div>
                )}

                {reward.status === "claimed" && reward.txHash && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-blue-500/50 text-blue-300 hover:bg-blue-500/20 bg-transparent text-xs px-2 py-1 h-auto"
                    onClick={() => window.open(`https://etherscan.io/tx/${reward.txHash}`, "_blank")}
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    <span className="hidden sm:inline">View TX</span>
                  </Button>
                )}

                {reward.status === "claimable" && (
                  <Button
                    onClick={() => claimReward(reward.id, "token")}
                    disabled={claimingReward === reward.id}
                    size="sm"
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-xs px-2 py-1 h-auto"
                  >
                    {claimingReward === reward.id ? (
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span className="hidden sm:inline">Claiming...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <Wallet className="w-3 h-3" />
                        <span className="hidden sm:inline">Claim</span>
                      </div>
                    )}
                  </Button>
                )}

                {reward.status === "claimed" && (
                  <div className="flex items-center gap-1 text-green-400">
                    <CheckCircle className="w-3 h-3" />
                    <span className="text-xs hidden sm:inline">Claimed</span>
                  </div>
                )}
              </div>
            </div>
          ))}

          {tokenRewards.length === 0 && (
            <div className="text-center py-8">
              <Coins className="w-16 h-16 mx-auto mb-4 text-gray-400 opacity-50" />
              <h3 className="text-lg font-semibold text-white mb-2">No Token Rewards Yet</h3>
              <p className="text-gray-400">Complete actions to start earning token rewards!</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* NFT Rewards */}
      <Card className="bg-black/40 backdrop-blur-xl border-purple-500/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-purple-400" />
            NFT Rewards
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {nftRewards.map((nft) => (
              <Card key={nft.id} className="bg-black/30 border-purple-500/10 overflow-hidden">
                <div className="aspect-square relative">
                  <img src={nft.imageUrl || "/placeholder.svg"} alt={nft.name} className="w-full h-full object-cover" />
                  <div className="absolute top-2 right-2">
                    <Badge variant="secondary" className={getStatusColor(nft.status)}>
                      {nft.status}
                    </Badge>
                  </div>
                </div>

                <CardContent className="p-3">
                  <h4 className="text-white font-medium mb-1 text-sm">{nft.name}</h4>
                  <p className="text-gray-400 text-xs mb-2 line-clamp-2">{nft.description}</p>
                  <p className="text-purple-400 text-xs mb-3">{nft.earnedFrom}</p>

                  <Separator className="bg-purple-500/20 mb-3" />

                  <div className="space-y-2">
                    {nft.status === "claimable" && (
                      <Button
                        onClick={() => claimReward(nft.id, "nft")}
                        disabled={claimingReward === nft.id}
                        size="sm"
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                      >
                        {claimingReward === nft.id ? (
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            Minting...
                          </div>
                        ) : (
                          <div className="flex items-center gap-1">
                            <Download className="w-3 h-3" />
                            Mint NFT
                          </div>
                        )}
                      </Button>
                    )}

                    {nft.status === "claimed" && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-center gap-1 text-green-400">
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-sm">Minted</span>
                        </div>
                        {nft.tokenId && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full border-blue-500/50 text-blue-300 hover:bg-blue-500/20 bg-transparent"
                            onClick={() =>
                              window.open(
                                `https://opensea.io/assets/ethereum/${nft.contractAddress}/${nft.tokenId}`,
                                "_blank",
                              )
                            }
                          >
                            <ExternalLink className="w-3 h-3 mr-1" />
                            View on OpenSea
                          </Button>
                        )}
                      </div>
                    )}

                    {nft.status === "pending" && (
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-yellow-400">
                          <Clock className="w-4 h-4" />
                          <span className="text-sm">Processing...</span>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {nftRewards.length === 0 && (
            <div className="text-center py-8">
              <Trophy className="w-16 h-16 mx-auto mb-4 text-gray-400 opacity-50" />
              <h3 className="text-lg font-semibold text-white mb-2">No NFT Rewards Yet</h3>
              <p className="text-gray-400">Complete special challenges to earn exclusive NFTs!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
