"use client"

import * as React from "react"
import Calendar from "react-calendar"
import './calendar.css'
import { cn } from "@/app/lib/utils"

interface CalendarProps {
  selected?: Date
  onSelect?: (date: Date | undefined) => void
  className?: string
}

function CustomCalendar({
  className,
  selected,
  onSelect,
  ...props
}: CalendarProps) {
  return (
    <div className={cn("p-3", className)}>
      <Calendar
        value={selected}
        onChange={(value) => {
          if (!onSelect) return
          if (value instanceof Date) {
            onSelect(value)
          }
        }}
        navigationLabel={({ date }) => 
          date.toLocaleString('default', { month: 'long', year: 'numeric' })
        }
        nextLabel="›"
        prevLabel="‹"
        next2Label={null}
        prev2Label={null}
        navigationAriaLabel="Change month"
        {...props}
      />
    </div>
  )
}

CustomCalendar.displayName = "Calendar"

export { CustomCalendar as Calendar } 