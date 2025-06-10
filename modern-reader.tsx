"use client"

import React from "react"

import type { ReactNode } from "react"
import { useState, useRef, useEffect, forwardRef, createContext, useContext } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { Menu, Sun, Moon, Type, Minus, Plus, ChevronRight, ChevronDown, X, Settings, BookOpen } from "lucide-react"
import { Search, ArrowRight, FileText } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

// Theme and Settings Context
interface SettingsContextType {
  theme: "light" | "dark"
  fontSize: number
  toggleTheme: () => void
  increaseFontSize: () => void
  decreaseFontSize: () => void
  resetFontSize: () => void
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

const useSettings = () => {
  const context = useContext(SettingsContext)
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider")
  }
  return context
}

// Search Context and Types
interface SearchResult {
  workTitle: string
  partTitle?: string
  chapterTitle: string
  content: string
  id: string
  matchCount: number
  preview: string
}

interface SearchContextType {
  searchQuery: string
  searchResults: SearchResult[]
  isSearching: boolean
  activeSearchResult: string | null
  setSearchQuery: (query: string) => void
  clearSearch: () => void
  navigateToResult: (resultId: string) => void
}

const SearchContext = createContext<SearchContextType | undefined>(undefined)

const useSearch = () => {
  const context = useContext(SearchContext)
  if (!context) {
    throw new Error("useSearch must be used within a SearchProvider")
  }
  return context
}

// Settings Provider Component
function SettingsProvider({ children }: { children: ReactNode }) {
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

// Search Provider Component
function SearchProvider({ children, data }: { children: ReactNode; data: { works: any[] } }) {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [activeSearchResult, setActiveSearchResult] = useState<string | null>(null)

  // Debounced search function
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
  }, [searchQuery, data])

  const performSearch = (query: string) => {
    setIsSearching(true)
    const results: SearchResult[] = []
    const searchTerms = query.toLowerCase().split(/\s+/)

    data.works?.forEach((work) => {
      work.parts?.forEach((part) => {
        part.chapters?.forEach((chapter) => {
          const content = chapter.content_html || ""
          const textContent = content
            .replace(/<[^>]*>/g, " ")
            .replace(/\s+/g, " ")
            .trim()

          let matchCount = 0
          let hasMatch = false

          // Check if all search terms are present
          const contentLower = textContent.toLowerCase()
          const titleLower = chapter.chapter_title.toLowerCase()

          searchTerms.forEach((term) => {
            const contentMatches = (contentLower.match(new RegExp(term, "g")) || []).length
            const titleMatches = (titleLower.match(new RegExp(term, "g")) || []).length
            matchCount += contentMatches + titleMatches * 2 // Weight title matches higher
            if (contentMatches > 0 || titleMatches > 0) {
              hasMatch = true
            }
          })

          if (hasMatch) {
            // Create preview with highlighted terms
            const preview = createSearchPreview(textContent, searchTerms, 150)
            const resultId = generateId(`${work.work_title}-${part.part_title}-${chapter.chapter_title}`)

            results.push({
              workTitle: work.work_title,
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
    })

    // Sort by relevance (match count)
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

  const clearSearch = () => {
    setSearchQuery("")
    setSearchResults([])
    setActiveSearchResult(null)
    setIsSearching(false)
  }

  const navigateToResult = (resultId: string) => {
    setActiveSearchResult(resultId)
    const element = document.getElementById(resultId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" })
      // Highlight the element briefly
      element.classList.add("search-highlight")
      setTimeout(() => {
        element.classList.remove("search-highlight")
      }, 2000)
    }
  }

  return (
    <SearchContext.Provider
      value={{
        searchQuery,
        searchResults,
        isSearching,
        activeSearchResult,
        setSearchQuery,
        clearSearch,
        navigateToResult,
      }}
    >
      {children}
    </SearchContext.Provider>
  )
}

// Utility function for generating IDs
const generateId = (text: string) => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

// Settings Panel Component
function SettingsPanel() {
  const { theme, fontSize, toggleTheme, increaseFontSize, decreaseFontSize, resetFontSize } = useSettings()

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Settings className="w-4 h-4" />
          <h3 className="font-semibold">Reading Settings</h3>
        </div>

        <div className="space-y-4">
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
      </CardContent>
    </Card>
  )
}

// Search Panel Component
function SearchPanel() {
  const { searchQuery, searchResults, isSearching, setSearchQuery, clearSearch, navigateToResult } = useSearch()

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Search className="w-4 h-4" />
          <h3 className="font-semibold">Search</h3>
          {searchQuery && (
            <Button variant="ghost" size="sm" onClick={clearSearch} className="ml-auto h-6 w-6 p-0">
              <X className="w-3 h-3" />
            </Button>
          )}
        </div>

        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search all texts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {isSearching && <div className="text-sm text-muted-foreground text-center py-2">Searching...</div>}

          {searchQuery && !isSearching && (
            <div className="text-sm text-muted-foreground">
              {searchResults.length > 0
                ? `Found ${searchResults.length} result${searchResults.length !== 1 ? "s" : ""}`
                : "No results found"}
            </div>
          )}

          {searchResults.length > 0 && (
            <ScrollArea className="h-64">
              <div className="space-y-2">
                {searchResults.map((result, index) => (
                  <Card key={index} className="cursor-pointer hover:bg-accent/50 transition-colors">
                    <CardContent className="p-3" onClick={() => navigateToResult(result.id)}>
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm truncate">{result.chapterTitle}</h4>
                            <p className="text-xs text-muted-foreground truncate">
                              {result.workTitle} → {result.partTitle}
                            </p>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {result.matchCount}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {highlightSearchTerms(result.preview, searchQuery.split(/\s+/))}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <FileText className="w-3 h-3" />
                          <span>Go to chapter</span>
                          <ArrowRight className="w-3 h-3" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Helper function to highlight search terms
function highlightSearchTerms(text: string, searchTerms: string[]): ReactNode {
  if (!searchTerms.length) return text

  let highlightedText = text
  searchTerms.forEach((term) => {
    const regex = new RegExp(`(${term})`, "gi")
    highlightedText = highlightedText.replace(
      regex,
      '<mark class="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">$1</mark>',
    )
  })

  return <span dangerouslySetInnerHTML={{ __html: highlightedText }} />
}

// Navigation Item Component
function NavItem({
  children,
  onClick,
  level,
  isActive = false,
}: {
  children: ReactNode
  onClick: () => void
  level: 1 | 2 | 3
  isActive?: boolean
}) {
  const levelStyles = {
    1: "text-primary font-semibold text-base",
    2: "text-muted-foreground text-sm pl-4",
    3: "text-muted-foreground text-xs pl-8",
  }

  return (
    <Button
      variant={isActive ? "secondary" : "ghost"}
      onClick={onClick}
      className={`justify-start w-full h-auto py-2 px-3 ${levelStyles[level]} hover:bg-accent`}
    >
      <span className="truncate text-left">{children}</span>
    </Button>
  )
}

// Collapsible Icon Component
function CollapsibleIcon({ isExpanded }: { isExpanded: boolean }) {
  return (
    <Button variant="ghost" size="sm" className="p-1 h-auto">
      {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
    </Button>
  )
}

// Sidebar Component
function Sidebar({ data }: { data: { works: any[] } }) {
  const [expandedWork, setExpandedWork] = useState<number | null>(0)
  const [expandedPart, setExpandedPart] = useState<string | null>("0-0")

  const scrollToElement = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  return (
    <div className="h-full flex flex-col w-full overflow-hidden">
      <div className="p-4 border-b">
        <div className="flex items-center gap-2 mb-2">
          <BookOpen className="w-5 h-5 text-primary" />
          <h2 className="font-bold text-lg">Contents</h2>
        </div>
      </div>

      <div className="w-full max-w-full">
        <SettingsPanel />
      </div>
      <div className="w-full max-w-full">
        <SearchPanel />
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <nav className="space-y-2">
          {data.works?.map((work, workIdx) => {
            const workId = generateId(work.work_title)
            const isWorkExpanded = expandedWork === workIdx

            return (
              <div key={workIdx} className="space-y-1">
                <div className="flex items-center justify-between">
                  <NavItem level={1} onClick={() => scrollToElement(workId)}>
                    {work.work_title}
                  </NavItem>
                  <div onClick={() => setExpandedWork(isWorkExpanded ? null : workIdx)}>
                    <CollapsibleIcon isExpanded={isWorkExpanded} />
                  </div>
                </div>

                {isWorkExpanded &&
                  work.parts?.map((part, partIdx) => {
                    const partId = generateId(`${work.work_title}-${part.part_title}`)
                    const partKey = `${workIdx}-${partIdx}`
                    const isPartExpanded = expandedPart === partKey

                    return (
                      <div key={partKey} className="ml-2 space-y-1">
                        <div className="flex items-center justify-between">
                          <NavItem level={2} onClick={() => scrollToElement(partId)}>
                            {part.part_title}
                          </NavItem>
                          <div onClick={() => setExpandedPart(isPartExpanded ? null : partKey)}>
                            <CollapsibleIcon isExpanded={isPartExpanded} />
                          </div>
                        </div>

                        {isPartExpanded &&
                          part.chapters?.map((chapter, chapterIdx) => {
                            const chapterId = generateId(
                              `${work.work_title}-${part.part_title}-${chapter.chapter_title}`,
                            )
                            return (
                              <div key={chapterIdx} className="ml-2">
                                <NavItem level={3} onClick={() => scrollToElement(chapterId)}>
                                  {chapter.chapter_title}
                                </NavItem>
                              </div>
                            )
                          })}
                      </div>
                    )
                  })}
              </div>
            )
          })}
        </nav>
      </div>
    </div>
  )
}

// HTML Content Component
function HtmlContent({ htmlString }: { htmlString: string }) {
  const { fontSize } = useSettings()
  const { searchQuery } = useSearch()

  // Highlight search terms in content
  const highlightedContent = React.useMemo(() => {
    if (!searchQuery.trim()) return htmlString

    let highlighted = htmlString
    const searchTerms = searchQuery.toLowerCase().split(/\s+/)

    searchTerms.forEach((term) => {
      if (term.length >= 2) {
        const regex = new RegExp(`(${term})`, "gi")
        highlighted = highlighted.replace(
          regex,
          '<mark class="bg-yellow-200 dark:bg-yellow-800 px-1 rounded font-medium">$1</mark>',
        )
      }
    })

    return highlighted
  }, [htmlString, searchQuery])

  return (
    <div
      className="prose dark:prose-invert max-w-none leading-relaxed"
      style={{ fontSize: `${fontSize}px`, lineHeight: 1.7 }}
      dangerouslySetInnerHTML={{ __html: highlightedContent }}
    />
  )
}

// Footnote processing function
function injectInteractiveFootnotes(contentHtml: string) {
  if (!contentHtml) return ""
  return contentHtml.replace(/<sup class="footnote-ref" data-note-id="(\d+)">(\d+)<\/sup>/g, (match, id) => {
    return `
        <a 
          href="#footnote-${id}" 
          id="fnref-${id}" 
          class="footnote-link inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-primary bg-primary/10 rounded-full hover:bg-primary/20 transition-colors cursor-pointer ml-1"
          data-footnote-id="${id}"
        >${id}</a>
      `
  })
}

// Footnote Tooltip Component
const FootnoteTooltip = forwardRef<
  HTMLDivElement,
  {
    footnote: any
    isVisible: boolean
    position: { x: number; y: number }
    onClose: () => void
  }
>(({ footnote, isVisible, position, onClose }, ref) => {
  if (!isVisible) return null

  const transformStyle = position.y < 160 ? "translate(-50%, 10px)" : "translate(-50%, -100%)"
  // Clamp horizontal position within viewport with 20px padding
  const viewportWidth = typeof window !== "undefined" ? window.innerWidth : 1024
  const clampedX = Math.min(Math.max(position.x, 20), viewportWidth - 20)

  return (
    <Card
      ref={ref}
      className="fixed z-50 max-w-sm shadow-lg"
      style={{
        left: `${clampedX}px`,
        top: `${position.y}px`,
        transform: transformStyle,
        marginTop: transformStyle.includes("-100%") ? "-10px" : "10px",
      }}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <span className="text-xs font-semibold text-muted-foreground">Footnote {footnote.id}</span>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-6 w-6 p-0">
            <X className="w-3 h-3" />
          </Button>
        </div>
        <div className="text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: footnote.text_html }} />
      </CardContent>
    </Card>
  )
})
FootnoteTooltip.displayName = "FootnoteTooltip"

// Footnote Component
function Footnote({ footnote }: { footnote: any }) {
  return (
    <li id={`footnote-${footnote.id}`} className="mb-4 p-3 rounded-lg bg-muted/50 target:bg-primary/10">
      <a
        href={`#fnref-${footnote.id}`}
        className="inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-primary bg-primary/10 rounded-full hover:bg-primary/20 transition-colors mr-3"
      >
        {footnote.id}
      </a>
      <HtmlContent htmlString={footnote.text_html} />
    </li>
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
  const [activeFootnote, setActiveFootnote] = useState<any>(null)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })
  const [showFootnotes, setShowFootnotes] = useState(false)
  const chapterRef = useRef<HTMLElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)

  const chapterId = generateId(`${workTitle}-${partTitle}-${chapter.chapter_title}`)
  const contentHtml = injectInteractiveFootnotes(chapter.content_html)

  const footnoteMap =
    chapter.footnotes?.reduce((acc: Record<string, any>, fn: any) => {
      acc[fn.id] = fn
      return acc
    }, {}) || {}

  useEffect(() => {
    const chapterElement = chapterRef.current
    if (!chapterElement) return

    const handleLinkClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest(".footnote-link")
      if (!target) return

      e.preventDefault()
      const footnoteId = target.getAttribute("data-footnote-id")

      if (activeFootnote && activeFootnote.id === footnoteId) {
        setActiveFootnote(null)
        return
      }

      if (footnoteId && footnoteMap[footnoteId]) {
        const rect = target.getBoundingClientRect()
        setTooltipPosition({
          x: rect.left + rect.width / 2,
          y: rect.top,
        })
        setActiveFootnote(footnoteMap[footnoteId])
      }
    }

    const handleOutsideClick = (e: MouseEvent) => {
      if (!activeFootnote) return
      if (
        tooltipRef.current &&
        !tooltipRef.current.contains(e.target as Node) &&
        !(e.target as HTMLElement).closest(".footnote-link")
      ) {
        setActiveFootnote(null)
      }
    }

    chapterElement.addEventListener("click", handleLinkClick)
    document.addEventListener("mousedown", handleOutsideClick)

    return () => {
      chapterElement.removeEventListener("click", handleLinkClick)
      document.removeEventListener("mousedown", handleOutsideClick)
    }
  }, [activeFootnote, footnoteMap])

  return (
    <>
      <Card className="mb-8">
        <CardContent className="p-6 md:p-8">
          <section ref={chapterRef} id={chapterId}>
            <h3 className="text-xl md:text-2xl font-bold mb-6 text-primary border-b pb-3">{chapter.chapter_title}</h3>

            <HtmlContent htmlString={contentHtml} />

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
                      <Footnote footnote={fn} key={fn.id} />
                    ))}
                  </ol>
                )}
              </div>
            )}
          </section>
        </CardContent>
      </Card>

      <FootnoteTooltip
        ref={tooltipRef}
        footnote={activeFootnote}
        isVisible={!!activeFootnote}
        position={tooltipPosition}
        onClose={() => setActiveFootnote(null)}
      />
    </>
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

// Main Component
export default function ModernReader({
  data,
  showSidebar = true,
}: {
  data: { works: any[] }
  showSidebar?: boolean
}) {
  return (
    <SettingsProvider>
      <SearchProvider data={data}>
        <div className="min-h-screen bg-background text-foreground">
          {/* Add search highlight styles */}
          <style jsx global>{`
            .search-highlight {
              background-color: rgba(59, 130, 246, 0.1);
              border: 2px solid rgba(59, 130, 246, 0.3);
              border-radius: 8px;
              transition: all 0.3s ease;
            }
            .dark .search-highlight {
              background-color: rgba(59, 130, 246, 0.2);
              border-color: rgba(59, 130, 246, 0.4);
            }
          `}</style>

          <div className="flex h-screen">
            {showSidebar && (
              <>
                {/* Desktop Sidebar */}
                <aside className="hidden lg:flex w-80 flex-shrink-0 border-r bg-card">
                  <Sidebar data={data} />
                </aside>

                {/* Mobile Sidebar */}
                <Sheet>
                  <SheetTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="fixed top-4 left-4 z-40 lg:hidden"
                    >
                      <Menu className="w-4 h-4" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80 p-0">
                    <Sidebar data={data} />
                  </SheetContent>
                </Sheet>
              </>
            )}
            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
              <div className="max-w-4xl mx-auto p-4 md:p-6 lg:p-8 pt-16 lg:pt-8">
                <header className="text-center mb-12">
                  <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">Ante-Nicene Fathers, Vol. 1</h1>
                  <p className="text-lg text-muted-foreground mb-2">Early Christian Writings</p>
                  <p className="text-sm text-muted-foreground">
                    Click footnote numbers to view notes. Use the sidebar to navigate.
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
        </div>
      </SearchProvider>
    </SettingsProvider>
  )
}
