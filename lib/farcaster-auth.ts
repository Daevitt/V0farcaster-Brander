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
      // In a real implementation, this would use @farcaster/auth-kit or similar
      if (typeof window !== "undefined") {
        // Check if Farcaster app is available
        if (!window.parent || window.parent === window) {
          throw new Error("This app must be opened within Farcaster")
        }

        // Real Farcaster authentication would happen here
        // For now, throw error to indicate real auth is needed
        throw new Error("Real Farcaster authentication not implemented. Please integrate @farcaster/auth-kit")
      }

      throw new Error("Farcaster authentication not available")
    } catch (error) {
      console.error("Farcaster sign in failed:", error)
      throw error
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
    callback(this.getCurrentUser())
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

  isAdmin(fid: number): boolean {
    // In production, this should check against a database or API
    const APP_CREATOR_FID = process.env.NEXT_PUBLIC_APP_CREATOR_FID
      ? Number.parseInt(process.env.NEXT_PUBLIC_APP_CREATOR_FID)
      : null
    const adminFids = this.getAdminFids()
    return (APP_CREATOR_FID && fid === APP_CREATOR_FID) || adminFids.includes(fid)
  }

  isSuperAdmin(fid: number): boolean {
    const APP_CREATOR_FID = process.env.NEXT_PUBLIC_APP_CREATOR_FID
      ? Number.parseInt(process.env.NEXT_PUBLIC_APP_CREATOR_FID)
      : null
    return APP_CREATOR_FID && fid === APP_CREATOR_FID
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
