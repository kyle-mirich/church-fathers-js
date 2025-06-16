"use client"

import React, { useState } from 'react'
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

interface SimpleNoteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedText?: string
  onSave: (data: { title: string; content: string }) => void
}

export function SimpleNoteDialog({
  open,
  onOpenChange,
  selectedText,
  onSave
}: SimpleNoteDialogProps) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState(selectedText ? `"${selectedText}"\n\n` : '')

  const handleSave = () => {
    if (content.trim()) {
      onSave({
        title: title || 'Untitled Note',
        content: content.trim()
      })
      setTitle('')
      setContent('')
      onOpenChange(false)
    }
  }

  const handleClose = () => {
    setTitle('')
    setContent('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Note</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {selectedText && (
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded border-l-4 border-blue-200">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                Selected Text:
              </p>
              <p className="text-sm text-blue-800 dark:text-blue-200 italic">
                "{selectedText}"
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter note title..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your note here..."
              rows={6}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!content.trim()}>
            Save Note
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}