"use client"

import { useState, useEffect } from "react"
import ModernReader from "./modern-reader"

// Alternative approach: Load data dynamically
export default function DataLoader() {
  const [data, setData] = useState<{ works: any[] } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Option 1: Load from public folder
    fetch("/output.json")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to load data")
        }
        return response.json()
      })
      .then((jsonData) => {
        setData(jsonData)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })

    // Option 2: Load from API endpoint
    // fetch('/api/reader-data')
    //   .then(response => response.json())
    //   .then(jsonData => {
    //     setData(jsonData)
    //     setLoading(false)
    //   })
    //   .catch(err => {
    //     setError(err.message)
    //     setLoading(false)
    //   })
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading your data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">Error loading data: {error}</p>
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

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>No data available</p>
      </div>
    )
  }

  return <ModernReader data={data} />
}
