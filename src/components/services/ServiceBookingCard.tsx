"use client"

import { Button } from "@/components/ui/Button"
import { Card, CardContent } from "@/components/ui/Card"
import { pricing } from "@/lib/data"
import { cn } from "@/lib/utils"
import { Calendar, CheckCircle2, Clock, Globe, LucideIcon, MapPin, Sparkles, Video } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

interface ServiceBookingCardProps {
  serviceId: string
  serviceTitle: string
  serviceColor: string
  serviceBgColor: string
  ServiceIcon: LucideIcon
}

const serviceMessages: Record<string, { headline: string; benefit: string; prep: string }> = {
  "cancer-nutrition": {
    headline: "Start Your Oncology Nutrition Journey",
    benefit: "Get personalized support for managing treatment side effects and optimizing your nutrition during recovery.",
    prep: "Have your recent lab results and medication list ready for your consultation."
  },
  "diabetes-management": {
    headline: "Take Control of Your Blood Sugar",
    benefit: "Learn effective meal planning strategies and understand how food affects your glucose levels.",
    prep: "Keep a 3-day food diary and note your recent HbA1c readings if available."
  },
  "gut-health": {
    headline: "Find Relief for Your Digestive Issues",
    benefit: "Discover dietary strategies to manage symptoms and restore gut balance.",
    prep: "Track your symptoms and trigger foods for a week before your appointment."
  },
  "general-counselling": {
    headline: "Invest in Your Long-Term Health",
    benefit: "Get science-backed guidance for weight management, cholesterol, and overall wellness.",
    prep: "Bring any recent health check results and list your health goals."
  }
}

export function ServiceBookingCard({ 
  serviceId, 
  serviceTitle, 
  serviceColor, 
  serviceBgColor,
  ServiceIcon 
}: ServiceBookingCardProps) {
  const [sessionType, setSessionType] = useState<"virtual" | "in-person">("virtual")
  const message = serviceMessages[serviceId] || serviceMessages["general-counselling"]
  
  // Use service-specific pricing for diabetes, default for others
  const servicePricing = serviceId === "diabetes-management" ? pricing.diabetes : pricing.default
  const isDiabetes = serviceId === "diabetes-management"

  return (
    <Card className="border-none shadow-2xl shadow-olive/10 bg-white dark:bg-charcoal overflow-hidden">
      {/* Service-colored header */}
      <div className={cn("p-4 flex items-center gap-3", serviceBgColor)}>
        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center bg-white/20", serviceColor)}>
          <ServiceIcon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider opacity-70">{serviceTitle}</p>
          <p className={cn("font-bold", serviceColor.replace("text-", "text-"))}>{message.headline}</p>
        </div>
      </div>

      <CardContent className="p-6 space-y-5">
        {/* Benefit statement */}
        <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
          {message.benefit}
        </p>

        {/* Session Type Selector */}
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Choose Session Type</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setSessionType("virtual")}
              className={cn(
                "p-4 rounded-xl border-2 text-left transition-all",
                sessionType === "virtual"
                  ? "border-brand-green bg-brand-green/5 ring-1 ring-brand-green"
                  : "border-neutral-200 dark:border-white/10 hover:border-brand-green/50"
              )}
            >
              <Video className={cn("w-5 h-5 mb-2", sessionType === "virtual" ? "text-brand-green" : "text-neutral-400")} />
              <p className="text-sm font-semibold text-olive dark:text-off-white">Virtual</p>
              <p className="text-xs text-neutral-500">via Zoom</p>
              <p className="text-lg font-bold text-brand-green mt-2">Ksh {servicePricing.virtual.toLocaleString()}</p>
            </button>
            <button
              onClick={() => setSessionType("in-person")}
              className={cn(
                "p-4 rounded-xl border-2 text-left transition-all",
                sessionType === "in-person"
                  ? "border-brand-green bg-brand-green/5 ring-1 ring-brand-green"
                  : "border-neutral-200 dark:border-white/10 hover:border-brand-green/50"
              )}
            >
              <MapPin className={cn("w-5 h-5 mb-2", sessionType === "in-person" ? "text-brand-green" : "text-neutral-400")} />
              <p className="text-sm font-semibold text-olive dark:text-off-white">In-Person</p>
              <p className="text-xs text-neutral-500">Parklands / South C</p>
              <p className="text-lg font-bold text-brand-green mt-2">Ksh {servicePricing.inPerson.toLocaleString()}</p>
            </button>
          </div>
        </div>

        {/* Session details */}
        <div className="flex items-center gap-4 text-xs text-neutral-500 border-t border-neutral-100 dark:border-white/5 pt-4">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>45-60 mins</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5" />
            <span>{sessionType === "virtual" ? "Video call" : "Clinic visit"}</span>
          </div>
        </div>

        {/* Book Button */}
        <Link href={`/booking?service=${serviceId}&type=${sessionType}`}>
          <Button className="w-full h-12 text-base font-semibold shadow-lg shadow-orange/20" variant="accent">
            <Calendar className="mr-2 h-4 w-4" />
            Book {serviceTitle} Consultation
          </Button>
        </Link>

        {/* Prep tip */}
        <div className="bg-brand-green/5 dark:bg-white/5 p-3 rounded-lg flex gap-2">
          <Sparkles className="w-4 h-4 text-brand-green shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-olive dark:text-off-white mb-0.5">Preparation Tip</p>
            <p className="text-xs text-neutral-600 dark:text-neutral-400">{message.prep}</p>
          </div>
        </div>

        {/* Trust indicators */}
        <div className="flex flex-wrap gap-2 pt-2">
          {["Evidence-based", "Personalized", "Confidential"].map((tag) => (
            <span key={tag} className="inline-flex items-center gap-1 text-[10px] font-medium bg-neutral-100 dark:bg-white/5 text-neutral-500 px-2 py-1 rounded-full">
              <CheckCircle2 className="w-2.5 h-2.5 text-brand-green" />
              {tag}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
