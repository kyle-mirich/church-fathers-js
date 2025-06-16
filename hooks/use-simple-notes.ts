"use client"

import { useState, useEffect } from 'react'

export interface SimpleNote {
  id: string
  workTitle: string
  chapterTitle: string
  title: string
  content: string
  selectedText?: string
  tags: string[]
  createdAt: string
}

export interface SimpleHighlight {
  id: string
  workTitle: string
  chapterTitle: string
  selectedText: string
  color: string
  elementId?: string
  createdAt: string
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

export function useSimpleNotes(workTitle?: string) {
  const [notes, setNotes] = useState<SimpleNote[]>([])

  // Load notes from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('reader-notes')
      if (stored) {
        const allNotes = JSON.parse(stored)
        const filteredNotes = workTitle 
          ? allNotes.filter((note: SimpleNote) => note.workTitle === workTitle)
          : allNotes
        setNotes(filteredNotes)
      }
    } catch (error) {
      console.error('Error loading notes:', error)
    }
  }, [workTitle])

  const saveNotes = (newNotes: SimpleNote[]) => {
    try {
      // Get all notes, replace ones for this work
      const stored = localStorage.getItem('reader-notes')
      const allNotes = stored ? JSON.parse(stored) : []
      
      // Remove notes for this work
      const otherNotes = allNotes.filter((note: SimpleNote) => 
        !workTitle || note.workTitle !== workTitle
      )
      
      // Add new notes
      const updatedNotes = [...otherNotes, ...newNotes]
      localStorage.setItem('reader-notes', JSON.stringify(updatedNotes))
    } catch (error) {
      console.error('Error saving notes:', error)
    }
  }

  const createNote = (noteData: {
    title: string
    content: string
    selectedText?: string
    chapterTitle: string
    tags?: string[]
  }) => {
    const newNote: SimpleNote = {
      id: generateId(),
      workTitle: workTitle || '',
      chapterTitle: noteData.chapterTitle,
      title: noteData.title,
      content: noteData.content,
      selectedText: noteData.selectedText,
      tags: noteData.tags || [],
      createdAt: new Date().toISOString()
    }

    const updatedNotes = [newNote, ...notes]
    setNotes(updatedNotes)
    saveNotes(updatedNotes)
    return newNote
  }

  const deleteNote = (noteId: string) => {
    const updatedNotes = notes.filter(note => note.id !== noteId)
    setNotes(updatedNotes)
    saveNotes(updatedNotes)
  }

  return {
    notes,
    createNote,
    deleteNote
  }
}

export function useSimpleHighlights(workTitle?: string) {
  const [highlights, setHighlights] = useState<SimpleHighlight[]>([])

  // Load highlights from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('reader-highlights')
      if (stored) {
        const allHighlights = JSON.parse(stored)
        const filteredHighlights = workTitle 
          ? allHighlights.filter((highlight: SimpleHighlight) => highlight.workTitle === workTitle)
          : allHighlights
        setHighlights(filteredHighlights)
      }
    } catch (error) {
      console.error('Error loading highlights:', error)
    }
  }, [workTitle])

  const saveHighlights = (newHighlights: SimpleHighlight[]) => {
    try {
      // Get all highlights, replace ones for this work
      const stored = localStorage.getItem('reader-highlights')
      const allHighlights = stored ? JSON.parse(stored) : []
      
      // Remove highlights for this work
      const otherHighlights = allHighlights.filter((highlight: SimpleHighlight) => 
        !workTitle || highlight.workTitle !== workTitle
      )
      
      // Add new highlights
      const updatedHighlights = [...otherHighlights, ...newHighlights]
      localStorage.setItem('reader-highlights', JSON.stringify(updatedHighlights))
    } catch (error) {
      console.error('Error saving highlights:', error)
    }
  }

  const createHighlight = (highlightData: {
    selectedText: string
    color: string
    chapterTitle: string
    elementId?: string
  }) => {
    const newHighlight: SimpleHighlight = {
      id: generateId(),
      workTitle: workTitle || '',
      chapterTitle: highlightData.chapterTitle,
      selectedText: highlightData.selectedText,
      color: highlightData.color,
      elementId: highlightData.elementId,
      createdAt: new Date().toISOString()
    }

    const updatedHighlights = [newHighlight, ...highlights]
    setHighlights(updatedHighlights)
    saveHighlights(updatedHighlights)
    return newHighlight
  }

  const deleteHighlight = (highlightId: string) => {
    const updatedHighlights = highlights.filter(highlight => highlight.id !== highlightId)
    setHighlights(updatedHighlights)
    saveHighlights(updatedHighlights)
  }

  return {
    highlights,
    createHighlight,
    deleteHighlight
  }
}