"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface HabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  habit?: {
    id: string;
    name: string;
    frequency: string;
  } | null;
  onSave: (habitData: { name: string; frequency: string }) => Promise<void>;
  onDelete?: (habitId: string) => Promise<void>;
}

export function HabitModal({ isOpen, onClose, habit, onSave, onDelete }: HabitModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    frequency: "DAILY" as "DAILY" | "WEEKLY",
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (habit) {
      setFormData({
        name: habit.name,
        frequency: habit.frequency as "DAILY" | "WEEKLY",
      });
    } else {
      setFormData({
        name: "",
        frequency: "DAILY",
      });
    }
  }, [habit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error("Failed to save habit:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={habit ? "Edit Habit" : "New Habit"}
      description={habit ? "Update your habit details" : "Create a new habit to track"}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">Habit Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Morning Exercise, Read for 30 min"
            required
            autoFocus
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="frequency">Frequency</Label>
          <select
            id="frequency"
            className="flex h-11 md:h-10 w-full rounded-lg border border-border bg-background/50 px-3 py-2 text-base md:text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 touch-manipulation"
            value={formData.frequency}
            onChange={(e) => setFormData({ ...formData, frequency: e.target.value as any })}
          >
            <option value="DAILY">Daily</option>
            <option value="WEEKLY">Weekly</option>
          </select>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          {habit && onDelete && (
            <Button
              type="button"
              variant="destructive"
              onClick={async () => {
                setIsLoading(true);
                await onDelete(habit.id);
                setIsLoading(false);
              }}
              disabled={isLoading}
            >
              Delete
            </Button>
          )}
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : habit ? "Update Habit" : "Create Habit"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
