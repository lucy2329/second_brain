import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthenticatedUser, AuthenticationError } from "@/lib/auth";

// GET /api/accounts/[id] - Get account details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getAuthenticatedUser();
    const { id } = await params;

    const account = await prisma.account.findFirst({
      where: { id, userId },
      include: {
        positions: {
          orderBy: { symbol: "asc" },
        },
        _count: {
          select: { transactions: true },
        },
      },
    });

    if (!account) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    // Calculate portfolio value for investment accounts
    let portfolioValue = 0;
    let totalGainLoss = 0;
    if (account.positions.length > 0) {
      account.positions.forEach((position) => {
        const currentValue =
          Number(position.quantity) * Number(position.currentPrice);
        const costValue = Number(position.costBasis);
        portfolioValue += currentValue;
        totalGainLoss += currentValue - costValue;
      });
    }

    return NextResponse.json({
      ...account,
      portfolioValue,
      totalGainLoss,
      totalGainLossPercent:
        portfolioValue > 0
          ? ((totalGainLoss / (portfolioValue - totalGainLoss)) * 100).toFixed(2)
          : 0,
    });
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Error fetching account:", error);
    return NextResponse.json(
      { error: "Failed to fetch account" },
      { status: 500 }
    );
  }
}

// PATCH /api/accounts/[id] - Update account
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getAuthenticatedUser();
    const { id } = await params;
    const body = await request.json();

    // Check ownership
    const existing = await prisma.account.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    const { name, type, institution, balance, currency, color } = body;

    const account = await prisma.account.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(type !== undefined && { type }),
        ...(institution !== undefined && { institution }),
        ...(balance !== undefined && { balance }),
        ...(currency !== undefined && { currency }),
        ...(color !== undefined && { color }),
      },
    });

    return NextResponse.json(account);
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Error updating account:", error);
    return NextResponse.json(
      { error: "Failed to update account" },
      { status: 500 }
    );
  }
}

// DELETE /api/accounts/[id] - Delete account
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getAuthenticatedUser();
    const { id } = await params;

    // Check ownership
    const existing = await prisma.account.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    await prisma.account.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Error deleting account:", error);
    return NextResponse.json(
      { error: "Failed to delete account" },
      { status: 500 }
    );
  }
}

