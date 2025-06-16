"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { 
  Highlighter, 
  StickyNote, 
  Quote,
  X
} from 'lucide-react'
import { TextSelection, clearSelection } from '@/lib/text-selection'

interface TextSelectionToolbarProps {
  selection: TextSelection
  position: { x: number; y: number }
  onCreateNote: (selection: TextSelection) => void
  onCreateHighlight: (selection: TextSelection, color: string) => void
  onClose: () => void
}

const highlightColors = [
  { value: 'YELLOW', label: 'Yellow', color: '#fef08a' },
  { value: 'BLUE', label: 'Blue', color: '#bfdbfe' },
  { value: 'GREEN', label: 'Green', color: '#bbf7d0' },
  { value: 'PINK', label: 'Pink', color: '#fce7f3' },
  { value: 'ORANGE', label: 'Orange', color: '#fed7aa' },
  { value: 'PURPLE', label: 'Purple', color: '#e9d5ff' },
  { value: 'RED', label: 'Red', color: '#fecaca' }
]

export function TextSelectionToolbar({
  selection,
  position,
  onCreateNote,
  onCreateHighlight,
  onClose
}: TextSelectionToolbarProps) {
  const [selectedColor, setSelectedColor] = useState('YELLOW')

  const handleCreateNote = () => {
    onCreateNote(selection)
    clearSelection()
    onClose()
  }

  const handleCreateHighlight = () => {
    onCreateHighlight(selection, selectedColor)
    clearSelection()
    onClose()
  }

  const handleQuoteNote = () => {
    // Create a note with the selected text as a quote
    onCreateNote(selection)
    clearSelection()
    onClose()
  }

  const handleClose = () => {
    clearSelection()
    onClose()
  }

  return (
    <div
      className="fixed z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-2 flex items-center gap-1"
      style={{
        left: `${position.x}px`,
        top: `${position.y - 60}px`,
        transform: 'translateX(-50%)'
      }}
    >
      {/* Highlight Button with Color Selector */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Highlighter className="w-4 h-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-48 p-2" align="center">
          <div className="space-y-2">
            <p className="text-sm font-medium">Highlight Color</p>
            <Select value={selectedColor} onValueChange={setSelectedColor}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {highlightColors.map((color) => (
                  <SelectItem key={color.value} value={color.value}>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded border"
                        style={{ backgroundColor: color.color }}
                      />
                      {color.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              onClick={handleCreateHighlight}
              className="w-full"
              size="sm"
            >
              Highlight Text
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      {/* Create Note Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleCreateNote}
        className="h-8 w-8 p-0"
        title="Create Note"
      >
        <StickyNote className="w-4 h-4" />
      </Button>

      {/* Quote Note Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleQuoteNote}
        className="h-8 w-8 p-0"
        title="Quote in Note"
      >
        <Quote className="w-4 h-4" />
      </Button>

      {/* Close Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleClose}
        className="h-8 w-8 p-0"
        title="Close"
      >
        <X className="w-4 h-4" />
      </Button>

      {/* Selection Info */}
      <div className="ml-2 pl-2 border-l border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400 max-w-32 truncate">
          "{selection.text}"
        </p>
      </div>
    </div>
  )
}