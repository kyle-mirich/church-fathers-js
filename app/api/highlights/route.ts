import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/highlights - Get all highlights for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')
    const workTitle = searchParams.get('workTitle')
    const chapterTitle = searchParams.get('chapterTitle')

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 })
    }

    // Get or create user
    let user = await prisma.user.findUnique({
      where: { sessionId }
    })

    if (!user) {
      user = await prisma.user.create({
        data: { sessionId }
      })
    }

    // Build query filters
    const whereClause: any = {
      userId: user.id
    }

    if (workTitle) {
      whereClause.workTitle = workTitle
    }

    if (chapterTitle) {
      whereClause.chapterTitle = chapterTitle
    }

    const highlights = await prisma.highlight.findMany({
      where: whereClause,
      include: {
        note: true,
        user: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(highlights)
  } catch (error) {
    console.error('Error fetching highlights:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/highlights - Create a new highlight
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      sessionId,
      noteId,
      workTitle,
      partTitle,
      chapterTitle,
      selectedText,
      color = 'YELLOW',
      selectionStart,
      selectionEnd,
      elementId,
      xpath
    } = body

    if (!sessionId || !workTitle || !chapterTitle || !selectedText || !selectionStart || !selectionEnd) {
      return NextResponse.json(
        { error: 'Missing required fields: sessionId, workTitle, chapterTitle, selectedText, selectionStart, selectionEnd' },
        { status: 400 }
      )
    }

    // Get or create user
    let user = await prisma.user.findUnique({
      where: { sessionId }
    })

    if (!user) {
      user = await prisma.user.create({
        data: { sessionId }
      })
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

    const highlight = await prisma.highlight.create({
      data: {
        userId: user.id,
        noteId,
        workTitle,
        partTitle,
        chapterTitle,
        selectedText,
        color,
        selectionStart,
        selectionEnd,
        elementId,
        xpath
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

    return NextResponse.json(highlight, { status: 201 })
  } catch (error) {
    console.error('Error creating highlight:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}