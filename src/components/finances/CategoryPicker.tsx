"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Plus, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface CategoryPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (category: string) => Promise<void>;
  categories: string[];
  transactionType: "INCOME" | "EXPENSE";
}

export function CategoryPicker({
  isOpen,
  onClose,
  onSelect,
  categories,
  transactionType,
}: CategoryPickerProps) {
  const [customCategory, setCustomCategory] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleSelect = async (category: string) => {
    setSelectedCategory(category);
    setIsSubmitting(true);
    try {
      await onSelect(category);
      onClose();
    } finally {
      setIsSubmitting(false);
      setSelectedCategory(null);
    }
  };

  const handleCustomSubmit = async () => {
    if (!customCategory.trim()) return;
    await handleSelect(customCategory.trim());
    setCustomCategory("");
  };

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

          <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="relative w-full max-w-md rounded-t-2xl md:rounded-2xl border border-border bg-background shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <h2 className="text-lg font-semibold">
                  Choose Category
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-secondary transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                {/* Quick Categories */}
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => handleSelect(cat)}
                      disabled={isSubmitting}
                      className={cn(
                        "px-4 py-2 rounded-lg text-sm transition-all",
                        selectedCategory === cat
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary/50 hover:bg-secondary",
                        isSubmitting && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      {selectedCategory === cat ? (
                        <span className="flex items-center gap-2">
                          <motion.div
                            className="h-3 w-3 rounded-full border-2 border-current border-t-transparent"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          />
                          {cat}
                        </span>
                      ) : (
                        cat
                      )}
                    </button>
                  ))}
                </div>

                {/* Custom Category */}
                <div className="pt-4 border-t border-border/50">
                  <p className="text-sm text-foreground/60 mb-3">
                    Or create a new category:
                  </p>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Custom category name"
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleCustomSubmit();
                        }
                      }}
                    />
                    <Button
                      onClick={handleCustomSubmit}
                      disabled={!customCategory.trim() || isSubmitting}
                      size="icon"
                    >
                      {isSubmitting ? (
                        <motion.div
                          className="h-4 w-4 rounded-full border-2 border-current border-t-transparent"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                      ) : (
                        <Plus className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

