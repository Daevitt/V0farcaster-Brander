"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

interface PageHeaderProps {
  title: string
  description?: string
  showBackButton?: boolean
  backPath?: string
}

export function PageHeader({ title, description, showBackButton = true, backPath = "/" }: PageHeaderProps) {
  const router = useRouter()

  return (
    <div className="border-b border-purple-500/20 bg-black/20 backdrop-blur-xl">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center gap-4">
          {showBackButton && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(backPath)}
              className="border-purple-500/50 text-purple-300 hover:bg-purple-500/20 bg-transparent"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          )}
          <div>
            <h1 className="text-2xl font-bold text-white">{title}</h1>
            {description && <p className="text-gray-400 mt-1">{description}</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
