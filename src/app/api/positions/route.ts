import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthenticatedUser, AuthenticationError } from "@/lib/auth";

// GET /api/positions - List all positions
export async function GET(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUser();
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get("accountId");

    const positions = await prisma.position.findMany({
      where: {
        account: {
          userId,
          ...(accountId && { id: accountId }),
        },
      },
      include: {
        account: {
          select: { id: true, name: true, institution: true, color: true },
        },
      },
      orderBy: [{ symbol: "asc" }],
    });

    // Fetch account balances to include cash in total portfolio value
    const accounts = await prisma.account.findMany({
      where: {
        userId,
        ...(accountId && { id: accountId }),
      },
      select: { balance: true }
    });
    const totalAccountValue = accounts.reduce((sum, acc) => sum + Number(acc.balance), 0);

    // Calculate totals and find top performer
    let topPerformer = { symbol: "None", gain: 0 };

    // Regex to detect options (matches SnapTrade/OCC format)
    const isOptionTicker = (symbol: string) => /[A-Z]+\s*\d{6}[CP]\d+/.test(symbol);

    const mappedPositions = positions.map((p) => {
      const qty = Number(p.quantity);
      const price = Number(p.currentPrice);
      const cost = Number(p.costBasis);
      
      let currentValue, totalCost, gainLoss;

      if (isOptionTicker(p.symbol)) {
        currentValue = qty * price * 100;
        totalCost = qty * cost * 100;
        gainLoss = currentValue - totalCost;
      } else {
        currentValue = qty * price;
        totalCost = qty * cost;
        gainLoss = currentValue - totalCost;
      }

      const isPositive = gainLoss > topPerformer.gain;
      if (isPositive) {
        topPerformer = { symbol: p.symbol, gain: gainLoss };
      }

      return {
        ...p,
        currentValue,
        totalCost,
        gainLoss,
        gainLossPercent:
          totalCost > 0
            ? ((gainLoss / totalCost) * 100).toFixed(2)
            : 0,
        isOption: isOptionTicker(p.symbol)
      };
    });

    const summary = mappedPositions.reduce(
      (acc, p) => {
        acc.totalCost += p.totalCost;
        acc.totalGainLoss += p.gainLoss;
        return acc;
      },
      { totalValue: totalAccountValue, totalCost: 0, totalGainLoss: 0 }
    );

    // Total cost basis for the whole portfolio (including cash)
    summary.totalCost = summary.totalValue - summary.totalGainLoss;

    // Return separated for easier frontend handling
    return NextResponse.json({
      stocks: mappedPositions.filter(p => !p.isOption),
      options: mappedPositions.filter(p => p.isOption),
      positions: mappedPositions, // Keep merged for backward compatibility if needed
      summary: {
        ...summary,
        totalGainLossPercent:
          summary.totalCost > 0
            ? ((summary.totalGainLoss / summary.totalCost) * 100).toFixed(2)
            : 0,
        topPerformer: topPerformer.symbol !== "None" ? topPerformer : null,
      },
    });
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Error fetching positions:", error);
    return NextResponse.json(
      { error: "Failed to fetch positions" },
      { status: 500 }
    );
  }
}

// POST /api/positions - Create a new position
export async function POST(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUser();
    const body = await request.json();

    const { accountId, symbol, name, quantity, costBasis, currentPrice, currency } =
      body;

    if (!accountId || !symbol || !name || quantity === undefined) {
      return NextResponse.json(
        { error: "accountId, symbol, name, and quantity are required" },
        { status: 400 }
      );
    }

    // Verify account ownership
    const account = await prisma.account.findFirst({
      where: { id: accountId, userId },
    });

    if (!account) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    const position = await prisma.position.create({
      data: {
        accountId,
        symbol: symbol.toUpperCase(),
        name,
        quantity,
        costBasis: costBasis || 0,
        currentPrice: currentPrice || 0,
        currency: currency || "USD",
      },
    });

    return NextResponse.json(position, { status: 201 });
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Error creating position:", error);
    return NextResponse.json(
      { error: "Failed to create position" },
      { status: 500 }
    );
  }
}
