// List management and storage utilities
export interface RewardList {
  id: string
  name: string
  description: string
  creatorFid: string
  creatorWallet: string
  duration: number
  startDate: Date
  endDate: Date
  actions: ActionConfig[]
  rewards: RewardConfig[]
  isActive: boolean
  isPaid: boolean
  transactionHash?: string
  participants: string[] // FIDs of participants
  totalParticipants: number
  totalRewards: number
}

export interface ActionConfig {
  id: string
  type: "cast" | "recast" | "follow" | "like"
  description: string
  points: number
  targetUrl?: string
  targetUser?: string
}

export interface RewardConfig {
  position: number
  type: "token" | "nft"
  amount?: number
  tokenSymbol?: string
  nftUrl?: string
  nftName?: string
}

export interface ParticipantScore {
  fid: string
  username: string
  totalPoints: number
  completedActions: string[] // Action IDs
  pendingActions: string[] // Action IDs
  position: number
  rewards: RewardConfig[]
}

export class ListManagementService {
  private static instance: ListManagementService
  private lists: Map<string, RewardList> = new Map()
  private scores: Map<string, Map<string, ParticipantScore>> = new Map() // listId -> fid -> score

  static getInstance(): ListManagementService {
    if (!ListManagementService.instance) {
      ListManagementService.instance = new ListManagementService()
      // Initialize with demo data
      ListManagementService.instance.initializeDemoData()
    }
    return ListManagementService.instance
  }

  private initializeDemoData() {
    // Create demo lists and scores for testing
    const demoList1: RewardList = {
      id: "demo-list-1",
      name: "Farcaster Growth Challenge",
      description: "Help grow the Farcaster ecosystem by completing social actions",
      creatorFid: "999",
      creatorWallet: "0x1234567890123456789012345678901234567890",
      duration: 7,
      startDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      actions: [
        {
          id: "action-1",
          type: "cast",
          description: "Share your thoughts about Farcaster",
          points: 50,
        },
        {
          id: "action-2",
          type: "follow",
          description: "Follow @farcaster",
          points: 25,
          targetUser: "farcaster",
        },
        {
          id: "action-3",
          type: "recast",
          description: "Recast the announcement",
          points: 30,
          targetUrl: "https://warpcast.com/farcaster/0x12345",
        },
      ],
      rewards: [
        { position: 1, type: "token", amount: 1000, tokenSymbol: "CAST" },
        { position: 2, type: "token", amount: 500, tokenSymbol: "CAST" },
        { position: 3, type: "nft", nftName: "Bronze Badge", nftUrl: "https://example.com/nft/bronze" },
      ],
      isActive: true,
      isPaid: true,
      participants: ["12345", "user1", "user2", "user3", "user4", "user5"],
      totalParticipants: 6,
      totalRewards: 3,
    }

    const demoList2: RewardList = {
      id: "demo-list-2",
      name: "Web3 Builders Unite",
      description: "Connect with other Web3 builders and share your projects",
      creatorFid: "888",
      creatorWallet: "0x9876543210987654321098765432109876543210",
      duration: 3,
      startDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      actions: [
        {
          id: "action-4",
          type: "cast",
          description: "Share your latest Web3 project",
          points: 75,
        },
        {
          id: "action-5",
          type: "like",
          description: "Like the featured project",
          points: 15,
          targetUrl: "https://warpcast.com/builder/0x67890",
        },
      ],
      rewards: [
        { position: 1, type: "token", amount: 2000, tokenSymbol: "BUILD" },
        { position: 2, type: "token", amount: 1000, tokenSymbol: "BUILD" },
      ],
      isActive: true,
      isPaid: true,
      participants: ["12345", "user1", "user2", "user3"],
      totalParticipants: 4,
      totalRewards: 2,
    }

    this.lists.set(demoList1.id, demoList1)
    this.lists.set(demoList2.id, demoList2)

    // Initialize demo scores
    const demoScores1 = new Map<string, ParticipantScore>()
    demoScores1.set("12345", {
      fid: "12345",
      username: "cryptouser",
      totalPoints: 85,
      completedActions: ["action-1", "action-2"],
      pendingActions: ["action-3"],
      position: 2,
      rewards: [{ position: 2, type: "token", amount: 500, tokenSymbol: "CAST" }],
    })
    demoScores1.set("user1", {
      fid: "user1",
      username: "alice_crypto",
      totalPoints: 105,
      completedActions: ["action-1", "action-2", "action-3"],
      pendingActions: [],
      position: 1,
      rewards: [{ position: 1, type: "token", amount: 1000, tokenSymbol: "CAST" }],
    })
    demoScores1.set("user2", {
      fid: "user2",
      username: "bob_builder",
      totalPoints: 75,
      completedActions: ["action-1", "action-2"],
      pendingActions: [],
      position: 3,
      rewards: [{ position: 3, type: "nft", nftName: "Bronze Badge", nftUrl: "https://example.com/nft/bronze" }],
    })
    demoScores1.set("user3", {
      fid: "user3",
      username: "charlie_dev",
      totalPoints: 50,
      completedActions: ["action-1"],
      pendingActions: [],
      position: 4,
      rewards: [],
    })

    const demoScores2 = new Map<string, ParticipantScore>()
    demoScores2.set("12345", {
      fid: "12345",
      username: "cryptouser",
      totalPoints: 90,
      completedActions: ["action-4", "action-5"],
      pendingActions: [],
      position: 1,
      rewards: [{ position: 1, type: "token", amount: 2000, tokenSymbol: "BUILD" }],
    })
    demoScores2.set("user1", {
      fid: "user1",
      username: "alice_crypto",
      totalPoints: 75,
      completedActions: ["action-4"],
      pendingActions: [],
      position: 2,
      rewards: [{ position: 2, type: "token", amount: 1000, tokenSymbol: "BUILD" }],
    })

    this.scores.set(demoList1.id, demoScores1)
    this.scores.set(demoList2.id, demoScores2)
  }

  async createList(
    name: string,
    description: string,
    duration: number,
    actions: ActionConfig[],
    rewards: RewardConfig[],
    creatorFid: string,
    creatorWallet: string,
    transactionHash: string,
  ): Promise<RewardList> {
    const listId = Math.random().toString(36).substr(2, 9)
    const startDate = new Date()
    const endDate = new Date(startDate.getTime() + duration * 24 * 60 * 60 * 1000)

    const newList: RewardList = {
      id: listId,
      name,
      description,
      creatorFid,
      creatorWallet,
      duration,
      startDate,
      endDate,
      actions,
      rewards,
      isActive: true,
      isPaid: true,
      transactionHash,
      participants: [],
      totalParticipants: 0,
      totalRewards: rewards.length,
    }

    this.lists.set(listId, newList)
    this.scores.set(listId, new Map())

    return newList
  }

  getActiveLists(): RewardList[] {
    const now = new Date()
    return Array.from(this.lists.values()).filter((list) => list.isActive && list.isPaid && list.endDate > now)
  }

  getListById(listId: string): RewardList | undefined {
    return this.lists.get(listId)
  }

  async joinList(listId: string, userFid: string, username: string): Promise<boolean> {
    const list = this.lists.get(listId)
    if (!list || !list.isActive) return false

    if (!list.participants.includes(userFid)) {
      list.participants.push(userFid)
      list.totalParticipants++
    }

    // Initialize user score
    const listScores = this.scores.get(listId) || new Map()
    if (!listScores.has(userFid)) {
      listScores.set(userFid, {
        fid: userFid,
        username,
        totalPoints: 0,
        completedActions: [],
        pendingActions: [],
        position: 0,
        rewards: [],
      })
      this.scores.set(listId, listScores)
    }

    return true
  }

  async updateUserScore(listId: string, userFid: string, actionId: string, points: number): Promise<void> {
    const listScores = this.scores.get(listId)
    if (!listScores) return

    const userScore = listScores.get(userFid)
    if (!userScore) return

    // Move from pending to completed
    userScore.pendingActions = userScore.pendingActions.filter((id) => id !== actionId)
    if (!userScore.completedActions.includes(actionId)) {
      userScore.completedActions.push(actionId)
      userScore.totalPoints += points
    }

    // Recalculate positions
    this.recalculatePositions(listId)
  }

  private recalculatePositions(listId: string): void {
    const listScores = this.scores.get(listId)
    if (!listScores) return

    const sortedScores = Array.from(listScores.values()).sort((a, b) => b.totalPoints - a.totalPoints)

    sortedScores.forEach((score, index) => {
      score.position = index + 1

      // Assign rewards based on position
      const list = this.lists.get(listId)
      if (list) {
        score.rewards = list.rewards.filter((reward) => reward.position === score.position)
      }
    })
  }

  getLeaderboard(listId: string, limit = 10): ParticipantScore[] {
    const listScores = this.scores.get(listId)
    if (!listScores) return []

    return Array.from(listScores.values())
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .slice(0, limit)
  }

  getUserScore(listId: string, userFid: string): ParticipantScore | undefined {
    const listScores = this.scores.get(listId)
    return listScores?.get(userFid)
  }

  getGlobalLeaderboard(
    limit = 10,
  ): Array<{ fid: string; username: string; totalPoints: number; listsParticipated: number }> {
    const globalScores = new Map<
      string,
      { fid: string; username: string; totalPoints: number; listsParticipated: number }
    >()

    // Aggregate scores across all lists
    this.scores.forEach((listScores) => {
      listScores.forEach((userScore) => {
        const existing = globalScores.get(userScore.fid)
        if (existing) {
          existing.totalPoints += userScore.totalPoints
          existing.listsParticipated++
        } else {
          globalScores.set(userScore.fid, {
            fid: userScore.fid,
            username: userScore.username,
            totalPoints: userScore.totalPoints,
            listsParticipated: 1,
          })
        }
      })
    })

    return Array.from(globalScores.values())
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .slice(0, limit)
  }
}
