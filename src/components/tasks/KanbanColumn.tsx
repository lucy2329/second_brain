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
}

export function KanbanColumn({ id, title, color, icon, tasks, onTaskClick }: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({
    id: id,
    data: {
      type: "Column",
      column: { id, title, color },
    },
  });

  const getGradient = (id: string) => {
    switch (id) {
      case "BACKLOG": return "from-pink-500/20 via-purple-500/20 to-indigo-500/20";
      case "DOING": return "from-cyan-500/20 via-blue-500/20 to-teal-500/20";
      case "DONE": return "from-green-500/20 via-emerald-500/20 to-lime-500/20";
      default: return "from-gray-500/20 via-slate-500/20 to-zinc-500/20";
    }
  };

  const getBorderColor = (id: string) => {
    switch (id) {
      case "BACKLOG": return "group-hover:border-pink-500/50";
      case "DOING": return "group-hover:border-cyan-500/50";
      case "DONE": return "group-hover:border-green-500/50";
      default: return "group-hover:border-foreground/50";
    }
  };

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Minimal Header with Animated Border Bottom */}
      <div className="group relative p-4 rounded-xl bg-secondary/5 border border-border/50 hover:bg-secondary/10 transition-all duration-300">
        {/* Animated Border Gradient */}
        <motion.div 
          className={cn(
            "absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none",
            "bg-gradient-to-r",
            getGradient(id)
          )}
          animate={{
            backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{ backgroundSize: "200% 200%" }}
        />
        
        {/* Border Line Animation */}
        <div className={cn(
          "absolute bottom-0 left-0 h-[2px] w-0 bg-gradient-to-r transition-all duration-500 group-hover:w-full",
          id === "BACKLOG" && "from-pink-500 to-indigo-500",
          id === "DOING" && "from-cyan-500 to-blue-500",
          id === "DONE" && "from-green-500 to-emerald-500"
        )} />

        <div className="relative flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-2 rounded-lg bg-background/50 backdrop-blur-sm border border-border/50",
              id === "BACKLOG" && "text-pink-500",
              id === "DOING" && "text-cyan-500",
              id === "DONE" && "text-green-500"
            )}>
              {icon}
            </div>
            <h3 className="font-semibold text-foreground/80 tracking-tight">{title}</h3>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground bg-background/50 px-2 py-1 rounded-md border border-border/50">
              {tasks.length}
            </span>
            <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-background/50">
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
