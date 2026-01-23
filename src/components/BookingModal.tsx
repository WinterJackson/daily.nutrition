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
import { Calendar, Clock, Globe, Video } from "lucide-react"
import { useState } from "react"

interface BookingModalProps {
  trigger?: React.ReactNode
  calendlyUrl?: string
}

export function BookingModal({
  trigger,
  calendlyUrl = "https://calendly.com/dailynutrition/consultation",
}: BookingModalProps) {
  const [isOpen, setIsOpen] = useState(false)

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

        {/* Calendly Embed */}
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

        {/* Fallback Link */}
        <div className="p-4 bg-neutral-50 dark:bg-white/5 border-t border-neutral-100 dark:border-white/10 text-center">
          <p className="text-xs text-neutral-500">
            Having trouble? {" "}
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
      </DialogContent>
    </Dialog>
  )
}
