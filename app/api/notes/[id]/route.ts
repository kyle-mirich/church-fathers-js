import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/notes/[id] - Get a specific note
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const note = await prisma.note.findUnique({
      where: { id: params.id },
      include: {
        highlights: true,
        user: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    if (!note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 })
    }

    // Parse tags JSON string back to array
    const noteWithParsedTags = {
      ...note,
      tags: JSON.parse(note.tags)
    }

    return NextResponse.json(noteWithParsedTags)
  } catch (error) {
    console.error('Error fetching note:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/notes/[id] - Update a note
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const {
      sessionId,
      title,
      content,
      noteType,
      selectedText,
      selectionStart,
      selectionEnd,
      elementId,
      tags,
      isPublic
    } = body

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 })
    }

    // Verify user owns this note
    const existingNote = await prisma.note.findUnique({
      where: { id: params.id },
      include: { user: true }
    })

    if (!existingNote) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 })
    }

    if (existingNote.user.sessionId !== sessionId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const updatedNote = await prisma.note.update({
      where: { id: params.id },
      data: {
        title,
        content,
        noteType,
        selectedText,
        selectionStart,
        selectionEnd,
        elementId,
        tags: tags ? JSON.stringify(tags) : undefined,
        isPublic,
        updatedAt: new Date()
      },
      include: {
        highlights: true,
        user: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    // Parse tags back to array for response
    const noteWithParsedTags = {
      ...updatedNote,
      tags: JSON.parse(updatedNote.tags)
    }

    return NextResponse.json(noteWithParsedTags)
  } catch (error) {
    console.error('Error updating note:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/notes/[id] - Delete a note
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 })
    }

    // Verify user owns this note
    const existingNote = await prisma.note.findUnique({
      where: { id: params.id },
      include: { user: true }
    })

    if (!existingNote) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 })
    }

    if (existingNote.user.sessionId !== sessionId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    await prisma.note.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Note deleted successfully' })
  } catch (error) {
    console.error('Error deleting note:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}