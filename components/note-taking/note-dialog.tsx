"use client"

import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { X } from 'lucide-react'
import { Note, CreateNoteData } from '@/lib/notes-provider'
import { TextSelection } from '@/lib/text-selection'

interface NoteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (noteData: CreateNoteData) => Promise<Note | null>
  workTitle: string
  partTitle?: string
  chapterTitle: string
  selection?: TextSelection
  existingNote?: Note
}

const noteTypes = [
  { value: 'GENERAL', label: 'General Note' },
  { value: 'QUESTION', label: 'Question' },
  { value: 'INSIGHT', label: 'Insight' },
  { value: 'CROSS_REF', label: 'Cross Reference' },
  { value: 'PRAYER', label: 'Prayer/Reflection' },
  { value: 'COMMENTARY', label: 'Commentary' }
]

export function NoteDialog({
  open,
  onOpenChange,
  onSave,
  workTitle,
  partTitle,
  chapterTitle,
  selection,
  existingNote
}: NoteDialogProps) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [noteType, setNoteType] = useState('GENERAL')
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState('')
  const [isPublic, setIsPublic] = useState(false)
  const [saving, setSaving] = useState(false)

  // Initialize form with existing note data or selection
  useEffect(() => {
    if (existingNote) {
      setTitle(existingNote.title || '')
      setContent(existingNote.content)
      setNoteType(existingNote.noteType)
      setTags(existingNote.tags)
      setIsPublic(existingNote.isPublic)
    } else if (selection) {
      // Pre-fill with selection if creating new note
      setTitle('')
      setContent(selection.text ? `"${selection.text}"\n\n` : '')
      setNoteType('GENERAL')
      setTags([])
      setIsPublic(false)
    } else {
      // Reset form
      setTitle('')
      setContent('')
      setNoteType('GENERAL')
      setTags([])
      setIsPublic(false)
    }
  }, [existingNote, selection, open])

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()])
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      addTag()
    }
  }

  const handleSave = async () => {
    if (!content.trim()) return

    setSaving(true)
    try {
      const noteData: CreateNoteData = {
        workTitle,
        partTitle,
        chapterTitle,
        title: title.trim() || undefined,
        content: content.trim(),
        noteType,
        tags,
        isPublic,
        ...(selection && {
          selectedText: selection.text,
          selectionStart: selection.startOffset,
          selectionEnd: selection.endOffset,
          elementId: selection.elementId
        })
      }

      const result = await onSave(noteData)
      if (result) {
        onOpenChange(false)
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {existingNote ? 'Edit Note' : 'Create Note'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Location Info */}
          <div className="text-sm text-muted-foreground bg-muted p-3 rounded">
            <strong>{workTitle}</strong>
            {partTitle && <> → {partTitle}</>}
            <> → {chapterTitle}</>
          </div>

          {/* Selected Text Preview */}
          {selection?.text && (
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded border-l-4 border-blue-200 dark:border-blue-800">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                Selected Text:
              </p>
              <p className="text-sm text-blue-800 dark:text-blue-200 italic">
                "{selection.text}"
              </p>
            </div>
          )}

          {/* Note Type */}
          <div className="space-y-2">
            <Label htmlFor="noteType">Note Type</Label>
            <Select value={noteType} onValueChange={setNoteType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {noteTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title (Optional)</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a title for your note..."
            />
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content">Note Content *</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your note here..."
              rows={8}
              className="resize-none"
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="gap-1">
                  {tag}
                  <X 
                    className="w-3 h-3 cursor-pointer hover:text-destructive" 
                    onClick={() => removeTag(tag)}
                  />
                </Badge>
              ))}
            </div>
            <Input
              id="tags"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Add tags (press Enter to add)..."
            />
          </div>

          {/* Public Toggle */}
          <div className="flex items-center space-x-2">
            <Switch
              id="isPublic"
              checked={isPublic}
              onCheckedChange={setIsPublic}
            />
            <Label htmlFor="isPublic">Make this note public</Label>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!content.trim() || saving}
          >
            {saving ? 'Saving...' : existingNote ? 'Update Note' : 'Create Note'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}