"use client"

import { cn } from "@/lib/utils"
import { Check, ClipboardList, Monitor, User } from "lucide-react"

const steps = [
  {
    id: 1,
    title: "Select Service",
    description: "Choose the specialized care plan that fits your needs.",
    icon: ClipboardList,
  },
  {
    id: 2,
    title: "Choose Method",
    description: "Decide between Virtual (Zoom) or In-Person visits.",
    icon: Monitor,
  },
  {
    id: 3,
    title: "Book Time",
    description: "Pick a convenient slot from our real-time calendar.",
    icon: Check,
  },
  {
    id: 4,
    title: "Consultation",
    description: "Meet with Edna to start your personalized journey.",
    icon: User,
  },
]

export function BookingSteps() {
  return (
    <div className="relative">
      {/* Connecting Line (Desktop) */}
      <div className="hidden md:block absolute top-6 left-0 w-full h-0.5 bg-neutral-100 dark:bg-white/10 -z-10" />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {steps.map((step, index) => (
          <div key={step.id} className="relative flex flex-col items-center text-center group">
            <div className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold mb-4 transition-all duration-300 relative bg-white dark:bg-charcoal border-2 z-10",
              index === 0 ? "border-brand-green text-brand-green shadow-lg shadow-brand-green/20 scale-110" : "border-neutral-200 dark:border-white/10 text-neutral-400 group-hover:border-brand-green/50 group-hover:text-brand-green/50"
            )}>
              <step.icon className="w-5 h-5" />
            </div>
            
            <h3 className={cn(
              "text-lg font-serif font-semibold mb-2 transition-colors",
              index === 0 ? "text-olive dark:text-off-white" : "text-neutral-500 dark:text-neutral-400"
            )}>
              {step.title}
            </h3>
            
            <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-[200px]">
              {step.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
