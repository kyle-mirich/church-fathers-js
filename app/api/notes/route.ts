import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/notes - Get all notes for a user
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

    const notes = await prisma.note.findMany({
      where: whereClause,
      include: {
        highlights: true,
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

    // Parse tags JSON strings back to arrays
    const notesWithParsedTags = notes.map(note => ({
      ...note,
      tags: JSON.parse(note.tags)
    }))

    return NextResponse.json(notesWithParsedTags)
  } catch (error) {
    console.error('Error fetching notes:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/notes - Create a new note
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      sessionId,
      workTitle,
      partTitle,
      chapterTitle,
      title,
      content,
      noteType = 'GENERAL',
      selectedText,
      selectionStart,
      selectionEnd,
      elementId,
      tags = [],
      isPublic = false
    } = body

    if (!sessionId || !workTitle || !chapterTitle || !content) {
      return NextResponse.json(
        { error: 'Missing required fields: sessionId, workTitle, chapterTitle, content' },
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

    const note = await prisma.note.create({
      data: {
        userId: user.id,
        workTitle,
        partTitle,
        chapterTitle,
        title,
        content,
        noteType,
        selectedText,
        selectionStart,
        selectionEnd,
        elementId,
        tags: JSON.stringify(tags),
        isPublic
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
      ...note,
      tags: JSON.parse(note.tags)
    }

    return NextResponse.json(noteWithParsedTags, { status: 201 })
  } catch (error) {
    console.error('Error creating note:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}