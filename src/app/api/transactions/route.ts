import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthenticatedUser, AuthenticationError } from "@/lib/auth";

// Default expense categories
const DEFAULT_CATEGORIES = {
  INCOME: ["Salary", "Freelance", "Investments", "Dividends", "Gifts", "Other Income"],
  EXPENSE: [
    "Food & Dining",
    "Groceries",
    "Transport",
    "Shopping",
    "Bills & Utilities",
    "Entertainment",
    "Health",
    "Travel",
    "Education",
    "Personal Care",
    "Home",
    "Other",
  ],
};

// GET /api/transactions - List transactions with filters
export async function GET(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUser();
    const { searchParams } = new URL(request.url);

    // Parse filters
    const accountId = searchParams.get("accountId");
    const type = searchParams.get("type") as "INCOME" | "EXPENSE" | null;
    const category = searchParams.get("category");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const uncategorized = searchParams.get("uncategorized") === "true";
    
    // Validate limit and offset
    let limit = parseInt(searchParams.get("limit") || "50");
    if (isNaN(limit)) limit = 50;
    
    let offset = parseInt(searchParams.get("offset") || "0");
    if (isNaN(offset)) offset = 0;

    const where: any = {
      userId,
    };

    if (accountId && accountId !== "null" && accountId !== "undefined") {
      where.accountId = accountId;
    }

    if (type) {
      where.type = type;
    }

    if (category) {
      where.category = category;
    } else if (uncategorized) {
      where.category = null;
    }

    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        const d = new Date(startDate);
        if (!isNaN(d.getTime())) where.date.gte = d;
      }
      if (endDate) {
        const d = new Date(endDate);
        if (!isNaN(d.getTime())) where.date.lte = d;
      }
    }

    console.log("[Transactions API] Fetching with where:", JSON.stringify(where, null, 2));

    const [transactionsRaw, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: {
          account: {
            select: { id: true, name: true, institution: true, color: true },
          },
        },
        orderBy: { date: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.transaction.count({ where }),
    ]);

    // Convert Decimal to Number for serialization and calculate page totals
    const transactions = transactionsRaw.map(t => ({
      ...t,
      amount: Number(t.amount)
    }));

    const pageIncome = transactions
      .filter((t) => t.type === "INCOME")
      .reduce((sum, t) => sum + t.amount, 0);
    
    const pageExpense = transactions
      .filter((t) => t.type === "EXPENSE")
      .reduce((sum, t) => sum + t.amount, 0);

    return NextResponse.json({
      transactions,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + transactions.length < total,
      },
      pageTotals: {
        income: pageIncome,
        expense: pageExpense,
        net: pageIncome - pageExpense,
      },
      categories: DEFAULT_CATEGORIES,
    });
  } catch (error: any) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Error fetching transactions:", error);
    // Log more details if it's a Prisma error or similar
    if (error.code) console.error("Error code:", error.code);
    if (error.meta) console.error("Error meta:", JSON.stringify(error.meta));
    
    return NextResponse.json(
      { error: "Failed to fetch transactions", details: error.message },
      { status: 500 }
    );
  }
}

// POST /api/transactions - Create a new transaction
export async function POST(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUser();
    const body = await request.json();

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

    if (!type || amount === undefined || !date) {
      return NextResponse.json(
        { error: "type, amount, and date are required" },
        { status: 400 }
      );
    }

    // If accountId provided, verify ownership
    if (accountId) {
      const account = await prisma.account.findFirst({
        where: { id: accountId, userId },
      });
      if (!account) {
        return NextResponse.json({ error: "Account not found" }, { status: 404 });
      }
    }

    const transaction = await prisma.transaction.create({
      data: {
        userId,
        accountId: accountId || null,
        type,
        amount: Math.abs(amount), // Store as positive
        category: category || null, // Allow null for uncategorized
        description: description || null,
        merchant: merchant || null,
        tags: tags || [],
        date: new Date(date),
        receiptUrl: receiptUrl || null,
      },
      include: {
        account: {
          select: { id: true, name: true, institution: true, color: true },
        },
      },
    });

    // Update account balance if linked
    if (accountId) {
      const balanceChange = type === "INCOME" ? amount : -amount;
      await prisma.account.update({
        where: { id: accountId },
        data: { balance: { increment: balanceChange } },
      });
    }

    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Error creating transaction:", error);
    return NextResponse.json(
      { error: "Failed to create transaction" },
      { status: 500 }
    );
  }
}

