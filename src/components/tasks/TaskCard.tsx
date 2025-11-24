"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: "BACKLOG" | "DOING" | "DONE";
  dueDate: string | null;
  tags: string[];
  category?: string | null;
  position: number;
}

interface TaskCardProps {
  task: Task;
  isDragging?: boolean;
  onClick?: () => void;
}

export function TaskCard({ task, isDragging, onClick }: TaskCardProps) {
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "DONE";

  return (
    <Card 
      className={cn(
        "group relative border-border/40 bg-card/50 hover:bg-card hover:border-border/80 transition-all duration-300",
        "cursor-grab active:cursor-grabbing",
        isDragging && "opacity-50 rotate-2 scale-105 shadow-xl cursor-grabbing ring-2 ring-primary/20",
        onClick && "cursor-pointer"
      )}
      onClick={onClick}
    >
      <CardHeader className="p-3 pb-2 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-sm font-medium leading-tight text-foreground/90 group-hover:text-foreground transition-colors">
            {task.title}
          </CardTitle>
          {isOverdue && (
            <AlertCircle className="h-3.5 w-3.5 text-destructive/80 shrink-0" />
          )}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {task.category && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 border-primary/10 text-primary/80 bg-primary/5">
              {task.category}
            </Badge>
          )}
          {task.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0 h-5 bg-secondary/50 text-secondary-foreground/70">
              {tag}
            </Badge>
          ))}
        </div>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        {task.description && (
          <p className="text-xs text-foreground/50 line-clamp-2 mb-2 group-hover:text-foreground/70 transition-colors">
            {task.description}
          </p>
        )}
        
        {task.dueDate && (
          <div className={cn(
            "flex items-center gap-1.5 text-[10px] font-medium",
            isOverdue ? "text-destructive" : "text-foreground/40 group-hover:text-foreground/60 transition-colors"
          )}>
            <Calendar className="h-3 w-3" />
            <span>{new Date(task.dueDate).toLocaleDateString()}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
