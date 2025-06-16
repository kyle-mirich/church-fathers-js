import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/highlights/[id] - Get a specific highlight
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const highlight = await prisma.highlight.findUnique({
      where: { id: params.id },
      include: {
        note: true,
        user: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    if (!highlight) {
      return NextResponse.json({ error: 'Highlight not found' }, { status: 404 })
    }

    return NextResponse.json(highlight)
  } catch (error) {
    console.error('Error fetching highlight:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/highlights/[id] - Update a highlight
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const {
      sessionId,
      noteId,
      color,
      selectedText,
      selectionStart,
      selectionEnd,
      elementId,
      xpath
    } = body

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 })
    }

    // Verify user owns this highlight
    const existingHighlight = await prisma.highlight.findUnique({
      where: { id: params.id },
      include: { user: true }
    })

    if (!existingHighlight) {
      return NextResponse.json({ error: 'Highlight not found' }, { status: 404 })
    }

    if (existingHighlight.user.sessionId !== sessionId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Verify note belongs to user if noteId provided
    if (noteId) {
      const note = await prisma.note.findUnique({
        where: { id: noteId },
        include: { user: true }
      })

      if (!note || note.user.sessionId !== sessionId) {
        return NextResponse.json({ error: 'Invalid note ID or unauthorized' }, { status: 403 })
      }
    }

    const updatedHighlight = await prisma.highlight.update({
      where: { id: params.id },
      data: {
        noteId,
        color,
        selectedText,
        selectionStart,
        selectionEnd,
        elementId,
        xpath,
        updatedAt: new Date()
      },
      include: {
        note: true,
        user: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    return NextResponse.json(updatedHighlight)
  } catch (error) {
    console.error('Error updating highlight:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/highlights/[id] - Delete a highlight
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

    // Verify user owns this highlight
    const existingHighlight = await prisma.highlight.findUnique({
      where: { id: params.id },
      include: { user: true }
    })

    if (!existingHighlight) {
      return NextResponse.json({ error: 'Highlight not found' }, { status: 404 })
    }

    if (existingHighlight.user.sessionId !== sessionId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    await prisma.highlight.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Highlight deleted successfully' })
  } catch (error) {
    console.error('Error deleting highlight:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}