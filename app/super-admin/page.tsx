"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PageHeader } from "@/components/page-header"
import { FarcasterAuth, type FarcasterUser } from "@/lib/farcaster-auth"
import { ListManagementService, type RewardList } from "@/lib/list-management"
import {
  Shield,
  Users,
  Ban,
  CheckCircle,
  BarChart3,
  Settings,
  UserPlus,
  UserMinus,
  AlertTriangle,
  Eye,
  Trash2,
} from "lucide-react"
import { useRouter } from "next/navigation"

interface AppMetrics {
  totalUsers: number
  activeLists: number
  totalRewardsPaid: string
  nftsMinted: number
  lastUpdated: Date
}

export default function SuperAdminPage() {
  const router = useRouter()
  const [user, setUser] = useState<FarcasterUser | null>(null)
  const [allLists, setAllLists] = useState<RewardList[]>([])
  const [adminFids, setAdminFids] = useState<number[]>([])
  const [newAdminFid, setNewAdminFid] = useState("")
  const [metrics, setMetrics] = useState<AppMetrics>({
    totalUsers: 2400,
    activeLists: 127,
    totalRewardsPaid: "$12.5K",
    nftsMinted: 856,
    lastUpdated: new Date(),
  })

  const farcasterAuth = FarcasterAuth.getInstance()
  const listService = ListManagementService.getInstance()

  useEffect(() => {
    const currentUser = farcasterAuth.getCurrentUser()
    if (!currentUser || !farcasterAuth.isSuperAdmin(currentUser.fid)) {
      router.push("/")
      return
    }
    setUser(currentUser)
    loadData()
  }, [])

  const loadData = () => {
    // Load all lists across all creators
    const lists = listService.getAllLists()
    setAllLists(lists)

    // Load admin list
    const admins = farcasterAuth.getAdmins()
    setAdminFids(admins)
  }

  const cancelList = (listId: string, reason: string) => {
    if (confirm(`Cancel this list? Reason: ${reason}\n\nThis action cannot be undone and no refunds will be issued.`)) {
      listService.cancelList(listId, reason)
      loadData()
    }
  }

  const markActionComplete = (listId: string, userFid: string, actionType: string) => {
    if (confirm(`Mark ${actionType} action as complete for user ${userFid}?`)) {
      // In real implementation, this would update the action status
      console.log(`[v0] Marking action complete: ${actionType} for user ${userFid} in list ${listId}`)
    }
  }

  const addAdmin = () => {
    const fid = Number.parseInt(newAdminFid)
    if (fid && !adminFids.includes(fid)) {
      farcasterAuth.addAdmin(fid)
      setAdminFids([...adminFids, fid])
      setNewAdminFid("")
    }
  }

  const removeAdmin = (fid: number) => {
    if (confirm(`Remove admin privileges for FID ${fid}?`)) {
      farcasterAuth.removeAdmin(fid)
      setAdminFids(adminFids.filter((id) => id !== fid))
    }
  }

  const updateMetrics = () => {
    // Simulate metrics update
    setMetrics((prev) => ({
      ...prev,
      totalUsers: prev.totalUsers + Math.floor(Math.random() * 50),
      activeLists: allLists.filter((l) => l.status === "active").length,
      lastUpdated: new Date(),
    }))
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="absolute inset-0 bg-[url('/abstract-geometric-pattern.png')] opacity-10"></div>

      <PageHeader title="Super Admin Panel" description="Manage the entire Farcaster Rewards platform" />

      <main className="relative z-10 container mx-auto px-4 py-8 max-w-7xl">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-black/40 border border-purple-500/20">
            <TabsTrigger value="overview" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
              <BarChart3 className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="lists" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
              <Shield className="w-4 h-4 mr-2" />
              Manage Lists
            </TabsTrigger>
            <TabsTrigger value="admins" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
              <Users className="w-4 h-4 mr-2" />
              Admins
            </TabsTrigger>
            <TabsTrigger value="metrics" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
              <Settings className="w-4 h-4 mr-2" />
              Metrics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <Card className="bg-black/40 backdrop-blur-xl border-red-500/20">
                <CardContent className="p-4 text-center">
                  <Users className="w-6 h-6 mx-auto mb-2 text-blue-400" />
                  <div className="text-xl font-bold text-white">{metrics.totalUsers}</div>
                  <div className="text-xs text-gray-400">Total Users</div>
                </CardContent>
              </Card>

              <Card className="bg-black/40 backdrop-blur-xl border-red-500/20">
                <CardContent className="p-4 text-center">
                  <Shield className="w-6 h-6 mx-auto mb-2 text-green-400" />
                  <div className="text-xl font-bold text-white">{metrics.activeLists}</div>
                  <div className="text-xs text-gray-400">Active Lists</div>
                </CardContent>
              </Card>

              <Card className="bg-black/40 backdrop-blur-xl border-red-500/20">
                <CardContent className="p-4 text-center">
                  <BarChart3 className="w-6 h-6 mx-auto mb-2 text-purple-400" />
                  <div className="text-xl font-bold text-white">{metrics.totalRewardsPaid}</div>
                  <div className="text-xs text-gray-400">Rewards Paid</div>
                </CardContent>
              </Card>

              <Card className="bg-black/40 backdrop-blur-xl border-red-500/20">
                <CardContent className="p-4 text-center">
                  <CheckCircle className="w-6 h-6 mx-auto mb-2 text-yellow-400" />
                  <div className="text-xl font-bold text-white">{metrics.nftsMinted}</div>
                  <div className="text-xs text-gray-400">NFTs Minted</div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-black/40 backdrop-blur-xl border-red-500/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  Recent Admin Actions Required
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <div>
                      <div className="text-white font-medium">Reported List: "Spam Campaign"</div>
                      <div className="text-gray-400 text-sm">Multiple users reported inappropriate content</div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-red-500/50 text-red-300 hover:bg-red-500/20 bg-transparent"
                    >
                      Review
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                    <div>
                      <div className="text-white font-medium">Neynar API Error</div>
                      <div className="text-gray-400 text-sm">Action verification failed for 3 users</div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-yellow-500/50 text-yellow-300 hover:bg-yellow-500/20 bg-transparent"
                    >
                      Fix
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="lists">
            <div className="space-y-4">
              {allLists.map((list) => (
                <Card key={list.id} className="bg-black/40 backdrop-blur-xl border-red-500/20">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-white flex items-center gap-2">
                          {list.name}
                          <Badge variant={list.status === "active" ? "default" : "secondary"}>{list.status}</Badge>
                        </CardTitle>
                        <p className="text-gray-400 text-sm mt-1">{list.description}</p>
                        <p className="text-gray-500 text-xs mt-1">Creator FID: {list.creatorFid}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-blue-500/50 text-blue-300 hover:bg-blue-500/20 bg-transparent"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => cancelList(list.id, "Inappropriate content")}
                          className="border-red-500/50 text-red-300 hover:bg-red-500/20"
                        >
                          <Ban className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-500/50 text-red-300 hover:bg-red-500/20 bg-transparent"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-gray-400">Participants</div>
                        <div className="text-white font-medium">{list.totalParticipants}</div>
                      </div>
                      <div>
                        <div className="text-gray-400">Actions</div>
                        <div className="text-white font-medium">{list.actions.length}</div>
                      </div>
                      <div>
                        <div className="text-gray-400">Rewards</div>
                        <div className="text-white font-medium">{list.rewards.length}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="admins">
            <div className="space-y-6">
              <Card className="bg-black/40 backdrop-blur-xl border-red-500/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <UserPlus className="w-5 h-5 text-green-400" />
                    Add New Admin
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-3">
                    <Input
                      placeholder="Enter Farcaster FID"
                      value={newAdminFid}
                      onChange={(e) => setNewAdminFid(e.target.value)}
                      className="bg-black/30 border-purple-500/30 text-white"
                    />
                    <Button onClick={addAdmin} className="bg-green-600 hover:bg-green-700">
                      Add Admin
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black/40 backdrop-blur-xl border-red-500/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-400" />
                    Current Admins
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <div>
                        <div className="text-white font-medium">FID: {user.fid} (You)</div>
                        <div className="text-gray-400 text-sm">Super Admin - App Creator</div>
                      </div>
                      <Badge className="bg-green-500/20 text-green-300 border-green-500/50">Super Admin</Badge>
                    </div>

                    {adminFids.map((fid) => (
                      <div
                        key={fid}
                        className="flex items-center justify-between p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg"
                      >
                        <div>
                          <div className="text-white font-medium">FID: {fid}</div>
                          <div className="text-gray-400 text-sm">Admin</div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removeAdmin(fid)}
                          className="border-red-500/50 text-red-300 hover:bg-red-500/20"
                        >
                          <UserMinus className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="metrics">
            <Card className="bg-black/40 backdrop-blur-xl border-red-500/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Settings className="w-5 h-5 text-purple-400" />
                  Platform Metrics Control
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white font-medium">Last Updated</div>
                    <div className="text-gray-400 text-sm">{metrics.lastUpdated.toLocaleString()}</div>
                  </div>
                  <Button onClick={updateMetrics} className="bg-purple-600 hover:bg-purple-700">
                    Update Metrics Now
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-black/30 rounded-lg">
                    <div className="text-gray-400 text-sm">Auto-update Schedule</div>
                    <div className="text-white font-medium">Daily at 12:00 UTC</div>
                  </div>
                  <div className="p-4 bg-black/30 rounded-lg">
                    <div className="text-gray-400 text-sm">Metrics Visibility</div>
                    <div className="text-white font-medium">Public</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full border-yellow-500/50 text-yellow-300 hover:bg-yellow-500/20 bg-transparent"
                  >
                    Hide Metrics from Public
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full border-blue-500/50 text-blue-300 hover:bg-blue-500/20 bg-transparent"
                  >
                    Export Analytics Data
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
