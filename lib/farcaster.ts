// Farcaster authentication utilities
export interface FarcasterUser {
  fid: string
  username: string
  displayName: string
  pfpUrl: string
  walletAddress?: string
}

export class FarcasterAuth {
  private static instance: FarcasterAuth
  private user: FarcasterUser | null = null

  static getInstance(): FarcasterAuth {
    if (!FarcasterAuth.instance) {
      FarcasterAuth.instance = new FarcasterAuth()
    }
    return FarcasterAuth.instance
  }

  async authenticate(): Promise<FarcasterUser> {
    // This will integrate with Farcaster's authentication flow
    // For now, returning mock data
    const mockUser: FarcasterUser = {
      fid: Math.random().toString(36).substr(2, 9),
      username: "user" + Math.floor(Math.random() * 1000),
      displayName: "Farcaster User",
      pfpUrl: "/abstract-profile.png",
    }

    this.user = mockUser
    return mockUser
  }

  getCurrentUser(): FarcasterUser | null {
    return this.user
  }

  logout(): void {
    this.user = null
  }
}
