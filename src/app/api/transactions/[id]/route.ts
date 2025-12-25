import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthenticatedUser, AuthenticationError } from "@/lib/auth";

// GET /api/transactions/[id] - Get transaction details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getAuthenticatedUser();
    const { id } = await params;

    const transaction = await prisma.transaction.findFirst({
      where: { id, userId },
      include: {
        account: {
          select: { id: true, name: true, institution: true, color: true },
        },
      },
    });

    if (!transaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(transaction);
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Error fetching transaction:", error);
    return NextResponse.json(
      { error: "Failed to fetch transaction" },
      { status: 500 }
    );
  }
}

// PATCH /api/transactions/[id] - Update transaction
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getAuthenticatedUser();
    const { id } = await params;
    const body = await request.json();

    // Check ownership
    const existing = await prisma.transaction.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    const {
      accountId,
      type,
      amount,
      category,
      description,
      merchant,
      tags,
      date,
      receiptUrl,
    } = body;

    // Handle account change - revert old account balance, update new
    const oldAccountId = existing.accountId;
    const oldType = existing.type;
    const oldAmount = Number(existing.amount);

    // If new accountId provided, verify ownership
    if (accountId && accountId !== oldAccountId) {
      const account = await prisma.account.findFirst({
        where: { id: accountId, userId },
      });
      if (!account) {
        return NextResponse.json(
          { error: "Account not found" },
          { status: 404 }
        );
      }
    }

    const transaction = await prisma.transaction.update({
      where: { id },
      data: {
        ...(accountId !== undefined && { accountId }),
        ...(type !== undefined && { type }),
        ...(amount !== undefined && { amount: Math.abs(amount) }),
        ...(category !== undefined && { category }),
        ...(description !== undefined && { description }),
        ...(merchant !== undefined && { merchant }),
        ...(tags !== undefined && { tags }),
        ...(date !== undefined && { date: new Date(date) }),
        ...(receiptUrl !== undefined && { receiptUrl }),
      },
      include: {
        account: {
          select: { id: true, name: true, institution: true, color: true },
        },
      },
    });

    // Update account balances if needed
    const newType = type ?? oldType;
    const newAmount = amount !== undefined ? Math.abs(amount) : oldAmount;
    const newAccountId = accountId !== undefined ? accountId : oldAccountId;

    // Revert old account balance
    if (oldAccountId) {
      const oldBalanceChange = oldType === "INCOME" ? -oldAmount : oldAmount;
      await prisma.account.update({
        where: { id: oldAccountId },
        data: { balance: { increment: oldBalanceChange } },
      });
    }

    // Apply new account balance
    if (newAccountId) {
      const newBalanceChange = newType === "INCOME" ? newAmount : -newAmount;
      await prisma.account.update({
        where: { id: newAccountId },
        data: { balance: { increment: newBalanceChange } },
      });
    }

    return NextResponse.json(transaction);
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Error updating transaction:", error);
    return NextResponse.json(
      { error: "Failed to update transaction" },
      { status: 500 }
    );
  }
}

// DELETE /api/transactions/[id] - Delete transaction
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getAuthenticatedUser();
    const { id } = await params;

    // Check ownership and get details for balance update
    const existing = await prisma.transaction.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    await prisma.transaction.delete({ where: { id } });

    // Revert account balance if linked
    if (existing.accountId) {
      const balanceRevert =
        existing.type === "INCOME"
          ? -Number(existing.amount)
          : Number(existing.amount);
      await prisma.account.update({
        where: { id: existing.accountId },
        data: { balance: { increment: balanceRevert } },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Error deleting transaction:", error);
    return NextResponse.json(
      { error: "Failed to delete transaction" },
      { status: 500 }
    );
  }
}
