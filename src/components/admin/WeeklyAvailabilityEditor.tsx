"use client"

import { Switch } from "@/components/ui/Switch"
import { Clock } from "lucide-react"
import { useEffect, useState } from "react"

// Type definition matches the JSON structure in Prisma
export type DaySchedule = {
  isOpen: boolean
  start: string
  end: string
}

export type WeeklySchedule = {
  [key: string]: DaySchedule
}

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]

interface WeeklyAvailabilityEditorProps {
  initialSchedule?: WeeklySchedule
  onChange: (schedule: WeeklySchedule) => void
}

export const DEFAULT_SCHEDULE: WeeklySchedule = {
  monday: { isOpen: true, start: "09:00", end: "17:00" },
  tuesday: { isOpen: true, start: "09:00", end: "17:00" },
  wednesday: { isOpen: true, start: "09:00", end: "17:00" },
  thursday: { isOpen: true, start: "09:00", end: "17:00" },
  friday: { isOpen: true, start: "09:00", end: "17:00" },
  saturday: { isOpen: false, start: "10:00", end: "14:00" },
  sunday: { isOpen: false, start: "10:00", end: "14:00" },
}

export function WeeklyAvailabilityEditor({ initialSchedule, onChange }: WeeklyAvailabilityEditorProps) {
  const [schedule, setSchedule] = useState<WeeklySchedule>(initialSchedule || DEFAULT_SCHEDULE)

  useEffect(() => {
    if (initialSchedule && Object.keys(initialSchedule).length > 0) {
      setSchedule(initialSchedule)
    }
  }, [initialSchedule])

  const handleDayToggle = (day: string) => {
    const newSchedule = {
      ...schedule,
      [day]: {
        ...schedule[day],
        isOpen: !schedule[day]?.isOpen
      }
    }
    setSchedule(newSchedule)
    onChange(newSchedule)
  }

  const handleTimeChange = (day: string, type: "start" | "end", value: string) => {
    const newSchedule = {
      ...schedule,
      [day]: {
        ...schedule[day],
        [type]: value
      }
    }
    setSchedule(newSchedule)
    onChange(newSchedule)
  }

  // Generate time options (00:00 - 23:45)
  const timeOptions: string[] = []
  for (let i = 0; i < 24; i++) {
    for (let j = 0; j < 60; j += 15) {
      const hour = i.toString().padStart(2, '0')
      const minute = j.toString().padStart(2, '0')
      timeOptions.push(`${hour}:${minute}`)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-olive dark:text-off-white flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Weekly Schedule
        </h3>
        <p className="text-xs text-neutral-500">Set your standard availability.</p>
      </div>

      <div className="space-y-3">
        {DAYS.map((day) => {
          const config = schedule[day] || DEFAULT_SCHEDULE[day as keyof typeof DEFAULT_SCHEDULE]
          
          return (
            <div 
              key={day} 
              className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3 rounded-xl border transition-all ${
                config.isOpen 
                  ? "bg-white dark:bg-white/5 border-neutral-200 dark:border-white/10" 
                  : "bg-neutral-50 dark:bg-white/5 border-transparent opacity-60"
              }`}
            >
              {/* Day Toggle */}
              <div className="flex items-center justify-between sm:w-1/3">
                <span className="capitalize font-medium text-sm w-24">
                  {day}
                </span>
                <Switch 
                  checked={config.isOpen}
                  onCheckedChange={() => handleDayToggle(day)}
                  className="data-[state=checked]:bg-olive"
                />
              </div>

              {/* Time Selectors */}
              <div className={`flex items-center gap-2 sm:gap-4 transition-opacity ${config.isOpen ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
                {config.isOpen ? (
                    <>
                        <div className="relative">
                        <select
                            value={config.start}
                            onChange={(e) => handleTimeChange(day, "start", e.target.value)}
                            className="bg-neutral-50 dark:bg-black/20 border border-neutral-200 dark:border-white/10 rounded-lg px-2 py-1 text-sm focus:border-olive focus:ring-olive"
                        >
                            {timeOptions.map(t => (
                            <option key={`start-${t}`} value={t}>{t}</option>
                            ))}
                        </select>
                        </div>
                        <span className="text-neutral-400">-</span>
                        <div className="relative">
                        <select
                            value={config.end}
                            onChange={(e) => handleTimeChange(day, "end", e.target.value)}
                            className="bg-neutral-50 dark:bg-black/20 border border-neutral-200 dark:border-white/10 rounded-lg px-2 py-1 text-sm focus:border-olive focus:ring-olive"
                        >
                            {timeOptions.map(t => (
                            <option key={`end-${t}`} value={t}>{t}</option>
                            ))}
                        </select>
                        </div>
                    </>
                ) : (
                    <span className="text-sm text-neutral-400 italic px-4">Unavailable</span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
