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

    // Mock data - in real app this would come from API
    const mockTokenRewards: TokenReward[] = [
      {
        id: "token-1",
        tokenSymbol: "DEGEN",
        amount: 1000,
        usdValue: 25.5,
        status: "claimable",
        earnedFrom: "Social Media Challenge #1",
        earnedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        claimableAt: new Date(),
      },
      {
        id: "token-2",
        tokenSymbol: "BPLUS",
        amount: 500,
        usdValue: 12.75,
        status: "claimed",
        earnedFrom: "Weekly Leaderboard Winner",
        earnedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        txHash: "0x1234567890abcdef",
      },
      {
        id: "token-3",
        tokenSymbol: "DEGEN",
        amount: 750,
        usdValue: 19.13,
        status: "pending",
        earnedFrom: "Engagement Campaign #3",
        earnedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        claimableAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      },
    ]

    const mockNFTRewards: NFTReward[] = [
      {
        id: "nft-1",
        name: "Farcaster OG Badge",
        description: "Exclusive badge for early Farcaster adopters",
        imageUrl: "/farcaster-badge-nft.jpg",
        status: "claimable",
        earnedFrom: "Complete 10 Social Actions",
        earnedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        claimableAt: new Date(),
      },
      {
        id: "nft-2",
        name: "Social Butterfly Trophy",
        description: "Awarded for exceptional social engagement",
        imageUrl: "/trophy-butterfly-nft.jpg",
        status: "claimed",
        earnedFrom: "Monthly Top Performer",
        earnedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        tokenId: "42",
        contractAddress: "0xabcdef1234567890",
      },
    ]

    setTokenRewards(mockTokenRewards)
    setNFTRewards(mockNFTRewards)
    setIsLoading(false)
  }

  const claimReward = async (rewardId: string, type: "token" | "nft") => {
    setClaimingReward(rewardId)

    try {
      // Simulate claiming process
      await new Promise((resolve) => setTimeout(resolve, 2000))

      if (type === "token") {
        setTokenRewards((prev) =>
          prev.map((reward) =>
            reward.id === rewardId
              ? { ...reward, status: "claimed", txHash: "0x" + Math.random().toString(16).substr(2, 8) }
              : reward,
          ),
        )
      } else {
        setNFTRewards((prev) =>
          prev.map((reward) =>
            reward.id === rewardId
              ? {
                  ...reward,
                  status: "claimed",
                  tokenId: Math.floor(Math.random() * 1000).toString(),
                  contractAddress: "0x" + Math.random().toString(16).substr(2, 8),
                }
              : reward,
          ),
        )
      }
    } catch (error) {
      console.error("Failed to claim reward:", error)
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-black/40 backdrop-blur-xl border-purple-500/20">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <Coins className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-white">${totalTokenValue.toFixed(2)}</div>
            <div className="text-sm text-gray-400">Total Claimed</div>
          </CardContent>
        </Card>

        <Card className="bg-black/40 backdrop-blur-xl border-purple-500/20">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <Gift className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-white">${claimableTokenValue.toFixed(2)}</div>
            <div className="text-sm text-gray-400">Ready to Claim</div>
          </CardContent>
        </Card>

        <Card className="bg-black/40 backdrop-blur-xl border-purple-500/20">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-white">{nftRewards.length}</div>
            <div className="text-sm text-gray-400">NFTs Earned</div>
          </CardContent>
        </Card>

        <Card className="bg-black/40 backdrop-blur-xl border-purple-500/20">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <Star className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-white">{tokenRewards.length + nftRewards.length}</div>
            <div className="text-sm text-gray-400">Total Rewards</div>
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
        <CardContent className="space-y-4">
          {tokenRewards.map((reward) => (
            <div
              key={reward.id}
              className="flex items-center justify-between p-4 bg-black/30 rounded-lg border border-purple-500/10"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                  <Coins className="w-6 h-6 text-white" />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-white font-medium">
                      {reward.amount.toLocaleString()} {reward.tokenSymbol}
                    </h4>
                    <Badge variant="secondary" className={getStatusColor(reward.status)}>
                      {reward.status}
                    </Badge>
                  </div>
                  <p className="text-gray-400 text-sm">{reward.earnedFrom}</p>
                  <p className="text-green-400 text-sm">${reward.usdValue.toFixed(2)} USD</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {reward.status === "pending" && reward.claimableAt && (
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-yellow-400">
                      <Clock className="w-4 h-4" />
                      <span className="text-xs">Claimable {reward.claimableAt.toLocaleDateString()}</span>
                    </div>
                  </div>
                )}

                {reward.status === "claimed" && reward.txHash && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-blue-500/50 text-blue-300 hover:bg-blue-500/20 bg-transparent"
                    onClick={() => window.open(`https://etherscan.io/tx/${reward.txHash}`, "_blank")}
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    View TX
                  </Button>
                )}

                {reward.status === "claimable" && (
                  <Button
                    onClick={() => claimReward(reward.id, "token")}
                    disabled={claimingReward === reward.id}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  >
                    {claimingReward === reward.id ? (
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Claiming...
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <Wallet className="w-3 h-3" />
                        Claim
                      </div>
                    )}
                  </Button>
                )}

                {reward.status === "claimed" && (
                  <div className="flex items-center gap-1 text-green-400">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm">Claimed</span>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

                <CardContent className="p-4">
                  <h4 className="text-white font-medium mb-1">{nft.name}</h4>
                  <p className="text-gray-400 text-sm mb-2">{nft.description}</p>
                  <p className="text-purple-400 text-xs mb-3">{nft.earnedFrom}</p>

                  <Separator className="bg-purple-500/20 mb-3" />

                  <div className="flex justify-between items-center">
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
                      <div className="w-full space-y-2">
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
                      <div className="w-full text-center">
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
