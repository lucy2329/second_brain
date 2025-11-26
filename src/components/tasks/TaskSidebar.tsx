"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LayoutGrid, ListFilter, AlertCircle } from "lucide-react";

interface TaskSidebarProps {
  categories: string[];
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
  showOverdue: boolean;
  onToggleOverdue: () => void;
}

export function TaskSidebar({
  categories,
  selectedCategory,
  onSelectCategory,
  showOverdue,
  onToggleOverdue,
}: TaskSidebarProps) {
  return (
    <div className="hidden md:flex w-64 flex-col gap-6 pr-6 border-r border-border/50">
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-3 px-2">Filters</h3>
        <div className="space-y-1">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "w-full justify-start",
              !selectedCategory && !showOverdue && "bg-secondary/50"
            )}
            onClick={() => {
              onSelectCategory(null);
              if (showOverdue) onToggleOverdue();
            }}
          >
            <LayoutGrid className="h-4 w-4 mr-2" />
            All Tasks
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "w-full justify-start text-destructive hover:text-destructive",
              showOverdue && "bg-destructive/10"
            )}
            onClick={onToggleOverdue}
          >
            <AlertCircle className="h-4 w-4 mr-2" />
            Overdue
          </Button>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-3 px-2">Categories</h3>
        <div className="space-y-1">
          {categories.map((category) => (
            <Button
              key={category}
              variant="ghost"
              size="sm"
              className={cn(
                "w-full justify-start",
                selectedCategory === category && "bg-secondary/50"
              )}
              onClick={() => {
                if (selectedCategory === category) {
                  onSelectCategory(null);
                } else {
                  onSelectCategory(category);
                }
                if (showOverdue) onToggleOverdue();
              }}
            >
              <ListFilter className="h-4 w-4 mr-2" />
              {category}
            </Button>
          ))}
          {categories.length === 0 && (
            <div className="px-2 text-sm text-muted-foreground italic">
              No categories yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
