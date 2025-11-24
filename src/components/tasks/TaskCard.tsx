"use client";

import { motion } from "framer-motion";
import { Calendar, Tag, GripVertical } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: "BACKLOG" | "DOING" | "DONE";
  dueDate: string | null;
  tags: string[];
}

interface TaskCardProps {
  task: Task;
  isDragging?: boolean;
}

export function TaskCard({ task, isDragging = false }: TaskCardProps) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <Card
      className={cn(
        "cursor-grab active:cursor-grabbing transition-shadow",
        isDragging && "shadow-2xl opacity-50 rotate-3"
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <GripVertical className="h-5 w-5 text-foreground/40 mt-0.5 flex-shrink-0" />
          
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-foreground mb-1 line-clamp-2">
              {task.title}
            </h3>
            
            {task.description && (
              <p className="text-sm text-foreground/60 mb-3 line-clamp-2">
                {task.description}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-2">
              {task.dueDate && (
                <div className="flex items-center gap-1 text-xs text-foreground/60">
                  <Calendar className="h-3 w-3" />
                  <span>{formatDate(task.dueDate)}</span>
                </div>
              )}
              
              {task.tags.length > 0 && (
                <div className="flex items-center gap-1 flex-wrap">
                  {task.tags.slice(0, 2).map((tag) => (
                    <Badge key={tag} variant="default" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {task.tags.length > 2 && (
                    <span className="text-xs text-foreground/60">
                      +{task.tags.length - 2}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
