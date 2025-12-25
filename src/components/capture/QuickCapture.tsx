"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, StickyNote, CheckSquare, DollarSign, Target, TrendingUp, Dumbbell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";

type CaptureType = "note" | "task" | "expense" | "habit";

interface QuickCaptureProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void; // Callback to trigger refresh after successful creation
}

export function QuickCapture({ isOpen, onClose, onSuccess }: QuickCaptureProps) {
  const [activeTab, setActiveTab] = useState<CaptureType>("note");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  // Note state
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");

  // Task state
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");

  // Habit state
  const [habitName, setHabitName] = useState("");
  const [habitFrequency, setHabitFrequency] = useState<"DAILY" | "WEEKLY">("DAILY");

  // Expense state
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseCategory, setExpenseCategory] = useState("");
  const [expenseMerchant, setExpenseMerchant] = useState("");
  const [expenseDescription, setExpenseDescription] = useState("");
  const [expenseType, setExpenseType] = useState<"EXPENSE" | "INCOME">("EXPENSE");

  const tabs = [
    { id: "note" as const, label: "Note", icon: StickyNote, color: "text-primary" },
    { id: "task" as const, label: "Task", icon: CheckSquare, color: "text-accent" },
    { id: "expense" as const, label: "Expense", icon: DollarSign, color: "text-success" },
    { id: "habit" as const, label: "Habit", icon: Target, color: "text-warning" },
  ];

  const resetForm = () => {
    setNoteTitle("");
    setNoteContent("");
    setTaskTitle("");
    setTaskDescription("");
    setHabitName("");
    setHabitFrequency("DAILY");
    setExpenseAmount("");
    setExpenseCategory("");
    setExpenseMerchant("");
    setExpenseDescription("");
    setExpenseType("EXPENSE");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      if (activeTab === "note") {
        if (!noteTitle || !noteContent) {
          alert("Please fill in all fields");
          return;
        }

        const response = await fetch("/api/notes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: noteTitle,
            content: noteContent,
            paraType: "RESOURCE",
            tags: [],
          }),
        });

        if (!response.ok) throw new Error("Failed to create note");
        
        resetForm();
        onClose();
        onSuccess?.();
        showToast("Note created successfully! 📝", "success");
      } else if (activeTab === "task") {
        if (!taskTitle) {
          alert("Please enter a task title");
          return;
        }

        const response = await fetch("/api/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: taskTitle,
            description: taskDescription,
            status: "BACKLOG",
            tags: [],
          }),
        });

        if (!response.ok) throw new Error("Failed to create task");
        
        resetForm();
        onClose();
        onSuccess?.();
        showToast("Task created successfully! ✅", "success");
      } else if (activeTab === "habit") {
        if (!habitName) {
          alert("Please enter a habit name");
          return;
        }

        const response = await fetch("/api/habits", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: habitName,
            frequency: habitFrequency,
          }),
        });

        if (!response.ok) throw new Error("Failed to create habit");
        
        resetForm();
        onClose();
        onSuccess?.();
        showToast("Habit created successfully! 🎯", "success");
      } else if (activeTab === "expense") {
        if (!expenseAmount) {
          alert("Please enter an amount");
          return;
        }

        const response = await fetch("/api/transactions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: expenseType,
            amount: parseFloat(expenseAmount),
            category: expenseCategory || null,
            merchant: expenseMerchant || null,
            description: expenseDescription || null,
            date: new Date().toISOString(),
          }),
        });

        if (!response.ok) throw new Error("Failed to create transaction");
        
        resetForm();
        onClose();
        onSuccess?.();
        showToast(
          expenseType === "EXPENSE" 
            ? "Expense added! 💸" 
            : "Income added! 💰", 
          "success"
        );
      }
    } catch (error: any) {
      console.error("Error submitting:", error);
      const errorMessage = error?.message || "Failed to save. Please try again.";
      showToast(errorMessage, "error");
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
            onClick={handleClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-2xl h-full md:h-auto md:rounded-2xl border border-border bg-background shadow-2xl"
            >
              {/* Header */}
              <div className="border-b border-border px-4 md:px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Plus className="h-5 w-5 text-primary" />
                    <h2 className="text-lg md:text-xl font-semibold">Quick Capture</h2>
                  </div>
                  <button
                    onClick={handleClose}
                    className="rounded-lg p-2 text-foreground/60 hover:bg-secondary hover:text-foreground transition-colors touch-manipulation"
                    aria-label="Close"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Tabs */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                          "relative flex items-center gap-2 px-4 py-2 rounded-lg transition-all",
                          isActive
                            ? "bg-secondary text-foreground"
                            : "text-foreground/60 hover:text-foreground hover:bg-secondary/50"
                        )}
                      >
                        <Icon className={cn("h-4 w-4", isActive && tab.color)} />
                        <span className="text-sm font-medium">{tab.label}</span>
                        {isActive && (
                          <motion.div
                            layoutId="activeTab"
                            className="absolute inset-0 bg-secondary rounded-lg -z-10"
                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Content */}
              <div className="px-4 md:px-6 py-6 overflow-y-auto max-h-[calc(100vh-250px)] md:max-h-[calc(100vh-300px)]">
                <AnimatePresence mode="wait">
                  {activeTab === "note" && (
                    <motion.div
                      key="note"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-4"
                    >
                      <Input
                        label="Title"
                        placeholder="What's this about?"
                        value={noteTitle}
                        onChange={(e) => setNoteTitle(e.target.value)}
                        autoFocus
                      />
                      <Textarea
                        label="Content"
                        placeholder="Write your thoughts..."
                        rows={6}
                        value={noteContent}
                        onChange={(e) => setNoteContent(e.target.value)}
                      />
                      <div className="flex gap-2">
                        <Badge variant="primary">Resource</Badge>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === "task" && (
                    <motion.div
                      key="task"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-4"
                    >
                      <Input
                        label="Task"
                        placeholder="What needs to be done?"
                        value={taskTitle}
                        onChange={(e) => setTaskTitle(e.target.value)}
                        autoFocus
                      />
                      <Textarea
                        label="Description (optional)"
                        placeholder="Add more details..."
                        rows={4}
                        value={taskDescription}
                        onChange={(e) => setTaskDescription(e.target.value)}
                      />
                      <div className="flex gap-2">
                        <Badge>Backlog</Badge>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === "expense" && (
                    <motion.div
                      key="expense"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-4"
                    >
                      {/* Type Toggle */}
                      <div className="flex rounded-lg border border-border overflow-hidden">
                        <button
                          type="button"
                          onClick={() => setExpenseType("EXPENSE")}
                          className={cn(
                            "flex-1 py-2 text-sm font-medium transition-all",
                            expenseType === "EXPENSE"
                              ? "bg-destructive/10 text-destructive"
                              : "hover:bg-secondary/50"
                          )}
                        >
                          Expense
                        </button>
                        <button
                          type="button"
                          onClick={() => setExpenseType("INCOME")}
                          className={cn(
                            "flex-1 py-2 text-sm font-medium transition-all",
                            expenseType === "INCOME"
                              ? "bg-success/10 text-success"
                              : "hover:bg-secondary/50"
                          )}
                        >
                          Income
                        </button>
                      </div>

                      {/* Amount */}
                      <div>
                        <label className="block text-sm font-medium text-foreground/80 mb-2">
                          Amount
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/60">
                            $
                          </span>
                          <input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            value={expenseAmount}
                            onChange={(e) => setExpenseAmount(e.target.value)}
                            className="w-full pl-7 pr-4 py-2.5 rounded-lg border border-border bg-background/50 text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-primary tabular-nums"
                            autoFocus
                          />
                        </div>
                      </div>

                      <Input
                        label={expenseType === "EXPENSE" ? "Merchant / Store" : "Source"}
                        placeholder={expenseType === "EXPENSE" ? "e.g., Starbucks, Amazon" : "e.g., Salary, Freelance"}
                        value={expenseMerchant}
                        onChange={(e) => setExpenseMerchant(e.target.value)}
                      />

                      <Input
                        label="Category (optional)"
                        placeholder="e.g., Food, Transport, Entertainment"
                        value={expenseCategory}
                        onChange={(e) => setExpenseCategory(e.target.value)}
                      />

                      <Textarea
                        label="Notes (optional)"
                        placeholder="Add any details..."
                        rows={2}
                        value={expenseDescription}
                        onChange={(e) => setExpenseDescription(e.target.value)}
                      />

                      <div className="flex gap-2">
                        <Badge variant={expenseType === "EXPENSE" ? "destructive" : "success"}>
                          {expenseType === "EXPENSE" ? "Expense" : "Income"}
                        </Badge>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === "habit" && (
                    <motion.div
                      key="habit"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-4"
                    >
                      <Input
                        label="Habit Name"
                        placeholder="e.g., Morning Exercise, Read for 30 min"
                        value={habitName}
                        onChange={(e) => setHabitName(e.target.value)}
                        autoFocus
                      />
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-foreground/80">Frequency</label>
                        <select
                          className="flex h-11 md:h-10 w-full rounded-lg border border-border bg-background/50 px-3 py-2 text-base md:text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 touch-manipulation"
                          value={habitFrequency}
                          onChange={(e) => setHabitFrequency(e.target.value as "DAILY" | "WEEKLY")}
                        >
                          <option value="DAILY">Daily</option>
                          <option value="WEEKLY">Weekly</option>
                        </select>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="primary">New Habit</Badge>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Footer */}
              <div className="border-t border-border px-4 md:px-6 py-4 flex gap-3 justify-end">
                <Button variant="ghost" onClick={handleClose}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  isLoading={isSubmitting}
                  disabled={isSubmitting}
                >
                  Save
                </Button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
