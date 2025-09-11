"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart3, Users, Trophy, DollarSign, Zap, Settings, Save, AlertTriangle } from "lucide-react"
import { ListManagementService, type RewardList } from "@/lib/list-management"
import { AdminConfigService, type AdminConfig } from "@/lib/admin-config"
import { FarcasterAuth, type FarcasterUser } from "@/lib/farcaster-auth"
import { useRouter } from "next/navigation"

export default function AdminDashboard() {
  const [user, setUser] = useState<FarcasterUser | null>(null)
  const [creatorLists, setCreatorLists] = useState<RewardList[]>([])
  const [adminConfig, setAdminConfig] = useState<AdminConfig | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [configError, setConfigError] = useState<string | null>(null)

  const router = useRouter()
  const farcasterAuth = FarcasterAuth.getInstance()
  const listService = ListManagementService.getInstance()
  const configService = AdminConfigService.getInstance()

  useEffect(() => {
    const currentUser = farcasterAuth.getCurrentUser()
    if (!currentUser) {
      router.push("/")
      return
    }

    if (!farcasterAuth.isAdmin(currentUser.fid)) {
      router.push("/")
      return
    }

    setUser(currentUser)
    loadAdminData()
  }, [router, farcasterAuth])

  const loadAdminData = async () => {
    setIsLoading(true)
    setConfigError(null)
    try {
      const config = await configService.getConfig()
      setAdminConfig(config)

      if (user) {
        const lists = listService.getListsByCreator(user.fid.toString())
        setCreatorLists(lists)
      }
    } catch (error) {
      console.error("Failed to load admin data:", error)
      setConfigError("Failed to load configuration. Please check your server setup.")
    } finally {
      setIsLoading(false)
    }
  }

  const updateConfig = async (updates: Partial<AdminConfig>) => {
    if (!adminConfig) return

    setIsSaving(true)
    setConfigError(null)
    try {
      await configService.updateConfig(updates)
      setAdminConfig({ ...adminConfig, ...updates })
      alert("Configuration updated successfully!")
    } catch (error) {
      console.error("Failed to update config:", error)
      setConfigError("Failed to update configuration. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  const toggleListStatus = (listId: string) => {
    const list = creatorLists.find((l) => l.id === listId)
    if (list) {
      listService.updateListStatus(listId, list.status === "active" ? "paused" : "active")
      loadAdminData()
    }
  }

  const deleteList = (listId: string) => {
    if (confirm("Are you sure you want to delete this list? This action cannot be undone.")) {
      listService.deleteList(listId)
      loadAdminData()
    }
  }

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  const ConfigTab = () => (
    <div className="space-y-6">
      {configError && (
        <Card className="bg-red-500/10 border-red-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-400">
              <AlertTriangle className="w-5 h-5" />
              <span className="font-medium">Configuration Error</span>
            </div>
            <p className="text-red-300 text-sm mt-2">{configError}</p>
            <div className="mt-3 text-xs text-red-200">
              <p>To fix this, you need to:</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Set up environment variables in Project Settings</li>
                <li>Implement database storage for configuration</li>
                <li>Add proper authentication to API routes</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-black/40 backdrop-blur-xl border-purple-500/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-purple-400" />
            Contract Configuration
          </CardTitle>
          <p className="text-gray-400 text-sm">
            Configure blockchain contracts and platform settings. These values are stored securely on the server.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {adminConfig ? (
            <>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nftContract" className="text-gray-300">
                    NFT Contract Address
                  </Label>
                  <Input
                    id="nftContract"
                    value={adminConfig.nftContractAddress}
                    onChange={(e) => setAdminConfig({ ...adminConfig, nftContractAddress: e.target.value })}
                    placeholder="0x..."
                    className="bg-black/30 border-purple-500/30 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tokenContract" className="text-gray-300">
                    Token Contract Address
                  </Label>
                  <Input
                    id="tokenContract"
                    value={adminConfig.tokenContractAddress}
                    onChange={(e) => setAdminConfig({ ...adminConfig, tokenContractAddress: e.target.value })}
                    placeholder="0x..."
                    className="bg-black/30 border-purple-500/30 text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="treasuryWallet" className="text-gray-300">
                  Treasury Wallet Address
                </Label>
                <Input
                  id="treasuryWallet"
                  value={adminConfig.treasuryWallet}
                  onChange={(e) => setAdminConfig({ ...adminConfig, treasuryWallet: e.target.value })}
                  placeholder="0x..."
                  className="bg-black/30 border-purple-500/30 text-white"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="feePercentage" className="text-gray-300">
                    Platform Fee (%)
                  </Label>
                  <Input
                    id="feePercentage"
                    type="number"
                    min="0"
                    max="100"
                    value={adminConfig.feePercentage}
                    onChange={(e) =>
                      setAdminConfig({ ...adminConfig, feePercentage: Number.parseFloat(e.target.value) || 0 })
                    }
                    className="bg-black/30 border-purple-500/30 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxReward" className="text-gray-300">
                    Max Reward Amount (USD)
                  </Label>
                  <Input
                    id="maxReward"
                    type="number"
                    min="0"
                    value={adminConfig.maxRewardAmount}
                    onChange={(e) =>
                      setAdminConfig({ ...adminConfig, maxRewardAmount: Number.parseFloat(e.target.value) || 0 })
                    }
                    className="bg-black/30 border-purple-500/30 text-white"
                  />
                </div>
              </div>

              <Button
                onClick={() => updateConfig(adminConfig)}
                disabled={isSaving}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                {isSaving ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Saving...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    Save Configuration
                  </div>
                )}
              </Button>
            </>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <Settings className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Configuration not available. Please check your server setup.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-black/40 backdrop-blur-xl border-blue-500/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-blue-400" />
            Production Setup Required
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-gray-300">
          <p>To deploy this app in production, you need to:</p>
          <ul className="list-disc list-inside space-y-2">
            <li>
              Set environment variables in Project Settings:
              <ul className="list-disc list-inside ml-4 mt-1 text-xs text-gray-400">
                <li>NFT_CONTRACT_ADDRESS</li>
                <li>TOKEN_CONTRACT_ADDRESS</li>
                <li>TREASURY_WALLET</li>
                <li>PLATFORM_FEE_PERCENTAGE</li>
                <li>MAX_REWARD_AMOUNT</li>
                <li>ALLOWED_TOKENS</li>
              </ul>
            </li>
            <li>Integrate real Farcaster authentication (@farcaster/auth-kit)</li>
            <li>Set up database for storing configuration and user data</li>
            <li>Implement blockchain integration for token/NFT distribution</li>
            <li>Add proper authentication middleware to API routes</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
            <p className="text-gray-400">Manage your reward lists and platform configuration</p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => router.push("/")}
              variant="outline"
              className="border-purple-500/50 text-purple-300 hover:bg-purple-500/20 bg-transparent"
            >
              Back to App
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-black/40 border border-purple-500/20">
            <TabsTrigger value="overview" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              <BarChart3 className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="lists" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              <Zap className="w-4 h-4 mr-2" />
              My Lists
            </TabsTrigger>
            <TabsTrigger value="config" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              <Settings className="w-4 h-4 mr-2" />
              Configuration
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-black/40 backdrop-blur-xl border-purple-500/20">
                <CardContent className="p-4 text-center">
                  <Zap className="w-6 h-6 mx-auto mb-2 text-purple-400" />
                  <div className="text-xl font-bold text-white">{creatorLists.length}</div>
                  <div className="text-xs text-gray-400">My Lists</div>
                </CardContent>
              </Card>
              <Card className="bg-black/40 backdrop-blur-xl border-purple-500/20">
                <CardContent className="p-4 text-center">
                  <Users className="w-6 h-6 mx-auto mb-2 text-blue-400" />
                  <div className="text-xl font-bold text-white">0</div>
                  <div className="text-xs text-gray-400">Total Participants</div>
                </CardContent>
              </Card>
              <Card className="bg-black/40 backdrop-blur-xl border-purple-500/20">
                <CardContent className="p-4 text-center">
                  <Trophy className="w-6 h-6 mx-auto mb-2 text-yellow-400" />
                  <div className="text-xl font-bold text-white">0</div>
                  <div className="text-xs text-gray-400">Rewards Distributed</div>
                </CardContent>
              </Card>
              <Card className="bg-black/40 backdrop-blur-xl border-purple-500/20">
                <CardContent className="p-4 text-center">
                  <DollarSign className="w-6 h-6 mx-auto mb-2 text-green-400" />
                  <div className="text-xl font-bold text-white">$0</div>
                  <div className="text-xs text-gray-400">Total Value</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="lists">
            {creatorLists.length === 0 ? (
              <Card className="bg-black/40 backdrop-blur-xl border-purple-500/20">
                <CardContent className="p-12 text-center">
                  <Zap className="w-16 h-16 mx-auto mb-4 text-gray-400 opacity-50" />
                  <h3 className="text-xl font-semibold text-white mb-2">No Lists Created</h3>
                  <p className="text-gray-400 mb-4">Start creating reward lists to engage your Farcaster community.</p>
                  <Button
                    onClick={() => router.push("/")}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  >
                    Create Your First List
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <p>List management functionality will be available once you create lists.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="config">
            <ConfigTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
