"use client"

import { AnimatedBackground } from "@/components/ui/AnimatedBackground"
import { Button } from "@/components/ui/Button"
import { buildCalendlyUrl } from "@/lib/calendly"
import { pricing, services } from "@/lib/data"
import { cn } from "@/lib/utils"
import { ArrowLeft, Calendar, Check, Clock, Globe, Info, MapPin } from "lucide-react"
import { useTheme } from "next-themes"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useMemo } from "react"

interface ScheduleClientProps {
  calendlyUrl: string
}

const PREP_CHECKLISTS: Record<string, string[]> = {
  "diabetes-management": [
    "Recent blood sugar logs (last 3-7 days)",
    "List of current medications",
    "Recent HbA1c results if available"
  ],
  "gut-health": [
    "3-day food recall (rough notes)",
    "List of trigger foods/symptoms",
    "Recent lab results (if any)"
  ],
  "cancer-nutrition": [
    "Current treatment plan documents",
    "List of medications & supplements",
    "Recent blood work results"
  ],
  "general-counselling": [
    "List of health goals",
    "Current supplements list",
    "Recent check-up results"
  ],
  "discovery-call": [
    "Primary health goal",
    "Key questions for us"
  ]
}

export function ScheduleClient({ calendlyUrl }: ScheduleClientProps) {
  const searchParams = useSearchParams()
  const ServiceIcon = Calendar // Default
  const router = useRouter()
  const { resolvedTheme } = useTheme()

  const serviceId = searchParams.get("service")
  const sessionType = searchParams.get("type") as "virtual" | "in-person" | null

  // Validate service
  const service = services.find(s => s.id === serviceId)
  
  if (!serviceId || !service) {
    // Redirect back if invalid (handled in page.tsx effectively by notFound, but good safety)
    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
            <p>Invalid service selected.</p>
            <Link href="/booking" className="text-brand-green mt-4 underline">Back to Booking</Link>
        </div>
    )
  }

  // Derived Data
  const Icon = service.icon
  const isDiabetes = service.id === "diabetes-management"
  const isDiscovery = service.id === "discovery-call"
  
  // Pricing Strategy
  const servicePricing = isDiabetes ? pricing.diabetes : pricing.default
  const currentPrice = sessionType === "in-person" ? servicePricing.inPerson : servicePricing.virtual

  const prepList = PREP_CHECKLISTS[service.id] || PREP_CHECKLISTS["general-counselling"]

  // Calendly Construction
  const dynamicCalendlyUrl = useMemo(() => {
    if (!calendlyUrl) return ""
    
    // Theme colors matching globals.css
    // Light: bg-off-white (#F8FAF5), Text #0E1110
    // Dark: bg-charcoal (#0E1110), Text #F8FAF5
    const isDark = resolvedTheme === "dark"
    const bgColor = isDark ? "0E1110" : "F8FAF5"
    const textColor = isDark ? "F8FAF5" : "0E1110"

    return buildCalendlyUrl(calendlyUrl, {
      service: service.title,
      sessionType: sessionType || "virtual", // Fallback
      backgroundColor: bgColor,
      textColor: textColor,
      primaryColor: "E8751A" 
    })
  }, [calendlyUrl, service, sessionType, resolvedTheme])

  const isCalendlyConfigured = calendlyUrl && calendlyUrl.startsWith("https://calendly.com/")

  return (
    <div className="min-h-screen bg-off-white dark:bg-charcoal pt-20 pb-16 relative overflow-hidden">
      <AnimatedBackground variant="nutrition" />

      {/* Header / Nav */}
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 relative z-10">
        <Link 
            href="/booking" 
            className="inline-flex items-center text-sm font-medium text-neutral-500 hover:text-brand-green transition-colors px-4 py-2 hover:bg-neutral-100 dark:hover:bg-white/5 rounded-full"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Change Service
        </Link>
      </div>

      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* LEFT: Summary Sidebar (Sticky) */}
          <div className="lg:col-span-4 lg:sticky lg:top-28 space-y-6">
            
            {/* Booking Summary Card */}
            <div className="bg-white dark:bg-charcoal rounded-2xl p-6 shadow-xl shadow-olive/5 border border-neutral-100 dark:border-white/10">
                <div className="flex items-start justify-between mb-6 border-b border-neutral-100 dark:border-white/5 pb-6">
                    <div>
                        <p className="text-xs uppercase tracking-wider font-semibold text-neutral-500 mb-1">Service</p>
                        <h1 className="text-xl font-serif font-bold text-olive dark:text-off-white">{service.title}</h1>
                    </div>
                    <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0", service.bgColor, service.color)}>
                        <Icon className="w-5 h-5" />
                    </div>
                </div>

                <div className="space-y-4 text-sm text-neutral-600 dark:text-neutral-300">
                    <div className="flex items-center gap-3">
                        {sessionType === "virtual" ? <Globe className="w-4 h-4 text-brand-green" /> : <MapPin className="w-4 h-4 text-brand-green" />}
                        <span className="font-medium">{sessionType === "virtual" ? "Virtual Session (Zoom)" : "In-Person (Parklands/South C)"}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Clock className="w-4 h-4 text-brand-green" />
                        <span>{isDiscovery ? "5 Minutes" : "45 - 60 Minutes"}</span>
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-neutral-100 dark:border-white/5 flex items-end justify-between">
                    <span className="text-sm font-medium text-neutral-500">Total</span>
                    <span className="text-2xl font-bold text-brand-green">
                        {isDiscovery ? "Free" : `Ksh ${currentPrice.toLocaleString()}`}
                    </span>
                </div>
            </div>

            {/* Preparation Checklist */}
            <div className="bg-brand-green/5 dark:bg-white/5 rounded-2xl p-6 border border-brand-green/10 dark:border-white/5">
                <div className="flex items-center gap-2 mb-4 text-olive dark:text-off-white">
                    <Info className="w-5 h-5 text-brand-green" />
                    <h3 className="font-semibold">How to Prepare</h3>
                </div>
                <ul className="space-y-3">
                    {prepList.map((item, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-neutral-600 dark:text-neutral-400">
                            <Check className="w-4 h-4 text-brand-green mt-0.5 shrink-0" />
                            <span>{item}</span>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Waitlist / Fallback */}
            <div className="bg-orange/5 dark:bg-orange/10 rounded-2xl p-6 border border-orange/10 text-center">
                <h3 className="font-semibold text-olive dark:text-off-white mb-2">Can't find a time?</h3>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-4">
                    Our schedule fills up fast. Join the waitlist or request a custom slot.
                </p>
                <Button variant="outline" className="w-full text-xs h-9 border-orange/20 text-orange hover:text-orange hover:bg-orange/10" asChild>
                    <Link href="/contact?subject=Waitlist Request">Join Waitlist / Custom Request</Link>
                </Button>
            </div>

          </div>

          {/* RIGHT: Calendar */}
          <div className="lg:col-span-8">
            <div className="mb-6">
                <h2 className="text-2xl font-serif font-bold text-olive dark:text-off-white mb-2">Select a Date & Time</h2>
                <p className="text-neutral-500 dark:text-neutral-400">
                    Times are in your local timezone. Confirmation sent immediately.
                </p>
            </div>

            {isCalendlyConfigured ? (
               <iframe
                 src={dynamicCalendlyUrl}
                 width="100%"
                 height="900" // Taller for better view
                 frameBorder="0"
                 title={`Book ${service.title}`}
                 className="w-full min-h-[900px] rounded-xl"
               />
            ) : (
                <div className="bg-white dark:bg-white/5 rounded-2xl border border-neutral-200 dark:border-white/10 p-12 text-center">
                    <p className="text-neutral-500">Booking configuration loading or missing...</p>
                </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
