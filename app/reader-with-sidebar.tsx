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
  const [activeWork, setActiveWork] = useState<WorkIndexEntry | null>(null)
  const [activeWorkData, setActiveWorkData] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch the works index once on mount.
  useEffect(() => {
    fetch("/works/works_index.json")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load works index")
        return res.json()
      })
      .then((data: WorkIndexEntry[]) => {
        setWorksIndex(data)
        // Automatically select the Title Page if it exists, otherwise the first work.
        const initial =
          data.find((w) => w.work_title === "Title Page") ?? data[0] ?? null
        setActiveWork(initial)
      })
      .catch((err) => setError(err.message))
  }, [])

  // Whenever the active work changes, fetch its JSON.
  useEffect(() => {
    if (!activeWork) return
    setLoading(true)
    setError(null)
    fetch(`/works/${activeWork.file}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load work data")
        return res.json()
      })
      .then((data) => setActiveWorkData({ works: [data] }))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [activeWork])

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
        {loading || !activeWorkData ? (
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Loading...</p>
            </div>
          </div>
        ) : (
          <ModernReader data={activeWorkData} />
        )}
      </SidebarInset>
    </SidebarProvider>
  )
}
