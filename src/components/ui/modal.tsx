"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = "md",
}) => {
  const sizes = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className={cn(
                "relative w-full border border-border bg-background shadow-2xl",
                "h-full md:h-auto md:rounded-2xl", // Full-screen on mobile, rounded on desktop
                sizes[size]
              )}
            >
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute right-4 top-4 z-10 rounded-lg p-2 text-foreground/60 hover:bg-secondary hover:text-foreground transition-colors touch-manipulation"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Header */}
              {(title || description) && (
                <div className="border-b border-border px-4 md:px-6 py-4 md:py-5">
                  {title && (
                    <h2 className="text-lg md:text-xl font-semibold pr-8">{title}</h2>
                  )}
                  {description && (
                    <p className="mt-1 text-sm text-foreground/60">
                      {description}
                    </p>
                  )}
                </div>
              )}

              {/* Content */}
              <div className="px-4 md:px-6 py-4 overflow-y-auto max-h-[calc(100vh-200px)] md:max-h-[calc(100vh-300px)]">
                {children}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

Modal.displayName = "Modal";

export { Modal };
