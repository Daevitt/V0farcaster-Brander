import { type NextRequest, NextResponse } from "next/server"

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

export async function GET(request: NextRequest, { params }: { params: { userFid: string } }) {
  try {
    const userFid = params.userFid

    // In production, fetch from database
    // const tokenRewards = await getTokenRewardsFromDB(userFid)
    // const nftRewards = await getNFTRewardsFromDB(userFid)

    // For now, return empty arrays (no mock data)
    const tokenRewards: TokenReward[] = []
    const nftRewards: NFTReward[] = []

    return NextResponse.json({
      tokenRewards,
      nftRewards,
    })
  } catch (error) {
    console.error("Failed to get user rewards:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
