"use client"

import React, { createContext, useContext, ReactNode } from 'react'
import { 
  useLocalNotes, 
  useLocalHighlights,
  type Note,
  type Highlight,
  type CreateNoteData,
  type CreateHighlightData
} from '@/hooks/use-local-storage-notes'
import { 
  useNotes as useRemoteNotes, 
  useHighlights as useRemoteHighlights 
} from '@/hooks/use-notes'

// Re-export types for easy importing
export type { Note, Highlight, CreateNoteData, CreateHighlightData } from '@/hooks/use-local-storage-notes'

// Configuration for storage type
const USE_LOCAL_STORAGE = true // Set to false to use remote database

// Context types
interface NotesContextType {
  // Notes
  notes: Note[]
  notesLoading: boolean
  notesError: string | null
  createNote: (noteData: CreateNoteData) => Promise<Note | null>
  updateNote: (noteId: string, updates: Partial<CreateNoteData>) => Promise<Note | null>
  deleteNote: (noteId: string) => Promise<boolean>
  refetchNotes: () => void

  // Highlights
  highlights: Highlight[]
  highlightsLoading: boolean
  highlightsError: string | null
  createHighlight: (highlightData: CreateHighlightData) => Promise<Highlight | null>
  updateHighlight: (highlightId: string, updates: Partial<CreateHighlightData>) => Promise<Highlight | null>
  deleteHighlight: (highlightId: string) => Promise<boolean>
  refetchHighlights: () => void

  // Migration utilities (for future use)
  exportToJson: () => { notes: Note[], highlights: Highlight[] }
  importFromJson: (data: { notes: Note[], highlights: Highlight[] }) => Promise<boolean>
}

const NotesContext = createContext<NotesContextType | undefined>(undefined)

interface NotesProviderProps {
  children: ReactNode
  workTitle?: string
  chapterTitle?: string
}

export function NotesProvider({ children, workTitle, chapterTitle }: NotesProviderProps) {
  // Choose storage method based on configuration
  const {
    notes,
    loading: notesLoading,
    error: notesError,
    createNote,
    updateNote,
    deleteNote,
    refetch: refetchNotes
  } = USE_LOCAL_STORAGE 
    ? useLocalNotes(workTitle, chapterTitle)
    : useRemoteNotes(workTitle, chapterTitle)

  const {
    highlights,
    loading: highlightsLoading,
    error: highlightsError,
    createHighlight,
    updateHighlight,
    deleteHighlight,
    refetch: refetchHighlights
  } = USE_LOCAL_STORAGE
    ? useLocalHighlights(workTitle, chapterTitle)
    : useRemoteHighlights(workTitle, chapterTitle)

  // Export data for migration
  const exportToJson = () => {
    return { notes, highlights }
  }

  // Import data (for migration from local to remote)
  const importFromJson = async (data: { notes: Note[], highlights: Highlight[] }) => {
    try {
      // This would be implemented based on the target storage system
      // For now, just update localStorage
      if (USE_LOCAL_STORAGE) {
        localStorage.setItem('orthodox-reader-notes', JSON.stringify(data.notes))
        localStorage.setItem('orthodox-reader-highlights', JSON.stringify(data.highlights))
        refetchNotes()
        refetchHighlights()
        return true
      }
      
      // For remote storage, would make API calls to create each note/highlight
      return false
    } catch {
      return false
    }
  }

  const contextValue: NotesContextType = {
    notes,
    notesLoading,
    notesError,
    createNote,
    updateNote,
    deleteNote,
    refetchNotes,
    
    highlights,
    highlightsLoading,
    highlightsError,
    createHighlight,
    updateHighlight,
    deleteHighlight,
    refetchHighlights,
    
    exportToJson,
    importFromJson
  }

  return (
    <NotesContext.Provider value={contextValue}>
      {children}
    </NotesContext.Provider>
  )
}

export function useNotesContext() {
  const context = useContext(NotesContext)
  if (!context) {
    throw new Error('useNotesContext must be used within a NotesProvider')
  }
  return context
}

// Convenience hooks that use the context
export function useContextNotes() {
  const context = useNotesContext()
  return {
    notes: context.notes,
    loading: context.notesLoading,
    error: context.notesError,
    createNote: context.createNote,
    updateNote: context.updateNote,
    deleteNote: context.deleteNote,
    refetch: context.refetchNotes
  }
}

export function useContextHighlights() {
  const context = useNotesContext()
  return {
    highlights: context.highlights,
    loading: context.highlightsLoading,
    error: context.highlightsError,
    createHighlight: context.createHighlight,
    updateHighlight: context.updateHighlight,
    deleteHighlight: context.deleteHighlight,
    refetch: context.refetchHighlights
  }
}