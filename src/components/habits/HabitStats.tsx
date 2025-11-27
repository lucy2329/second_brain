"use client";

import { Card } from "@/components/ui/card";
import { Target, Flame, TrendingUp, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

interface HabitStatsProps {
  habits: Array<{
    stats: {
      currentStreak: number;
      longestStreak: number;
      completedToday: boolean;
      totalCompletions: number;
    };
  }>;
}

export function HabitStats({ habits }: HabitStatsProps) {
  const totalHabits = habits.length;
  const completedToday = habits.filter(h => h.stats.completedToday).length;
  const completionRate = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;
  const longestStreak = Math.max(...habits.map(h => h.stats.longestStreak), 0);
  const activeStreaks = habits.filter(h => h.stats.currentStreak > 0).length;

  const stats = [
    {
      icon: Target,
      label: "Total Habits",
      value: totalHabits,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      icon: CheckCircle2,
      label: "Completed Today",
      value: `${completedToday}/${totalHabits}`,
      subValue: `${completionRate}%`,
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      icon: Flame,
      label: "Longest Streak",
      value: longestStreak,
      subValue: longestStreak === 1 ? "day" : "days",
      color: "text-warning",
      bgColor: "bg-warning/10",
    },
    {
      icon: TrendingUp,
      label: "Active Streaks",
      value: activeStreaks,
      subValue: `of ${totalHabits}`,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <Card className="hover:shadow-lg transition-shadow">
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-foreground/60 mb-1">{stat.label}</div>
                <div className="flex items-baseline gap-1">
                  <div className="text-2xl font-bold">{stat.value}</div>
                  {stat.subValue && (
                    <div className="text-sm text-foreground/60">{stat.subValue}</div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
