"use client"

import { useEffect, useState } from "react"
import ModernReader from "../modern-reader"

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
      .then((data) => setActiveWorkData({ works: [data] }))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [activeWork])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
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

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-80 border-r bg-card h-full flex flex-col">
        <div className="p-4 border-b">
          <h2 className="font-bold text-lg">Works</h2>
        </div>
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {worksIndex.map((work, idx) => (
            <button
              key={work.work_title}
              className={`block w-full text-left px-3 py-2 rounded hover:bg-muted ${
                activeWork?.work_title === work.work_title ? "bg-muted font-bold" : ""
              }`}
              onClick={() => setActiveWork(work)}
              disabled={activeWork?.work_title === work.work_title}
            >
              {work.work_title}
            </button>
          ))}
        </nav>
      </aside>
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
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
      </main>
    </div>
  )
}
