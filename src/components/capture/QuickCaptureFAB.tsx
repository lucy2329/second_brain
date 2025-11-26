"use client";

import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickCaptureFABProps {
  onClick: () => void;
}

export function QuickCaptureFAB({ onClick }: QuickCaptureFABProps) {
  return (
    <motion.button
      onClick={onClick}
      className={cn(
        "fixed bottom-8 right-8 z-40",
        "flex items-center justify-center w-14 h-14 rounded-full",
        "bg-primary text-primary-foreground shadow-2xl shadow-primary/30",
        "hover:shadow-primary/50 transition-shadow"
      )}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
    >
      <Plus className="h-6 w-6" />
    </motion.button>
  );
}
