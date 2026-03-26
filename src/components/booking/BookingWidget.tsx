"use client"

import { bookAppointment, fetchAvailability } from "@/app/actions/google-calendar"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Textarea } from "@/components/ui/Textarea"
import { addMonths, eachDayOfInterval, endOfMonth, endOfWeek, format, isBefore, isSameDay, startOfMonth, startOfToday, startOfWeek, subMonths } from "date-fns"
import { AnimatePresence, motion } from "framer-motion"
import { AlertCircle, ArrowRight, CheckCircle, ChevronLeft, ChevronRight, Clock, Globe, Info, Loader2, Mail, User } from "lucide-react"
import Link from "next/link"
import { useEffect, useMemo, useState } from "react"

// Types
export interface PlatformSettings {
   eventDuration: number
   bufferTime: number
   minNotice: number // minutes from now
   availability: any // WeeklySchedule
   blockedDates: string[]
   businessName: string
   googleCalendarId: string
}

interface BookingWidgetProps {
  settings: PlatformSettings
  serviceTitle: string
  sessionType: "virtual" | "in-person"
}

export function BookingWidget({ settings, serviceTitle, sessionType }: BookingWidgetProps) {
  console.log("BookingWidget Settings:", settings);
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()))
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  
  // Slots State
  const [availableSlots, setAvailableSlots] = useState<{ time: string, available: boolean }[]>([])
  const [isLoadingSlots, setIsLoadingSlots] = useState(false)

  const [bookingStep, setBookingStep] = useState<"calendar" | "form" | "success">("calendar")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [referenceCode, setReferenceCode] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({ name: "", email: "", notes: "" })
  const [bookingError, setBookingError] = useState<string | null>(null)
  const [isInstructionsOpen, setIsInstructionsOpen] = useState(true)

  // Timezone State
  const [clientTimezone, setClientTimezone] = useState("Africa/Nairobi")
  const [mounted, setMounted] = useState(false)

  const timezones = [
    "Africa/Nairobi",
    "Europe/London",
    "Europe/Paris",
    "Europe/Berlin",
    "America/New_York",
    "America/Chicago",
    "America/Denver",
    "America/Los_Angeles",
    "Asia/Dubai",
    "Asia/Singapore",
    "Australia/Sydney",
    "Pacific/Auckland"
  ]

  useEffect(() => {
    setMounted(true)
    try {
        const detected = Intl.DateTimeFormat().resolvedOptions().timeZone
        if (detected) setClientTimezone(detected)
    } catch (e) {
        console.warn("Could not detect timezone", e)
    }
  }, [])

  const today = startOfToday()

  // Generate Calendar Days
  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth))
    const end = endOfWeek(endOfMonth(currentMonth))
    return eachDayOfInterval({ start, end })
  }, [currentMonth])

  // Fetch Slots on Date Change
  useEffect(() => {
    async function loadSlots() {
        if (!selectedDate) {
            setAvailableSlots([])
            return
        }
        
        setIsLoadingSlots(true)
        // Format as YYYY-MM-DD for consistency
        const dateStr = format(selectedDate, 'yyyy-MM-dd')
        
        const res = await fetchAvailability(dateStr)
        if (res.success && res.slots) {
            setAvailableSlots(res.slots)
        } else {
            console.error(res.error)
            setAvailableSlots([])
        }
        setIsLoadingSlots(false)
    }
    
    loadSlots()
  }, [selectedDate])

  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))
  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1))

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time)
    setBookingStep("form")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedDate || !selectedTime) return

    setIsSubmitting(true)
    setBookingError(null)
    
    // Call Server Action
    const res = await bookAppointment({
        dateStr: format(selectedDate, 'yyyy-MM-dd'),
        time: selectedTime,
        clientName: formData.name,
        clientEmail: formData.email,
        notes: formData.notes,
        serviceName: serviceTitle,
        clientTimezone: clientTimezone,
        sessionType: sessionType
    })

    if (res.success) {
        setReferenceCode('referenceCode' in res ? res.referenceCode : null)
        setBookingError(null)
        setBookingStep("success")
    } else {
        setBookingError(res.error || "An unexpected error occurred. Please try again.")
    }
    
    setIsSubmitting(false)
  }

  // --- Render Views ---

  if (bookingStep === "success") {
    return (
        <div className="bg-white dark:bg-charcoal rounded-2xl shadow-xl border border-neutral-100 dark:border-white/5 overflow-hidden max-w-2xl mx-auto p-12 text-center space-y-6">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-olive" />
            </div>
            <h2 className="text-3xl font-bold text-olive dark:text-off-white">Booking Confirmed!</h2>
            <p className="text-neutral-600 dark:text-neutral-400 max-w-md mx-auto">
                You are scheduled with <strong>{settings.businessName || "Edwak Nutrition"}</strong> for <strong>{selectedDate && format(selectedDate, 'MMMM d, yyyy')}</strong> at <strong>{new Date(selectedTime!).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: clientTimezone })}</strong>.
            </p>
            {referenceCode && (
              <div className="p-5 bg-brand-green/5 dark:bg-brand-green/10 rounded-xl border border-brand-green/20">
                <p className="text-neutral-500 mb-2 text-sm">Your Reference Code</p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-3">
                    <p className="text-3xl font-mono font-bold text-olive dark:text-off-white bg-white dark:bg-white/5 py-2 px-6 rounded-lg shadow-inner">{referenceCode}</p>
                </div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">Use this code to manage or reschedule your appointment at any time.</p>
                <Button asChild className="w-full sm:w-auto">
                    <Link href={`/booking/manage/${referenceCode}`}>
                        Manage Booking
                    </Link>
                </Button>
              </div>
            )}
            <div className="p-4 bg-neutral-50 dark:bg-white/5 rounded-xl border border-neutral-100 dark:border-white/10 text-sm text-neutral-500">
                A calendar invitation has been sent to <strong>{formData.email}</strong>
            </div>
            <Button onClick={() => window.location.reload()} variant="outline" className="mt-8">
                Book Another
            </Button>
        </div>
    )
  }

  return (
    <>
    {/* Collapsible Instruction Card */}
    <div className="max-w-5xl mx-auto mb-8 bg-white dark:bg-charcoal rounded-2xl border border-neutral-100 dark:border-white/5 shadow-lg overflow-hidden transition-all">
        <button 
            onClick={() => setIsInstructionsOpen(!isInstructionsOpen)}
            className="w-full flex items-center justify-between p-6 text-left hover:bg-neutral-50 dark:hover:bg-white/5 transition-colors"
        >
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-olive/10 flex items-center justify-center">
                    <Info className="w-5 h-5 text-olive" />
                </div>
                <h3 className="text-lg font-bold text-olive dark:text-off-white">
                    How to Book Your Appointment
                </h3>
            </div>
            <ChevronRight className={`w-5 h-5 text-neutral-400 transition-transform duration-300 ${isInstructionsOpen ? 'rotate-90' : ''}`} />
        </button>
        
        <AnimatePresence>
            {isInstructionsOpen && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                >
                    <div className="p-8 pt-0 border-t border-neutral-100 dark:border-white/5">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-6">
                            <div className="space-y-3">
                                <div className="w-8 h-8 rounded-full bg-brand-green/10 text-brand-green flex items-center justify-center font-bold text-sm">1</div>
                                <h4 className="font-semibold text-neutral-800 dark:text-neutral-200">View Availability</h4>
                                <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                                    Check the calendar below. Days marked with an <span className="inline-block w-2 h-2 rounded-full bg-orange mx-1"></span> orange dot indicate our business hours are open. Click on a date to see specific time slots.
                                </p>
                            </div>
                            
                            <div className="space-y-3">
                                <div className="w-8 h-8 rounded-full bg-brand-green/10 text-brand-green flex items-center justify-center font-bold text-sm">2</div>
                                <h4 className="font-semibold text-neutral-800 dark:text-neutral-200">Select a Time</h4>
                                <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                                    Choose a time slot that works best for you. Note that all times are displayed in your local timezone relative to our East Africa Time availability.
                                </p>
                            </div>
                            
                            <div className="space-y-3">
                                <div className="w-8 h-8 rounded-full bg-brand-green/10 text-brand-green flex items-center justify-center font-bold text-sm">3</div>
                                <h4 className="font-semibold text-neutral-800 dark:text-neutral-200">Confirm Details</h4>
                                <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                                    Enter your contact information and any notes. You'll receive an immediate email confirmation with a calendar invitation and meeting link.
                                </p>
                            </div>
                        </div>
                        
                        <div className="mt-8 pt-6 border-t border-neutral-100 dark:border-white/5 flex flex-wrap gap-4 text-xs text-neutral-500">
                             <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-orange"></span>
                                <span>Open for Booking</span>
                             </div>
                             <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-neutral-300 dark:bg-neutral-600"></span>
                                <span>Unavailable / Closed</span>
                             </div>
                             <div className="flex items-center gap-2 ml-auto">
                                <Mail className="w-3 h-3" />
                                <span>Need help? Contact info@edwaknutrition.co.ke</span>
                             </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    </div>

    <div className="bg-white dark:bg-charcoal rounded-2xl shadow-2xl border border-neutral-100 dark:border-white/5 overflow-hidden flex flex-col max-w-5xl mx-auto relative transition-all duration-500">
      
      {/* Calendar Section (Always Top) */}
      <div className={`p-6 w-full transition-all duration-500 ${bookingStep === 'form' ? 'opacity-50 pointer-events-none' : ''}`}>
         {/* Header */}
         <div className="mb-6 text-left">
            <span className="font-bold text-neutral-500 text-xs uppercase tracking-wider mb-2 block">
                {settings.businessName}
            </span>
            <h1 className="text-xl font-bold text-neutral-800 dark:text-neutral-100 mb-1">
                {serviceTitle}
            </h1>
            <div className="flex items-center justify-start gap-2 text-sm text-neutral-500">
                <Clock className="w-4 h-4" /> {settings.eventDuration} min
            </div>
         </div>

         {/* Timezone Picker */}
         <div className="flex justify-end px-6 pt-6">
            <div className="flex items-center gap-2 bg-neutral-100 dark:bg-white/5 px-2 py-1 rounded-lg border border-neutral-200 dark:border-white/10">
                <Globe className="w-3 h-3 text-neutral-500" />
                <select 
                    value={clientTimezone}
                    onChange={(e) => setClientTimezone(e.target.value)}
                    className="bg-transparent border-none text-xs font-medium text-neutral-600 dark:text-neutral-400 focus:ring-0 cursor-pointer py-0 pl-0 pr-6"
                >
                    {timezones.map(tz => (
                        <option key={tz} value={tz}>{tz.replace(/_/g, ' ')}</option>
                    ))}
                    {!timezones.includes(clientTimezone) && (
                        <option value={clientTimezone}>{clientTimezone.replace(/_/g, ' ')}</option>
                    )}
                </select>
            </div>
         </div>

         {/* Calendar Controls */}
         <div className="flex items-center justify-between mb-6 px-4 pt-2">
            <button onClick={handlePrevMonth} className="p-2 hover:bg-neutral-100 dark:hover:bg-white/10 rounded-full transition-colors">
                <ChevronLeft className="w-6 h-6 text-neutral-600 dark:text-neutral-400" />
            </button>
            <h2 className="font-bold text-xl text-neutral-800 dark:text-neutral-200">
                {format(currentMonth, 'MMMM yyyy')}
            </h2>
            <button onClick={handleNextMonth} className="p-2 hover:bg-neutral-100 dark:hover:bg-white/10 rounded-full transition-colors">
                <ChevronRight className="w-6 h-6 text-neutral-600 dark:text-neutral-400" />
            </button>
         </div>

         {/* Calendar Grid */}
         <div className="grid grid-cols-7 gap-y-4 text-center mb-6">
            {['S','M','T','W','T','F','S'].map((d, i) => (
                <div key={i} className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2">{d}</div>
            ))}
            {days.map((day, idx) => {
                // Hydration Fix: Gate date checks behind mounted to prevent server/client mismatch
                const isPast = mounted && isBefore(day, today)
                const isCurrentMonth = day.getMonth() === currentMonth.getMonth()
                const isSelected = selectedDate && isSameDay(day, selectedDate)
                const isDayToday = mounted && isSameDay(day, today)
                
                // Check business hours availability from settings
                const dayName = format(day, "EEEE").toLowerCase()
                const isOpen = settings.availability?.[dayName]?.isOpen ?? false
                
                // Check custom blocked dates
                const dayStr = format(day, 'yyyy-MM-dd')
                const isBlocked = settings.blockedDates?.includes(dayStr) ?? false
                
                const isClickable = !isPast && isCurrentMonth && isOpen && !isBlocked
                
                return (
                    <button
                        key={day.toISOString()}
                        disabled={!isClickable}
                        onClick={() => setSelectedDate(day)}
                        className={`
                            relative h-14 w-14 mx-auto flex items-center justify-center rounded-2xl text-base font-medium transition-all
                            ${!isCurrentMonth ? 'invisible' : ''}
                            ${isSelected ? 'bg-olive text-white shadow-md scale-105' : ''}
                            ${!isSelected && isClickable ? 'hover:bg-olive/10 text-neutral-700 dark:text-neutral-200 hover:text-olive' : ''}
                            ${!isClickable && !isSelected ? 'text-neutral-400 dark:text-neutral-500 cursor-not-allowed decoration-neutral-300 opacity-60' : ''}
                            ${isDayToday && !isSelected ? 'ring-1 ring-olive text-olive font-bold' : ''}
                        `}
                    >   
                        {format(day, 'd')}
                        {/* Availability Dot - Adjusted position for larger button */}
                        {isClickable && !isSelected && (
                            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-orange" />
                        )}
                    </button>
                )
            })}
         </div>
         
         <div className="flex justify-center items-center gap-1.5 text-[10px] text-neutral-400">
            <Globe className="w-3 h-3" />
            Timezone: Africa/Nairobi (EAT)
         </div>
      </div>

      {/* Slots Section (Bottom) */}
      <div className={`
         bg-neutral-50 dark:bg-black/20 border-t border-neutral-100 dark:border-white/5
         transition-all duration-500 overflow-hidden
         ${selectedDate ? 'max-h-[1200px] opacity-100' : 'max-h-0 opacity-0'}
      `}>
         <AnimatePresence mode="wait">
            {bookingStep === "calendar" && selectedDate && (
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="p-6"
                >
                    <h3 className="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-4 text-left">
                        Available Times for {format(selectedDate, "MMM do")}
                    </h3>

                    {/* Client Education Strategy Card */}
                    <div className="mb-6 p-4 bg-orange/5 border border-orange/10 rounded-xl text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed flex items-start gap-3">
                        <Info className="w-5 h-5 text-orange flex-shrink-0 mt-0.5" />
                        <div>
                            <strong className="text-olive dark:text-off-white block mb-1">Your privacy & care are prioritized.</strong>
                            <p>
                                Available times are displayed in structured 30-minute intervals. Behind the scenes, we automatically block out dedicated preparation time between every single appointment so your clinician can review your profile. If you see gaps between times, that slot is intentionally reserved to guarantee you receive a premium, unhurried consultation.
                            </p>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {isLoadingSlots ? (
                            <div className="col-span-2 md:col-span-4 flex flex-col items-center justify-center py-8 gap-3">
                                <Loader2 className="w-6 h-6 animate-spin text-olive" />
                                <p className="text-sm text-neutral-500">Loading available times...</p>
                            </div>
                        ) : availableSlots.length > 0 ? availableSlots.map(slot => (
                            <button
                                key={slot.time}
                                disabled={!slot.available}
                                onClick={() => handleTimeSelect(slot.time)}
                                className={`
                                    flex flex-col items-center justify-center p-3 border rounded-xl transition-all group
                                    ${slot.available 
                                        ? "bg-white dark:bg-white/5 border-neutral-200 dark:border-white/10 hover:border-olive hover:shadow-sm cursor-pointer" 
                                        : "bg-neutral-100 dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-700/50 opacity-60 cursor-not-allowed"}
                                `}
                            >
                                <span className={`font-bold text-lg ${slot.available ? "text-olive dark:text-white" : "text-neutral-400 dark:text-neutral-500 line-through decoration-neutral-400"}`}>
                                    {new Date(slot.time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: clientTimezone })}
                                </span>
                                <div className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 transition-colors ${slot.available ? "text-neutral-400 group-hover:text-olive" : "text-neutral-400/50"}`}>
                                    {slot.available ? (
                                        <>Next <ArrowRight className="w-2.5 h-2.5" /></>
                                    ) : (
                                        "Booked"
                                    )}
                                </div>
                            </button>
                        )) : (
                            <div className="col-span-2 md:col-span-4 text-center py-6 text-neutral-400">
                                <p className="mb-1 font-medium text-sm">No slots available.</p>
                                <p className="text-xs">Please try another date.</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            )}

            {bookingStep === "form" && (
                <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-6 md:p-8 h-full flex flex-col"
                >   
                    <button 
                        onClick={() => setBookingStep("calendar")}
                        className="mb-6 flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-800 transition-colors w-fit"
                    >
                        <ChevronLeft className="w-4 h-4" /> Back to times
                    </button>

                    <div className="mb-6 p-4 bg-white dark:bg-white/5 rounded-xl border border-neutral-200 dark:border-white/10 shadow-sm">
                        <div className="font-bold text-olive dark:text-off-white mb-1">
                            {serviceTitle}
                        </div>
                        <div className="text-sm text-neutral-600 dark:text-neutral-300">
                            {format(selectedDate!, "EEEE, MMMM do")} • {new Date(selectedTime!).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: clientTimezone })}
                        </div>
                    </div>

                    {bookingError && (
                        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-xl flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-red-700 dark:text-red-400">{bookingError}</p>
                                <button
                                    type="button"
                                    onClick={() => setBookingError(null)}
                                    className="text-xs text-red-500 hover:text-red-700 dark:hover:text-red-300 mt-1 underline"
                                >
                                    Dismiss
                                </button>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4 flex-1">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-neutral-700 dark:text-neutral-300">Your Name</label>
                            <div className="relative">
                                <Input 
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({...formData, name: e.target.value})}
                                    placeholder="John Doe"
                                    className="pl-10"
                                />
                                <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-neutral-700 dark:text-neutral-300">Email Address</label>
                            <div className="relative">
                                <Input 
                                    required
                                    type="email"
                                    value={formData.email}
                                    onChange={e => setFormData({...formData, email: e.target.value})}
                                    placeholder="john@example.com"
                                    className="pl-10"
                                />
                                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-neutral-700 dark:text-neutral-300">Notes (Optional)</label>
                            <div className="relative">
                                <Textarea 
                                    value={formData.notes}
                                    onChange={e => setFormData({...formData, notes: e.target.value})}
                                    placeholder="Any specific topics you'd like to discuss?"
                                    className="min-h-[100px] resize-none"
                                />
                            </div>
                        </div>

                        <div className="pt-4 mt-auto grid grid-cols-2 gap-4">
                            <Button 
                                type="button" 
                                variant="outline" 
                                onClick={() => setBookingStep("calendar")}
                                className="h-12 text-base border-neutral-200 dark:border-white/10 hover:bg-neutral-50 dark:hover:bg-white/5 text-neutral-600 dark:text-neutral-300"
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                            <Button 
                                type="submit" 
                                className="bg-olive hover:bg-olive-dark text-white h-12 text-base shadow-lg" 
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        Wait...
                                    </>
                                ) : (
                                    "Confirm Booking"
                                )}
                            </Button>
                        </div>
                    </form>
                </motion.div>
            )}
         </AnimatePresence>
      </div>

    </div>
    </>
  )
}
