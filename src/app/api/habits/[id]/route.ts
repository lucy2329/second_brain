import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthenticatedUser, AuthenticationError } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET /api/habits/[id] - Get single habit with logs
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getAuthenticatedUser();
    const { id } = await params;

    const habit = await prisma.habit.findFirst({
      where: {
        id,
        userId, // Ensure user can only access their own habits
      },
      include: {
        logs: {
          orderBy: { date: 'desc' },
        },
      },
    });

    if (!habit) {
      return NextResponse.json(
        { error: 'Habit not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(habit);
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    console.error('Error fetching habit:', error);
    return NextResponse.json(
      { error: 'Failed to fetch habit' },
      { status: 500 }
    );
  }
}

// PATCH /api/habits/[id] - Update habit
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getAuthenticatedUser();
    const { id } = await params;
    const body = await request.json();
    const { name, frequency } = body;

    // Verify habit belongs to user
    const existingHabit = await prisma.habit.findFirst({
      where: { id, userId },
    });

    if (!existingHabit) {
      return NextResponse.json(
        { error: 'Habit not found' },
        { status: 404 }
      );
    }

    const habit = await prisma.habit.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(frequency && { frequency }),
      },
      include: {
        logs: true,
      },
    });

    return NextResponse.json(habit);
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    console.error('Error updating habit:', error);
    return NextResponse.json(
      { error: 'Failed to update habit' },
      { status: 500 }
    );
  }
}

// DELETE /api/habits/[id] - Delete habit
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getAuthenticatedUser();
    const { id } = await params;

    // Verify habit belongs to user
    const existingHabit = await prisma.habit.findFirst({
      where: { id, userId },
    });

    if (!existingHabit) {
      return NextResponse.json(
        { error: 'Habit not found' },
        { status: 404 }
      );
    }

    // Delete habit (logs will be cascade deleted)
    await prisma.habit.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    console.error('Error deleting habit:', error);
    return NextResponse.json(
      { error: 'Failed to delete habit' },
      { status: 500 }
    );
  }
}
