"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { SortableTaskCard } from "./SortableTaskCard";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: "BACKLOG" | "DOING" | "DONE";
  dueDate: string | null;
  tags: string[];
  position: number;
}

interface KanbanColumnProps {
  id: "BACKLOG" | "DOING" | "DONE";
  title: string;
  color: string;
  icon?: React.ReactNode;
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
  onAddClick?: (status: Task["status"]) => void;
}

export function KanbanColumn({ id, title, color, icon, tasks, onTaskClick, onAddClick }: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({
    id: id,
    data: {
      type: "Column",
      column: { id, title, color },
    },
  });

  const getBorderColors = (id: string) => {
    switch (id) {
      case "BACKLOG": return ["#ec4899", "#8b5cf6", "#6366f1", "#ec4899"]; // Pink -> Violet -> Indigo -> Pink
      case "DOING": return ["#06b6d4", "#3b82f6", "#14b8a6", "#06b6d4"]; // Cyan -> Blue -> Teal -> Cyan
      case "DONE": return ["#22c55e", "#10b981", "#84cc16", "#22c55e"]; // Green -> Emerald -> Lime -> Green
      default: return ["#71717a", "#64748b", "#71717a"];
    }
  };

  const getGradient = (id: string) => {
    switch (id) {
      case "BACKLOG": return "from-pink-500/20 via-purple-500/20 to-indigo-500/20";
      case "DOING": return "from-cyan-500/20 via-blue-500/20 to-teal-500/20";
      case "DONE": return "from-green-500/20 via-emerald-500/20 to-lime-500/20";
      default: return "from-gray-500/20 via-slate-500/20 to-zinc-500/20";
    }
  };

  const getIconColor = (id: string) => {
    switch (id) {
      case "BACKLOG": return "text-pink-500";
      case "DOING": return "text-cyan-500";
      case "DONE": return "text-green-500";
      default: return "text-foreground";
    }
  };

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Header with Continuous Moving Border and Hover Effects */}
      <div className="relative group rounded-xl p-[1px] overflow-hidden">
        {/* Animated Gradient Border (Clockwise) */}
        <motion.div
          className="absolute inset-0"
          style={{
            background: `conic-gradient(from 0deg, ${getBorderColors(id).join(", ")})`,
          }}
          animate={{
            rotate: [0, 360],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "circInOut",
          }}
        />
        
        {/* Inner Content with Solid Background and Hover Effects */}
        <div className="relative bg-background/95 backdrop-blur-xl rounded-[11px] p-4 flex items-center justify-between overflow-hidden">
          {/* Hover Background Gradient */}
          <div 
            className={cn(
              "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none",
              "bg-gradient-to-r",
              getGradient(id)
            )}
          />

          <div className="flex items-center gap-3 z-10">
            <div className={cn(
              "p-2 rounded-lg bg-secondary/50 border border-border/50",
              getIconColor(id)
            )}>
              {icon}
            </div>
            <h3 className="font-semibold text-foreground/80 tracking-tight">{title}</h3>
          </div>
          
          <div className="flex items-center gap-2 z-10">
            <span className="text-xs font-medium text-muted-foreground bg-secondary/50 px-2 py-1 rounded-md border border-border/50">
              {tasks.length}
            </span>
            <Button 
              size="icon" 
              variant="ghost" 
              className="h-8 w-8 hover:bg-secondary/80"
              onClick={() => onAddClick?.(id)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div ref={setNodeRef} className="flex-1 flex flex-col gap-3 min-h-[150px] p-1">
        <SortableContext
          items={tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => (
            <SortableTaskCard 
              key={task.id} 
              task={task} 
              onClick={() => onTaskClick?.(task)}
            />
          ))}
          {tasks.length === 0 && (
            <div className="flex items-center justify-center h-32 border-2 border-dashed border-border rounded-lg text-foreground/40 text-sm">
              Drop tasks here
            </div>
          )}
        </SortableContext>
      </div>
    </div>
  );
}
