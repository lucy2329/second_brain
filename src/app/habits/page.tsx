"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { Button } from "@/components/ui/button";
import { HabitStats } from "@/components/habits/HabitStats";
import { HabitList } from "@/components/habits/HabitList";
import { HabitModal } from "@/components/habits/HabitModal";
import { QuickCaptureFAB } from "@/components/capture/QuickCaptureFAB";
import { QuickCapture } from "@/components/capture/QuickCapture";
import { ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/ui/toast";

interface Habit {
  id: string;
  name: string;
  frequency: string;
  logs: Array<{ date: Date | string; id: string }>;
  stats: {
    currentStreak: number;
    longestStreak: number;
    completedToday: boolean;
    totalCompletions: number;
  };
}

export default function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isQuickCaptureOpen, setIsQuickCaptureOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const router = useRouter();
  const { showToast } = useToast();

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
        fetchHabits();
      }
    };

    checkAuth();
  }, [router]);

  const fetchHabits = async () => {
    try {
      const response = await fetch("/api/habits", { cache: "no-store" });
      if (!response.ok) throw new Error("Failed to fetch habits");
      const data = await response.json();
      setHabits(data);
    } catch (error) {
      console.error("Error fetching habits:", error);
      showToast("Failed to load habits. Please refresh the page.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateHabit = () => {
    setEditingHabit(null);
    setIsModalOpen(true);
  };

  const handleEditHabit = (habitId: string) => {
    const habit = habits.find(h => h.id === habitId);
    if (habit) {
      setEditingHabit(habit);
      setIsModalOpen(true);
    }
  };

  const handleSaveHabit = async (habitData: { name: string; frequency: string }) => {
    try {
      const url = editingHabit ? `/api/habits/${editingHabit.id}` : "/api/habits";
      const method = editingHabit ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(habitData),
      });

      if (!response.ok) throw new Error("Failed to save habit");

      await fetchHabits();
      setIsModalOpen(false);
      showToast(
        editingHabit ? "Habit updated successfully!" : "Habit created successfully! 🎯",
        "success"
      );
    } catch (error) {
      console.error("Error saving habit:", error);
      showToast(
        editingHabit ? "Failed to update habit. Please try again." : "Failed to create habit. Please try again.",
        "error"
      );
    }
  };

  const handleDeleteHabit = async (habitId: string) => {
    try {
      const response = await fetch(`/api/habits/${habitId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete habit");

      await fetchHabits();
      setIsModalOpen(false);
      showToast("Habit deleted successfully.", "success");
    } catch (error) {
      console.error("Error deleting habit:", error);
      showToast("Failed to delete habit. Please try again.", "error");
    }
  };

  const handleCheckIn = async (habitId: string) => {
    try {
      const response = await fetch(`/api/habits/${habitId}/logs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: new Date().toISOString() }),
      });

      if (!response.ok) throw new Error("Failed to check in");

      await fetchHabits();
    } catch (error) {
      console.error("Error checking in:", error);
      throw error;
    }
  };

  const handleQuickCaptureSuccess = () => {
    fetchHabits();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 flex items-center justify-center">
        <div className="text-foreground/60">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Habits</h1>
              <p className="text-sm md:text-base text-foreground/60">
                Build better habits with streak tracking and analytics
              </p>
            </div>
            
            <Button onClick={handleCreateHabit} className="hidden md:flex">
              <Plus className="h-4 w-4 mr-2" />
              New Habit
            </Button>
          </div>
        </div>

        {/* Stats */}
        <HabitStats habits={habits} />

        {/* New Habit Button (Mobile) */}
        <div className="md:hidden mb-4">
          <Button onClick={handleCreateHabit} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            New Habit
          </Button>
        </div>

        {/* Habits List */}
        <HabitList
          habits={habits}
          onCheckIn={handleCheckIn}
          onEdit={handleEditHabit}
          onDelete={handleDeleteHabit}
        />
      </div>

      {/* Quick Capture FAB */}
      <QuickCaptureFAB onClick={() => setIsQuickCaptureOpen(true)} />

      {/* Quick Capture Modal */}
      <QuickCapture 
        isOpen={isQuickCaptureOpen} 
        onClose={() => setIsQuickCaptureOpen(false)}
        onSuccess={handleQuickCaptureSuccess}
      />

      {/* Habit Modal */}
      <HabitModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        habit={editingHabit}
        onSave={handleSaveHabit}
        onDelete={handleDeleteHabit}
      />
    </div>
  );
}
