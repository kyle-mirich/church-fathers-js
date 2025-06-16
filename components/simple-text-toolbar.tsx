"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Highlighter, StickyNote, X } from 'lucide-react'

interface SimpleTextToolbarProps {
  selectedText: string
  position: { x: number; y: number }
  onCreateNote: () => void
  onCreateHighlight: (color: string) => void
  onClose: () => void
}

const colors = [
  { name: 'Yellow', value: 'yellow', bg: '#fef08a' },
  { name: 'Blue', value: 'blue', bg: '#bfdbfe' },
  { name: 'Green', value: 'green', bg: '#bbf7d0' },
  { name: 'Pink', value: 'pink', bg: '#fce7f3' },
  { name: 'Orange', value: 'orange', bg: '#fed7aa' }
]

export function SimpleTextToolbar({
  selectedText,
  position,
  onCreateNote,
  onCreateHighlight,
  onClose
}: SimpleTextToolbarProps) {
  const [showColors, setShowColors] = useState(false)

  return (
    <div
      className="fixed z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-2 flex items-center gap-1"
      style={{
        left: `${position.x}px`,
        top: `${position.y - 60}px`,
        transform: 'translateX(-50%)'
      }}
    >
      {/* Note Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onCreateNote}
        className="h-8 w-8 p-0"
        title="Create Note"
      >
        <StickyNote className="w-4 h-4" />
      </Button>

      {/* Highlight Button */}
      <div className="relative">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowColors(!showColors)}
          className="h-8 w-8 p-0"
          title="Highlight"
        >
          <Highlighter className="w-4 h-4" />
        </Button>
        
        {showColors && (
          <div className="absolute top-10 left-0 bg-white dark:bg-gray-800 border rounded-lg shadow-lg p-2 flex gap-1">
            {colors.map((color) => (
              <button
                key={color.value}
                onClick={() => {
                  onCreateHighlight(color.value)
                  setShowColors(false)
                }}
                className="w-6 h-6 rounded border-2 hover:border-gray-400"
                style={{ backgroundColor: color.bg }}
                title={color.name}
              />
            ))}
          </div>
        )}
      </div>

      {/* Close Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onClose}
        className="h-8 w-8 p-0"
        title="Close"
      >
        <X className="w-4 h-4" />
      </Button>

      {/* Selection Preview */}
      <div className="ml-2 pl-2 border-l border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400 max-w-32 truncate">
          "{selectedText}"
        </p>
      </div>
    </div>
  )
}