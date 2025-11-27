import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthenticatedUser, AuthenticationError } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET /api/habits - List all habits with stats
export async function GET(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUser();

    const habits = await prisma.habit.findMany({
      where: { userId },
      include: {
        logs: {
          orderBy: { date: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate stats for each habit
    const habitsWithStats = habits.map(habit => {
      const logs = habit.logs;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Calculate current streak
      let currentStreak = 0;
      const sortedLogs = [...logs].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      let checkDate = new Date(today);
      for (const log of sortedLogs) {
        const logDate = new Date(log.date);
        logDate.setHours(0, 0, 0, 0);
        
        if (logDate.getTime() === checkDate.getTime()) {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else if (logDate.getTime() < checkDate.getTime()) {
          break;
        }
      }

      // Calculate longest streak
      let longestStreak = 0;
      let tempStreak = 0;
      let prevDate: Date | null = null;

      for (const log of sortedLogs) {
        const logDate = new Date(log.date);
        logDate.setHours(0, 0, 0, 0);

        if (!prevDate) {
          tempStreak = 1;
        } else {
          const dayDiff = Math.floor(
            (prevDate.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24)
          );
          
          if (dayDiff === 1) {
            tempStreak++;
          } else {
            longestStreak = Math.max(longestStreak, tempStreak);
            tempStreak = 1;
          }
        }
        
        prevDate = logDate;
      }
      longestStreak = Math.max(longestStreak, tempStreak);

      // Check if completed today
      const completedToday = logs.some(log => {
        const logDate = new Date(log.date);
        logDate.setHours(0, 0, 0, 0);
        return logDate.getTime() === today.getTime();
      });

      return {
        ...habit,
        stats: {
          currentStreak,
          longestStreak,
          completedToday,
          totalCompletions: logs.length,
        },
      };
    });

    return NextResponse.json(habitsWithStats);
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    console.error('Error fetching habits:', error);
    return NextResponse.json(
      { error: 'Failed to fetch habits' },
      { status: 500 }
    );
  }
}

// POST /api/habits - Create a new habit
export async function POST(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUser();
    const body = await request.json();
    const { name, frequency } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    const habit = await prisma.habit.create({
      data: {
        name,
        frequency: frequency || 'DAILY',
        userId,
      },
      include: {
        logs: true,
      },
    });

    return NextResponse.json({
      ...habit,
      stats: {
        currentStreak: 0,
        longestStreak: 0,
        completedToday: false,
        totalCompletions: 0,
      },
    }, { status: 201 });
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    console.error('Error creating habit:', error);
    return NextResponse.json(
      { error: 'Failed to create habit' },
      { status: 500 }
    );
  }
}
