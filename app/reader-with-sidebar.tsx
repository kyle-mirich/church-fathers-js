"use client"

import React, { useEffect, useState } from "react"
import ModernReader from "../modern-reader"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { BookOpen, ChevronRight, ChevronDown, Settings, Search, X, Sun, Moon, Type, Minus, Plus, FileText, ArrowRight } from "lucide-react"

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

// Settings types and context
interface SettingsContextType {
  theme: "light" | "dark"
  fontSize: number
  toggleTheme: () => void
  increaseFontSize: () => void
  decreaseFontSize: () => void
  resetFontSize: () => void
}

const SettingsContext = React.createContext<SettingsContextType | undefined>(undefined)

const useSettings = () => {
  const context = React.useContext(SettingsContext)
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider")
  }
  return context
}

// Search types
interface SearchResult {
  workTitle: string
  workIndex: number
  partTitle?: string
  chapterTitle: string
  content: string
  id: string
  matchCount: number
  preview: string
}

// Settings Provider Component
function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<"light" | "dark">("light")
  const [fontSize, setFontSize] = useState(16)

  useEffect(() => {
    // Load saved preferences
    const savedTheme = localStorage.getItem("reader-theme") as "light" | "dark" | null
    const savedFontSize = localStorage.getItem("reader-font-size")

    if (savedTheme) setTheme(savedTheme)
    if (savedFontSize) setFontSize(Number.parseInt(savedFontSize))
  }, [])

  useEffect(() => {
    // Apply theme to document
    document.documentElement.classList.toggle("dark", theme === "dark")
    localStorage.setItem("reader-theme", theme)
  }, [theme])

  useEffect(() => {
    // Save font size
    localStorage.setItem("reader-font-size", fontSize.toString())
  }, [fontSize])

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"))
  }

  const increaseFontSize = () => {
    setFontSize((prev) => Math.min(prev + 2, 24))
  }

  const decreaseFontSize = () => {
    setFontSize((prev) => Math.max(prev - 2, 12))
  }

  const resetFontSize = () => {
    setFontSize(16)
  }

  return (
    <SettingsContext.Provider
      value={{
        theme,
        fontSize,
        toggleTheme,
        increaseFontSize,
        decreaseFontSize,
        resetFontSize,
      }}
    >
      {children}
    </SettingsContext.Provider>
  )
}

// Settings Panel Component
function SettingsDialog() {
  const { theme, fontSize, toggleTheme, increaseFontSize, decreaseFontSize, resetFontSize } = useSettings()

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="p-2">
          <Settings className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Reading Settings
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Theme Toggle */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Theme</span>
            <Button variant="outline" size="sm" onClick={toggleTheme} className="flex items-center gap-2">
              {theme === "light" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              {theme === "light" ? "Light" : "Dark"}
            </Button>
          </div>

          <Separator />

          {/* Font Size Controls */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Font Size</span>
              <span className="text-sm text-muted-foreground">{fontSize}px</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={decreaseFontSize} disabled={fontSize <= 12}>
                <Minus className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={resetFontSize} className="flex-1">
                <Type className="w-4 h-4 mr-1" />
                Reset
              </Button>
              <Button variant="outline" size="sm" onClick={increaseFontSize} disabled={fontSize >= 24}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
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
  const [searchQuery, setSearchQuery] = useState("")
  const [searchScope, setSearchScope] = useState<"all" | "current">("all")
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showSearch, setShowSearch] = useState(false)

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

  // Search functionality
  const performSearch = async (query: string) => {
    if (query.trim().length < 2) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    const results: SearchResult[] = []
    const searchTerms = query.toLowerCase().split(/\s+/)

    // Determine which works to search
    const worksToSearch = searchScope === "current" && selectedWorkData 
      ? [{ data: selectedWorkData, index: selectedWorkIndex }]
      : await Promise.all(worksIndex.map(async (work, index) => {
          if (index === selectedWorkIndex && selectedWorkData) {
            return { data: selectedWorkData, index }
          }
          // Load work data for search
          try {
            const res = await fetch(`/works/${work.file}`)
            const data = await res.json()
            return { data, index }
          } catch {
            return null
          }
        }))

    for (const workContainer of worksToSearch) {
      if (!workContainer) continue
      
      const { data: work, index: workIndex } = workContainer
      
      work.parts?.forEach((part: any) => {
        part.chapters?.forEach((chapter: any) => {
          const content = chapter.content_html || ""
          const textContent = content
            .replace(/<[^>]*>/g, " ")
            .replace(/\s+/g, " ")
            .trim()

          let matchCount = 0
          let hasMatch = false

          const contentLower = textContent.toLowerCase()
          const titleLower = chapter.chapter_title.toLowerCase()
          const partTitleLower = part.part_title.toLowerCase()
          const workTitleLower = work.work_title.toLowerCase()

          searchTerms.forEach((term) => {
            const contentMatches = (contentLower.match(new RegExp(term, "g")) || []).length
            const titleMatches = (titleLower.match(new RegExp(term, "g")) || []).length
            const partMatches = (partTitleLower.match(new RegExp(term, "g")) || []).length
            const workMatches = (workTitleLower.match(new RegExp(term, "g")) || []).length
            
            matchCount += contentMatches + titleMatches * 3 + partMatches * 2 + workMatches * 2
            if (contentMatches > 0 || titleMatches > 0 || partMatches > 0 || workMatches > 0) {
              hasMatch = true
            }
          })

          if (hasMatch) {
            const preview = createSearchPreview(textContent, searchTerms, 150)
            const resultId = generateId(`${work.work_title}-${part.part_title}-${chapter.chapter_title}`)

            results.push({
              workTitle: work.work_title,
              workIndex,
              partTitle: part.part_title,
              chapterTitle: chapter.chapter_title,
              content: textContent,
              id: resultId,
              matchCount,
              preview,
            })
          }
        })
      })
    }

    results.sort((a, b) => b.matchCount - a.matchCount)
    setSearchResults(results)
    setIsSearching(false)
  }

  const createSearchPreview = (text: string, searchTerms: string[], maxLength: number): string => {
    const firstTermIndex = searchTerms.reduce((minIndex, term) => {
      const index = text.toLowerCase().indexOf(term)
      return index !== -1 && (minIndex === -1 || index < minIndex) ? index : minIndex
    }, -1)

    if (firstTermIndex === -1) return text.substring(0, maxLength) + "..."

    const start = Math.max(0, firstTermIndex - 50)
    const end = Math.min(text.length, start + maxLength)
    let preview = text.substring(start, end)

    if (start > 0) preview = "..." + preview
    if (end < text.length) preview = preview + "..."

    return preview
  }

  const handleSearchResultClick = (result: SearchResult) => {
    if (result.workIndex !== selectedWorkIndex) {
      onSelectWork(result.workIndex)
    }
    setTimeout(() => {
      scrollToElement(result.id)
    }, 500)
  }

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        performSearch(searchQuery.trim())
      } else {
        setSearchResults([])
        setIsSearching(false)
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchQuery, searchScope, selectedWorkData])

  return (
    <div className="h-full flex flex-col w-full overflow-hidden">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            <h2 className="font-bold text-lg">Works</h2>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSearch(!showSearch)}
              className="p-2"
            >
              <Search className="w-4 h-4" />
            </Button>
            <SettingsDialog />
          </div>
        </div>
        
        {showSearch && (
          <div className="space-y-3 mt-3">
            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search texts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-10"
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                )}
              </div>
              
              <Select value={searchScope} onValueChange={(value: "all" | "current") => setSearchScope(value)}>
                <SelectTrigger className="text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Search all works</SelectItem>
                  <SelectItem value="current">Search current work only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {isSearching && (
              <div className="text-sm text-muted-foreground text-center py-2">Searching...</div>
            )}
            
            {searchQuery && !isSearching && (
              <div className="text-sm text-muted-foreground">
                {searchResults.length > 0
                  ? `Found ${searchResults.length} result${searchResults.length !== 1 ? "s" : ""}`
                  : "No results found"}
              </div>
            )}
            
            {searchResults.length > 0 && (
              <ScrollArea className="h-48">
                <div className="space-y-1">
                  {searchResults.map((result, index) => (
                    <Card key={index} className="cursor-pointer hover:bg-accent/50 transition-colors">
                      <CardContent className="p-2" onClick={() => handleSearchResultClick(result)}>
                        <div className="space-y-1">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-xs truncate">{result.chapterTitle}</h4>
                              <p className="text-xs text-muted-foreground truncate">
                                {result.workTitle} → {result.partTitle}
                              </p>
                            </div>
                            <Badge variant="secondary" className="text-xs">
                              {result.matchCount}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                            {result.preview}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        )}
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

// ModernReaderContent component that uses settings
function ModernReaderContent({ data }: { data: { works: any[] } }) {
  const { fontSize } = useSettings()

  const generateId = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
  }

  // HTML Content Component
  function HtmlContent({ htmlString }: { htmlString: string }) {
    return (
      <div
        className="prose dark:prose-invert max-w-none leading-relaxed"
        style={{ fontSize: `${fontSize}px`, lineHeight: 1.7 }}
        dangerouslySetInnerHTML={{ __html: htmlString }}
      />
    )
  }

  // Chapter Component
  function Chapter({
    chapter,
    workTitle,
    partTitle,
  }: {
    chapter: any
    workTitle: string
    partTitle: string
  }) {
    const [showFootnotes, setShowFootnotes] = useState(false)
    const chapterId = generateId(`${workTitle}-${partTitle}-${chapter.chapter_title}`)

    return (
      <Card className="mb-8">
        <CardContent className="p-6 md:p-8">
          <section id={chapterId}>
            <h3 className="text-xl md:text-2xl font-bold mb-6 text-primary border-b pb-3">
              {chapter.chapter_title}
            </h3>

            <HtmlContent htmlString={chapter.content_html || ""} />

            {chapter.footnotes?.length > 0 && (
              <div className="mt-8 pt-6 border-t">
                <button
                  type="button"
                  className="flex items-center gap-2 mb-4 text-lg font-semibold hover:underline focus:outline-none"
                  onClick={() => setShowFootnotes((v) => !v)}
                  aria-expanded={showFootnotes}
                >
                  {showFootnotes ? (
                    <ChevronDown className="w-5 h-5" />
                  ) : (
                    <ChevronRight className="w-5 h-5" />
                  )}
                  <span>Footnotes ({chapter.footnotes.length})</span>
                </button>
                {showFootnotes && (
                  <ol className="list-none space-y-2">
                    {chapter.footnotes.map((fn: any) => (
                      <li key={fn.id} className="mb-4 p-3 rounded-lg bg-muted/50">
                        <div className="flex items-start gap-3">
                          <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-primary bg-primary/10 rounded-full">
                            {fn.id}
                          </span>
                          <HtmlContent htmlString={fn.text_html} />
                        </div>
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            )}
          </section>
        </CardContent>
      </Card>
    )
  }

  // Part Component
  function Part({ part, workTitle }: { part: any; workTitle: string }) {
    const partId = generateId(`${workTitle}-${part.part_title}`)

    return (
      <div className="mb-12">
        <h2 id={partId} className="text-2xl md:text-3xl font-bold mb-8 text-primary border-b-2 pb-4">
          {part.part_title}
        </h2>
        {part.chapters?.length > 0 ? (
          part.chapters.map((chapter: any, idx: number) => (
            <Chapter chapter={chapter} workTitle={workTitle} partTitle={part.part_title} key={idx} />
          ))
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">No chapters available.</p>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  // Work Component
  function Work({ work }: { work: any }) {
    const workId = generateId(work.work_title)

    return (
      <article className="mb-16">
        <h1 id={workId} className="text-3xl md:text-4xl font-bold mb-8 text-primary border-b-4 pb-6">
          {work.work_title}
        </h1>
        {work.parts?.length > 0 ? (
          work.parts.map((part: any, idx: number) => <Part part={part} workTitle={work.work_title} key={idx} />)
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground text-lg">No parts available for this work.</p>
            </CardContent>
          </Card>
        )}
      </article>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-4 md:p-6 lg:p-8">
          <header className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">Ante-Nicene Fathers, Vol. 1</h1>
            <p className="text-lg text-muted-foreground mb-2">Early Christian Writings</p>
            <p className="text-sm text-muted-foreground">
              Use the sidebar to navigate and search through the texts.
            </p>
          </header>

          <section>
            {data.works?.length > 0 ? (
              data.works.map((work: any, idx: number) => <Work work={work} key={idx} />)
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <p className="text-muted-foreground text-xl">No works found in the data.</p>
                </CardContent>
              </Card>
            )}
          </section>
        </div>
      </main>
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
    <SettingsProvider>
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
            <ModernReaderContent data={{ works: [selectedWorkData] }} />
          ) : (
            <div className="min-h-screen flex items-center justify-center p-4">
              <div className="text-center">
                <p className="text-muted-foreground">Select a work from the sidebar to begin reading.</p>
              </div>
            </div>
          )}
        </SidebarInset>
      </SidebarProvider>
    </SettingsProvider>
  )
}
