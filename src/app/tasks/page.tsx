"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { KanbanBoard } from "@/components/tasks/KanbanBoard";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { QuickCaptureFAB } from "@/components/capture/QuickCaptureFAB";
import { QuickCapture } from "@/components/capture/QuickCapture";

export default function TasksPage() {
  const [isQuickCaptureOpen, setIsQuickCaptureOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push("/login");
      } else {
        setIsAuthenticated(true);
      }
      setIsLoading(false);
    };

    checkAuth();
  }, [router]);

  const handleQuickCaptureSuccess = () => {
    // Increment refresh key to force KanbanBoard to re-fetch tasks
    setRefreshKey(prev => prev + 1);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 flex items-center justify-center">
        <div className="text-foreground/60">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

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
        <KanbanBoard key={refreshKey} />
      </div>

      {/* Quick Capture FAB */}
      <QuickCaptureFAB onClick={() => setIsQuickCaptureOpen(true)} />

      {/* Quick Capture Modal */}
      <QuickCapture 
        isOpen={isQuickCaptureOpen} 
        onClose={() => setIsQuickCaptureOpen(false)}
        onSuccess={handleQuickCaptureSuccess}
      />
    </div>
  );
}
