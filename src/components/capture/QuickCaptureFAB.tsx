"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickCaptureFABProps {
  onClick: () => void;
}

export function QuickCaptureFAB({ onClick }: QuickCaptureFABProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "fixed bottom-8 right-8 z-40",
        "flex items-center gap-2 px-6 py-4 rounded-full",
        "bg-primary text-primary-foreground shadow-2xl shadow-primary/30",
        "hover:shadow-primary/50 transition-shadow"
      )}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
    >
      <motion.div
        animate={{ rotate: isHovered ? 90 : 0 }}
        transition={{ duration: 0.2 }}
      >
        <Plus className="h-6 w-6" />
      </motion.div>
      <motion.span
        initial={{ width: 0, opacity: 0 }}
        animate={{
          width: isHovered ? "auto" : 0,
          opacity: isHovered ? 1 : 0,
        }}
        transition={{ duration: 0.2 }}
        className="font-medium whitespace-nowrap overflow-hidden"
      >
        Quick Capture
      </motion.span>
    </motion.button>
  );
}
