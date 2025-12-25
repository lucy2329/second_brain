import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthenticatedUser, AuthenticationError } from "@/lib/auth";

// GET /api/analytics - Get financial analytics
export async function GET(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUser();
    const { searchParams } = new URL(request.url);

    // Parse date range (default to current month)
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const startDate = searchParams.get("startDate")
      ? new Date(searchParams.get("startDate")!)
      : startOfMonth;
    const endDate = searchParams.get("endDate")
      ? new Date(searchParams.get("endDate")!)
      : endOfMonth;

    const accountId = searchParams.get("accountId");

    // Fetch all transactions in date range
    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        date: { gte: startDate, lte: endDate },
        ...(accountId && { accountId }),
      },
      orderBy: { date: "asc" },
    });

    // Calculate totals
    const totalIncome = transactions
      .filter((t) => t.type === "INCOME")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalExpense = transactions
      .filter((t) => t.type === "EXPENSE")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    // Spend by category
    const expenseByCategory: Record<string, number> = {};
    const incomeByCategory: Record<string, number> = {};

    transactions.forEach((t) => {
      const category = t.category || "Uncategorized";
      if (t.type === "EXPENSE") {
        expenseByCategory[category] =
          (expenseByCategory[category] || 0) + Number(t.amount);
      } else {
        incomeByCategory[category] =
          (incomeByCategory[category] || 0) + Number(t.amount);
      }
    });

    // Sort categories by amount
    const sortedExpenseCategories = Object.entries(expenseByCategory)
      .sort(([, a], [, b]) => b - a)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: totalExpense > 0 ? ((amount / totalExpense) * 100).toFixed(1) : 0,
      }));

    const sortedIncomeCategories = Object.entries(incomeByCategory)
      .sort(([, a], [, b]) => b - a)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: totalIncome > 0 ? ((amount / totalIncome) * 100).toFixed(1) : 0,
      }));

    // Daily spending trend
    const dailySpend: Record<string, { income: number; expense: number }> = {};
    transactions.forEach((t) => {
      const dateKey = t.date.toISOString().split("T")[0];
      if (!dailySpend[dateKey]) {
        dailySpend[dateKey] = { income: 0, expense: 0 };
      }
      if (t.type === "INCOME") {
        dailySpend[dateKey].income += Number(t.amount);
      } else {
        dailySpend[dateKey].expense += Number(t.amount);
      }
    });

    // Fill in missing days
    const dailyTrend: Array<{ date: string; income: number; expense: number }> = [];
    const current = new Date(startDate);
    while (current <= endDate) {
      const dateKey = current.toISOString().split("T")[0];
      dailyTrend.push({
        date: dateKey,
        income: dailySpend[dateKey]?.income || 0,
        expense: dailySpend[dateKey]?.expense || 0,
      });
      current.setDate(current.getDate() + 1);
    }

    // Count uncategorized transactions
    const uncategorizedCount = transactions.filter((t) => !t.category).length;

    // Get previous period for comparison
    const periodLength = endDate.getTime() - startDate.getTime();
    const prevStartDate = new Date(startDate.getTime() - periodLength);
    const prevEndDate = new Date(startDate.getTime() - 1);

    const prevTransactions = await prisma.transaction.findMany({
      where: {
        userId,
        date: { gte: prevStartDate, lte: prevEndDate },
        ...(accountId && { accountId }),
      },
    });

    const prevIncome = prevTransactions
      .filter((t) => t.type === "INCOME")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const prevExpense = prevTransactions
      .filter((t) => t.type === "EXPENSE")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    return NextResponse.json({
      period: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
      summary: {
        totalIncome,
        totalExpense,
        netSavings: totalIncome - totalExpense,
        savingsRate:
          totalIncome > 0
            ? (((totalIncome - totalExpense) / totalIncome) * 100).toFixed(1)
            : 0,
        transactionCount: transactions.length,
        uncategorizedCount,
      },
      comparison: {
        incomeChange: prevIncome > 0 ? ((totalIncome - prevIncome) / prevIncome) * 100 : 0,
        expenseChange: prevExpense > 0 ? ((totalExpense - prevExpense) / prevExpense) * 100 : 0,
        prevIncome,
        prevExpense,
      },
      byCategory: {
        expenses: sortedExpenseCategories,
        income: sortedIncomeCategories,
      },
      dailyTrend,
    });
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}

