"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, StickyNote, CheckSquare, DollarSign, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type CaptureType = "note" | "task" | "expense" | "habit";

interface QuickCaptureProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void; // Callback to trigger refresh after successful creation
}

export function QuickCapture({ isOpen, onClose, onSuccess }: QuickCaptureProps) {
  const [activeTab, setActiveTab] = useState<CaptureType>("note");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Note state
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");

  // Task state
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");

  // Expense state
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseCategory, setExpenseCategory] = useState("");
  const [expenseDescription, setExpenseDescription] = useState("");

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
    setExpenseAmount("");
    setExpenseCategory("");
    setExpenseDescription("");
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
        onSuccess?.(); // Trigger refresh in parent component
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
        onSuccess?.(); // Trigger refresh in parent component
      }
      // TODO: Implement expense and habit capture
    } catch (error) {
      console.error("Error submitting:", error);
      alert("Failed to save. Please try again.");
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-2xl rounded-2xl border border-border bg-background shadow-2xl"
            >
              {/* Header */}
              <div className="border-b border-border px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Plus className="h-5 w-5 text-primary" />
                    <h2 className="text-xl font-semibold">Quick Capture</h2>
                  </div>
                  <button
                    onClick={handleClose}
                    className="rounded-lg p-1 text-foreground/60 hover:bg-secondary hover:text-foreground transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Tabs */}
                <div className="mt-4 flex gap-2">
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
              <div className="px-6 py-6">
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
                      <Input
                        label="Amount"
                        type="number"
                        placeholder="0.00"
                        value={expenseAmount}
                        onChange={(e) => setExpenseAmount(e.target.value)}
                        autoFocus
                      />
                      <Input
                        label="Category"
                        placeholder="e.g., Food, Transport, Entertainment"
                        value={expenseCategory}
                        onChange={(e) => setExpenseCategory(e.target.value)}
                      />
                      <Textarea
                        label="Description (optional)"
                        placeholder="What was this for?"
                        rows={3}
                        value={expenseDescription}
                        onChange={(e) => setExpenseDescription(e.target.value)}
                      />
                      <p className="text-sm text-foreground/60">
                        Coming soon: Full expense tracking
                      </p>
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
                      <p className="text-center text-foreground/60 py-8">
                        Habit tracking coming soon!
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Footer */}
              <div className="border-t border-border px-6 py-4 flex gap-3 justify-end">
                <Button variant="ghost" onClick={handleClose}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  isLoading={isSubmitting}
                  disabled={isSubmitting || (activeTab === "expense") || (activeTab === "habit")}
                >
                  {activeTab === "expense" || activeTab === "habit" ? "Coming Soon" : "Save"}
                </Button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
