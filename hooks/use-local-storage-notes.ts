import { useState, useEffect, useCallback } from 'react'

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

// Generate unique ID
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

// Get session ID
function getSessionId(): string {
  if (typeof window === 'undefined') return ''
  
  let sessionId = localStorage.getItem('orthodox-reader-session')
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    localStorage.setItem('orthodox-reader-session', sessionId)
  }
  return sessionId
}

export function useLocalNotes(workTitle?: string, chapterTitle?: string) {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sessionId = getSessionId()

  // Load notes from localStorage
  const loadNotes = useCallback(() => {
    try {
      const stored = localStorage.getItem('orthodox-reader-notes')
      const allNotes = stored ? JSON.parse(stored) : []
      
      let filteredNotes = allNotes.filter((note: Note) => note.userId === sessionId)
      
      if (workTitle) {
        filteredNotes = filteredNotes.filter((note: Note) => note.workTitle === workTitle)
      }
      
      if (chapterTitle) {
        filteredNotes = filteredNotes.filter((note: Note) => note.chapterTitle === chapterTitle)
      }
      
      setNotes(filteredNotes)
    } catch (err) {
      setError('Failed to load notes')
    }
  }, [sessionId, workTitle, chapterTitle])

  // Save notes to localStorage
  const saveNotes = useCallback((newNotes: Note[]) => {
    try {
      const stored = localStorage.getItem('orthodox-reader-notes')
      const allNotes = stored ? JSON.parse(stored) : []
      
      // Remove old notes for this user
      const otherNotes = allNotes.filter((note: Note) => note.userId !== sessionId)
      
      // Add new notes
      const updatedNotes = [...otherNotes, ...newNotes]
      
      localStorage.setItem('orthodox-reader-notes', JSON.stringify(updatedNotes))
    } catch (err) {
      setError('Failed to save notes')
    }
  }, [sessionId])

  // Create note
  const createNote = useCallback(async (noteData: CreateNoteData): Promise<Note | null> => {
    try {
      const newNote: Note = {
        id: generateId(),
        userId: sessionId,
        workTitle: noteData.workTitle,
        partTitle: noteData.partTitle,
        chapterTitle: noteData.chapterTitle,
        title: noteData.title,
        content: noteData.content,
        noteType: noteData.noteType || 'GENERAL',
        selectedText: noteData.selectedText,
        selectionStart: noteData.selectionStart,
        selectionEnd: noteData.selectionEnd,
        elementId: noteData.elementId,
        tags: noteData.tags || [],
        isPublic: noteData.isPublic || false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        user: { id: sessionId }
      }
      
      const updatedNotes = [newNote, ...notes]
      setNotes(updatedNotes)
      saveNotes(updatedNotes)
      
      return newNote
    } catch (err) {
      setError('Failed to create note')
      return null
    }
  }, [sessionId, notes, saveNotes])

  // Update note
  const updateNote = useCallback(async (noteId: string, updates: Partial<CreateNoteData>): Promise<Note | null> => {
    try {
      const updatedNotes = notes.map(note => 
        note.id === noteId 
          ? { ...note, ...updates, updatedAt: new Date().toISOString() }
          : note
      )
      
      setNotes(updatedNotes)
      saveNotes(updatedNotes)
      
      return updatedNotes.find(note => note.id === noteId) || null
    } catch (err) {
      setError('Failed to update note')
      return null
    }
  }, [notes, saveNotes])

  // Delete note
  const deleteNote = useCallback(async (noteId: string): Promise<boolean> => {
    try {
      const updatedNotes = notes.filter(note => note.id !== noteId)
      setNotes(updatedNotes)
      saveNotes(updatedNotes)
      return true
    } catch (err) {
      setError('Failed to delete note')
      return false
    }
  }, [notes, saveNotes])

  // Load notes on mount
  useEffect(() => {
    loadNotes()
  }, [loadNotes])

  return {
    notes,
    loading,
    error,
    refetch: loadNotes,
    createNote,
    updateNote,
    deleteNote
  }
}

export function useLocalHighlights(workTitle?: string, chapterTitle?: string) {
  const [highlights, setHighlights] = useState<Highlight[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sessionId = getSessionId()

  // Load highlights from localStorage
  const loadHighlights = useCallback(() => {
    try {
      const stored = localStorage.getItem('orthodox-reader-highlights')
      const allHighlights = stored ? JSON.parse(stored) : []
      
      let filteredHighlights = allHighlights.filter((highlight: Highlight) => highlight.userId === sessionId)
      
      if (workTitle) {
        filteredHighlights = filteredHighlights.filter((highlight: Highlight) => highlight.workTitle === workTitle)
      }
      
      if (chapterTitle) {
        filteredHighlights = filteredHighlights.filter((highlight: Highlight) => highlight.chapterTitle === chapterTitle)
      }
      
      setHighlights(filteredHighlights)
    } catch (err) {
      setError('Failed to load highlights')
    }
  }, [sessionId, workTitle, chapterTitle])

  // Save highlights to localStorage
  const saveHighlights = useCallback((newHighlights: Highlight[]) => {
    try {
      const stored = localStorage.getItem('orthodox-reader-highlights')
      const allHighlights = stored ? JSON.parse(stored) : []
      
      // Remove old highlights for this user
      const otherHighlights = allHighlights.filter((highlight: Highlight) => highlight.userId !== sessionId)
      
      // Add new highlights
      const updatedHighlights = [...otherHighlights, ...newHighlights]
      
      localStorage.setItem('orthodox-reader-highlights', JSON.stringify(updatedHighlights))
    } catch (err) {
      setError('Failed to save highlights')
    }
  }, [sessionId])

  // Create highlight
  const createHighlight = useCallback(async (highlightData: CreateHighlightData): Promise<Highlight | null> => {
    try {
      const newHighlight: Highlight = {
        id: generateId(),
        userId: sessionId,
        noteId: highlightData.noteId,
        workTitle: highlightData.workTitle,
        partTitle: highlightData.partTitle,
        chapterTitle: highlightData.chapterTitle,
        selectedText: highlightData.selectedText,
        color: highlightData.color || 'YELLOW',
        selectionStart: highlightData.selectionStart,
        selectionEnd: highlightData.selectionEnd,
        elementId: highlightData.elementId,
        xpath: highlightData.xpath,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        user: { id: sessionId }
      }
      
      const updatedHighlights = [newHighlight, ...highlights]
      setHighlights(updatedHighlights)
      saveHighlights(updatedHighlights)
      
      return newHighlight
    } catch (err) {
      setError('Failed to create highlight')
      return null
    }
  }, [sessionId, highlights, saveHighlights])

  // Update highlight
  const updateHighlight = useCallback(async (highlightId: string, updates: Partial<CreateHighlightData>): Promise<Highlight | null> => {
    try {
      const updatedHighlights = highlights.map(highlight => 
        highlight.id === highlightId 
          ? { ...highlight, ...updates, updatedAt: new Date().toISOString() }
          : highlight
      )
      
      setHighlights(updatedHighlights)
      saveHighlights(updatedHighlights)
      
      return updatedHighlights.find(highlight => highlight.id === highlightId) || null
    } catch (err) {
      setError('Failed to update highlight')
      return null
    }
  }, [highlights, saveHighlights])

  // Delete highlight
  const deleteHighlight = useCallback(async (highlightId: string): Promise<boolean> => {
    try {
      const updatedHighlights = highlights.filter(highlight => highlight.id !== highlightId)
      setHighlights(updatedHighlights)
      saveHighlights(updatedHighlights)
      return true
    } catch (err) {
      setError('Failed to delete highlight')
      return false
    }
  }, [highlights, saveHighlights])

  // Load highlights on mount
  useEffect(() => {
    loadHighlights()
  }, [loadHighlights])

  return {
    highlights,
    loading,
    error,
    refetch: loadHighlights,
    createHighlight,
    updateHighlight,
    deleteHighlight
  }
}