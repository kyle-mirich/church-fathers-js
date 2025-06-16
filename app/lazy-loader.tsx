"use client"

import { useEffect, useState } from "react"
import ModernReader from "../modern-reader"
import { Card, CardContent } from "@/components/ui/card"
import { LoadingSpinner, ErrorDisplay } from "@/components/ui/loading"

export interface WorkIndexEntry {
  work_title: string
  file: string
  parts: string[]
}

export default function LazyLoader() {
  const [worksIndex, setWorksIndex] = useState<WorkIndexEntry[]>([])
  const [activeWork, setActiveWork] = useState<WorkIndexEntry | null>(null)
  const [activeWorkData, setActiveWorkData] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load works index on mount
  useEffect(() => {
    fetch("/works/works_index.json")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load works index")
        return res.json()
      })
      .then((data) => {
        setWorksIndex(data)
        // Load the title work by default
        const titleWork = data.find((w: WorkIndexEntry) => w.work_title === "Title Page") || data[0]
        setActiveWork(titleWork)
      })
      .catch((err) => setError(err.message))
  }, [])

  // Load active work data when activeWork changes
  useEffect(() => {
    if (!activeWork) return
    setLoading(true)
    setError(null)
    fetch(`/works/${activeWork.file}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load work data")
        return res.json()
      })
      .then((data) => setActiveWorkData(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [activeWork])

  if (error) {
    return <ErrorDisplay error={error} onRetry={() => window.location.reload()} />
  }

  // Sidebar navigation using worksIndex
  function SidebarList() {
    return (
      <aside className="hidden lg:flex w-80 flex-shrink-0 border-r bg-card h-screen flex-col">
        <div className="p-4 border-b">
          <h2 className="font-bold text-lg">Contents</h2>
        </div>
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {worksIndex.map((work) => (
            <button
              key={work.work_title}
              className={`w-full text-left px-3 py-2 rounded hover:bg-accent transition-colors ${activeWork?.work_title === work.work_title ? "bg-accent font-bold" : ""}`}
              onClick={() => setActiveWork(work)}
            >
              {work.work_title}
            </button>
          ))}
        </nav>
      </aside>
    )
  }

  // Only pass the selected work to ModernReader, but pass all worksIndex to the sidebar
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <SidebarList />
      <main className="flex-1">
        {loading || !activeWorkData ? (
          <LoadingSpinner />
        ) : (
          <ModernReader data={{ works: [activeWorkData] }} />
        )}
      </main>
    </div>
  )
}
