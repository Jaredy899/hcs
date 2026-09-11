"use client"

import { useState } from "react"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import type { Matcher } from "@daypicker/react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

const MIN_SELECTABLE_DATE = new Date("1900-01-01")

interface DatePickerProps {
  date?: Date
  onDateChange?: (date: Date | undefined) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function DatePicker({
  date,
  onDateChange,
  placeholder = "Pick a date",
  className,
  disabled = false,
}: DatePickerProps) {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <CalendarPanel
          date={date}
          onSelect={(next) => {
            onDateChange?.(next)
            setOpen(false)
          }}
        />
      </PopoverContent>
    </Popover>
  )
}

/**
 * Mounted only while the popover is open, so the "no future dates" boundary is
 * computed once per open rather than on every render.
 */
function CalendarPanel({
  date,
  onSelect,
}: {
  date?: Date
  onSelect: (date: Date | undefined) => void
}) {
  const [disabledDates] = useState<Matcher[]>(() => [
    { before: MIN_SELECTABLE_DATE },
    { after: new Date() },
  ])

  return (
    <Calendar
      mode="single"
      selected={date}
      defaultMonth={date}
      onSelect={onSelect}
      disabled={disabledDates}
      autoFocus
      className="rounded-md border shadow-sm"
    />
  )
}
