"use client"

import { BookingSteps } from "@/components/booking/BookingSteps"
import { FAQSection } from "@/components/booking/FAQSection"
import { ServiceSelection } from "@/components/booking/ServiceSelection"
import { AnimatedBackground } from "@/components/ui/AnimatedBackground"
import { motion } from "framer-motion"
import { Calendar } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useEffect, useRef, useState } from "react"

export function BookingClient({ activeServiceIds }: { activeServiceIds: string[] }) {
  const [selectedService, setSelectedService] = useState<string | undefined>()
  const calendarRef = useRef<HTMLDivElement>(null)
  const searchParams = useSearchParams()

  useEffect(() => {
    const serviceId = searchParams.get("service")
    if (serviceId) {
      // Basic validation: check if service is active?
      // For now, allow selection even if hidden, or explicit check:
      if (activeServiceIds.includes(serviceId)) {
          setSelectedService(serviceId)
          setTimeout(() => {
            calendarRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
          }, 500)
      }
    }
  }, [searchParams, activeServiceIds])

  const handleServiceSelect = (serviceId: string) => {
    setSelectedService(serviceId)
    // Smooth scroll to calendar
    setTimeout(() => {
      calendarRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    }, 100)
  }

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
         <div className="container max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
               <h2 className="text-3xl font-serif font-bold text-olive dark:text-off-white mb-4">Pick a Time</h2>
               <p className="text-neutral-500 dark:text-neutral-400 max-w-lg mx-auto">
                 {selectedService 
                   ? "Great choice. Select an available slot below to confirm your appointment." 
                   : "Please select a service above, then choose a time that works for you."}
               </p>
            </div>

            <div className="bg-white dark:bg-white/5 shadow-2xl shadow-olive/10 rounded-2xl overflow-hidden border border-neutral-200 dark:border-white/10 h-[700px]">
               <iframe
                 src="https://calendly.com/dailynutrition/consultation"
                 width="100%"
                 height="100%"
                 frameBorder="0"
                 title="Book a consultation"
                 className=""
               />
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
