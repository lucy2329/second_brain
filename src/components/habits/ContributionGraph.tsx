"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface ContributionDay {
  date: Date;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

interface ContributionGraphProps {
  logs: Array<{ date: Date | string }>;
  onDayClick?: (date: Date) => void;
  className?: string;
}

export function ContributionGraph({ logs, onDayClick, className }: ContributionGraphProps) {
  const [hoveredDay, setHoveredDay] = useState<ContributionDay | null>(null);

  // Generate last 365 days
  const generateDays = (): ContributionDay[] => {
    const days: ContributionDay[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Create a map of dates to counts
    const logCounts = new Map<string, number>();
    logs.forEach(log => {
      const date = new Date(log.date);
      date.setHours(0, 0, 0, 0);
      const key = date.toISOString().split('T')[0];
      logCounts.set(key, (logCounts.get(key) || 0) + 1);
    });

    // Generate 365 days
    for (let i = 364; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const key = date.toISOString().split('T')[0];
      const count = logCounts.get(key) || 0;
      
      let level: 0 | 1 | 2 | 3 | 4 = 0;
      if (count === 1) level = 1;
      else if (count === 2) level = 2;
      else if (count === 3) level = 3;
      else if (count >= 4) level = 4;

      days.push({ date, count, level });
    }

    return days;
  };

  const days = generateDays();

  // Group days by week
  const weeks: ContributionDay[][] = [];
  let currentWeek: ContributionDay[] = [];
  
  // Pad the beginning to start on Sunday
  const firstDay = days[0].date.getDay();
  for (let i = 0; i < firstDay; i++) {
    currentWeek.push({ date: new Date(0), count: 0, level: 0 });
  }

  days.forEach((day, index) => {
    currentWeek.push(day);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });

  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push({ date: new Date(0), count: 0, level: 0 });
    }
    weeks.push(currentWeek);
  }

  // Get month labels
  const getMonthLabels = () => {
    const labels: { month: string; weekIndex: number }[] = [];
    let lastMonth = -1;

    weeks.forEach((week, weekIndex) => {
      const firstValidDay = week.find(d => d.date.getTime() > 0);
      if (firstValidDay) {
        const month = firstValidDay.date.getMonth();
        if (month !== lastMonth && weekIndex > 0) {
          labels.push({
            month: firstValidDay.date.toLocaleDateString('en-US', { month: 'short' }),
            weekIndex,
          });
          lastMonth = month;
        }
      }
    });

    return labels;
  };

  const monthLabels = getMonthLabels();

  const getLevelColor = (level: number) => {
    switch (level) {
      case 0: return "bg-secondary/30";
      case 1: return "bg-success/30";
      case 2: return "bg-success/50";
      case 3: return "bg-success/70";
      case 4: return "bg-success";
      default: return "bg-secondary/30";
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      year: 'numeric' 
    });
  };

  return (
    <div className={cn("relative", className)}>
      {/* Month labels */}
      <div className="flex gap-[3px] mb-2 ml-8 overflow-x-auto scrollbar-hide">
        {monthLabels.map((label, index) => (
          <div
            key={index}
            className="text-xs text-foreground/60"
            style={{ marginLeft: `${label.weekIndex * 15}px` }}
          >
            {label.month}
          </div>
        ))}
      </div>

      {/* Graph */}
      <div className="flex gap-[3px] overflow-x-auto scrollbar-hide pb-2">
        {/* Day labels */}
        <div className="flex flex-col gap-[3px] text-xs text-foreground/60 pr-2">
          <div className="h-[12px]">Mon</div>
          <div className="h-[12px]"></div>
          <div className="h-[12px]">Wed</div>
          <div className="h-[12px]"></div>
          <div className="h-[12px]">Fri</div>
          <div className="h-[12px]"></div>
          <div className="h-[12px]">Sun</div>
        </div>

        {/* Contribution grid */}
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="flex flex-col gap-[3px]">
            {week.map((day, dayIndex) => {
              const isPlaceholder = day.date.getTime() === 0;
              
              return (
                <motion.button
                  key={dayIndex}
                  className={cn(
                    "w-[12px] h-[12px] rounded-sm transition-all touch-manipulation",
                    isPlaceholder ? "invisible" : getLevelColor(day.level),
                    !isPlaceholder && "hover:ring-2 hover:ring-primary/50 cursor-pointer"
                  )}
                  whileHover={!isPlaceholder ? { scale: 1.3 } : {}}
                  whileTap={!isPlaceholder ? { scale: 0.9 } : {}}
                  onMouseEnter={() => !isPlaceholder && setHoveredDay(day)}
                  onMouseLeave={() => setHoveredDay(null)}
                  onClick={() => !isPlaceholder && onDayClick?.(day.date)}
                  disabled={isPlaceholder}
                  aria-label={!isPlaceholder ? `${formatDate(day.date)}: ${day.count} completions` : undefined}
                />
              );
            })}
          </div>
        ))}
      </div>

      {/* Tooltip */}
      {hoveredDay && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-background border border-border rounded-lg shadow-xl text-sm whitespace-nowrap z-50"
        >
          <div className="font-medium">{formatDate(hoveredDay.date)}</div>
          <div className="text-foreground/60">
            {hoveredDay.count} {hoveredDay.count === 1 ? 'completion' : 'completions'}
          </div>
        </motion.div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-2 mt-4 text-xs text-foreground/60">
        <span>Less</span>
        <div className="flex gap-1">
          {[0, 1, 2, 3, 4].map(level => (
            <div
              key={level}
              className={cn("w-[12px] h-[12px] rounded-sm", getLevelColor(level))}
            />
          ))}
        </div>
        <span>More</span>
      </div>
    </div>
  );
}
