import { KanbanBoard } from "@/components/tasks/KanbanBoard";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";

export default function TasksPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Tasks</h1>
              <p className="text-foreground/60">
                Organize your work with drag-and-drop simplicity
              </p>
            </div>
            
          </div>
        </div>

        {/* Kanban Board */}
        <KanbanBoard />
      </div>
    </div>
  );
}
