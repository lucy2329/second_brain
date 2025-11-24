"use client";

import { useState, useEffect, useRef } from "react";
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, closestCorners, DragOverEvent, useSensor, useSensors, PointerSensor, KeyboardSensor } from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { TaskCard } from "./TaskCard";
import { KanbanColumn } from "./KanbanColumn";
import { Circle, Timer, CheckCircle2, Plus } from "lucide-react";
import { TaskModal } from "./TaskModal";
import { TaskSidebar } from "./TaskSidebar";
import { Button } from "@/components/ui/button";

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: "BACKLOG" | "DOING" | "DONE";
  dueDate: string | null;
  tags: string[];
  position: number;
  category?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export function KanbanBoard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showOverdue, setShowOverdue] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  
  // Use a ref to access the latest tasks state in event handlers
  const tasksRef = useRef(tasks);
  useEffect(() => {
    tasksRef.current = tasks;
  }, [tasks]);

  useEffect(() => {
    fetchTasks();
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const fetchTasks = async () => {
    try {
      const response = await fetch("/api/tasks", { cache: "no-store" });
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
    { id: "BACKLOG" as const, title: "To-do", color: "border-foreground/20", icon: <Circle className="h-4 w-4" /> },
    { id: "DOING" as const, title: "In Progress", color: "border-accent", icon: <Timer className="h-4 w-4" /> },
    { id: "DONE" as const, title: "Done", color: "border-success", icon: <CheckCircle2 className="h-4 w-4" /> },
  ];

  const getTasksByStatus = (status: Task["status"]) => {
    return tasks
      .filter((task) => {
        if (task.status !== status) return false;
        if (selectedCategory && task.category !== selectedCategory) return false;
        if (showOverdue) {
          const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "DONE";
          if (!isOverdue) return false;
        }
        return true;
      })
      .sort((a, b) => a.position - b.position);
  };

  const categories = Array.from(new Set(tasks.map((t) => t.category).filter(Boolean))) as string[];

  const handleCreateTask = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleSaveTask = async (taskData: Partial<Task>) => {
    try {
      const url = editingTask ? `/api/tasks/${editingTask.id}` : "/api/tasks";
      const method = editingTask ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskData),
      });

      if (!response.ok) throw new Error("Failed to save task");

      const savedTask = await response.json();

      setTasks((prev) => {
        if (editingTask) {
          return prev.map((t) => (t.id === savedTask.id ? savedTask : t));
        }
        return [...prev, savedTask];
      });

      setIsModalOpen(false);
    } catch (error) {
      console.error("Error saving task:", error);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id);
    // Create a shallow copy to avoid mutation issues
    setActiveTask(task ? { ...task } : null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveTask = active.data.current?.type === "Task";
    const isOverTask = over.data.current?.type === "Task";

    if (!isActiveTask) return;

    // Dropping a Task over another Task
    if (isActiveTask && isOverTask) {
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex((t) => t.id === activeId);
        const overIndex = tasks.findIndex((t) => t.id === overId);

        if (tasks[activeIndex].status !== tasks[overIndex].status) {
          const updatedTasks = [...tasks];
          // Create a new object for the updated task to avoid mutating the original reference
          updatedTasks[activeIndex] = {
            ...updatedTasks[activeIndex],
            status: tasks[overIndex].status
          };
          return arrayMove(updatedTasks, activeIndex, overIndex);
        }

        return arrayMove(tasks, activeIndex, overIndex);
      });
    }

    const isOverColumn = columns.some((col) => col.id === overId);

    // Dropping a Task over a Column
    if (isActiveTask && isOverColumn) {
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex((t) => t.id === activeId);
        const updatedTasks = [...tasks];
        // Create a new object for the updated task
        updatedTasks[activeIndex] = {
          ...updatedTasks[activeIndex],
          status: overId as Task["status"]
        };
        return arrayMove(updatedTasks, activeIndex, activeIndex);
      });
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    const originalTask = activeTask;
    setActiveTask(null);

    if (!over || !originalTask) return;

    // Determine new status
    let newStatus = originalTask.status;
    const overColumn = columns.find((col) => col.id === over.id);
    
    // Use the ref to get the latest state
    const currentTasks = tasksRef.current;
    
    if (overColumn) {
      newStatus = overColumn.id;
    } else {
      const overTask = currentTasks.find((t) => t.id === over.id);
      if (overTask) {
        newStatus = overTask.status;
      }
    }

    // Update on server
    if (newStatus !== originalTask.status) {
      try {
        const response = await fetch(`/api/tasks/${originalTask.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        });

        if (!response.ok) {
          throw new Error("Failed to update task status");
        }
      } catch (error) {
        console.error("Error updating task:", error);
        fetchTasks(); // Revert on error
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
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-6">
        <TaskSidebar
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          showOverdue={showOverdue}
          onToggleOverdue={() => setShowOverdue(!showOverdue)}
        />
        
        <div className="flex-1">
          <div className="flex justify-end mb-4">
            <Button onClick={handleCreateTask}>
              <Plus className="h-4 w-4 mr-2" />
              New Task
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {columns.map((column) => (
              <KanbanColumn
                key={column.id}
                id={column.id}
                title={column.title}
                color={column.color}
                icon={column.icon}
                tasks={getTasksByStatus(column.id)}
                onTaskClick={handleEditTask}
              />
            ))}
          </div>
        </div>
      </div>

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        task={editingTask}
        onSave={handleSaveTask}
      />

      <DragOverlay>
        {activeTask ? <TaskCard task={activeTask} isDragging /> : null}
      </DragOverlay>
    </DndContext>
  );
}
