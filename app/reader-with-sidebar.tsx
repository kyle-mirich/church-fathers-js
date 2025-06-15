"use client"

import { useEffect, useState } from "react"
import ModernReader from "../modern-reader"

// Re-use the sidebar primitives that already exist in the UI library.
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
} from "@/components/ui/sidebar"

export interface WorkIndexEntry {
  work_title: string
  file: string
  parts: string[]
}

export default function ReaderWithSidebar() {
  const [worksIndex, setWorksIndex] = useState<WorkIndexEntry[]>([])
  const [allWorksData, setAllWorksData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch the works index and all works' JSON on mount.
  useEffect(() => {
    setLoading(true)
    fetch("/works/works_index.json")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load works index")
        return res.json()
      })
      .then(async (data: WorkIndexEntry[]) => {
        setWorksIndex(data)
        // Fetch all works' JSON in parallel
        const worksData = await Promise.all(
          data.map(async (w) => {
            const res = await fetch(`/works/${w.file}`)
            if (!res.ok) throw new Error(`Failed to load work: ${w.file}`)
            return res.json()
          })
        )
        setAllWorksData(worksData)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  // Render error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <p className="text-red-500 font-medium">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  // Main layout using the sidebar primitives
  return (
    <SidebarProvider className="min-h-screen w-full">
      {/* Main reading pane only */}
      <SidebarInset className="w-full">
        {loading || allWorksData.length === 0 ? (
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Loading...</p>
            </div>
          </div>
        ) : (
          <ModernReader data={{ works: allWorksData }} />
        )}
      </SidebarInset>
    </SidebarProvider>
  )
}
