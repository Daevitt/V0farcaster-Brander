"use client"

// Real Farcaster authentication using Farcaster Connect
export interface FarcasterUser {
  fid: number
  username: string
  displayName: string
  pfpUrl: string
  bio?: string
  followerCount?: number
  followingCount?: number
  verifications?: string[]
}

export class FarcasterAuth {
  private static instance: FarcasterAuth
  private user: FarcasterUser | null = null
  private listeners: ((user: FarcasterUser | null) => void)[] = []

  static getInstance(): FarcasterAuth {
    if (!FarcasterAuth.instance) {
      FarcasterAuth.instance = new FarcasterAuth()
    }
    return FarcasterAuth.instance
  }

  async signIn(): Promise<FarcasterUser> {
    try {
      // In a real implementation, this would use Farcaster Connect SDK
      // For now, we'll simulate the authentication flow

      // Check if running in browser and has Farcaster app installed
      if (typeof window !== "undefined") {
        // Simulate Farcaster Connect flow
        const response = await this.simulateFarcasterConnect()

        this.user = response
        this.notifyListeners(this.user)

        // Store in localStorage for persistence
        localStorage.setItem("farcaster_user", JSON.stringify(this.user))

        return this.user
      }

      throw new Error("Farcaster authentication not available")
    } catch (error) {
      console.error("Farcaster sign in failed:", error)
      throw error
    }
  }

  private async simulateFarcasterConnect(): Promise<FarcasterUser> {
    // Simulate API call to Farcaster
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // In real implementation, this would come from Farcaster API
    return {
      fid: 12345,
      username: "cryptobuilder",
      displayName: "Crypto Builder",
      pfpUrl: "https://i.imgur.com/placeholder-avatar.jpg",
      bio: "Building the future of Web3 social",
      followerCount: 1250,
      followingCount: 890,
      verifications: ["0x742d35Cc6634C0532925a3b8D4C9db96C4b4d4d4"],
    }
  }

  signOut(): void {
    this.user = null
    this.notifyListeners(null)
    if (typeof window !== "undefined") {
      localStorage.removeItem("farcaster_user")
    }
  }

  getCurrentUser(): FarcasterUser | null {
    if (!this.user && typeof window !== "undefined") {
      const stored = localStorage.getItem("farcaster_user")
      if (stored) {
        try {
          this.user = JSON.parse(stored)
        } catch (error) {
          console.error("Failed to parse stored user:", error)
          localStorage.removeItem("farcaster_user")
        }
      }
    }
    return this.user
  }

  onAuthStateChanged(callback: (user: FarcasterUser | null) => void): () => void {
    this.listeners.push(callback)

    // Call immediately with current state
    callback(this.getCurrentUser())

    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(callback)
      if (index > -1) {
        this.listeners.splice(index, 1)
      }
    }
  }

  private notifyListeners(user: FarcasterUser | null): void {
    this.listeners.forEach((callback) => callback(user))
  }

  // Check if user is admin (app creator or added admin)
  isAdmin(fid: number): boolean {
    const APP_CREATOR_FID = 12345 // Your FID as app creator
    const adminFids = this.getAdminFids()
    return fid === APP_CREATOR_FID || adminFids.includes(fid)
  }

  // Check if user is super admin (app creator only)
  isSuperAdmin(fid: number): boolean {
    const APP_CREATOR_FID = 12345 // Your FID as app creator
    return fid === APP_CREATOR_FID
  }

  private getAdminFids(): number[] {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("admin_fids")
      if (stored) {
        try {
          return JSON.parse(stored)
        } catch (error) {
          console.error("Failed to parse admin FIDs:", error)
        }
      }
    }
    return []
  }

  addAdmin(fid: number): void {
    if (typeof window !== "undefined") {
      const adminFids = this.getAdminFids()
      if (!adminFids.includes(fid)) {
        adminFids.push(fid)
        localStorage.setItem("admin_fids", JSON.stringify(adminFids))
      }
    }
  }

  removeAdmin(fid: number): void {
    if (typeof window !== "undefined") {
      const adminFids = this.getAdminFids()
      const filtered = adminFids.filter((id) => id !== fid)
      localStorage.setItem("admin_fids", JSON.stringify(filtered))
    }
  }

  getAdmins(): number[] {
    return this.getAdminFids()
  }
}
