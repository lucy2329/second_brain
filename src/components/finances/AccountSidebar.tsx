"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Wallet,
  Building2,
  CreditCard,
  TrendingUp,
  PiggyBank,
  Bitcoin,
  Banknote,
  Plus,
  ChevronDown,
  ChevronRight,
  LayoutGrid,
  Link2,
  Edit2,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Account {
  id: string;
  name: string;
  type: string;
  institution: string | null;
  balance: number;
  color: string | null;
  isSnapTrade: boolean;
  _count?: { transactions: number; positions: number };
}

interface AccountSidebarProps {
  accounts: Account[];
  selectedAccountId: string | null;
  onSelectAccount: (accountId: string | null) => void;
  onAddAccount: () => void;
  onEditAccount: (account: Account) => void;
  onConnectSnapTrade: () => void;
  isConnecting?: boolean;
  onSync: () => Promise<void>;
  totals: {
    assets: number;
    liabilities: number;
    netWorth: number;
  };
}

const accountTypeIcons: Record<string, React.ElementType> = {
  CHECKING: Building2,
  SAVINGS: PiggyBank,
  CREDIT_CARD: CreditCard,
  BROKERAGE: TrendingUp,
  RETIREMENT: TrendingUp,
  CRYPTO: Bitcoin,
  CASH: Banknote,
  OTHER: Wallet,
};

const accountTypeColors: Record<string, string> = {
  CHECKING: "text-primary",
  SAVINGS: "text-success",
  CREDIT_CARD: "text-destructive",
  BROKERAGE: "text-accent",
  RETIREMENT: "text-warning",
  CRYPTO: "text-warning",
  CASH: "text-success",
  OTHER: "text-foreground/60",
};

export function AccountSidebar({
  accounts,
  selectedAccountId,
  onSelectAccount,
  onAddAccount,
  onEditAccount,
  onConnectSnapTrade,
  isConnecting = false,
  onSync,
  totals,
}: AccountSidebarProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  // Group accounts by type
  const groupedAccounts = accounts.reduce((acc, account) => {
    const type = account.type;
    if (!acc[type]) acc[type] = [];
    acc[type].push(account);
    return acc;
  }, {} as Record<string, Account[]>);

  const hasSnapTradeAccounts = accounts.some((a) => a.isSnapTrade);

  const handleSync = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSyncing(true);
    try {
      await onSync();
    } finally {
      setIsSyncing(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="w-full md:w-72 lg:w-80 flex-shrink-0 space-y-4">
      {/* Net Worth Card */}
      <Card className="overflow-hidden">
        <div className="p-4">
          <div className="text-xs text-foreground/60 uppercase tracking-wider mb-1">
            Net Worth
          </div>
          <div className={cn(
            "text-3xl font-bold",
            totals.netWorth >= 0 ? "text-success" : "text-destructive"
          )}>
            {formatCurrency(totals.netWorth)}
          </div>
          <div className="flex gap-4 mt-3 text-sm">
            <div>
              <span className="text-foreground/60">Assets: </span>
              <span className="text-success font-medium">
                {formatCurrency(totals.assets)}
              </span>
            </div>
            <div>
              <span className="text-foreground/60">Debt: </span>
              <span className="text-destructive font-medium">
                {formatCurrency(totals.liabilities)}
              </span>
            </div>
          </div>
        </div>
        <div className="h-1 bg-primary" />
      </Card>

      {/* Accounts List */}
      <Card className="overflow-hidden">
        <div className="p-4 border-b border-border/50">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
              Accounts ({accounts.length})
            </button>

            {hasSnapTradeAccounts && isExpanded && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-foreground/40 hover:text-primary hover:bg-primary/10"
                onClick={handleSync}
                disabled={isSyncing}
                title="Sync all connected accounts"
              >
                <RefreshCw className={cn("h-4 w-4", isSyncing && "animate-spin")} />
              </Button>
            )}
          </div>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="p-2">
                {/* All Accounts Option */}
                <button
                  onClick={() => onSelectAccount(null)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all touch-manipulation",
                    selectedAccountId === null
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-secondary/50 text-foreground/80"
                  )}
                >
                  <div className="p-1.5 rounded-md bg-primary/10">
                    <LayoutGrid className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-sm font-medium">All Accounts</div>
                  </div>
                </button>

                {/* Account Groups */}
                {Object.entries(groupedAccounts).map(([type, typeAccounts]) => {
                  const Icon = accountTypeIcons[type] || Wallet;
                  const colorClass = accountTypeColors[type] || "text-foreground/60";

                  return (
                    <div key={type} className="mt-2">
                      <div className="px-3 py-1 text-xs text-foreground/40 uppercase tracking-wider">
                        {type.replace("_", " ")}
                      </div>
                      {typeAccounts.map((account) => (
                        <div
                          key={account.id}
                          className={cn(
                            "group relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all",
                            selectedAccountId === account.id
                              ? "bg-primary/10 text-primary"
                              : "hover:bg-secondary/50 text-foreground/80"
                          )}
                        >
                          <button
                            onClick={() => onSelectAccount(account.id)}
                            className="flex items-center gap-3 flex-1 min-w-0 touch-manipulation"
                          >
                            <div
                              className="p-1.5 rounded-md flex-shrink-0"
                              style={{
                                backgroundColor: account.color
                                  ? `${account.color}20`
                                  : undefined,
                              }}
                            >
                              <Icon
                                className={cn(
                                  "h-4 w-4",
                                  account.color ? "" : colorClass
                                )}
                                style={account.color ? { color: account.color } : undefined}
                              />
                            </div>
                            <div className="flex-1 text-left min-w-0">
                              <div className="text-sm font-medium truncate">
                                {account.name}
                              </div>
                              {account.institution && (
                                <div className="text-xs text-foreground/50 truncate">
                                  {account.institution}
                                </div>
                              )}
                            </div>
                            <div className="text-right">
                              <div
                                className={cn(
                                  "text-sm font-semibold",
                                  account.type === "CREDIT_CARD"
                                    ? "text-destructive"
                                    : "text-success"
                                )}
                              >
                                {formatCurrency(Number(account.balance))}
                              </div>
                              {account.isSnapTrade && (
                                <Badge variant="primary" className="text-[10px] px-1.5 py-0">
                                  Linked
                                </Badge>
                              )}
                            </div>
                          </button>
                          {/* Edit button - appears on hover */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditAccount(account);
                            }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md opacity-0 group-hover:opacity-100 hover:bg-secondary transition-all"
                            title="Edit account"
                          >
                            <Edit2 className="h-3.5 w-3.5 text-foreground/60" />
                          </button>
                        </div>
                      ))}
                    </div>
                  );
                })}

                {/* Empty State */}
                {accounts.length === 0 && (
                  <div className="py-8 text-center text-foreground/60">
                    <Wallet className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No accounts yet</p>
                  </div>
                )}
              </div>

              {/* Add Account Buttons */}
              <div className="p-3 border-t border-border/50 space-y-3">
                {/* Premium Connect Brokerage Button */}
                <button
                  onClick={onConnectSnapTrade}
                  disabled={isConnecting}
                  className={cn(
                    "group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-primary via-primary to-accent p-[1px] transition-all duration-300 hover:shadow-lg hover:shadow-primary/25 active:scale-[0.98]",
                    isConnecting && "opacity-70 cursor-not-allowed"
                  )}
                >
                  <div className="relative flex items-center justify-center gap-3 rounded-[11px] bg-background/90 backdrop-blur-sm px-4 py-3 transition-all group-hover:bg-background/70">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      {isConnecting ? (
                        <RefreshCw className="h-4 w-4 text-primary animate-spin" />
                      ) : (
                        <Link2 className="h-4 w-4 text-primary" />
                      )}
                    </div>
                    <div className="flex-1 text-left">
                      <div className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                        Connect Brokerage
                      </div>
                      <div className="text-[10px] text-foreground/50">
                        Sync accounts automatically
                      </div>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <ChevronRight className="h-4 w-4 text-primary" />
                    </div>
                  </div>
                  {/* Animated gradient border effect */}
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary via-accent to-primary opacity-0 group-hover:opacity-100 transition-opacity blur-xl -z-10" />
                </button>

                <Button
                  onClick={onAddAccount}
                  variant="ghost"
                  className="w-full justify-start text-foreground/60 hover:text-foreground"
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Manual Account
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </div>
  );
}

