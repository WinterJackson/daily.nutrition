"use client"

import { Switch } from "@/components/ui/Switch"
import { AnimatePresence, motion } from "framer-motion"
import { AlertCircle, Clock, Copy } from "lucide-react"
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
  onChange: (schedule: WeeklySchedule, isValid: boolean) => void
  isLoading?: boolean
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

export function WeeklyAvailabilityEditor({ initialSchedule, onChange, isLoading = false }: WeeklyAvailabilityEditorProps) {
  const [schedule, setSchedule] = useState<WeeklySchedule>(initialSchedule || DEFAULT_SCHEDULE)
  const [errors, setErrors] = useState<{ [day: string]: boolean }>({})

  // Validate all days. A day is invalid if it's open and start >= end.
  const validateSchedule = (currentSchedule: WeeklySchedule) => {
    let isValid = true
    const newErrors: { [day: string]: boolean } = {}
    
    DAYS.forEach(day => {
      const config = currentSchedule[day]
      if (config && config.isOpen) {
        // Simple string comparison for HH:mm works perfectly since it's zero-padded 24h
        if (config.start >= config.end) {
          newErrors[day] = true
          isValid = false
        }
      }
    })
    
    setErrors(newErrors)
    return isValid
  }

  useEffect(() => {
    if (initialSchedule && Object.keys(initialSchedule).length > 0) {
      setSchedule(initialSchedule)
      validateSchedule(initialSchedule)
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
    const isValid = validateSchedule(newSchedule)
    onChange(newSchedule, isValid)
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
    const isValid = validateSchedule(newSchedule)
    onChange(newSchedule, isValid)
  }

  // Quick Copy Monday to all weekdays (Tue-Fri)
  const copyMondayToWeekdays = () => {
    const mondayConfig = schedule.monday
    if (!mondayConfig) return

    const newSchedule = { ...schedule }
    const weekdays = ["tuesday", "wednesday", "thursday", "friday"]
    
    weekdays.forEach(day => {
      newSchedule[day] = { ...mondayConfig }
    })
    
    setSchedule(newSchedule)
    const isValid = validateSchedule(newSchedule)
    onChange(newSchedule, isValid)
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
        <div>
            <h3 className="font-semibold text-olive dark:text-off-white flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Weekly Schedule
            </h3>
            <p className="text-xs text-neutral-500 mt-1">Set your standard availability.</p>
        </div>
        <button
            onClick={copyMondayToWeekdays}
            className="text-xs flex items-center gap-1 text-brand-green hover:text-olive transition-colors bg-brand-green/10 px-3 py-1.5 rounded-lg font-medium"
            title="Copy Monday's hours to Tue-Fri"
        >
            <Copy className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Copy Mon to Weekdays</span>
        </button>
      </div>

      <div className="space-y-3">
        {isLoading ? (
            // Loading Skeletons
            Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="h-14 bg-neutral-100 dark:bg-white/5 rounded-xl animate-pulse" />
            ))
        ) : (
            DAYS.map((day) => {
              const config = schedule[day] || DEFAULT_SCHEDULE[day as keyof typeof DEFAULT_SCHEDULE]
              const hasError = errors[day]
              
              return (
                <div 
                  key={day} 
                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3 rounded-xl border transition-all ${
                    config.isOpen 
                      ? hasError ? "bg-red-50/50 border-red-200" : "bg-white dark:bg-white/5 border-neutral-200 dark:border-white/10" 
                      : "bg-neutral-50 dark:bg-white/5 border-transparent opacity-60"
                  }`}
                >
                  {/* Day Toggle */}
                  <div className="flex items-center justify-between sm:w-1/3 shrink-0">
                    <span className="capitalize font-medium text-sm w-24">
                      {day}
                    </span>
                    <Switch 
                      checked={config.isOpen}
                      onCheckedChange={() => handleDayToggle(day)}
                      className="data-[state=checked]:bg-olive"
                    />
                  </div>

                  {/* Animated Time Selectors */}
                  <div className="flex-1 w-full overflow-hidden">
                      <AnimatePresence mode="popLayout" initial={false}>
                        {config.isOpen ? (
                            <motion.div 
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.2 }}
                                className="flex items-center gap-2 sm:gap-4 w-full justify-end"
                            >
                                <div className="relative">
                                    <select
                                        value={config.start}
                                        onChange={(e) => handleTimeChange(day, "start", e.target.value)}
                                        className={`bg-neutral-50 dark:bg-black/20 border rounded-lg px-2 py-1 text-sm focus:border-olive focus:ring-olive transition-colors ${hasError ? 'border-red-300 text-red-600' : 'border-neutral-200 dark:border-white/10'}`}
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
                                        className={`bg-neutral-50 dark:bg-black/20 border rounded-lg px-2 py-1 text-sm focus:border-olive focus:ring-olive transition-colors ${hasError ? 'border-red-300 text-red-600' : 'border-neutral-200 dark:border-white/10'}`}
                                    >
                                        {timeOptions.map(t => (
                                        <option key={`end-${t}`} value={t}>{t}</option>
                                        ))}
                                    </select>
                                </div>
                                {hasError && (
                                    <div className="text-red-500 absolute sm:static right-2 top-2 sm:mt-0" title="Start time must be before end time">
                                        <AlertCircle className="w-4 h-4 ml-2" />
                                    </div>
                                )}
                            </motion.div>
                        ) : (
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex justify-end pr-4 text-sm text-neutral-400 italic py-1.5"
                            >
                                Unavailable
                            </motion.div>
                        )}
                      </AnimatePresence>
                  </div>
                </div>
              )
            })
        )}
      </div>
    </div>
  )
}
