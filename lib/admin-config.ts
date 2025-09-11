"use client"

export interface AdminConfig {
  nftContractAddress: string
  tokenContractAddress: string
  treasuryWallet: string
  feePercentage: number
  maxRewardAmount: number
  allowedTokens: string[]
}

export class AdminConfigService {
  private static instance: AdminConfigService
  private config: AdminConfig | null = null

  static getInstance(): AdminConfigService {
    if (!AdminConfigService.instance) {
      AdminConfigService.instance = new AdminConfigService()
    }
    return AdminConfigService.instance
  }

  async getConfig(): Promise<AdminConfig> {
    if (!this.config) {
      try {
        const response = await fetch("/api/admin/config")
        if (response.ok) {
          this.config = await response.json()
        } else {
          throw new Error("Failed to load configuration")
        }
      } catch (error) {
        console.error("Failed to load admin config:", error)
        this.config = this.getEmptyConfig()
      }
    }
    return this.config
  }

  async updateConfig(config: Partial<AdminConfig>): Promise<void> {
    try {
      const response = await fetch("/api/admin/config", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(config),
      })

      if (response.ok) {
        this.config = { ...this.config!, ...config }
      } else {
        throw new Error("Failed to update config")
      }
    } catch (error) {
      console.error("Failed to update admin config:", error)
      throw error
    }
  }

  private getEmptyConfig(): AdminConfig {
    return {
      nftContractAddress: "",
      tokenContractAddress: "",
      treasuryWallet: "",
      feePercentage: 5, // 5% platform fee
      maxRewardAmount: 10000, // Maximum reward amount in USD
      allowedTokens: ["DEGEN", "BPLUS", "USDC", "ETH"],
    }
  }

  // Validate wallet address format
  isValidWalletAddress(address: string): boolean {
    return /^0x[a-fA-F0-9]{40}$/.test(address)
  }

  // Validate contract address format
  isValidContractAddress(address: string): boolean {
    return /^0x[a-fA-F0-9]{40}$/.test(address)
  }
}
