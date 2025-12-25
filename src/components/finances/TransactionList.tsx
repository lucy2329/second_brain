"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowUpRight,
  ArrowDownRight,
  Tag,
  MoreHorizontal,
  Edit2,
  Trash2,
  Filter,
  Search,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface Transaction {
  id: string;
  type: "INCOME" | "EXPENSE";
  amount: number;
  category: string | null;
  description: string | null;
  merchant: string | null;
  date: string;
  account: {
    id: string;
    name: string;
    institution: string | null;
    color: string | null;
  } | null;
}

interface TransactionListProps {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
  onCategorize: (transaction: Transaction) => void;
  isLoading?: boolean;
}

export function TransactionList({
  transactions,
  onEdit,
  onDelete,
  onCategorize,
  isLoading,
}: TransactionListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const formatCurrency = (amount: number, type: "INCOME" | "EXPENSE") => {
    const formatted = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
    return type === "INCOME" ? `+${formatted}` : `-${formatted}`;
  };

  const filteredTransactions = transactions.filter((t) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      t.description?.toLowerCase().includes(query) ||
      t.merchant?.toLowerCase().includes(query) ||
      t.category?.toLowerCase().includes(query)
    );
  });

  // Group transactions by date
  const groupedTransactions = filteredTransactions.reduce((acc, transaction) => {
    const dateKey = format(new Date(transaction.date), "yyyy-MM-dd");
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(transaction);
    return acc;
  }, {} as Record<string, Transaction[]>);

  if (isLoading) {
    return (
      <Card className="p-8">
        <div className="flex items-center justify-center">
          <motion.div
            className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border/50">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <h3 className="text-lg font-semibold">Transactions</h3>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/40" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      {/* Transaction List */}
      <div className="divide-y divide-border/30">
        {Object.entries(groupedTransactions).map(([date, dayTransactions]) => (
          <div key={date}>
            {/* Date Header */}
            <div className="px-4 py-2 bg-secondary/20 sticky top-0 z-10">
              <span className="text-xs font-medium text-foreground/60">
                {format(new Date(date), "EEEE, MMMM d, yyyy")}
              </span>
            </div>

            {/* Day's Transactions */}
            {dayTransactions.map((transaction, index) => (
              <motion.div
                key={transaction.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="group"
              >
                <div
                  className={cn(
                    "flex items-center gap-4 px-4 py-3 hover:bg-secondary/30 transition-colors cursor-pointer",
                    expandedId === transaction.id && "bg-secondary/20"
                  )}
                  onClick={() =>
                    setExpandedId(
                      expandedId === transaction.id ? null : transaction.id
                    )
                  }
                >
                  {/* Icon */}
                  <div
                    className={cn(
                      "p-2 rounded-lg",
                      transaction.type === "INCOME"
                        ? "bg-success/10"
                        : "bg-destructive/10"
                    )}
                  >
                    {transaction.type === "INCOME" ? (
                      <ArrowDownRight className="h-4 w-4 text-success" />
                    ) : (
                      <ArrowUpRight className="h-4 w-4 text-destructive" />
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">
                        {transaction.merchant ||
                          transaction.description ||
                          "Transaction"}
                      </span>
                      {!transaction.category && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onCategorize(transaction);
                          }}
                          className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-warning/10 text-warning text-xs font-medium hover:bg-warning/20 transition-colors"
                        >
                          <Tag className="h-3 w-3" />
                          Add Category
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-foreground/60">
                      {transaction.category && (
                        <Badge variant="secondary" className="text-xs">
                          {transaction.category}
                        </Badge>
                      )}
                      {transaction.account && (
                        <span
                          className="flex items-center gap-1"
                          style={{ color: transaction.account.color || undefined }}
                        >
                          <span className="opacity-60">•</span>
                          {transaction.account.name}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Amount */}
                  <div
                    className={cn(
                      "text-right font-semibold tabular-nums",
                      transaction.type === "INCOME"
                        ? "text-success"
                        : "text-foreground"
                    )}
                  >
                    {formatCurrency(Number(transaction.amount), transaction.type)}
                  </div>

                  {/* Expand Icon */}
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 text-foreground/40 transition-transform",
                      expandedId === transaction.id && "rotate-180"
                    )}
                  />
                </div>

                {/* Expanded Actions */}
                <AnimatePresence>
                  {expandedId === transaction.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden bg-secondary/10"
                    >
                      <div className="flex items-center justify-between px-4 py-3 pl-14">
                        <div className="text-sm text-foreground/60">
                          {transaction.description && (
                            <p>{transaction.description}</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit(transaction)}
                          >
                            <Edit2 className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => onDelete(transaction.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        ))}

        {/* Empty State */}
        {filteredTransactions.length === 0 && (
          <div className="py-16 text-center">
            <div className="text-4xl mb-4">💸</div>
            <h3 className="text-lg font-medium mb-2">No transactions yet</h3>
            <p className="text-sm text-foreground/60">
              Add your first transaction to start tracking your finances
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}

