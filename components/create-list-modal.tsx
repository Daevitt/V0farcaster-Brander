"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Wallet,
  Gift,
  Rocket,
  Plus,
  Trash2,
  DollarSign,
  Heart,
  MessageCircle,
  Repeat,
  UserPlus,
  AlertCircle,
} from "lucide-react"

interface CreateListModalProps {
  isOpen: boolean
  onClose: () => void
  userWallet?: string
  isWalletConnected: boolean
}

interface ActionConfig {
  id: string
  type: "cast" | "recast" | "follow" | "like"
  description: string
  points: number
  targetUrl?: string
  targetUser?: string
}

interface RewardConfig {
  position: number
  type: "token" | "nft"
  amount?: number
  tokenSymbol?: string
  nftUrl?: string
  nftName?: string
}

export function CreateListModal({ isOpen, onClose, userWallet, isWalletConnected }: CreateListModalProps) {
  const [step, setStep] = useState<"details" | "actions" | "rewards" | "payment">("details")
  const [listName, setListName] = useState("")
  const [listDescription, setListDescription] = useState("")
  const [duration, setDuration] = useState(1) // days
  const [actions, setActions] = useState<ActionConfig[]>([])
  const [rewards, setRewards] = useState<RewardConfig[]>([])
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)

  const actionTypes = [
    { type: "cast" as const, label: "Cast", icon: MessageCircle, description: "Post a cast" },
    { type: "recast" as const, label: "Recast", icon: Repeat, description: "Recast a specific post" },
    { type: "follow" as const, label: "Follow", icon: UserPlus, description: "Follow a user" },
    { type: "like" as const, label: "Like", icon: Heart, description: "Like a specific cast" },
  ]

  const addAction = (type: ActionConfig["type"]) => {
    const newAction: ActionConfig = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      description: "",
      points: 10,
    }
    setActions([...actions, newAction])
  }

  const updateAction = (id: string, updates: Partial<ActionConfig>) => {
    setActions(actions.map((action) => (action.id === id ? { ...action, ...updates } : action)))
  }

  const removeAction = (id: string) => {
    setActions(actions.filter((action) => action.id !== id))
  }

  const addReward = () => {
    const newReward: RewardConfig = {
      position: rewards.length + 1,
      type: "token",
      amount: 100,
      tokenSymbol: "REWARD",
    }
    setRewards([...rewards, newReward])
  }

  const updateReward = (index: number, updates: Partial<RewardConfig>) => {
    setRewards(rewards.map((reward, i) => (i === index ? { ...reward, ...updates } : reward)))
  }

  const removeReward = (index: number) => {
    setRewards(rewards.filter((_, i) => i !== index))
  }

  const totalCost = duration * 2 // 2 USDC per day

  const handlePayment = async () => {
    if (!isWalletConnected) {
      alert("Please connect your wallet first")
      return
    }

    setIsProcessingPayment(true)

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 3000))

    // Here you would integrate with actual payment processing
    console.log("Processing payment of", totalCost, "USDC for", duration, "days")

    setIsProcessingPayment(false)
    onClose()

    // Show success notification
    alert("List created successfully! Payment processed.")
  }

  const canLaunch = actions.length > 0 && rewards.length > 0 && listName && listDescription

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-2xl lg:max-w-4xl max-h-[90vh] overflow-y-auto bg-black/90 backdrop-blur-xl border-purple-500/20 mx-2">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Create Reward List
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6">
          {/* Step Navigation */}
          <div className="flex gap-1 sm:gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {[
              { key: "details", label: "Details" },
              { key: "actions", label: "Actions" },
              { key: "rewards", label: "Rewards" },
              { key: "payment", label: "Payment" },
            ].map((stepItem) => (
              <Button
                key={stepItem.key}
                variant={step === stepItem.key ? "default" : "outline"}
                size="sm"
                onClick={() => setStep(stepItem.key as any)}
                className={`whitespace-nowrap flex-shrink-0 min-w-[80px] text-xs sm:text-sm ${
                  step === stepItem.key
                    ? "bg-gradient-to-r from-purple-600 to-blue-600"
                    : "border-purple-500/50 text-purple-300 hover:bg-purple-500/20 bg-transparent"
                }`}
              >
                {stepItem.label}
              </Button>
            ))}
          </div>

          {/* Step Content */}
          {step === "details" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="listName" className="text-white">
                  List Name
                </Label>
                <Input
                  id="listName"
                  value={listName}
                  onChange={(e) => setListName(e.target.value)}
                  placeholder="Enter list name..."
                  className="bg-black/50 border-purple-500/30 text-white placeholder:text-gray-400"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="listDescription" className="text-white">
                  Description
                </Label>
                <Textarea
                  id="listDescription"
                  value={listDescription}
                  onChange={(e) => setListDescription(e.target.value)}
                  placeholder="Describe your reward list..."
                  className="bg-black/50 border-purple-500/30 text-white placeholder:text-gray-400 min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration" className="text-white">
                  Duration (Days)
                </Label>
                <Input
                  id="duration"
                  type="number"
                  min="1"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="bg-black/50 border-purple-500/30 text-white"
                />
                <p className="text-sm text-gray-400">
                  Cost: {totalCost} USDC ({duration} days × 2 USDC/day)
                </p>
              </div>

              <Button
                onClick={() => setStep("actions")}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600"
                disabled={!listName || !listDescription}
              >
                Next: Configure Actions
              </Button>
            </div>
          )}

          {step === "actions" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base sm:text-lg font-semibold text-white">Configure Actions</h3>
                <Badge variant="secondary" className="bg-purple-500/20 text-purple-300">
                  {actions.length} actions
                </Badge>
              </div>

              {/* Action Type Buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {actionTypes.map((actionType) => (
                  <Button
                    key={actionType.type}
                    variant="outline"
                    onClick={() => addAction(actionType.type)}
                    className="border-purple-500/50 text-purple-300 hover:bg-purple-500/20 bg-transparent flex flex-col gap-1 h-auto py-2 sm:py-3"
                  >
                    <actionType.icon className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="text-xs">{actionType.label}</span>
                  </Button>
                ))}
              </div>

              {/* Actions List */}
              <div className="space-y-3">
                {actions.map((action) => (
                  <Card key={action.id} className="bg-black/40 border-purple-500/20">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="bg-blue-500/20 text-blue-300">
                              {action.type}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeAction(action.id)}
                              className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>

                          <Input
                            placeholder="Action description..."
                            value={action.description}
                            onChange={(e) => updateAction(action.id, { description: e.target.value })}
                            className="bg-black/50 border-purple-500/30 text-white placeholder:text-gray-400"
                          />

                          {(action.type === "recast" || action.type === "like") && (
                            <Input
                              placeholder="Target cast URL..."
                              value={action.targetUrl || ""}
                              onChange={(e) => updateAction(action.id, { targetUrl: e.target.value })}
                              className="bg-black/50 border-purple-500/30 text-white placeholder:text-gray-400"
                            />
                          )}

                          {action.type === "follow" && (
                            <Input
                              placeholder="Target username..."
                              value={action.targetUser || ""}
                              onChange={(e) => updateAction(action.id, { targetUser: e.target.value })}
                              className="bg-black/50 border-purple-500/30 text-white placeholder:text-gray-400"
                            />
                          )}

                          <div className="flex items-center gap-2">
                            <Label className="text-white text-sm">Points:</Label>
                            <Input
                              type="number"
                              min="1"
                              value={action.points}
                              onChange={(e) => updateAction(action.id, { points: Number(e.target.value) })}
                              className="bg-black/50 border-purple-500/30 text-white w-20"
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  variant="outline"
                  onClick={() => setStep("details")}
                  className="border-purple-500/50 text-purple-300 hover:bg-purple-500/20 bg-transparent"
                >
                  Back
                </Button>
                <Button
                  onClick={() => setStep("rewards")}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600"
                  disabled={actions.length === 0}
                >
                  Next: Setup Rewards
                </Button>
              </div>
            </div>
          )}

          {step === "rewards" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base sm:text-lg font-semibold text-white">Setup Rewards</h3>
                <Button onClick={addReward} size="sm" className="bg-gradient-to-r from-green-600 to-emerald-600">
                  <Plus className="w-3 h-3 mr-1" />
                  <span className="hidden sm:inline">Add Reward</span>
                  <span className="sm:hidden">Add</span>
                </Button>
              </div>

              <div className="space-y-3">
                {rewards.map((reward, index) => (
                  <Card key={index} className="bg-black/40 border-purple-500/20">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-300">
                            Position #{reward.position}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeReward(index)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label className="text-white text-sm">Reward Type</Label>
                            <div className="flex gap-2">
                              <Button
                                variant={reward.type === "token" ? "default" : "outline"}
                                size="sm"
                                onClick={() => updateReward(index, { type: "token" })}
                                className={`flex-1 ${
                                  reward.type === "token"
                                    ? "bg-gradient-to-r from-green-600 to-emerald-600"
                                    : "border-purple-500/50 text-purple-300 hover:bg-purple-500/20 bg-transparent"
                                }`}
                              >
                                <DollarSign className="w-3 h-3 mr-1" />
                                Token
                              </Button>
                              <Button
                                variant={reward.type === "nft" ? "default" : "outline"}
                                size="sm"
                                onClick={() => updateReward(index, { type: "nft" })}
                                className={`flex-1 ${
                                  reward.type === "nft"
                                    ? "bg-gradient-to-r from-purple-600 to-pink-600"
                                    : "border-purple-500/50 text-purple-300 hover:bg-purple-500/20 bg-transparent"
                                }`}
                              >
                                <Gift className="w-3 h-3 mr-1" />
                                NFT
                              </Button>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-white text-sm">Position</Label>
                            <Input
                              type="number"
                              min="1"
                              max="10"
                              value={reward.position}
                              onChange={(e) => updateReward(index, { position: Number(e.target.value) })}
                              className="bg-black/50 border-purple-500/30 text-white"
                            />
                          </div>
                        </div>

                        {reward.type === "token" && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-2">
                              <Label className="text-white text-sm">Amount</Label>
                              <Input
                                type="number"
                                min="1"
                                value={reward.amount || 100}
                                onChange={(e) => updateReward(index, { amount: Number(e.target.value) })}
                                className="bg-black/50 border-purple-500/30 text-white"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-white text-sm">Token Symbol</Label>
                              <Input
                                value={reward.tokenSymbol || "REWARD"}
                                onChange={(e) => updateReward(index, { tokenSymbol: e.target.value })}
                                className="bg-black/50 border-purple-500/30 text-white"
                              />
                            </div>
                          </div>
                        )}

                        {reward.type === "nft" && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-2">
                              <Label className="text-white text-sm">NFT Name</Label>
                              <Input
                                value={reward.nftName || ""}
                                onChange={(e) => updateReward(index, { nftName: e.target.value })}
                                placeholder="NFT collection name..."
                                className="bg-black/50 border-purple-500/30 text-white placeholder:text-gray-400"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-white text-sm">NFT URL or Contract</Label>
                              <Input
                                value={reward.nftUrl || ""}
                                onChange={(e) => updateReward(index, { nftUrl: e.target.value })}
                                placeholder="NFT URL or contract address..."
                                className="bg-black/50 border-purple-500/30 text-white placeholder:text-gray-400"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {rewards.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <Gift className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No rewards configured yet. Add rewards to motivate participants!</p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  variant="outline"
                  onClick={() => setStep("actions")}
                  className="border-purple-500/50 text-purple-300 hover:bg-purple-500/20 bg-transparent"
                >
                  Back
                </Button>
                <Button
                  onClick={() => setStep("payment")}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600"
                  disabled={rewards.length === 0}
                >
                  Next: Payment
                </Button>
              </div>
            </div>
          )}

          {step === "payment" && (
            <div className="space-y-4 sm:space-y-6">
              <div className="text-center">
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">Launch Your List</h3>
                <p className="text-gray-300 text-sm sm:text-base">Review and pay to activate your reward list</p>
              </div>

              <Card className="bg-black/40 border-purple-500/20">
                <CardHeader>
                  <CardTitle className="text-white text-lg">List Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-white font-medium">{listName}</p>
                    <p className="text-gray-400 text-sm">{listDescription}</p>
                  </div>

                  <Separator className="bg-purple-500/20" />

                  <div className="grid grid-cols-2 gap-2 sm:gap-4 text-sm">
                    <div>
                      <p className="text-gray-400">Duration</p>
                      <p className="text-white">{duration} days</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Actions</p>
                      <p className="text-white">{actions.length} configured</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Rewards</p>
                      <p className="text-white">{rewards.length} positions</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Total Cost</p>
                      <p className="text-white font-semibold">{totalCost} USDC</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Section */}
              <Card className="bg-black/40 border-purple-500/20">
                <CardHeader>
                  <CardTitle className="text-white text-lg flex items-center gap-2">
                    <Wallet className="w-5 h-5" />
                    Payment Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!isWalletConnected && (
                    <div className="flex items-center gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                      <AlertCircle className="w-4 h-4 text-yellow-400" />
                      <p className="text-yellow-300 text-sm">Please connect your wallet to proceed with payment</p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">List activation fee</span>
                      <span className="text-white">{totalCost} USDC</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Duration</span>
                      <span className="text-white">{duration} days</span>
                    </div>
                    <Separator className="bg-purple-500/20" />
                    <div className="flex justify-between font-semibold">
                      <span className="text-white">Total</span>
                      <span className="text-white">{totalCost} USDC</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Button
                      onClick={handlePayment}
                      disabled={!canLaunch || !isWalletConnected || isProcessingPayment}
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 py-3"
                    >
                      {isProcessingPayment ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <span className="text-sm sm:text-base">Processing Payment...</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Rocket className="w-4 h-4" />
                          <span className="text-sm sm:text-base">Launch List ({totalCost} USDC)</span>
                        </div>
                      )}
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => setStep("rewards")}
                      disabled={isProcessingPayment}
                      className="w-full border-purple-500/50 text-purple-300 hover:bg-purple-500/20 bg-transparent"
                    >
                      Back to Rewards
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
