"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { BookOpen, StickyNote, Highlighter } from 'lucide-react'
import { useSimpleNotes, useSimpleHighlights } from '@/hooks/use-simple-notes'
import { SimpleTextToolbar } from '@/components/simple-text-toolbar'
import { SimpleNoteDialog } from '@/components/simple-note-dialog'

interface SimpleReaderProps {
  data: { works: any[] }
}

export default function SimpleReader({ data: initialData }: SimpleReaderProps) {
  const [data, setData] = useState(initialData)
  const [loading, setLoading] = useState(true)
  
  // Load the first work by default
  useEffect(() => {
    const loadFirstWork = async () => {
      try {
        const indexRes = await fetch('/works/works_index.json')
        const worksIndex = await indexRes.json()
        
        if (worksIndex.length > 0) {
          const workRes = await fetch(`/works/${worksIndex[0].file}`)
          const workData = await workRes.json()
          setData({ works: [workData] })
        }
      } catch (error) {
        console.error('Error loading work:', error)
      } finally {
        setLoading(false)
      }
    }

    if (!initialData.works?.length) {
      loadFirstWork()
    } else {
      setLoading(false)
    }
  }, [initialData])

  const currentWork = data.works?.[0]
  const workTitle = currentWork?.work_title || ''
  
  const { notes, createNote, deleteNote } = useSimpleNotes(workTitle)
  const { highlights, createHighlight, deleteHighlight } = useSimpleHighlights(workTitle)
  
  const [selectedText, setSelectedText] = useState('')
  const [selectionPosition, setSelectionPosition] = useState({ x: 0, y: 0 })
  const [showToolbar, setShowToolbar] = useState(false)
  const [noteDialogOpen, setNoteDialogOpen] = useState(false)

  // Handle text selection
  const handleTextSelection = () => {
    const selection = window.getSelection()
    if (selection && selection.toString().trim()) {
      const text = selection.toString().trim()
      const rect = selection.getRangeAt(0).getBoundingClientRect()
      
      setSelectedText(text)
      setSelectionPosition({
        x: rect.left + rect.width / 2,
        y: rect.top + window.scrollY
      })
      setShowToolbar(true)
    } else {
      setShowToolbar(false)
    }
  }

  // Clear selection
  const clearSelection = () => {
    window.getSelection()?.removeAllRanges()
    setShowToolbar(false)
    setSelectedText('')
  }

  // Create note from selection
  const handleCreateNote = () => {
    setNoteDialogOpen(true)
    setShowToolbar(false)
  }

  // Create highlight from selection
  const handleCreateHighlight = (color: string) => {
    if (selectedText && currentWork) {
      createHighlight({
        selectedText,
        color,
        chapterTitle: 'Current Chapter' // You can make this more specific
      })
      
      // Apply visual highlight
      const selection = window.getSelection()
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0)
        const span = document.createElement('span')
        span.className = `highlight-${color}`
        span.style.backgroundColor = getHighlightColor(color)
        span.style.padding = '2px 1px'
        span.style.borderRadius = '2px'
        
        try {
          range.surroundContents(span)
        } catch (e) {
          // If surroundContents fails, just extract and wrap
          const contents = range.extractContents()
          span.appendChild(contents)
          range.insertNode(span)
        }
      }
    }
    clearSelection()
  }

  // Save note
  const handleSaveNote = (noteData: { title: string; content: string }) => {
    createNote({
      title: noteData.title,
      content: noteData.content,
      selectedText: selectedText || undefined,
      chapterTitle: 'Current Chapter'
    })
  }

  // Get highlight color
  const getHighlightColor = (color: string) => {
    const colors: { [key: string]: string } = {
      yellow: '#fef08a',
      blue: '#bfdbfe',
      green: '#bbf7d0',
      pink: '#fce7f3',
      orange: '#fed7aa'
    }
    return colors[color] || colors.yellow
  }

  // Generate ID for elements
  const generateId = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Add selection styles */}
      <style jsx global>{`
        .highlight-yellow { background-color: #fef08a; }
        .highlight-blue { background-color: #bfdbfe; }
        .highlight-green { background-color: #bbf7d0; }
        .highlight-pink { background-color: #fce7f3; }
        .highlight-orange { background-color: #fed7aa; }
      `}</style>

      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="w-80 border-r bg-card">
          <div className="p-4 border-b">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              <h2 className="font-bold text-lg">Notes & Highlights</h2>
            </div>
          </div>

          <Tabs defaultValue="notes" className="h-full">
            <TabsList className="grid w-full grid-cols-2 mx-4 mt-4">
              <TabsTrigger value="notes" className="flex items-center gap-2">
                <StickyNote className="w-4 h-4" />
                Notes ({notes.length})
              </TabsTrigger>
              <TabsTrigger value="highlights" className="flex items-center gap-2">
                <Highlighter className="w-4 h-4" />
                Highlights ({highlights.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="notes" className="mx-4 mt-4">
              <ScrollArea className="h-[calc(100vh-200px)]">
                {notes.length > 0 ? (
                  <div className="space-y-3">
                    {notes.map((note) => (
                      <Card key={note.id} className="p-3">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-sm">{note.title}</h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteNote(note.id)}
                            className="h-6 w-6 p-0 text-red-500"
                          >
                            ×
                          </Button>
                        </div>
                        {note.selectedText && (
                          <div className="bg-blue-50 p-2 rounded text-xs mb-2 italic">
                            "{note.selectedText}"
                          </div>
                        )}
                        <p className="text-sm text-muted-foreground">{note.content}</p>
                        <div className="text-xs text-muted-foreground mt-2">
                          {new Date(note.createdAt).toLocaleDateString()}
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <StickyNote className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No notes yet</p>
                    <p className="text-sm">Select text to create your first note</p>
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="highlights" className="mx-4 mt-4">
              <ScrollArea className="h-[calc(100vh-200px)]">
                {highlights.length > 0 ? (
                  <div className="space-y-3">
                    {highlights.map((highlight) => (
                      <Card key={highlight.id} className="p-3">
                        <div className="flex justify-between items-start mb-2">
                          <div 
                            className="w-4 h-4 rounded border"
                            style={{ backgroundColor: getHighlightColor(highlight.color) }}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteHighlight(highlight.id)}
                            className="h-6 w-6 p-0 text-red-500"
                          >
                            ×
                          </Button>
                        </div>
                        <p className="text-sm">"{highlight.selectedText}"</p>
                        <div className="text-xs text-muted-foreground mt-2">
                          {new Date(highlight.createdAt).toLocaleDateString()}
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Highlighter className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No highlights yet</p>
                    <p className="text-sm">Select text and choose a color</p>
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div 
            className="max-w-4xl mx-auto p-8"
            onMouseUp={handleTextSelection}
            onTouchEnd={handleTextSelection}
          >
            <header className="text-center mb-12">
              <h1 className="text-4xl font-bold text-primary mb-4">
                {workTitle || 'Orthodox Reader'}
              </h1>
              <p className="text-muted-foreground">
                Select any text to create notes and highlights
              </p>
            </header>

            {currentWork ? (
              <div>
                {currentWork.parts?.map((part: any, partIdx: number) => (
                  <div key={partIdx} className="mb-12">
                    <h2 className="text-2xl font-bold mb-8 text-primary border-b-2 pb-4">
                      {part.part_title}
                    </h2>
                    {part.chapters?.map((chapter: any, chapterIdx: number) => (
                      <Card key={chapterIdx} className="mb-8">
                        <CardContent className="p-8">
                          <h3 className="text-xl font-bold mb-6 text-primary border-b pb-3">
                            {chapter.chapter_title}
                          </h3>
                          <div 
                            className="prose dark:prose-invert max-w-none leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: chapter.content_html || "" }}
                          />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-muted-foreground">No content available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Text Selection Toolbar */}
      {showToolbar && (
        <SimpleTextToolbar
          selectedText={selectedText}
          position={selectionPosition}
          onCreateNote={handleCreateNote}
          onCreateHighlight={handleCreateHighlight}
          onClose={clearSelection}
        />
      )}

      {/* Note Dialog */}
      <SimpleNoteDialog
        open={noteDialogOpen}
        onOpenChange={setNoteDialogOpen}
        selectedText={selectedText}
        onSave={handleSaveNote}
      />
    </div>
  )
}