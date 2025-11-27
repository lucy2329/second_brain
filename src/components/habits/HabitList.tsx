"use client";

import { HabitCard } from "./HabitCard";
import { motion } from "framer-motion";

interface Habit {
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
}

interface HabitListProps {
  habits: Habit[];
  onCheckIn: (habitId: string) => Promise<void>;
  onEdit: (habitId: string) => void;
  onDelete: (habitId: string) => void;
}

export function HabitList({ habits, onCheckIn, onEdit, onDelete }: HabitListProps) {
  if (habits.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="text-6xl mb-4">🎯</div>
          <h3 className="text-xl font-semibold mb-2">No habits yet</h3>
          <p className="text-foreground/60 mb-6">
            Start building better habits by creating your first one!
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {habits.map((habit, index) => (
        <motion.div
          key={habit.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <HabitCard
            habit={habit}
            onCheckIn={onCheckIn}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </motion.div>
      ))}
    </div>
  );
}
