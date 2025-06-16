import { useState, useEffect, useCallback } from 'react'
import { getSessionId } from '@/lib/text-selection'

export interface Note {
  id: string
  userId: string
  workTitle: string
  partTitle?: string
  chapterTitle: string
  title?: string
  content: string
  noteType: string
  selectedText?: string
  selectionStart?: number
  selectionEnd?: number
  elementId?: string
  isPublic: boolean
  tags: string[]
  createdAt: string
  updatedAt: string
  highlights?: Highlight[]
  user: {
    id: string
    name?: string
  }
}

export interface Highlight {
  id: string
  userId: string
  noteId?: string
  workTitle: string
  partTitle?: string
  chapterTitle: string
  selectedText: string
  color: string
  selectionStart: number
  selectionEnd: number
  elementId?: string
  xpath?: string
  createdAt: string
  updatedAt: string
  note?: Note
  user: {
    id: string
    name?: string
  }
}

export interface CreateNoteData {
  workTitle: string
  partTitle?: string
  chapterTitle: string
  title?: string
  content: string
  noteType?: string
  selectedText?: string
  selectionStart?: number
  selectionEnd?: number
  elementId?: string
  tags?: string[]
  isPublic?: boolean
}

export interface CreateHighlightData {
  noteId?: string
  workTitle: string
  partTitle?: string
  chapterTitle: string
  selectedText: string
  color?: string
  selectionStart: number
  selectionEnd: number
  elementId?: string
  xpath?: string
}

export function useNotes(workTitle?: string, chapterTitle?: string) {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sessionId = getSessionId()

  // Fetch notes
  const fetchNotes = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const params = new URLSearchParams({ sessionId })
      if (workTitle) params.append('workTitle', workTitle)
      if (chapterTitle) params.append('chapterTitle', chapterTitle)
      
      const response = await fetch(`/api/notes?${params}`)
      if (!response.ok) throw new Error('Failed to fetch notes')
      
      const data = await response.json()
      setNotes(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [sessionId, workTitle, chapterTitle])

  // Create note
  const createNote = useCallback(async (noteData: CreateNoteData): Promise<Note | null> => {
    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, ...noteData })
      })
      
      if (!response.ok) throw new Error('Failed to create note')
      
      const newNote = await response.json()
      setNotes(prev => [newNote, ...prev])
      return newNote
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      return null
    }
  }, [sessionId])

  // Update note
  const updateNote = useCallback(async (noteId: string, updates: Partial<CreateNoteData>): Promise<Note | null> => {
    try {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, ...updates })
      })
      
      if (!response.ok) throw new Error('Failed to update note')
      
      const updatedNote = await response.json()
      setNotes(prev => prev.map(note => note.id === noteId ? updatedNote : note))
      return updatedNote
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      return null
    }
  }, [sessionId])

  // Delete note
  const deleteNote = useCallback(async (noteId: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/notes/${noteId}?sessionId=${sessionId}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) throw new Error('Failed to delete note')
      
      setNotes(prev => prev.filter(note => note.id !== noteId))
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      return false
    }
  }, [sessionId])

  // Load notes on mount and when dependencies change
  useEffect(() => {
    fetchNotes()
  }, [fetchNotes])

  return {
    notes,
    loading,
    error,
    refetch: fetchNotes,
    createNote,
    updateNote,
    deleteNote
  }
}

export function useHighlights(workTitle?: string, chapterTitle?: string) {
  const [highlights, setHighlights] = useState<Highlight[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sessionId = getSessionId()

  // Fetch highlights
  const fetchHighlights = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const params = new URLSearchParams({ sessionId })
      if (workTitle) params.append('workTitle', workTitle)
      if (chapterTitle) params.append('chapterTitle', chapterTitle)
      
      const response = await fetch(`/api/highlights?${params}`)
      if (!response.ok) throw new Error('Failed to fetch highlights')
      
      const data = await response.json()
      setHighlights(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [sessionId, workTitle, chapterTitle])

  // Create highlight
  const createHighlight = useCallback(async (highlightData: CreateHighlightData): Promise<Highlight | null> => {
    try {
      const response = await fetch('/api/highlights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, ...highlightData })
      })
      
      if (!response.ok) throw new Error('Failed to create highlight')
      
      const newHighlight = await response.json()
      setHighlights(prev => [newHighlight, ...prev])
      return newHighlight
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      return null
    }
  }, [sessionId])

  // Update highlight
  const updateHighlight = useCallback(async (highlightId: string, updates: Partial<CreateHighlightData>): Promise<Highlight | null> => {
    try {
      const response = await fetch(`/api/highlights/${highlightId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, ...updates })
      })
      
      if (!response.ok) throw new Error('Failed to update highlight')
      
      const updatedHighlight = await response.json()
      setHighlights(prev => prev.map(highlight => highlight.id === highlightId ? updatedHighlight : highlight))
      return updatedHighlight
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      return null
    }
  }, [sessionId])

  // Delete highlight
  const deleteHighlight = useCallback(async (highlightId: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/highlights/${highlightId}?sessionId=${sessionId}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) throw new Error('Failed to delete highlight')
      
      setHighlights(prev => prev.filter(highlight => highlight.id !== highlightId))
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      return false
    }
  }, [sessionId])

  // Load highlights on mount and when dependencies change
  useEffect(() => {
    fetchHighlights()
  }, [fetchHighlights])

  return {
    highlights,
    loading,
    error,
    refetch: fetchHighlights,
    createHighlight,
    updateHighlight,
    deleteHighlight
  }
}