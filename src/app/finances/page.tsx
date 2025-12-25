"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AccountSidebar } from "@/components/finances/AccountSidebar";
import { AccountModal } from "@/components/finances/AccountModal";
import { TransactionList } from "@/components/finances/TransactionList";
import { TransactionModal } from "@/components/finances/TransactionModal";
import { CategoryPicker } from "@/components/finances/CategoryPicker";
import { PortfolioSummary } from "@/components/finances/PortfolioSummary";
import { SpendAnalytics } from "@/components/finances/SpendAnalytics";
import { QuickCaptureFAB } from "@/components/capture/QuickCaptureFAB";
import { QuickCapture } from "@/components/capture/QuickCapture";
import { useToast } from "@/components/ui/toast";
import {
  ArrowLeft,
  Plus,
  Wallet,
  TrendingUp,
  BarChart3,
  Receipt,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type TabType = "transactions" | "portfolio" | "analytics";

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

interface Transaction {
  id: string;
  type: "INCOME" | "EXPENSE";
  amount: number;
  category: string | null;
  description: string | null;
  merchant: string | null;
  date: string;
  accountId?: string | null;
  account: {
    id: string;
    name: string;
    institution: string | null;
    color: string | null;
  } | null;
}

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

export default function FinancesPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("transactions");
  
  // Account state
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [accountTotals, setAccountTotals] = useState({ assets: 0, liabilities: 0, netWorth: 0 });
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);

  // Transaction state
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [defaultTransactionType, setDefaultTransactionType] = useState<"INCOME" | "EXPENSE">("EXPENSE");

  // Category picker state
  const [isCategoryPickerOpen, setIsCategoryPickerOpen] = useState(false);
  const [categorizingTransaction, setCategorizingTransaction] = useState<Transaction | null>(null);

  // Portfolio state
  const [positions, setPositions] = useState<Position[]>([]);
  const [stocks, setStocks] = useState<Position[]>([]);
  const [options, setOptions] = useState<Position[]>([]);
  const [portfolioSummary, setPortfolioSummary] = useState({
    totalValue: 0,
    totalCost: 0,
    totalGainLoss: 0,
    totalGainLossPercent: 0,
  });

  // Analytics state
  const [analyticsData, setAnalyticsData] = useState<any>(null);

  // Quick Capture
  const [isQuickCaptureOpen, setIsQuickCaptureOpen] = useState(false);

  // Institution Connection
  const [isConnectingSnapTrade, setIsConnectingSnapTrade] = useState(false);

  const router = useRouter();
  const { showToast } = useToast();

  // --- 1. Data Fetching Functions ---
  
  const fetchAccounts = useCallback(async () => {
    try {
      const response = await fetch("/api/accounts");
      if (!response.ok) throw new Error("Failed to fetch accounts");
      const data = await response.json();
      setAccounts(data.accounts || []);
      setAccountTotals(data.totals || { assets: 0, liabilities: 0, netWorth: 0 });
    } catch (error) {
      console.error("Error fetching accounts:", error);
      showToast("Failed to load accounts", "error");
    }
  }, [showToast]);

  const fetchTransactions = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (selectedAccountId) params.set("accountId", selectedAccountId);
      
      const response = await fetch(`/api/transactions?${params}`);
      if (!response.ok) throw new Error("Failed to fetch transactions");
      const data = await response.json();
      setTransactions(data.transactions || []);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      showToast("Failed to load transactions", "error");
    }
  }, [selectedAccountId, showToast]);

  const fetchPositions = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (selectedAccountId) params.set("accountId", selectedAccountId);

      const response = await fetch(`/api/positions?${params}`);
      if (!response.ok) throw new Error("Failed to fetch positions");
      const data = await response.json();
      setPositions(data.positions || []);
      setStocks(data.stocks || []);
      setOptions(data.options || []);
      setPortfolioSummary(data.summary || {
        totalValue: 0,
        totalCost: 0,
        totalGainLoss: 0,
        totalGainLossPercent: 0,
      });
    } catch (error) {
      console.error("Error fetching positions:", error);
      showToast("Failed to load portfolio", "error");
    }
  }, [selectedAccountId, showToast]);

  const fetchAnalytics = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (selectedAccountId) params.set("accountId", selectedAccountId);

      const response = await fetch(`/api/analytics?${params}`);
      if (!response.ok) throw new Error("Failed to fetch analytics");
      const data = await response.json();
      setAnalyticsData(data);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      showToast("Failed to load analytics", "error");
    }
  }, [selectedAccountId, showToast]);

  // --- 2. Action Handlers ---

  const handleSync = useCallback(async () => {
    try {
      const response = await fetch("/api/snaptrade/sync", { method: "POST" });
      if (!response.ok) throw new Error("Sync failed");

      const data = await response.json();
      await Promise.all([
        fetchAccounts(),
        activeTab === "portfolio" ? fetchPositions() : Promise.resolve(),
        activeTab === "transactions" ? fetchTransactions() : Promise.resolve(),
      ]);

      showToast(
        `Synced ${data.accountsSynced} accounts and ${data.positionsSynced} positions!`,
        "success"
      );
    } catch (error) {
      console.error("Error syncing SnapTrade:", error);
      showToast("Failed to sync with SnapTrade", "error");
    }
  }, [fetchAccounts, fetchPositions, fetchTransactions, activeTab, showToast]);

  const handleConnectSnapTrade = useCallback(async () => {
    setIsConnectingSnapTrade(true);
    showToast("Opening SnapTrade connection portal...", "info");
    try {
      const regRes = await fetch("/api/snaptrade/register", { method: "POST" });
      if (!regRes.ok) throw new Error("Failed to register SnapTrade user");

      const loginRes = await fetch("/api/snaptrade/login");
      if (!loginRes.ok) throw new Error("Failed to get connection URL");
      
      const { redirectUrl } = await loginRes.json();
      
      if (redirectUrl) {
        window.location.href = redirectUrl;
      } else {
        throw new Error("No redirect URL received");
      }
    } catch (error) {
      console.error("SnapTrade connection error:", error);
      showToast("Failed to initiate SnapTrade connection", "error");
    } finally {
      setIsConnectingSnapTrade(false);
    }
  }, [showToast]);

  const handleSaveAccount = async (data: any) => {
    try {
      const url = editingAccount ? `/api/accounts/${editingAccount.id}` : "/api/accounts";
      const method = editingAccount ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Failed to save account");

      await fetchAccounts();
      showToast(editingAccount ? "Account updated!" : "Account created!", "success");
    } catch (error) {
      console.error("Error saving account:", error);
      showToast("Failed to save account", "error");
      throw error;
    }
  };

  const handleDeleteAccount = async (id: string) => {
    try {
      const response = await fetch(`/api/accounts/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete account");

      await fetchAccounts();
      if (selectedAccountId === id) setSelectedAccountId(null);
      showToast("Account deleted", "success");
    } catch (error) {
      console.error("Error deleting account:", error);
      showToast("Failed to delete account", "error");
      throw error;
    }
  };

  const handleSaveTransaction = async (data: any) => {
    try {
      const url = editingTransaction
        ? `/api/transactions/${editingTransaction.id}`
        : "/api/transactions";
      const method = editingTransaction ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Failed to save transaction");

      await Promise.all([fetchTransactions(), fetchAccounts()]);
      showToast(
        editingTransaction ? "Transaction updated!" : "Transaction added!",
        "success"
      );
    } catch (error) {
      console.error("Error saving transaction:", error);
      showToast("Failed to save transaction", "error");
      throw error;
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    try {
      const response = await fetch(`/api/transactions/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete transaction");

      await Promise.all([fetchTransactions(), fetchAccounts()]);
      showToast("Transaction deleted", "success");
    } catch (error) {
      console.error("Error deleting transaction:", error);
      showToast("Failed to delete transaction", "error");
    }
  };

  const handleCategorize = async (category: string) => {
    if (!categorizingTransaction) return;

    try {
      const response = await fetch(`/api/transactions/${categorizingTransaction.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category }),
      });

      if (!response.ok) throw new Error("Failed to categorize");

      await fetchTransactions();
      showToast("Category added!", "success");
    } catch (error) {
      console.error("Error categorizing:", error);
      showToast("Failed to add category", "error");
      throw error;
    }
  };

  // --- 3. Effects ---

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
      } else {
        setIsAuthenticated(true);
      }
      setIsLoading(false);
    };

    checkAuth();
  }, [router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchAccounts();

      const searchParams = new URL(window.location.href).searchParams;
      if (searchParams.get("snaptrade_sync") === "true") {
        handleSync();
        const newUrl = window.location.pathname;
        window.history.replaceState({}, "", newUrl);
      }
    }
  }, [isAuthenticated, fetchAccounts, handleSync]);

  useEffect(() => {
    if (!isAuthenticated) return;

    if (activeTab === "transactions") {
      fetchTransactions();
    } else if (activeTab === "portfolio") {
      fetchPositions();
    } else if (activeTab === "analytics") {
      fetchAnalytics();
    }
  }, [isAuthenticated, activeTab, selectedAccountId, fetchTransactions, fetchPositions, fetchAnalytics]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 flex items-center justify-center">
        <motion.div
          className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const tabs = [
    { id: "transactions" as const, label: "Transactions", icon: Receipt },
    { id: "portfolio" as const, label: "Portfolio", icon: TrendingUp },
    { id: "analytics" as const, label: "Analytics", icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[20%] -right-[10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[100px]" />
        <div className="absolute -bottom-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-accent/5 blur-[100px]" />
      </div>

      <div className="relative p-4 md:p-8">
        <div className="max-w-[1600px] mx-auto">
          {/* Header */}
          <div className="mb-6 md:mb-8">
            <Link href="/">
              <Button variant="ghost" size="sm" className="mb-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2 text-primary">
                  Finances
                </h1>
                <p className="text-sm md:text-base text-foreground/60">
                  Track your money, grow your wealth
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    setDefaultTransactionType("EXPENSE");
                    setEditingTransaction(null);
                    setIsTransactionModalOpen(true);
                  }}
                  variant="secondary"
                >
                  <ArrowUpRight className="h-4 w-4 mr-2" />
                  Expense
                </Button>
                <Button
                  onClick={() => {
                    setDefaultTransactionType("INCOME");
                    setEditingTransaction(null);
                    setIsTransactionModalOpen(true);
                  }}
                >
                  <ArrowDownRight className="h-4 w-4 mr-2" />
                  Income
                </Button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex flex-col md:flex-row gap-6">
            {/* Sidebar */}
            <AccountSidebar
              accounts={accounts}
              selectedAccountId={selectedAccountId}
              onSelectAccount={setSelectedAccountId}
              onAddAccount={() => {
                setEditingAccount(null);
                setIsAccountModalOpen(true);
              }}
              onEditAccount={(account) => {
                setEditingAccount(account);
                setIsAccountModalOpen(true);
              }}
              onConnectSnapTrade={handleConnectSnapTrade}
              isConnecting={isConnectingSnapTrade}
              onSync={handleSync}
              totals={accountTotals}
            />

            {/* Main Area */}
            <div className="flex-1 min-w-0">
              {/* Tabs */}
              <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;

                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all whitespace-nowrap touch-manipulation",
                        isActive
                          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                          : "bg-secondary/30 text-foreground/60 hover:bg-secondary/50 hover:text-foreground"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Tab Content */}
              <AnimatePresence mode="wait">
                {activeTab === "transactions" && (
                  <motion.div
                    key="transactions"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <TransactionList
                      transactions={transactions}
                      onEdit={(t) => {
                        setEditingTransaction(t);
                        setIsTransactionModalOpen(true);
                      }}
                      onDelete={handleDeleteTransaction}
                      onCategorize={(t) => {
                        setCategorizingTransaction(t);
                        setIsCategoryPickerOpen(true);
                      }}
                    />
                  </motion.div>
                )}

                {activeTab === "portfolio" && (
                  <motion.div
                    key="portfolio"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <PortfolioSummary
                      stocks={stocks}
                      options={options}
                      summary={portfolioSummary}
                    />
                  </motion.div>
                )}

                {activeTab === "analytics" && (
                  <motion.div
                    key="analytics"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <SpendAnalytics data={analyticsData} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AccountModal
        isOpen={isAccountModalOpen}
        onClose={() => {
          setIsAccountModalOpen(false);
          setEditingAccount(null);
        }}
        onSave={handleSaveAccount}
        onDelete={editingAccount ? handleDeleteAccount : undefined}
        account={editingAccount}
      />

      <TransactionModal
        isOpen={isTransactionModalOpen}
        onClose={() => {
          setIsTransactionModalOpen(false);
          setEditingTransaction(null);
        }}
        onSave={handleSaveTransaction}
        accounts={accounts}
        categories={DEFAULT_CATEGORIES}
        transaction={editingTransaction}
        defaultType={defaultTransactionType}
      />

      <CategoryPicker
        isOpen={isCategoryPickerOpen}
        onClose={() => {
          setIsCategoryPickerOpen(false);
          setCategorizingTransaction(null);
        }}
        onSelect={handleCategorize}
        categories={
          categorizingTransaction?.type === "INCOME"
            ? DEFAULT_CATEGORIES.INCOME
            : DEFAULT_CATEGORIES.EXPENSE
        }
        transactionType={categorizingTransaction?.type || "EXPENSE"}
      />

      {/* Quick Capture FAB */}
      <QuickCaptureFAB onClick={() => setIsQuickCaptureOpen(true)} />

      <QuickCapture
        isOpen={isQuickCaptureOpen}
        onClose={() => setIsQuickCaptureOpen(false)}
        onSuccess={() => {
          fetchTransactions();
          fetchAccounts();
        }}
      />
    </div>
  );
}

