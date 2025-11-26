import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthenticatedUser, AuthenticationError } from '@/lib/auth';

// GET /api/notes - List all notes
export async function GET(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUser();
    const searchParams = request.nextUrl.searchParams;
    const paraType = searchParams.get('paraType');
    const tags = searchParams.get('tags')?.split(',').filter(Boolean);

    const notes = await prisma.note.findMany({
      where: {
        userId,
        ...(paraType && { paraType: paraType as any }),
        ...(tags && tags.length > 0 && { tags: { hasSome: tags } }),
      },
      orderBy: {
        updatedAt: 'desc' },
    });

    return NextResponse.json(notes);
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    console.error('Error fetching notes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notes' },
      { status: 500 }
    );
  }
}

// POST /api/notes - Create a new note
export async function POST(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUser();
    const body = await request.json();
    const { title, content, paraType, tags, linkedNoteIds } = body;

    // Validation
    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }

    const note = await prisma.note.create({
      data: {
        title,
        content,
        paraType: paraType || 'RESOURCE',
        tags: tags || [],
        linkedNoteIds: linkedNoteIds || [],
        userId,
      },
    });

    // TODO: Generate embedding in background job
    // await generateEmbedding(note.id, `${title} ${content}`);

    return NextResponse.json(note, { status: 201 });
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    console.error('Error creating note:', error);
    return NextResponse.json(
      { error: 'Failed to create note' },
      { status: 500 }
    );
  }
}
