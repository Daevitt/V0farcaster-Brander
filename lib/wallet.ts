// Wallet connection utilities
export interface WalletConnection {
  address: string
  chainId: number
  isConnected: boolean
}

export class WalletService {
  private static instance: WalletService
  private connection: WalletConnection | null = null

  static getInstance(): WalletService {
    if (!WalletService.instance) {
      WalletService.instance = new WalletService()
    }
    return WalletService.instance
  }

  async connectWallet(): Promise<WalletConnection> {
    if (typeof window === "undefined" || !window.ethereum) {
      throw new Error("MetaMask not installed")
    }

    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      })

      const chainId = await window.ethereum.request({
        method: "eth_chainId",
      })

      this.connection = {
        address: accounts[0],
        chainId: Number.parseInt(chainId, 16),
        isConnected: true,
      }

      return this.connection
    } catch (error) {
      console.error("Wallet connection failed:", error)
      throw error
    }
  }

  getConnection(): WalletConnection | null {
    return this.connection
  }

  disconnect(): void {
    this.connection = null
  }

  async switchToChain(chainId: number): Promise<void> {
    if (!window.ethereum) return

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      })
    } catch (error) {
      console.error("Chain switch failed:", error)
      throw error
    }
  }
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    ethereum?: any
  }
}
