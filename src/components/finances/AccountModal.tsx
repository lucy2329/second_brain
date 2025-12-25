"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  X,
  Building2,
  CreditCard,
  TrendingUp,
  PiggyBank,
  Bitcoin,
  Banknote,
  Wallet,
  Trash2,
  Link2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: AccountFormData) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  account?: {
    id: string;
    name: string;
    type: string;
    institution: string | null;
    balance: number;
    color: string | null;
    isSnapTrade?: boolean;
  } | null;
}

interface AccountFormData {
  name: string;
  type: string;
  institution: string;
  balance: number;
  color: string;
}

const accountTypes = [
  { id: "CHECKING", label: "Checking", icon: Building2 },
  { id: "SAVINGS", label: "Savings", icon: PiggyBank },
  { id: "CREDIT_CARD", label: "Credit Card", icon: CreditCard },
  { id: "BROKERAGE", label: "Brokerage", icon: TrendingUp },
  { id: "RETIREMENT", label: "Retirement", icon: TrendingUp },
  { id: "CRYPTO", label: "Crypto", icon: Bitcoin },
  { id: "CASH", label: "Cash", icon: Banknote },
  { id: "OTHER", label: "Other", icon: Wallet },
];

const accountColors = [
  "#3b82f6", // Blue
  "#10b981", // Green
  "#f59e0b", // Amber
  "#ef4444", // Red
  "#8b5cf6", // Purple
  "#ec4899", // Pink
  "#06b6d4", // Cyan
  "#84cc16", // Lime
];

export function AccountModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  account,
}: AccountModalProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState("CHECKING");
  const [institution, setInstitution] = useState("");
  const [balance, setBalance] = useState("");
  const [color, setColor] = useState(accountColors[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (account) {
      setName(account.name);
      setType(account.type);
      setInstitution(account.institution || "");
      setBalance(String(account.balance));
      setColor(account.color || accountColors[0]);
    } else {
      setName("");
      setType("CHECKING");
      setInstitution("");
      setBalance("");
      setColor(accountColors[0]);
    }
    setShowDeleteConfirm(false);
  }, [account, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !type) return;

    setIsSubmitting(true);
    try {
      await onSave({
        name,
        type,
        institution,
        balance: parseFloat(balance) || 0,
        color,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!account || !onDelete) return;
    setIsSubmitting(true);
    try {
      await onDelete(account.id);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-lg rounded-2xl border border-border bg-background shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <h2 className="text-xl font-semibold">
                  {account ? "Edit Account" : "Add Account"}
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-secondary transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Content */}
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {account?.isSnapTrade && (
                  <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 flex items-start gap-4 mb-6">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Link2 className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-primary">Connected Account</div>
                      <p className="text-xs text-primary/70 mt-0.5 leading-relaxed">
                        This account is managed through SnapTrade. Name, type, and balance are automatically kept in sync.
                      </p>
                    </div>
                  </div>
                )}

                {/* Account Name */}
                <Input
                  label="Account Name"
                  placeholder="e.g., Chase Checking"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={account?.isSnapTrade}
                  required
                />

                {/* Account Type */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground/80">
                    Account Type
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {accountTypes.map((t) => {
                      const Icon = t.icon;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setType(t.id)}
                          disabled={account?.isSnapTrade}
                          className={cn(
                            "flex flex-col items-center gap-1 p-3 rounded-lg border transition-all",
                            type === t.id
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border hover:border-primary/50",
                            account?.isSnapTrade && type !== t.id && "opacity-50"
                          )}
                        >
                          <Icon className="h-5 w-5" />
                          <span className="text-xs">{t.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Institution */}
                <Input
                  label="Institution (Optional)"
                  placeholder="e.g., Chase, Fidelity"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  disabled={account?.isSnapTrade}
                />

                {/* Balance */}
                <Input
                  label="Current Balance"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={balance}
                  onChange={(e) => setBalance(e.target.value)}
                  disabled={account?.isSnapTrade}
                />

                {/* Color */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground/80">
                    Color
                  </label>
                  <div className="flex gap-2">
                    {accountColors.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setColor(c)}
                        className={cn(
                          "w-8 h-8 rounded-full transition-all",
                          color === c
                            ? "ring-2 ring-offset-2 ring-offset-background ring-primary scale-110"
                            : "hover:scale-105"
                        )}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>

                {/* Delete Confirmation */}
                {account && onDelete && (
                  <div className="pt-4 border-t border-border">
                    {showDeleteConfirm ? (
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-destructive">
                          Delete this account?
                        </span>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={handleDelete}
                          isLoading={isSubmitting}
                        >
                          Confirm
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowDeleteConfirm(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowDeleteConfirm(true)}
                        className="flex items-center gap-2 text-sm text-destructive hover:text-destructive/80 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete Account
                      </button>
                    )}
                  </div>
                )}
              </form>

              {/* Footer */}
              <div className="flex gap-3 justify-end px-6 py-4 border-t border-border">
                <Button type="button" variant="ghost" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  isLoading={isSubmitting}
                  disabled={!name}
                >
                  {account ? "Save Changes" : "Add Account"}
                </Button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

