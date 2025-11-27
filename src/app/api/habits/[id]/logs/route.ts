import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthenticatedUser, AuthenticationError } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET /api/habits/[id]/logs - Get habit logs for date range
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getAuthenticatedUser();
    const { id } = await params;
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Verify habit belongs to user
    const habit = await prisma.habit.findFirst({
      where: { id, userId },
    });

    if (!habit) {
      return NextResponse.json(
        { error: 'Habit not found' },
        { status: 404 }
      );
    }

    const logs = await prisma.habitLog.findMany({
      where: {
        habitId: id,
        ...(startDate && endDate && {
          date: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        }),
      },
      orderBy: { date: 'desc' },
    });

    return NextResponse.json(logs);
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    console.error('Error fetching habit logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch habit logs' },
      { status: 500 }
    );
  }
}

// POST /api/habits/[id]/logs - Log habit completion
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getAuthenticatedUser();
    const { id } = await params;
    const body = await request.json();
    const { date } = body;

    // Verify habit belongs to user
    const habit = await prisma.habit.findFirst({
      where: { id, userId },
    });

    if (!habit) {
      return NextResponse.json(
        { error: 'Habit not found' },
        { status: 404 }
      );
    }

    const logDate = date ? new Date(date) : new Date();
    logDate.setHours(0, 0, 0, 0);

    // Check if log already exists for this date
    const existingLog = await prisma.habitLog.findFirst({
      where: {
        habitId: id,
        date: logDate,
      },
    });

    if (existingLog) {
      return NextResponse.json(
        { error: 'Habit already logged for this date' },
        { status: 400 }
      );
    }

    const log = await prisma.habitLog.create({
      data: {
        habitId: id,
        date: logDate,
      },
    });

    return NextResponse.json(log, { status: 201 });
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    console.error('Error creating habit log:', error);
    return NextResponse.json(
      { error: 'Failed to create habit log' },
      { status: 500 }
    );
  }
}

// DELETE /api/habits/[id]/logs - Delete habit log
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getAuthenticatedUser();
    const { id } = await params;
    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get('date');

    if (!date) {
      return NextResponse.json(
        { error: 'Date is required' },
        { status: 400 }
      );
    }

    // Verify habit belongs to user
    const habit = await prisma.habit.findFirst({
      where: { id, userId },
    });

    if (!habit) {
      return NextResponse.json(
        { error: 'Habit not found' },
        { status: 404 }
      );
    }

    const logDate = new Date(date);
    logDate.setHours(0, 0, 0, 0);

    // Find and delete the log
    const log = await prisma.habitLog.findFirst({
      where: {
        habitId: id,
        date: logDate,
      },
    });

    if (!log) {
      return NextResponse.json(
        { error: 'Log not found' },
        { status: 404 }
      );
    }

    await prisma.habitLog.delete({
      where: { id: log.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    console.error('Error deleting habit log:', error);
    return NextResponse.json(
      { error: 'Failed to delete habit log' },
      { status: 500 }
    );
  }
}
