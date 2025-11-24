"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, closestCorners } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { TaskCard } from "./TaskCard";
import { SortableTaskCard } from "./SortableTaskCard";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: "BACKLOG" | "DOING" | "DONE";
  dueDate: string | null;
  tags: string[];
  position: number;
}

export function KanbanBoard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await fetch("/api/tasks");
      if (!response.ok) throw new Error("Failed to fetch tasks");
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const columns = [
    { id: "BACKLOG" as const, title: "Backlog", color: "border-foreground/20" },
    { id: "DOING" as const, title: "Doing", color: "border-accent" },
    { id: "DONE" as const, title: "Done", color: "border-success" },
  ];

  const getTasksByStatus = (status: Task["status"]) => {
    return tasks
      .filter((task) => task.status === status)
      .sort((a, b) => a.position - b.position);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id);
    setActiveTask(task || null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeTask = tasks.find((t) => t.id === active.id);
    if (!activeTask) return;

    // Determine the new status based on which column was dropped into
    let newStatus = activeTask.status;
    
    // Check if dropped over a column container
    const overColumn = columns.find((col) => over.id === col.id);
    if (overColumn) {
      newStatus = overColumn.id;
    } else {
      // Dropped over another task - get that task's status
      const overTask = tasks.find((t) => t.id === over.id);
      if (overTask) {
        newStatus = overTask.status;
      }
    }

    // If status changed or position changed
    if (newStatus !== activeTask.status || active.id !== over.id) {
      // Optimistically update UI
      const updatedTasks = tasks.map((task) => {
        if (task.id === activeTask.id) {
          return { ...task, status: newStatus };
        }
        return task;
      });
      setTasks(updatedTasks);

      // Update on server
      try {
        await fetch(`/api/tasks/${activeTask.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        });
        
        // Refetch to get correct positions
        fetchTasks();
      } catch (error) {
        console.error("Error updating task:", error);
        // Revert on error
        setTasks(tasks);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-foreground/60">Loading tasks...</div>
      </div>
    );
  }

  return (
    <DndContext
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map((column) => {
          const columnTasks = getTasksByStatus(column.id);
          
          return (
            <div key={column.id} className="flex flex-col gap-4">
              <Card className={cn("border-t-4", column.color)}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{column.title}</CardTitle>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-foreground/60">
                        {columnTasks.length}
                      </span>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              <SortableContext
                items={columnTasks.map((t) => t.id)}
                strategy={verticalListSortingStrategy}
                id={column.id}
              >
                <div className="flex flex-col gap-3 min-h-[200px]">
                  {columnTasks.map((task) => (
                    <SortableTaskCard key={task.id} task={task} />
                  ))}
                  {columnTasks.length === 0 && (
                    <div className="flex items-center justify-center h-32 border-2 border-dashed border-border rounded-lg text-foreground/40 text-sm">
                      Drop tasks here
                    </div>
                  )}
                </div>
              </SortableContext>
            </div>
          );
        })}
      </div>

      <DragOverlay>
        {activeTask ? <TaskCard task={activeTask} isDragging /> : null}
      </DragOverlay>
    </DndContext>
  );
}
