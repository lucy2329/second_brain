"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  PiggyBank,
  Receipt,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface CategoryBreakdown {
  category: string;
  amount: number;
  percentage: number | string;
}

interface DailyTrend {
  date: string;
  income: number;
  expense: number;
}

interface AnalyticsData {
  period: {
    startDate: string;
    endDate: string;
  };
  summary: {
    totalIncome: number;
    totalExpense: number;
    netSavings: number;
    savingsRate: number | string;
    transactionCount: number;
    uncategorizedCount: number;
  };
  comparison: {
    incomeChange: number;
    expenseChange: number;
    prevIncome: number;
    prevExpense: number;
  };
  byCategory: {
    expenses: CategoryBreakdown[];
    income: CategoryBreakdown[];
  };
  dailyTrend: DailyTrend[];
}

interface SpendAnalyticsProps {
  data: AnalyticsData | null;
  isLoading?: boolean;
}

// Category colors for the chart
const categoryColors = [
  "#3b82f6", // Blue
  "#10b981", // Green
  "#f59e0b", // Amber
  "#ef4444", // Red
  "#8b5cf6", // Purple
  "#ec4899", // Pink
  "#06b6d4", // Cyan
  "#84cc16", // Lime
  "#f97316", // Orange
  "#6366f1", // Indigo
];

export function SpendAnalytics({ data, isLoading }: SpendAnalyticsProps) {
  const [hoveredDay, setHoveredDay] = useState<DailyTrend | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  if (isLoading || !data) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="h-64 animate-pulse bg-secondary/20" />
        ))}
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatCurrencyCompact = (amount: number) => {
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(1)}k`;
    }
    return `$${amount}`;
  };

  const formatPercent = (value: number | string) => {
    const num = typeof value === "string" ? parseFloat(value) : value;
    return `${num >= 0 ? "+" : ""}${num.toFixed(1)}%`;
  };

  const { summary, comparison, byCategory, dailyTrend } = data;

  // Find max for daily trend chart scaling
  const maxDaily = Math.max(
    ...dailyTrend.map((d) => Math.max(d.income, d.expense)),
    1
  );

  // Calculate nice Y-axis values
  const yAxisMax = Math.ceil(maxDaily / 100) * 100;
  const yAxisSteps = [
    0,
    yAxisMax * 0.25,
    yAxisMax * 0.5,
    yAxisMax * 0.75,
    yAxisMax,
  ];

  // Last 14 days for display
  const displayDays = dailyTrend.slice(-14);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Income */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <div className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-md bg-success/10">
                  <ArrowDownRight className="h-4 w-4 text-success" />
                </div>
                <span className="text-xs text-foreground/60">Income</span>
              </div>
              <p className="text-2xl font-bold text-success">
                {formatCurrency(summary.totalIncome)}
              </p>
              {comparison.prevIncome > 0 && (
                <div className="flex items-center gap-1 mt-1">
                  {comparison.incomeChange >= 0 ? (
                    <TrendingUp className="h-3 w-3 text-success" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-destructive" />
                  )}
                  <span
                    className={cn(
                      "text-xs",
                      comparison.incomeChange >= 0
                        ? "text-success"
                        : "text-destructive"
                    )}
                  >
                    {formatPercent(comparison.incomeChange)} vs last period
                  </span>
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Expenses */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <div className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-md bg-destructive/10">
                  <ArrowUpRight className="h-4 w-4 text-destructive" />
                </div>
                <span className="text-xs text-foreground/60">Expenses</span>
              </div>
              <p className="text-2xl font-bold">
                {formatCurrency(summary.totalExpense)}
              </p>
              {comparison.prevExpense > 0 && (
                <div className="flex items-center gap-1 mt-1">
                  {comparison.expenseChange <= 0 ? (
                    <TrendingDown className="h-3 w-3 text-success" />
                  ) : (
                    <TrendingUp className="h-3 w-3 text-destructive" />
                  )}
                  <span
                    className={cn(
                      "text-xs",
                      comparison.expenseChange <= 0
                        ? "text-success"
                        : "text-destructive"
                    )}
                  >
                    {formatPercent(comparison.expenseChange)} vs last period
                  </span>
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Net Savings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <div className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-md bg-primary/10">
                  <PiggyBank className="h-4 w-4 text-primary" />
                </div>
                <span className="text-xs text-foreground/60">Net Savings</span>
              </div>
              <p
                className={cn(
                  "text-2xl font-bold",
                  summary.netSavings >= 0 ? "text-success" : "text-destructive"
                )}
              >
                {summary.netSavings >= 0 ? "+" : ""}
                {formatCurrency(summary.netSavings)}
              </p>
              <p className="text-xs text-foreground/50 mt-1">
                {Number(summary.savingsRate).toFixed(0)}% savings rate
              </p>
            </div>
          </Card>
        </motion.div>

        {/* Transactions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <div className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-md bg-accent/10">
                  <Receipt className="h-4 w-4 text-accent" />
                </div>
                <span className="text-xs text-foreground/60">Transactions</span>
              </div>
              <p className="text-2xl font-bold">{summary.transactionCount}</p>
              {summary.uncategorizedCount > 0 && (
                <Badge variant="warning" className="mt-1 text-xs">
                  {summary.uncategorizedCount} uncategorized
                </Badge>
              )}
            </div>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spend by Category */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="overflow-hidden">
            <div className="p-4 border-b border-border/50">
              <h3 className="font-semibold">Spending by Category</h3>
            </div>
            <div className="p-4">
              {byCategory.expenses.length > 0 ? (
                <div className="space-y-3">
                  {byCategory.expenses.slice(0, 6).map((cat, index) => (
                    <div key={cat.category} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3 h-3 rounded-full"
                            style={{
                              backgroundColor:
                                categoryColors[index % categoryColors.length],
                            }}
                          />
                          <span>{cat.category}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {formatCurrency(cat.amount)}
                          </span>
                          <span className="text-xs text-foreground/50">
                            {cat.percentage}%
                          </span>
                        </div>
                      </div>
                      <div className="h-2 rounded-full bg-secondary overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${cat.percentage}%` }}
                          transition={{ duration: 0.5, delay: index * 0.05 }}
                          className="h-full rounded-full"
                          style={{
                            backgroundColor:
                              categoryColors[index % categoryColors.length],
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-foreground/60">
                  <p>No expenses this period</p>
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Daily Trend - Enhanced */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="overflow-hidden">
            <div className="p-4 border-b border-border/50">
              <h3 className="font-semibold">Daily Spending</h3>
            </div>
            <div className="p-4">
              {displayDays.length > 0 ? (
                <div className="space-y-4">
                  {/* Chart with Y-axis */}
                  <div className="flex">
                    {/* Y-axis labels */}
                    <div className="flex flex-col justify-between h-40 pr-2 text-xs text-foreground/50 w-12">
                      {[...yAxisSteps].reverse().map((val, i) => (
                        <span key={i} className="text-right">
                          {formatCurrencyCompact(val)}
                        </span>
                      ))}
                    </div>

                    {/* Chart area */}
                    <div className="flex-1 relative">
                      {/* Grid lines */}
                      <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                        {yAxisSteps.map((_, i) => (
                          <div
                            key={i}
                            className="border-t border-border/30 w-full"
                          />
                        ))}
                      </div>

                      {/* Bars */}
                      <div className="relative flex items-end gap-1 h-40">
                        {displayDays.map((day, index) => {
                          // Use pixel heights (h-40 = 160px)
                          const chartHeight = 160;
                          const expenseHeight =
                            yAxisMax > 0
                              ? (day.expense / yAxisMax) * chartHeight
                              : 0;
                          const incomeHeight =
                            yAxisMax > 0
                              ? (day.income / yAxisMax) * chartHeight
                              : 0;

                          return (
                            <div
                              key={day.date}
                              className="flex-1 flex flex-col items-center justify-end h-full relative group cursor-pointer"
                              onMouseEnter={(e) => {
                                setHoveredDay(day);
                                const rect =
                                  e.currentTarget.getBoundingClientRect();
                                setTooltipPosition({
                                  x: rect.left + rect.width / 2,
                                  y: rect.top - 10,
                                });
                              }}
                              onMouseLeave={() => setHoveredDay(null)}
                            >
                              <div className="w-full flex flex-col-reverse gap-0.5 items-center justify-start h-full">
                                {/* Expense bar */}
                                {day.expense > 0 && (
                                  <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: expenseHeight }}
                                    transition={{
                                      duration: 0.3,
                                      delay: index * 0.02,
                                    }}
                                    className="w-full max-w-3 bg-destructive/70 rounded-t group-hover:bg-destructive transition-colors"
                                  />
                                )}
                                {/* Income bar */}
                                {day.income > 0 && (
                                  <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: incomeHeight }}
                                    transition={{
                                      duration: 0.3,
                                      delay: index * 0.02,
                                    }}
                                    className="w-full max-w-3 bg-success/70 rounded-t group-hover:bg-success transition-colors"
                                  />
                                )}
                                {/* Empty placeholder for days with no data */}
                                {day.expense === 0 && day.income === 0 && (
                                  <div className="w-full max-w-3 h-1 bg-secondary/30 rounded group-hover:bg-secondary/50 transition-colors" />
                                )}
                              </div>
                              {/* Hover indicator line */}
                              <div className="absolute inset-0 border-l border-r border-transparent group-hover:border-primary/30 transition-colors" />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* X-axis date labels */}
                  <div className="flex pl-12">
                    <div className="flex-1 flex justify-between text-xs text-foreground/40">
                      <span>
                        {format(new Date(displayDays[0].date), "MMM d")}
                      </span>
                      {displayDays.length > 7 && (
                        <span>
                          {format(
                            new Date(
                              displayDays[
                                Math.floor(displayDays.length / 2)
                              ].date
                            ),
                            "MMM d"
                          )}
                        </span>
                      )}
                      <span>
                        {format(
                          new Date(displayDays[displayDays.length - 1].date),
                          "MMM d"
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="flex items-center justify-center gap-6 text-xs pt-2 border-t border-border/30">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded bg-destructive/70" />
                      <span className="text-foreground/60">Expenses</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded bg-success/70" />
                      <span className="text-foreground/60">Income</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center text-foreground/60">
                  <p>No data for this period</p>
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Hover Tooltip */}
      <AnimatePresence>
        {hoveredDay && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="fixed z-50 pointer-events-none"
            style={{
              left: tooltipPosition.x,
              top: tooltipPosition.y,
              transform: "translate(-50%, -100%)",
            }}
          >
            <div className="bg-background border border-border rounded-lg shadow-xl p-3 min-w-[140px]">
              <p className="text-xs text-foreground/60 mb-2">
                {format(new Date(hoveredDay.date), "EEEE, MMM d")}
              </p>
              {hoveredDay.income > 0 && (
                <div className="flex items-center justify-between gap-4 text-sm">
                  <span className="text-foreground/70">Income</span>
                  <span className="font-semibold text-success">
                    +{formatCurrency(hoveredDay.income)}
                  </span>
                </div>
              )}
              {hoveredDay.expense > 0 && (
                <div className="flex items-center justify-between gap-4 text-sm">
                  <span className="text-foreground/70">Expense</span>
                  <span className="font-semibold text-destructive">
                    -{formatCurrency(hoveredDay.expense)}
                  </span>
                </div>
              )}
              {hoveredDay.income === 0 && hoveredDay.expense === 0 && (
                <p className="text-sm text-foreground/50">No transactions</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Income by Category */}
      {byCategory.income.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="overflow-hidden">
            <div className="p-4 border-b border-border/50">
              <h3 className="font-semibold">Income by Source</h3>
            </div>
            <div className="p-4">
              <div className="flex flex-wrap gap-3">
                {byCategory.income.map((cat) => (
                  <div
                    key={cat.category}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-success/10"
                  >
                    <span className="text-sm font-medium text-success">
                      {cat.category}
                    </span>
                    <span className="text-sm text-foreground/60">
                      {formatCurrency(cat.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
