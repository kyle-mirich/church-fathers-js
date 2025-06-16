"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { 
  StickyNote, 
  Highlighter, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Calendar,
  Tag,
  Quote
} from 'lucide-react'
import { Note, Highlight } from '@/lib/notes-provider'
import { formatDistanceToNow } from 'date-fns'

interface NotesPanelProps {
  notes: Note[]
  highlights: Highlight[]
  onEditNote: (note: Note) => void
  onDeleteNote: (noteId: string) => void
  onDeleteHighlight: (highlightId: string) => void
  loading?: boolean
}

const noteTypeLabels = {
  GENERAL: 'General',
  QUESTION: 'Question',
  INSIGHT: 'Insight', 
  CROSS_REF: 'Cross Ref',
  PRAYER: 'Prayer',
  COMMENTARY: 'Commentary'
}

const noteTypeColors = {
  GENERAL: 'bg-gray-100 text-gray-800',
  QUESTION: 'bg-blue-100 text-blue-800',
  INSIGHT: 'bg-green-100 text-green-800',
  CROSS_REF: 'bg-purple-100 text-purple-800',
  PRAYER: 'bg-yellow-100 text-yellow-800',
  COMMENTARY: 'bg-orange-100 text-orange-800'
}

const highlightColors = {
  YELLOW: '#fef08a',
  BLUE: '#bfdbfe',
  GREEN: '#bbf7d0',
  PINK: '#fce7f3',
  ORANGE: '#fed7aa',
  PURPLE: '#e9d5ff',
  RED: '#fecaca'
}

export function NotesPanel({
  notes,
  highlights,
  onEditNote,
  onDeleteNote,
  onDeleteHighlight,
  loading = false
}: NotesPanelProps) {
  const [filter, setFilter] = useState<string>('all')

  const filteredNotes = notes.filter(note => {
    if (filter === 'all') return true
    return note.noteType === filter
  })

  const scrollToElement = (elementId?: string) => {
    if (elementId) {
      const element = document.getElementById(elementId)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        // Highlight briefly
        element.style.backgroundColor = 'rgba(59, 130, 246, 0.1)'
        setTimeout(() => {
          element.style.backgroundColor = ''
        }, 2000)
      }
    }
  }

  const truncateText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">Loading notes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <StickyNote className="w-5 h-5" />
          Study Notes
        </h3>
      </div>

      <Tabs defaultValue="notes" className="flex-1 flex flex-col">
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

        <TabsContent value="notes" className="flex-1 m-0">
          <div className="p-4">
            {/* Note Type Filter */}
            <div className="mb-4">
              <ScrollArea className="w-full">
                <div className="flex gap-2 pb-2">
                  <Button
                    variant={filter === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter('all')}
                  >
                    All
                  </Button>
                  {Object.entries(noteTypeLabels).map(([type, label]) => (
                    <Button
                      key={type}
                      variant={filter === type ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilter(type)}
                    >
                      {label}
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            </div>

            <ScrollArea className="h-[calc(100vh-300px)]">
              {filteredNotes.length > 0 ? (
                <div className="space-y-3">
                  {filteredNotes.map((note) => (
                    <Card key={note.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-sm font-medium">
                              {note.title || 'Untitled Note'}
                            </CardTitle>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge 
                                variant="secondary" 
                                className={`text-xs ${noteTypeColors[note.noteType as keyof typeof noteTypeColors]}`}
                              >
                                {noteTypeLabels[note.noteType as keyof typeof noteTypeLabels]}
                              </Badge>
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {formatDistanceToNow(new Date(note.createdAt), { addSuffix: true })}
                              </span>
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => onEditNote(note)}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => scrollToElement(note.elementId)}
                                disabled={!note.elementId}
                              >
                                <Quote className="w-4 h-4 mr-2" />
                                Go to Text
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => onDeleteNote(note.id)}
                                className="text-destructive"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        {note.selectedText && (
                          <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded text-xs mb-2 border-l-2 border-blue-200">
                            <span className="italic">"{truncateText(note.selectedText, 80)}"</span>
                          </div>
                        )}
                        <p className="text-sm text-muted-foreground">
                          {truncateText(note.content)}
                        </p>
                        {note.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {note.tags.map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                <Tag className="w-3 h-3 mr-1" />
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                        <div className="text-xs text-muted-foreground mt-2">
                          {note.chapterTitle}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <StickyNote className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {filter === 'all' ? 'No notes yet' : `No ${noteTypeLabels[filter as keyof typeof noteTypeLabels]} notes`}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Select text to create your first note
                  </p>
                </div>
              )}
            </ScrollArea>
          </div>
        </TabsContent>

        <TabsContent value="highlights" className="flex-1 m-0">
          <div className="p-4">
            <ScrollArea className="h-[calc(100vh-250px)]">
              {highlights.length > 0 ? (
                <div className="space-y-3">
                  {highlights.map((highlight) => (
                    <Card key={highlight.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between mb-2">
                          <div 
                            className="w-4 h-4 rounded border flex-shrink-0"
                            style={{ backgroundColor: highlightColors[highlight.color as keyof typeof highlightColors] }}
                          />
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                <MoreVertical className="w-3 h-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem 
                                onClick={() => scrollToElement(highlight.elementId)}
                                disabled={!highlight.elementId}
                              >
                                <Quote className="w-4 h-4 mr-2" />
                                Go to Text
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => onDeleteHighlight(highlight.id)}
                                className="text-destructive"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <p className="text-sm font-medium mb-1">
                          "{truncateText(highlight.selectedText, 100)}"
                        </p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{highlight.chapterTitle}</span>
                          <span>{formatDistanceToNow(new Date(highlight.createdAt), { addSuffix: true })}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Highlighter className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No highlights yet</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Select text and choose a highlight color
                  </p>
                </div>
              )}
            </ScrollArea>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}