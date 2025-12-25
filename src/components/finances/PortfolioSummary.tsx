"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PieChart,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Position {
  id: string;
  symbol: string;
  name: string;
  quantity: number;
  costBasis: number;
  currentPrice: number;
  currentValue: number;
  gainLoss: number;
  gainLossPercent: number | string;
  account?: {
    id: string;
    name: string;
    color: string | null;
  };
}

interface PortfolioSummaryProps {
  stocks: Position[];
  options: Position[];
  summary: {
    totalValue: number;
    totalCost: number;
    totalGainLoss: number;
    totalGainLossPercent: number | string;
    topPerformer?: { symbol: string; gain: number } | null;
  };
};

export function PortfolioSummary({ stocks, options, summary }: PortfolioSummaryProps) {
  const [activeTab, setActiveTab] = useState<"stocks" | "options">("stocks");

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatPercent = (value: number | string) => {
    const num = typeof value === "string" ? parseFloat(value) : value;
    return `${num >= 0 ? "+" : ""}${num.toFixed(2)}%`;
  };

  const isPositive = summary.totalGainLoss >= 0;

  const currentHoldings = activeTab === "stocks" ? stocks : options;
  const sortedHoldings = [...currentHoldings].sort((a, b) => b.currentValue - a.currentValue);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Value */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="h-full">
            <div className="p-4 h-full flex flex-col">
              <div className="flex items-start justify-between flex-1">
                <div>
                  <p className="text-xs text-foreground/60 uppercase tracking-wider">
                    Portfolio Value
                  </p>
                  <p className="text-3xl font-bold mt-1">
                    {formatCurrency(summary.totalValue)}
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-primary/10">
                  <Wallet className="h-5 w-5 text-primary" />
                </div>
              </div>
              <p className="text-xs text-foreground/50 mt-2">
                Total market value (inc. cash)
              </p>
            </div>
          </Card>
        </motion.div>

        {/* Total Gain/Loss */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="h-full">
            <div className="p-4 h-full flex flex-col">
              <div className="flex items-start justify-between flex-1">
                <div>
                  <p className="text-xs text-foreground/60 uppercase tracking-wider">
                    Total Gain/Loss
                  </p>
                  <p
                    className={cn(
                      "text-3xl font-bold mt-1",
                      isPositive ? "text-success" : "text-destructive"
                    )}
                  >
                    {isPositive ? "+" : ""}
                    {formatCurrency(summary.totalGainLoss)}
                  </p>
                </div>
                <div
                  className={cn(
                    "p-2 rounded-lg",
                    isPositive ? "bg-success/10" : "bg-destructive/10"
                  )}
                >
                  {isPositive ? (
                    <TrendingUp className="h-5 w-5 text-success" />
                  ) : (
                    <TrendingDown className="h-5 w-5 text-destructive" />
                  )}
                </div>
              </div>
              <div className="mt-2">
                <Badge
                  variant={isPositive ? "success" : "destructive"}
                  className="text-xs"
                >
                  {formatPercent(summary.totalGainLossPercent)}
                </Badge>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Top Performer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="h-full">
            <div className="p-4 h-full flex flex-col">
              <div className="flex items-start justify-between flex-1">
                <div>
                  <p className="text-xs text-foreground/60 uppercase tracking-wider">
                    Top Performer
                  </p>
                  <p className="text-3xl font-bold mt-1">
                    {summary.topPerformer?.symbol || "N/A"}
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-accent/10">
                  <PieChart className="h-5 w-5 text-accent" />
                </div>
              </div>
              <p className="text-xs text-foreground/50 mt-2">
                {summary.topPerformer 
                  ? `Highest gain: ${formatCurrency(summary.topPerformer.gain)}`
                  : "No gains recorded"}
              </p>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Holdings Section with Tabs */}
      <Card className="overflow-hidden">
        <div className="border-b border-border/50">
          <div className="flex items-center px-4 py-2 gap-4">
            <button
              onClick={() => setActiveTab("stocks")}
              className={cn(
                "px-3 py-2 text-sm font-medium transition-colors relative",
                activeTab === "stocks" ? "text-primary" : "text-foreground/60 hover:text-foreground"
              )}
            >
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4" />
                Stocks & ETFs
                <Badge variant="secondary" className="ml-1 text-[10px] h-4">
                  {stocks.length}
                </Badge>
              </div>
              {activeTab === "stocks" && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                />
              )}
            </button>
            <button
              onClick={() => setActiveTab("options")}
              className={cn(
                "px-3 py-2 text-sm font-medium transition-colors relative",
                activeTab === "options" ? "text-primary" : "text-foreground/60 hover:text-foreground"
              )}
            >
              <div className="flex items-center gap-2">
                <PieChart className="h-4 w-4" />
                Options
                <Badge variant="secondary" className="ml-1 text-[10px] h-4">
                  {options.length}
                </Badge>
              </div>
              {activeTab === "options" && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                />
              )}
            </button>
          </div>
        </div>

        <div className="min-h-[400px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              {sortedHoldings.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border/30">
                        <th className="text-left text-xs font-medium text-foreground/60 uppercase tracking-wider px-6 py-4">
                          Asset
                        </th>
                        <th className="text-right text-xs font-medium text-foreground/60 uppercase tracking-wider px-6 py-4">
                          Quantity
                        </th>
                        <th className="text-right text-xs font-medium text-foreground/60 uppercase tracking-wider px-6 py-4">
                          Price
                        </th>
                        <th className="text-right text-xs font-medium text-foreground/60 uppercase tracking-wider px-6 py-4">
                          Market Value
                        </th>
                        <th className="text-right text-xs font-medium text-foreground/60 uppercase tracking-wider px-6 py-4">
                          Cost Basis
                        </th>
                        <th className="text-right text-xs font-medium text-foreground/60 uppercase tracking-wider px-6 py-4">
                          Total Gain/Loss
                        </th>
                        <th className="text-right text-xs font-medium text-foreground/60 uppercase tracking-wider px-6 py-4">
                          Allocation
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30">
                      {sortedHoldings.map((position, index) => {
                        const posIsPositive = position.gainLoss >= 0;
                        const allocation = summary.totalValue > 0 ? (position.currentValue / summary.totalValue) * 100 : 0;
                        
                        return (
                          <tr
                            key={position.id}
                            className="hover:bg-secondary/20 transition-colors"
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center font-bold text-sm">
                                  {position.symbol.slice(0, 2)}
                                </div>
                                <div>
                                  <div className="font-semibold text-sm">{position.symbol}</div>
                                  <div className="text-xs text-foreground/60 truncate max-w-[200px]">
                                    {position.name}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right tabular-nums text-sm">
                              {Number(position.quantity).toLocaleString(undefined, {
                                maximumFractionDigits: 8,
                              })}
                            </td>
                            <td className="px-6 py-4 text-right tabular-nums text-sm text-foreground/80">
                              {formatCurrency(Number(position.currentPrice))}
                            </td>
                            <td className="px-6 py-4 text-right font-semibold tabular-nums text-sm">
                              {formatCurrency(position.currentValue)}
                            </td>
                            <td className="px-6 py-4 text-right text-foreground/60 tabular-nums text-sm">
                              {formatCurrency(Number(position.costBasis))}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div
                                className={cn(
                                  "font-semibold tabular-nums text-sm",
                                  posIsPositive ? "text-success" : "text-destructive"
                                )}
                              >
                                {posIsPositive ? "+" : ""}
                                {formatCurrency(position.gainLoss)}
                              </div>
                              <div
                                className={cn(
                                  "text-[10px]",
                                  posIsPositive ? "text-success/80" : "text-destructive/80"
                                )}
                              >
                                {formatPercent(position.gainLossPercent)}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2 justify-end">
                                <div className="w-16 h-1.5 rounded-full bg-secondary overflow-hidden">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${allocation}%` }}
                                    transition={{ duration: 0.5, delay: index * 0.05 }}
                                    className="h-full bg-primary rounded-full"
                                  />
                                </div>
                                <span className="text-[10px] text-foreground/60 w-8 text-right font-medium">
                                  {allocation.toFixed(1)}%
                                </span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-20 text-center">
                  <div className="text-4xl mb-4 opacity-20">📁</div>
                  <h3 className="text-lg font-medium opacity-60">No {activeTab} in this account</h3>
                  <p className="text-sm opacity-40">Your synced holdings will appear here</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </Card>
    </div>
  );
}
