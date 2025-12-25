import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthenticatedUser, AuthenticationError } from "@/lib/auth";

// PATCH /api/positions/[id] - Update position
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getAuthenticatedUser();
    const { id } = await params;
    const body = await request.json();

    // Check ownership through account
    const existing = await prisma.position.findFirst({
      where: { id },
      include: { account: { select: { userId: true } } },
    });

    if (!existing || existing.account.userId !== userId) {
      return NextResponse.json({ error: "Position not found" }, { status: 404 });
    }

    const { symbol, name, quantity, costBasis, currentPrice, currency } = body;

    const position = await prisma.position.update({
      where: { id },
      data: {
        ...(symbol !== undefined && { symbol: symbol.toUpperCase() }),
        ...(name !== undefined && { name }),
        ...(quantity !== undefined && { quantity }),
        ...(costBasis !== undefined && { costBasis }),
        ...(currentPrice !== undefined && { currentPrice }),
        ...(currency !== undefined && { currency }),
        lastUpdated: new Date(),
      },
    });

    return NextResponse.json(position);
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Error updating position:", error);
    return NextResponse.json(
      { error: "Failed to update position" },
      { status: 500 }
    );
  }
}

// DELETE /api/positions/[id] - Delete position
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getAuthenticatedUser();
    const { id } = await params;

    // Check ownership through account
    const existing = await prisma.position.findFirst({
      where: { id },
      include: { account: { select: { userId: true } } },
    });

    if (!existing || existing.account.userId !== userId) {
      return NextResponse.json({ error: "Position not found" }, { status: 404 });
    }

    await prisma.position.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Error deleting position:", error);
    return NextResponse.json(
      { error: "Failed to delete position" },
      { status: 500 }
    );
  }
}

