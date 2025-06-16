import { Note, Highlight } from '@/lib/notes-provider'

// Export data from localStorage
export function exportLocalStorageData(): { notes: Note[], highlights: Highlight[] } {
  try {
    const notesStr = localStorage.getItem('orthodox-reader-notes')
    const highlightsStr = localStorage.getItem('orthodox-reader-highlights')
    
    const notes = notesStr ? JSON.parse(notesStr) : []
    const highlights = highlightsStr ? JSON.parse(highlightsStr) : []
    
    return { notes, highlights }
  } catch (error) {
    console.error('Error exporting data:', error)
    return { notes: [], highlights: [] }
  }
}

// Import data to localStorage (for testing or backup restoration)
export function importToLocalStorage(data: { notes: Note[], highlights: Highlight[] }): boolean {
  try {
    localStorage.setItem('orthodox-reader-notes', JSON.stringify(data.notes))
    localStorage.setItem('orthodox-reader-highlights', JSON.stringify(data.highlights))
    return true
  } catch (error) {
    console.error('Error importing data:', error)
    return false
  }
}

// Migrate data from localStorage to Supabase/PostgreSQL
export async function migrateToSupabase(data: { notes: Note[], highlights: Highlight[] }): Promise<boolean> {
  try {
    // This would be implemented when you set up Supabase
    // For now, just log what would be migrated
    console.log('Would migrate to Supabase:', {
      notesCount: data.notes.length,
      highlightsCount: data.highlights.length
    })
    
    // Implementation would look like:
    /*
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // Migrate notes
    for (const note of data.notes) {
      await supabase.from('notes').insert({
        id: note.id,
        user_id: note.userId,
        work_title: note.workTitle,
        part_title: note.partTitle,
        chapter_title: note.chapterTitle,
        title: note.title,
        content: note.content,
        note_type: note.noteType,
        selected_text: note.selectedText,
        selection_start: note.selectionStart,
        selection_end: note.selectionEnd,
        element_id: note.elementId,
        is_public: note.isPublic,
        tags: note.tags,
        created_at: note.createdAt,
        updated_at: note.updatedAt
      })
    }
    
    // Migrate highlights
    for (const highlight of data.highlights) {
      await supabase.from('highlights').insert({
        id: highlight.id,
        user_id: highlight.userId,
        note_id: highlight.noteId,
        work_title: highlight.workTitle,
        part_title: highlight.partTitle,
        chapter_title: highlight.chapterTitle,
        selected_text: highlight.selectedText,
        color: highlight.color,
        selection_start: highlight.selectionStart,
        selection_end: highlight.selectionEnd,
        element_id: highlight.elementId,
        xpath: highlight.xpath,
        created_at: highlight.createdAt,
        updated_at: highlight.updatedAt
      })
    }
    */
    
    return true
  } catch (error) {
    console.error('Error migrating to Supabase:', error)
    return false
  }
}

// Export data as JSON file for backup
export function downloadDataAsJson(): void {
  const data = exportLocalStorageData()
  const dataStr = JSON.stringify(data, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  
  const url = URL.createObjectURL(dataBlob)
  const link = document.createElement('a')
  link.href = url
  link.download = `orthodox-reader-backup-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// Import data from JSON file
export function uploadJsonFile(file: File): Promise<{ notes: Note[], highlights: Highlight[] } | null> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string)
        if (data.notes && data.highlights) {
          resolve(data)
        } else {
          resolve(null)
        }
      } catch (error) {
        console.error('Error parsing JSON file:', error)
        resolve(null)
      }
    }
    reader.readAsText(file)
  })
}

// Get storage statistics
export function getStorageStats(): { 
  notesCount: number, 
  highlightsCount: number, 
  storageSize: string,
  oldestNote?: string,
  newestNote?: string
} {
  const data = exportLocalStorageData()
  const dataStr = JSON.stringify(data)
  const sizeInBytes = new Blob([dataStr]).size
  const sizeInKB = (sizeInBytes / 1024).toFixed(2)
  
  let oldestNote, newestNote
  if (data.notes.length > 0) {
    const sortedNotes = [...data.notes].sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    )
    oldestNote = sortedNotes[0].createdAt
    newestNote = sortedNotes[sortedNotes.length - 1].createdAt
  }
  
  return {
    notesCount: data.notes.length,
    highlightsCount: data.highlights.length,
    storageSize: `${sizeInKB} KB`,
    oldestNote,
    newestNote
  }
}