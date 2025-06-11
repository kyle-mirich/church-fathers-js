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

}
