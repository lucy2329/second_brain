"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  X,
  ArrowUpRight,
  ArrowDownRight,
  CalendarDays,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface Account {
  id: string;
  name: string;
  color: string | null;
}

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: TransactionFormData) => Promise<void>;
  accounts: Account[];
  categories: {
    INCOME: string[];
    EXPENSE: string[];
  };
  transaction?: {
    id: string;
    type: "INCOME" | "EXPENSE";
    amount: number;
    category: string | null;
    description: string | null;
    merchant: string | null;
    date: string;
    accountId?: string | null;
  } | null;
  defaultType?: "INCOME" | "EXPENSE";
}

interface TransactionFormData {
  type: "INCOME" | "EXPENSE";
  amount: number;
  category: string | null;
  description: string;
  merchant: string;
  date: string;
  accountId: string | null;
}

export function TransactionModal({
  isOpen,
  onClose,
  onSave,
  accounts,
  categories,
  transaction,
  defaultType = "EXPENSE",
}: TransactionModalProps) {
  const [type, setType] = useState<"INCOME" | "EXPENSE">(defaultType);
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [customCategory, setCustomCategory] = useState("");
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [description, setDescription] = useState("");
  const [merchant, setMerchant] = useState("");
  const [date, setDate] = useState<Date>(new Date());
  const [accountId, setAccountId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (transaction) {
      setType(transaction.type);
      setAmount(String(transaction.amount));
      setCategory(transaction.category);
      setDescription(transaction.description || "");
      setMerchant(transaction.merchant || "");
      setDate(new Date(transaction.date));
      setAccountId(transaction.accountId || null);
    } else {
      setType(defaultType);
      setAmount("");
      setCategory(null);
      setDescription("");
      setMerchant("");
      setDate(new Date());
      setAccountId(null);
    }
    setShowCustomCategory(false);
    setCustomCategory("");
  }, [transaction, isOpen, defaultType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;

    setIsSubmitting(true);
    try {
      await onSave({
        type,
        amount: parseFloat(amount),
        category: showCustomCategory ? customCategory || null : category,
        description,
        merchant,
        date: date.toISOString(),
        accountId,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentCategories = type === "INCOME" ? categories.INCOME : categories.EXPENSE;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg max-h-[90vh] rounded-2xl border border-border bg-background shadow-2xl overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <h2 className="text-xl font-semibold">
                  {transaction ? "Edit Transaction" : "Add Transaction"}
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-secondary transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Content */}
              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Type Toggle */}
                <div className="flex rounded-lg border border-border overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setType("EXPENSE")}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 py-3 transition-all",
                      type === "EXPENSE"
                        ? "bg-destructive/10 text-destructive"
                        : "hover:bg-secondary/50"
                    )}
                  >
                    <ArrowUpRight className="h-4 w-4" />
                    Expense
                  </button>
                  <button
                    type="button"
                    onClick={() => setType("INCOME")}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 py-3 transition-all",
                      type === "INCOME"
                        ? "bg-success/10 text-success"
                        : "hover:bg-secondary/50"
                    )}
                  >
                    <ArrowDownRight className="h-4 w-4" />
                    Income
                  </button>
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-2">
                    Amount
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/60 text-lg">
                      $
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full pl-8 pr-4 py-3 rounded-lg border border-border bg-background/50 text-2xl font-semibold focus:outline-none focus:ring-2 focus:ring-primary tabular-nums"
                      autoFocus
                    />
                  </div>
                </div>

                {/* Merchant/Description */}
                <Input
                  label={type === "EXPENSE" ? "Merchant / Store" : "Source"}
                  placeholder={type === "EXPENSE" ? "e.g., Starbucks" : "e.g., Paycheck"}
                  value={merchant}
                  onChange={(e) => setMerchant(e.target.value)}
                />

                {/* Category */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-foreground/80">
                      Category
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowCustomCategory(!showCustomCategory)}
                      className="text-xs text-primary hover:underline"
                    >
                      {showCustomCategory ? "Choose existing" : "Add custom"}
                    </button>
                  </div>

                  {showCustomCategory ? (
                    <Input
                      placeholder="Enter custom category"
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                    />
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {currentCategories.map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setCategory(category === cat ? null : cat)}
                          className={cn(
                            "px-3 py-1.5 rounded-lg text-sm transition-all",
                            category === cat
                              ? "bg-primary text-primary-foreground"
                              : "bg-secondary/50 hover:bg-secondary"
                          )}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-foreground/50">
                    Category is optional - you can add it later
                  </p>
                </div>

                {/* Date */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground/80">
                    Date
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className="w-full flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border bg-background/50 hover:bg-secondary/50 transition-colors text-left"
                      >
                        <CalendarDays className="h-4 w-4 text-foreground/60" />
                        {format(date, "PPP")}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={(d) => d && setDate(d)}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Account */}
                {accounts.length > 0 && (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-foreground/80">
                      Account (Optional)
                    </label>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setAccountId(null)}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-sm transition-all",
                          accountId === null
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary/50 hover:bg-secondary"
                        )}
                      >
                        None
                      </button>
                      {accounts.map((account) => (
                        <button
                          key={account.id}
                          type="button"
                          onClick={() => setAccountId(account.id)}
                          className={cn(
                            "px-3 py-1.5 rounded-lg text-sm transition-all flex items-center gap-2",
                            accountId === account.id
                              ? "bg-primary text-primary-foreground"
                              : "bg-secondary/50 hover:bg-secondary"
                          )}
                        >
                          {account.color && (
                            <span
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: account.color }}
                            />
                          )}
                          {account.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notes */}
                <Textarea
                  label="Notes (Optional)"
                  placeholder="Add any additional details..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                />
              </form>

              {/* Footer */}
              <div className="flex gap-3 justify-end px-6 py-4 border-t border-border">
                <Button type="button" variant="ghost" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  isLoading={isSubmitting}
                  disabled={!amount}
                  className={cn(
                    type === "EXPENSE"
                      ? "bg-destructive hover:bg-destructive/90"
                      : "bg-success hover:bg-success/90"
                  )}
                >
                  {transaction ? "Save Changes" : `Add ${type === "INCOME" ? "Income" : "Expense"}`}
                </Button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

