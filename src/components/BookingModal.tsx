"use client"

import { Button } from "@/components/ui/Button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/Dialog"
import { AlertCircle, Calendar, Clock, Globe, Video } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

interface BookingModalProps {
  trigger?: React.ReactNode
  calendlyUrl?: string
}

export function BookingModal({
  trigger,
  calendlyUrl = "",
}: BookingModalProps) {
  const [isOpen, setIsOpen] = useState(false)

  const isCalendlyConfigured = calendlyUrl && calendlyUrl.startsWith("https://calendly.com/")

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="accent" size="lg" className="shadow-lg shadow-orange/20">
            <Calendar className="mr-2 h-4 w-4" />
            Book Consultation
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl p-0 overflow-hidden">
        <div className="bg-gradient-to-br from-olive to-olive/90 text-white p-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-serif text-white flex items-center gap-2">
              <Calendar className="w-6 h-6 text-gold" />
              Schedule Your Consultation
            </DialogTitle>
            <DialogDescription className="text-white/80">
              Choose a convenient time for your personalized nutrition session.
            </DialogDescription>
          </DialogHeader>

          {/* Session Info Cards */}
          <div className="grid grid-cols-2 gap-3 mt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <Video className="w-4 h-4 text-gold" />
                <span className="text-sm font-semibold">Virtual Session</span>
              </div>
              <p className="text-xs text-white/70">Via Zoom or Google Meet</p>
              <p className="text-lg font-bold text-gold mt-2">Ksh 2,500</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <Globe className="w-4 h-4 text-gold" />
                <span className="text-sm font-semibold">In-Person</span>
              </div>
              <p className="text-xs text-white/70">Parklands or South C clinic</p>
              <p className="text-lg font-bold text-gold mt-2">Ksh 3,000</p>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-4 text-xs text-white/60">
            <Clock className="w-3 h-3" />
            <span>Sessions typically last 45-60 minutes</span>
          </div>
        </div>

        {/* Calendly Embed or Fallback */}
        {isCalendlyConfigured ? (
          <div className="h-[500px] w-full">
            <iframe
              src={calendlyUrl}
              width="100%"
              height="100%"
              frameBorder="0"
              title="Book a consultation"
              className="border-0"
            />
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-orange/10 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-orange" />
            </div>
            <h3 className="text-xl font-serif font-bold text-olive dark:text-off-white mb-3">
              Booking Coming Soon
            </h3>
            <p className="text-neutral-500 dark:text-neutral-400 max-w-md mx-auto mb-6">
              Online booking is currently unavailable. Please check back later or contact us directly to book your appointment.
            </p>
            <div className="flex gap-3 justify-center">
              <Link 
                href="/booking" 
                className="inline-flex items-center gap-2 px-6 py-3 bg-brand-green text-white rounded-full font-medium hover:bg-brand-green/90 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Go to Booking Page
              </Link>
              <Link 
                href="/contact" 
                className="inline-flex items-center gap-2 px-6 py-3 border border-neutral-200 dark:border-white/10 rounded-full font-medium hover:bg-neutral-50 dark:hover:bg-white/5 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Contact Us
              </Link>
            </div>
          </div>
        )}

        {/* Fallback Link - only show when Calendly is configured */}
        {isCalendlyConfigured && (
          <div className="p-4 bg-neutral-50 dark:bg-white/5 border-t border-neutral-100 dark:border-white/10 text-center">
            <p className="text-xs text-neutral-500">
              Having trouble?{" "}
              <a
                href={calendlyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-green hover:underline font-medium"
              >
                Open in new tab
              </a>
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
