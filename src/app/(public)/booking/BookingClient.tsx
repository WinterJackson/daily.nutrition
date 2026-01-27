"use client"

import { BookingSteps } from "@/components/booking/BookingSteps"
import { FAQSection } from "@/components/booking/FAQSection"
import { ServiceSelection } from "@/components/booking/ServiceSelection"
import { AnimatedBackground } from "@/components/ui/AnimatedBackground"
import { buildCalendlyUrl } from "@/lib/calendly"
import { services } from "@/lib/data"
import { motion } from "framer-motion"
import { AlertCircle, Calendar } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"

interface BookingClientProps {
  activeServiceIds: string[]
  calendlyUrl: string
}

export function BookingClient({ activeServiceIds, calendlyUrl }: BookingClientProps) {
  const [selectedService, setSelectedService] = useState<string | undefined>()
  const [sessionType, setSessionType] = useState<"virtual" | "in-person">("virtual")
  const calendarRef = useRef<HTMLDivElement>(null)
  const searchParams = useSearchParams()

  useEffect(() => {
    const serviceId = searchParams.get("service")
    const type = searchParams.get("type") as "virtual" | "in-person" | null
    
    if (serviceId && activeServiceIds.includes(serviceId)) {
      setSelectedService(serviceId)
      setTimeout(() => {
        calendarRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
      }, 500)
    }
    if (type === "virtual" || type === "in-person") {
      setSessionType(type)
    }
  }, [searchParams, activeServiceIds])

  const handleServiceSelect = (serviceId: string) => {
    setSelectedService(serviceId)
    setTimeout(() => {
      calendarRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    }, 100)
  }

  // Build dynamic Calendly URL with prefill
  const dynamicCalendlyUrl = useMemo(() => {
    if (!calendlyUrl) return ""
    
    const serviceName = selectedService 
      ? services.find(s => s.id === selectedService)?.title 
      : undefined

    return buildCalendlyUrl(calendlyUrl, {
      service: serviceName,
      sessionType: sessionType
    })
  }, [calendlyUrl, selectedService, sessionType])

  const isCalendlyConfigured = calendlyUrl && calendlyUrl.startsWith("https://calendly.com/")

  return (
    <div className="min-h-screen bg-off-white dark:bg-charcoal pt-24 pb-16 relative overflow-hidden">
      {/* Animated Background */}
      <AnimatedBackground variant="nutrition" />

      {/* Header */}
      <section className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 dark:bg-white/5 backdrop-blur-sm text-brand-green font-semibold text-xs uppercase tracking-wide mb-6 border border-brand-green/20 shadow-sm"
        >
          <Calendar className="w-3 h-3 fill-current" />
          Start Your Journey
        </motion.div>
        
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl md:text-5xl lg:text-6xl font-bold font-serif text-olive dark:text-off-white mb-6"
        >
          Book Your Consultation
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-lg md:text-xl text-neutral-600 dark:text-neutral-300 max-w-2xl mx-auto leading-relaxed mb-12"
        >
          Simple, transparent booking. Choose your service, pick a time, and let&apos;s get started on your health goals.
        </motion.p>

        {/* Process Steps */}
        <motion.div
           initial={{ opacity: 0, y: 30 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.3 }}
        >
           <BookingSteps />
        </motion.div>
      </section>

      {/* Service Selection */}
      <section className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24 relative z-10">
        <div className="text-center mb-12">
           <h2 className="text-3xl font-serif font-bold text-olive dark:text-off-white mb-4">Select Your Plan</h2>
           <p className="text-neutral-500 dark:text-neutral-400">Choose the area of focus for your consultation.</p>
        </div>
        <ServiceSelection 
          onServiceSelect={handleServiceSelect} 
          selectedServiceId={selectedService} 
          activeServiceIds={activeServiceIds}
        />
      </section>

      {/* Booking Calendar */}
      <div ref={calendarRef} className="bg-white dark:bg-charcoal border-y border-neutral-100 dark:border-white/5 py-24 mb-24 relative z-10">
         <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 items-start">
              {/* Left Column: Text */}
              <div className="lg:col-span-4 lg:sticky lg:top-32">
                 <h2 className="text-3xl md:text-4xl font-serif font-bold text-olive dark:text-off-white mb-6">Pick a Time</h2>
                 <p className="text-lg text-neutral-600 dark:text-neutral-300 leading-relaxed">
                   {selectedService 
                     ? "Great choice. Select an available slot on the calendar to confirm your appointment." 
                     : "Please select a service above, then choose a time that works for you."}
                 </p>
                 <div className="mt-8 hidden lg:block p-6 bg-orange/5 rounded-2xl border border-orange/10">
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-2 font-medium uppercase tracking-wide">Note</p>
                    <p className="text-sm text-neutral-600 dark:text-neutral-300">
                      All times are in your local time zone. Checking out details will be sent to your email immediately after booking.
                    </p>
                 </div>
              </div>

              {/* Right Column: Calendar */}
              <div className="lg:col-span-8">
                {isCalendlyConfigured ? (
                  <div className="bg-white dark:bg-white/5 shadow-2xl shadow-olive/10 rounded-2xl overflow-hidden border border-neutral-200 dark:border-white/10 w-full min-h-[800px] h-full">
                     <iframe
                       src={dynamicCalendlyUrl}
                       width="100%"
                       height="100%"
                       frameBorder="0"
                       title="Book a consultation"
                       className="w-full h-full min-h-[800px]"
                     />
                  </div>
                ) : (
                  <div className="bg-white dark:bg-white/5 shadow-2xl shadow-olive/10 rounded-2xl overflow-hidden border border-neutral-200 dark:border-white/10 p-12 text-center">
                    <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-orange/10 flex items-center justify-center">
                      <AlertCircle className="w-8 h-8 text-orange" />
                    </div>
                    <h3 className="text-xl font-serif font-bold text-olive dark:text-off-white mb-3">
                      Booking Coming Soon
                    </h3>
                    <p className="text-neutral-500 dark:text-neutral-400 max-w-md mx-auto mb-6">
                      Our online booking system is being set up. In the meantime, please contact us directly to schedule your consultation.
                    </p>
                    <Link 
                      href="/contact" 
                      className="inline-flex items-center gap-2 px-6 py-3 bg-orange text-white rounded-full font-medium hover:bg-orange/90 transition-colors shadow-lg shadow-orange/20"
                    >
                      Contact Us
                    </Link>
                  </div>
                )}
              </div>
            </div>
         </div>
      </div>

      {/* Pre-session List */}
      <section className="container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-24 relative z-10">
         <div className="bg-olive/5 dark:bg-white/5 rounded-3xl p-8 md:p-12 border border-olive/10 dark:border-white/10">
             <h3 className="text-2xl font-serif font-bold text-olive dark:text-off-white mb-6 text-center">To Make The Most Of Your Visit</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-charcoal p-6 rounded-xl shadow-sm">
                   <h4 className="font-bold text-olive dark:text-off-white mb-2">Medical Records</h4>
                   <p className="text-sm text-neutral-600 dark:text-neutral-400">Please bring any recent blood test results (within last 3-6 months), doctor&apos;s referral notes, and a list of current medications.</p>
                </div>
                <div className="bg-white dark:bg-charcoal p-6 rounded-xl shadow-sm">
                   <h4 className="font-bold text-olive dark:text-off-white mb-2">Food Diary</h4>
                   <p className="text-sm text-neutral-600 dark:text-neutral-400">If possible, keep a simple log of what you eat for 3 days prior to the consultation. This helps us understand your habits.</p>
                </div>
             </div>
         </div>
      </section>

      {/* FAQ */}
      <section className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24 relative z-10">
         <FAQSection />
      </section>

      {/* Support CTA */}
      <section className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 mb-12">
         <p className="text-neutral-500 dark:text-neutral-400 mb-4">Can&apos;t find a suitable time?</p>
         <Link href="/contact" className="text-brand-green font-semibold hover:underline">Contact us directly</Link>
      </section>

    </div>
  )
}
