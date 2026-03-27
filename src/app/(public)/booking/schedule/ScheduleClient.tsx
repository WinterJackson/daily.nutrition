"use client"

import { BookingWidget } from "@/components/booking/BookingWidget";
import { AnimatedBackground } from "@/components/ui/AnimatedBackground";
import { Button } from "@/components/ui/Button";
import { pricing, services } from "@/lib/data";
import { cn } from "@/lib/utils";
import { ArrowLeft, Calendar, Check, Clock, Globe, Info, MapPin } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

interface ScheduleClientProps {
  calendarId: string
  businessName: string
  blockedDates: string[]
  googleCalendarConfig?: {
    eventDuration: number
    bufferTime: number
    minNotice: number
    availability: any
  }
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

export function ScheduleClient({ calendarId, businessName, blockedDates, googleCalendarConfig }: ScheduleClientProps) {
  const searchParams = useSearchParams()
  const router = useRouter()

  const serviceId = searchParams.get("service")
  const rawSessionType = searchParams.get("type") as "virtual" | "in-person" | null

  // Validate service
  const service = services.find(s => s.id === serviceId)

  // Derived Data
  const Icon = service?.icon || Calendar
  const isDiscovery = service?.id === "discovery-call"
  const isDiabetes = service?.id === "diabetes-management"

  // Force discovery calls to virtual-only regardless of URL params
  const sessionType = isDiscovery ? "virtual" : (rawSessionType || "virtual")

  // Pricing Strategy
  const servicePricing = isDiabetes ? pricing.diabetes : pricing.default
  const currentPrice = isDiscovery ? 0 : (sessionType === "in-person" ? servicePricing.inPerson : servicePricing.virtual)

  const prepList = PREP_CHECKLISTS[service?.id || ""] || PREP_CHECKLISTS["general-counselling"]

  const isCalendarConfigured = calendarId.length > 0

  if (!serviceId || !service) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
            <p>Invalid service selected.</p>
            <Link href="/booking" className="text-brand-green mt-4 underline">Back to Booking</Link>
        </div>
    )
  }

  return (
    <div className="min-h-screen bg-off-white dark:bg-charcoal pt-28 pb-16 relative overflow-hidden">
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
                        <span className="font-medium">{sessionType === "virtual" ? "Virtual Session (Google Meet)" : "In-Person (PMC, Parklands)"}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Clock className="w-4 h-4 text-brand-green" />
                        <span>{isDiscovery ? "5-15 Minutes" : "45 - 60 Minutes"}</span>
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

            {isCalendarConfigured ? (
               <div className="min-h-[600px]">
                  <BookingWidget 
                    serviceTitle={service.title}
                    sessionType={sessionType}
                    settings={{
                        eventDuration: isDiscovery ? 15 : (googleCalendarConfig?.eventDuration || 30),
                        bufferTime: googleCalendarConfig?.bufferTime || 15,
                        minNotice: googleCalendarConfig?.minNotice || 120,
                        availability: googleCalendarConfig?.availability || {},
                        businessName: businessName,
                        googleCalendarId: calendarId,
                        blockedDates: blockedDates
                    }}
                  />
               </div>
            ) : (
                <div className="bg-white dark:bg-charcoal rounded-2xl border border-neutral-200 dark:border-white/10 p-8 md:p-12 text-center shadow-xl">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-orange/20 to-brand-green/10 flex items-center justify-center">
                        <Calendar className="w-10 h-10 text-orange" />
                    </div>
                    <h3 className="text-2xl font-serif font-bold text-olive dark:text-off-white mb-3">
                        Booking Coming Soon
                    </h3>
                    <p className="text-neutral-600 dark:text-neutral-400 max-w-md mx-auto mb-8 leading-relaxed">
                        Our online booking system is being set up. In the meantime, please contact us directly to schedule your consultation.
                    </p>
                    <Button variant="accent" size="lg" className="shadow-lg shadow-orange/20" asChild>
                        <Link href="/contact">
                            Contact Us
                        </Link>
                    </Button>
                    <p className="mt-6 text-xs text-neutral-400">
                        We typically respond within 24 hours
                    </p>
                </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
