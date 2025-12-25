import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthenticatedUser, AuthenticationError } from "@/lib/auth";

// GET /api/accounts - List all accounts for the user
export async function GET() {
  try {
    const userId = await getAuthenticatedUser();

    const accounts = await prisma.account.findMany({
      where: { userId },
      include: {
        _count: {
          select: { transactions: true, positions: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Calculate totals
    const totals = accounts.reduce(
      (acc, account) => {
        const balance = Number(account.balance);
        if (account.type === "CREDIT_CARD") {
          acc.liabilities += balance;
        } else {
          acc.assets += balance;
        }
        return acc;
      },
      { assets: 0, liabilities: 0 }
    );

    return NextResponse.json({
      accounts,
      totals: {
        ...totals,
        netWorth: totals.assets - totals.liabilities,
      },
    });
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Error fetching accounts:", error);
    return NextResponse.json(
      { error: "Failed to fetch accounts" },
      { status: 500 }
    );
  }
}

// POST /api/accounts - Create a new account
export async function POST(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUser();
    const body = await request.json();

    const { name, type, institution, balance, currency, color } = body;

    if (!name || !type) {
      return NextResponse.json(
        { error: "Name and type are required" },
        { status: 400 }
      );
    }

    const account = await prisma.account.create({
      data: {
        userId,
        name,
        type,
        institution: institution || null,
        balance: balance || 0,
        currency: currency || "USD",
        color: color || null,
        isSnapTrade: false,
      },
    });

    return NextResponse.json(account, { status: 201 });
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Error creating account:", error);
    return NextResponse.json(
      { error: "Failed to create account" },
      { status: 500 }
    );
  }
}

