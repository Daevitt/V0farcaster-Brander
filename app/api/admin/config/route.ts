import { type NextRequest, NextResponse } from "next/server"

interface AdminConfig {
  nftContractAddress: string
  tokenContractAddress: string
  treasuryWallet: string
  feePercentage: number
  maxRewardAmount: number
  allowedTokens: string[]
}

// In production, this would be stored in a database
// For now, we'll use environment variables on the server side only
function getServerConfig(): AdminConfig {
  return {
    nftContractAddress: process.env.NFT_CONTRACT_ADDRESS || "",
    tokenContractAddress: process.env.TOKEN_CONTRACT_ADDRESS || "",
    treasuryWallet: process.env.TREASURY_WALLET || "",
    feePercentage: Number.parseInt(process.env.PLATFORM_FEE_PERCENTAGE || "5"),
    maxRewardAmount: Number.parseInt(process.env.MAX_REWARD_AMOUNT || "10000"),
    allowedTokens: (process.env.ALLOWED_TOKENS || "DEGEN,BPLUS,USDC,ETH").split(","),
  }
}

export async function GET(request: NextRequest) {
  try {
    // In production, add authentication check here
    // const user = await authenticateUser(request)
    // if (!user || !isAdmin(user.fid)) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    // }

    const config = getServerConfig()
    return NextResponse.json(config)
  } catch (error) {
    console.error("Failed to get admin config:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    // In production, add authentication check here
    // const user = await authenticateUser(request)
    // if (!user || !isAdmin(user.fid)) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    // }

    const updates = await request.json()

    // Validate the updates
    if (updates.nftContractAddress && !/^0x[a-fA-F0-9]{40}$/.test(updates.nftContractAddress)) {
      return NextResponse.json({ error: "Invalid NFT contract address" }, { status: 400 })
    }

    if (updates.tokenContractAddress && !/^0x[a-fA-F0-9]{40}$/.test(updates.tokenContractAddress)) {
      return NextResponse.json({ error: "Invalid token contract address" }, { status: 400 })
    }

    if (updates.treasuryWallet && !/^0x[a-fA-F0-9]{40}$/.test(updates.treasuryWallet)) {
      return NextResponse.json({ error: "Invalid treasury wallet address" }, { status: 400 })
    }

    // In production, save to database instead of environment variables
    // await updateConfigInDatabase(updates)

    // For now, return success (changes won't persist without database)
    const currentConfig = getServerConfig()
    const updatedConfig = { ...currentConfig, ...updates }

    return NextResponse.json(updatedConfig)
  } catch (error) {
    console.error("Failed to update admin config:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
