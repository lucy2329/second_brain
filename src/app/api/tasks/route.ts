import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthenticatedUser, AuthenticationError } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET /api/tasks - List all tasks
export async function GET(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUser();
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');

    const tasks = await prisma.task.findMany({
      where: {
        userId,
        ...(status && { status: status as any }),
      },
      orderBy: [
        { status: 'asc' },
        { position: 'asc' },
      ],
    });

    return NextResponse.json(tasks);
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}

// POST /api/tasks - Create a new task
export async function POST(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUser();
    const body = await request.json();
    const { title, description, status, dueDate, tags, category, linkedNoteId } = body;

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    // Get the max position for the status column (scoped to user)
    const maxPositionTask = await prisma.task.findFirst({
      where: { 
        userId,
        status: status || 'BACKLOG' 
      },
      orderBy: { position: 'desc' },
    });

    const task = await prisma.task.create({
      data: {
        title,
        description,
        status: status || 'BACKLOG',
        dueDate: dueDate ? new Date(dueDate) : null,
        tags: tags || [],
        category,
        linkedNoteId,
        position: (maxPositionTask?.position || 0) + 1,
        userId,
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    console.error('Error creating task:', error);
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    );
  }
}
