"use client"

import { useEffect, useState } from "react"
import ModernReader from "../modern-reader"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { BookOpen, ChevronRight, ChevronDown } from "lucide-react"

// Re-use the sidebar primitives that already exist in the UI library.
import {
  SidebarProvider,
  SidebarInset,
} from "@/components/ui/sidebar"

export interface WorkIndexEntry {
  work_title: string
  file: string
  parts: string[]
}

// WorkSidebar component for selecting works
function WorkSidebar({ 
  worksIndex, 
  selectedWorkIndex, 
  onSelectWork,
  selectedWorkData 
}: {
  worksIndex: WorkIndexEntry[]
  selectedWorkIndex: number
  onSelectWork: (index: number) => void
  selectedWorkData: any | null
}) {
  const [expandedPart, setExpandedPart] = useState<string | null>(null)

  const scrollToElement = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  const generateId = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
  }

  return (
    <div className="h-full flex flex-col w-full overflow-hidden">
      <div className="p-4 border-b">
        <div className="flex items-center gap-2 mb-2">
          <BookOpen className="w-5 h-5 text-primary" />
          <h2 className="font-bold text-lg">Works</h2>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-2 mb-4">
          {worksIndex.map((work, index) => (
            <Button
              key={index}
              variant={selectedWorkIndex === index ? "secondary" : "ghost"}
              onClick={() => onSelectWork(index)}
              className="w-full justify-start text-left h-auto py-3 px-3"
            >
              <span className="truncate font-medium">{work.work_title}</span>
            </Button>
          ))}
        </div>

        {selectedWorkData && (
          <>
            <div className="border-t pt-4 mt-4">
              <h3 className="font-semibold text-sm text-muted-foreground mb-3">Contents</h3>
              <nav className="space-y-2">
                {selectedWorkData.parts?.map((part: any, partIdx: number) => {
                  const partId = generateId(`${selectedWorkData.work_title}-${part.part_title}`)
                  const partKey = `${selectedWorkIndex}-${partIdx}`
                  const isPartExpanded = expandedPart === partKey

                  return (
                    <div key={partKey} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <Button
                          variant="ghost"
                          onClick={() => scrollToElement(partId)}
                          className="flex-1 justify-start text-left h-auto py-2 px-2 text-sm"
                        >
                          <span className="truncate">{part.part_title}</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setExpandedPart(isPartExpanded ? null : partKey)}
                          className="p-1 h-auto"
                        >
                          {isPartExpanded ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </Button>
                      </div>

                      {isPartExpanded &&
                        part.chapters?.map((chapter: any, chapterIdx: number) => {
                          const chapterId = generateId(
                            `${selectedWorkData.work_title}-${part.part_title}-${chapter.chapter_title}`
                          )
                          return (
                            <div key={chapterIdx} className="ml-4">
                              <Button
                                variant="ghost"
                                onClick={() => scrollToElement(chapterId)}
                                className="w-full justify-start text-left h-auto py-1 px-2 text-xs"
                              >
                                <span className="truncate text-muted-foreground">{chapter.chapter_title}</span>
                              </Button>
                            </div>
                          )
                        })}
                    </div>
                  )
                })}
              </nav>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default function ReaderWithSidebar() {
  const [worksIndex, setWorksIndex] = useState<WorkIndexEntry[]>([])
  const [selectedWorkIndex, setSelectedWorkIndex] = useState<number>(0)
  const [selectedWorkData, setSelectedWorkData] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch the works index on mount
  useEffect(() => {
    setLoading(true)
    fetch("/works/works_index.json")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load works index")
        return res.json()
      })
      .then((data: WorkIndexEntry[]) => {
        setWorksIndex(data)
        // Load the first work by default
        if (data.length > 0) {
          loadWork(0, data)
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  // Function to load a specific work
  const loadWork = async (workIndex: number, indexData?: WorkIndexEntry[]) => {
    const worksList = indexData || worksIndex
    if (workIndex < 0 || workIndex >= worksList.length) return
    
    setLoading(true)
    setError(null)
    
    try {
      const workEntry = worksList[workIndex]
      const res = await fetch(`/works/${workEntry.file}`)
      if (!res.ok) throw new Error(`Failed to load work: ${workEntry.file}`)
      const workData = await res.json()
      
      setSelectedWorkData(workData)
      setSelectedWorkIndex(workIndex)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

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
      {/* Sidebar */}
      <div className="w-80 border-r bg-card">
        {worksIndex.length > 0 && (
          <WorkSidebar 
            worksIndex={worksIndex}
            selectedWorkIndex={selectedWorkIndex}
            onSelectWork={loadWork}
            selectedWorkData={selectedWorkData}
          />
        )}
      </div>
      
      {/* Main reading pane */}
      <SidebarInset className="flex-1">
        {loading ? (
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Loading...</p>
            </div>
          </div>
        ) : selectedWorkData ? (
          <ModernReader data={{ works: [selectedWorkData] }} showSidebar={false} />
        ) : (
          <div className="min-h-screen flex items-center justify-center p-4">
            <div className="text-center">
              <p className="text-muted-foreground">Select a work from the sidebar to begin reading.</p>
            </div>
          </div>
        )}
      </SidebarInset>
    </SidebarProvider>
  )
}
