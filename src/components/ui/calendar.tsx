"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { 
  addMonths, 
  subMonths, 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  eachDayOfInterval,
  isToday
} from "date-fns"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

/**
 * Calendar Component
 * A custom-built date picker component written from scratch.
 * Replaces the react-day-picker implementation to avoid alignment and styling issues.
 */

export interface CalendarProps {
  /** The currently selected date */
  selected?: Date | null
  /** Callback when a date is selected */
  onSelect?: (date: Date | null) => void
  /** Optional additional class names */
  className?: string
  /** 
   * Compatibility props for Shadcn-like usage.
   * Note: This implementation currently focuses on 'single' mode.
   */
  mode?: "single" | "range" | "multiple"
  initialFocus?: boolean
  showOutsideDays?: boolean
}

export function Calendar({
  selected,
  onSelect,
  className,
  showOutsideDays = true,
  // These are accepted but currently ignored in this simplified implementation
  mode = "single",
  initialFocus,
}: CalendarProps) {
  // Use the selected date or today as the starting month view
  // We use viewDate to track which month is currently being displayed
  const [viewDate, setViewDate] = React.useState(selected || new Date())

  // Navigation handlers
  const handlePrevMonth = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setViewDate(subMonths(viewDate, 1))
  }

  const handleNextMonth = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setViewDate(addMonths(viewDate, 1))
  }

  // Calculate the dates to display in the grid
  const monthStart = startOfMonth(viewDate)
  const monthEnd = endOfMonth(monthStart)
  
  // Start the week on Monday (1)
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 })
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 })

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  })

  const weekDayLabels = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"]

  return (
    <div 
      className={cn(
        "p-4 w-fit bg-background border border-border rounded-xl shadow-md select-none", 
        className
      )}
    >
      {/* Header with Month/Year and Navigation */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-foreground px-2">
          {format(viewDate, "MMMM yyyy")}
        </h2>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={handlePrevMonth}
            aria-label="Previous Month"
            className={cn(
              buttonVariants({ variant: "ghost" }),
              "h-8 w-8 p-0 text-muted-foreground hover:text-foreground transition-all rounded-lg"
            )}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={handleNextMonth}
            aria-label="Next Month"
            className={cn(
              buttonVariants({ variant: "ghost" }),
              "h-8 w-8 p-0 text-muted-foreground hover:text-foreground transition-all rounded-lg"
            )}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Week Day Labels (Mon, Tue, etc.) */}
      <div className="grid grid-cols-7 mb-1">
        {weekDayLabels.map((day) => (
          <div
            key={day}
            className="h-9 w-9 flex items-center justify-center text-[0.7rem] font-medium text-muted-foreground/60 uppercase tracking-tight"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid of Days */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day) => {
          const isSelected = selected && isSameDay(day, selected)
          const isCurrentMonth = isSameMonth(day, monthStart)
          const isTodayDate = isToday(day)

          // If showOutsideDays is false, we render empty slots for days not in the current month
          if (!showOutsideDays && !isCurrentMonth) {
            return <div key={day.toString()} className="h-9 w-9" />
          }

          return (
            <button
              key={day.toString()}
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onSelect?.(day)
              }}
              className={cn(
                "h-9 w-9 flex items-center justify-center rounded-lg text-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/20 relative",
                isSelected 
                  ? "bg-emerald-600 text-white font-medium shadow-sm hover:bg-emerald-700" 
                  : isTodayDate
                    ? "text-emerald-500 font-bold bg-emerald-500/10 hover:bg-emerald-500/20"
                    : isCurrentMonth
                      ? "text-foreground hover:bg-muted"
                      : "text-muted-foreground/30 hover:bg-muted/50"
              )}
            >
              {format(day, "d")}
              {/* Subtle indicator for today if not selected */}
              {isTodayDate && !isSelected && (
                <span className="absolute bottom-1 w-1 h-1 rounded-full bg-emerald-500" />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

Calendar.displayName = "Calendar"
