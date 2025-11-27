"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ContributionGraph } from "./ContributionGraph";
import { CheckCircle2, Edit2, Trash2, Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";

interface HabitCardProps {
  habit: {
    id: string;
    name: string;
    frequency: string;
    logs: Array<{ date: Date | string }>;
    stats: {
      currentStreak: number;
      longestStreak: number;
      completedToday: boolean;
      totalCompletions: number;
    };
  };
  onCheckIn: (habitId: string) => Promise<void>;
  onEdit: (habitId: string) => void;
  onDelete: (habitId: string) => void;
}

export function HabitCard({ habit, onCheckIn, onEdit, onDelete }: HabitCardProps) {
  const [isChecking, setIsChecking] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const { showToast } = useToast();

  const handleCheckIn = async () => {
    if (habit.stats.completedToday) {
      showToast("Already checked in for today!", "info");
      return;
    }
    
    if (isChecking) return;

    setIsChecking(true);
    try {
      await onCheckIn(habit.id);
      
      // Show celebration animation
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 2000);
      
      showToast("Great job! Habit checked in! 🎉", "success");
    } catch (error: any) {
      console.error("Failed to check in:", error);
      const errorMessage = error?.message || "Failed to check in. Please try again.";
      showToast(errorMessage, "error");
    } finally {
      setIsChecking(false);
    }
  };

  const last30Days = habit.logs.slice(0, 30);

  return (
    <Card className="relative overflow-hidden hover:shadow-xl transition-shadow">
      {/* Celebration Animation */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-success/20 backdrop-blur-sm z-50 pointer-events-none"
          >
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              className="text-6xl"
            >
              🎉
            </motion.div>
            
            {/* Confetti particles */}
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  x: 0, 
                  y: 0, 
                  opacity: 1,
                  scale: 1 
                }}
                animate={{
                  x: (Math.random() - 0.5) * 200,
                  y: (Math.random() - 0.5) * 200,
                  opacity: 0,
                  scale: 0,
                }}
                transition={{
                  duration: 1,
                  delay: i * 0.05,
                  ease: "easeOut"
                }}
                className="absolute top-1/2 left-1/2 w-3 h-3 rounded-full"
                style={{
                  backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][i % 5],
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-2">{habit.name}</h3>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="primary" className="text-xs">
                {habit.frequency}
              </Badge>
              {habit.stats.currentStreak > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex items-center gap-1 text-sm font-medium text-warning"
                >
                  <Flame className="h-4 w-4" />
                  <span>{habit.stats.currentStreak} day streak</span>
                </motion.div>
              )}
            </div>
          </div>

          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(habit.id)}
              className="h-8 w-8"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(habit.id)}
              className="h-8 w-8 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2 rounded-lg bg-secondary/30">
            <div className="text-2xl font-bold text-primary">{habit.stats.currentStreak}</div>
            <div className="text-xs text-foreground/60">Current</div>
          </div>
          <div className="p-2 rounded-lg bg-secondary/30">
            <div className="text-2xl font-bold text-accent">{habit.stats.longestStreak}</div>
            <div className="text-xs text-foreground/60">Longest</div>
          </div>
          <div className="p-2 rounded-lg bg-secondary/30">
            <div className="text-2xl font-bold text-success">{habit.stats.totalCompletions}</div>
            <div className="text-xs text-foreground/60">Total</div>
          </div>
        </div>

        {/* Mini Contribution Graph (last 30 days) */}
        <div className="pt-2 border-t border-border/50">
          <div className="text-xs text-foreground/60 mb-2">Last 30 days</div>
          <div className="flex gap-[2px] overflow-x-auto scrollbar-hide">
            {[...Array(30)].map((_, i) => {
              const date = new Date();
              date.setDate(date.getDate() - (29 - i));
              date.setHours(0, 0, 0, 0);
              
              const hasLog = last30Days.some(log => {
                const logDate = new Date(log.date);
                logDate.setHours(0, 0, 0, 0);
                return logDate.getTime() === date.getTime();
              });

              return (
                <div
                  key={i}
                  className={cn(
                    "w-2 h-8 rounded-sm flex-shrink-0",
                    hasLog ? "bg-success" : "bg-secondary/30"
                  )}
                  title={date.toLocaleDateString()}
                />
              );
            })}
          </div>
        </div>

        {/* Check-in Button */}
        <Button
          onClick={handleCheckIn}
          disabled={habit.stats.completedToday || isChecking}
          className={cn(
            "w-full",
            habit.stats.completedToday && "bg-success hover:bg-success cursor-not-allowed opacity-100"
          )}
        >
          {habit.stats.completedToday ? (
            <>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Completed Today
            </>
          ) : (
            <>Check In Today</>
          )}
        </Button>
      </div>
    </Card>
  );
}
