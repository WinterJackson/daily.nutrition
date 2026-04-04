"use client"

import { cancelBooking, checkCanReschedule, getBookingDetails, rescheduleBooking } from "@/app/actions/booking-management"
import { fetchAvailability } from "@/app/actions/google-calendar"
import { Button } from "@/components/ui/Button"
import { Card, CardContent } from "@/components/ui/Card"
import { Input } from "@/components/ui/Input"
import { AlertTriangle, Calendar, CheckCircle2, Clock, Loader2, RefreshCw, XCircle } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"

// Styled error state for the actions

export default function BookingDetailPage() {
    const params = useParams()
    const router = useRouter()
    const referenceCode = params.referenceCode as string
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [booking, setBooking] = useState<any | null>(null)
    const [settings, setSettings] = useState<any | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [isCancelling, setIsCancelling] = useState(false)
    const [showCancelConfirm, setShowCancelConfirm] = useState(false)
    const [actionError, setActionError] = useState<string | null>(null)

    // Reschedule state
    const [showReschedule, setShowReschedule] = useState(false)
    const [rescheduleDate, setRescheduleDate] = useState("")
    const [rescheduleTime, setRescheduleTime] = useState("")
    const [isRescheduling, setIsRescheduling] = useState(false)
    const [rescheduleError, setRescheduleError] = useState<string | null>(null)
    const [canReschedule, setCanReschedule] = useState(true)

    const [availableSlots, setAvailableSlots] = useState<{ time: string, available: boolean }[]>([])
    const [isLoadingSlots, setIsLoadingSlots] = useState(false)

    useEffect(() => {
        if (!rescheduleDate) {
            setAvailableSlots([])
            return
        }
        
        async function load() {
            setIsLoadingSlots(true)
            const res = await fetchAvailability(rescheduleDate)
            if (res.success && res.slots) {
                setAvailableSlots(res.slots)
            } else {
                setAvailableSlots([])
            }
            setIsLoadingSlots(false)
            setRescheduleTime("") // Reset time block when date changes
        }
        
        load()
    }, [rescheduleDate])

    useEffect(() => {
        if (referenceCode) {
            loadBooking()
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [referenceCode])

    const loadBooking = async () => {
        try {
            const res = await getBookingDetails(referenceCode)
            if (res.success && res.booking) {
                setBooking(res.booking)
                if (res.settings) setSettings(res.settings)
                const rescheduleCheck = await checkCanReschedule(referenceCode)
                setCanReschedule(rescheduleCheck.allowed)
            } else {
                setError(res.error || "Booking not found")
            }
        } catch (e) {
            setError("Failed to load booking details")
        } finally {
            setIsLoading(false)
        }
    }

    const handleCancel = async () => {
        setIsCancelling(true)
        setActionError(null)
        try {
            const res = await cancelBooking(referenceCode)
            if (res.success) {
                loadBooking()
                setShowCancelConfirm(false)
            } else {
                setActionError("Failed to cancel: " + (res.error || "Unknown error"))
            }
        } catch (e) {
            setActionError("An error occurred while cancelling your booking. Please try again.")
        } finally {
            setIsCancelling(false)
        }
    }

    const handleReschedule = async () => {
        if (!rescheduleDate || !rescheduleTime) {
            setRescheduleError("Please select both a date and time")
            return
        }
        setIsRescheduling(true)
        setRescheduleError(null)
        try {
            const res = await rescheduleBooking(referenceCode, rescheduleDate, rescheduleTime)
            if (res.success) {
                setShowReschedule(false)
                setRescheduleDate("")
                setRescheduleTime("")
                loadBooking()
            } else {
                setRescheduleError(res.error || "Failed to reschedule")
            }
        } catch (e) {
            setRescheduleError("An error occurred while rescheduling")
        } finally {
            setIsRescheduling(false)
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-caption animate-pulse">Loading booking details...</p>
            </div>
        )
    }

    if (error || !booking) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6">
                <div className="text-red-500 mb-4 text-lg sm:text-xl font-bold">{error || "Booking not found"}</div>
                <Button onClick={() => router.push("/booking/manage")}>
                    Back to Lookup
                </Button>
            </div>
        )
    }

    const isCancelled = booking.bookingStatus === "CANCELLED" || booking.status === "CANCELLED"
    const isCompleted = booking.bookingStatus === "COMPLETED" || booking.status === "COMPLETED"
    const isPending = booking.bookingStatus === "PENDING" || booking.status === "PENDING"
    const scheduledDate = new Date(booking.scheduledAt)

    return (
        <div className="min-h-screen bg-off-white dark:bg-charcoal flex flex-col items-center justify-center p-6 relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-brand-green/5 to-transparent pointer-events-none" />

            <div className="w-full max-w-2xl relative z-10 space-y-8">
                <div className="text-center">
                    <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-body mb-2">
                        {isCancelled ? "Booking Cancelled" : "Your Booking"}
                    </h1>
                    <p className="text-sm md:text-base text-caption">
                        Reference: <span className="font-mono font-bold text-brand-green">{booking.referenceCode}</span>
                    </p>
                </div>

                {/* Styled Error Banner */}
                {actionError && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-xl flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-red-700 dark:text-red-400">{actionError}</p>
                            <button
                                type="button"
                                onClick={() => setActionError(null)}
                                className="text-xs text-red-500 hover:text-red-700 dark:hover:text-red-300 mt-1 underline"
                            >
                                Dismiss
                            </button>
                        </div>
                    </div>
                )}

                <Card className="surface-card shadow-2xl backdrop-blur-sm overflow-hidden">
                    <div className={`p-4 text-sm md:text-base font-bold text-center flex items-center justify-center gap-2 ${
                        isCancelled ? "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400" :
                        isCompleted ? "surface-secondary text-caption" :
                        isPending ? "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400" :
                        "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                    }`}>
                        {isCancelled ? <XCircle className="w-5 h-5" /> : isPending ? <AlertTriangle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                        {booking.bookingStatus || booking.status}
                    </div>

                    <CardContent className="p-8">
                        <div className="grid gap-8">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h2 className="text-xl md:text-2xl font-bold text-body">{booking.serviceName}</h2>
                                    <p className="text-sm md:text-base text-caption">{booking.sessionType} Session</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-brand-orange font-bold text-lg">{booking.duration} min</div>
                                </div>
                            </div>

                            {isPending && settings && (
                                <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-2xl p-6">
                                    <h3 className="text-amber-800 dark:text-amber-500 font-bold text-lg mb-2 flex items-center gap-2">
                                        <AlertTriangle className="w-5 h-5" />
                                        Action Required: Awaiting Payment
                                    </h3>
                                    <p className="text-amber-700 dark:text-amber-400 text-sm mb-4">
                                        Your booking is currently pending. To confirm this reservation and prevent it from automatically expiring, please complete payment via M-Pesa.
                                    </p>
                                    <div className="bg-white dark:bg-charcoal p-4 rounded-xl border border-amber-100 dark:border-amber-900/20 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs uppercase font-bold text-caption">M-Pesa Till Number</p>
                                            <p className="font-mono text-lg sm:text-xl font-bold text-body">{settings.paymentTillNumber || "N/A"}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs uppercase font-bold text-caption">Alternative Paybill</p>
                                            <p className="font-mono text-lg font-bold text-body">{settings.paymentPaybill || "N/A"}</p>
                                        </div>
                                    </div>
                                    <p className="text-amber-700 dark:text-amber-400 text-xs mt-4">
                                        Once your payment is manually verified by our team, you will receive a confirmation email with instructions or a Google Meet link (for virtual sessions).
                                    </p>
                                </div>
                            )}

                            <div className="surface-secondary rounded-2xl p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                                        <Calendar className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] md:text-xs font-bold uppercase text-caption">Date</p>
                                        <p className="text-sm md:text-base font-semibold text-body">
                                            {scheduledDate.toLocaleDateString("en-US", {
                                                weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
                                                timeZone: booking.clientTimezone || 'Africa/Nairobi'
                                            })}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
                                        <Clock className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] md:text-xs font-bold uppercase text-caption">Time</p>
                                        <p className="text-sm md:text-base font-semibold text-body">
                                            {scheduledDate.toLocaleTimeString("en-US", {
                                                hour: 'numeric', minute: '2-digit',
                                                timeZone: booking.clientTimezone || 'Africa/Nairobi'
                                            })}
                                            {booking.clientTimezone && <span className="text-xs text-caption ml-1">({booking.clientTimezone})</span>}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Reschedule Form */}
                            {showReschedule && (
                                <div className="surface-secondary rounded-xl p-6 space-y-4 border border-default animate-in fade-in slide-in-from-top-2 duration-200">
                                    <div className="flex items-center gap-2 text-brand-green font-bold">
                                        <RefreshCw className="w-5 h-5" />
                                        Reschedule Appointment
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] md:text-xs font-bold uppercase text-caption">New Date</label>
                                            <Input
                                                type="date"
                                                value={rescheduleDate}
                                                onChange={(e) => setRescheduleDate(e.target.value)}
                                                min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
                                                className="surface-input"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] md:text-xs font-bold uppercase text-caption">New Time</label>
                                            <select
                                                value={rescheduleTime}
                                                onChange={(e) => setRescheduleTime(e.target.value)}
                                                className="surface-input w-full p-2 border rounded-md min-h-[40px] appearance-none"
                                                disabled={isLoadingSlots || !rescheduleDate || availableSlots.length === 0}
                                            >
                                                <option value="">
                                                    {!rescheduleDate ? "Pick a date first" : isLoadingSlots ? "Loading slots..." : availableSlots.length === 0 ? "No slots available" : "Select a time block"}
                                                </option>
                                                {availableSlots.map(slot => (
                                                    <option key={slot.time} value={slot.time} disabled={!slot.available}>
                                                        {new Date(slot.time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: booking.clientTimezone || 'Africa/Nairobi' })}
                                                        {!slot.available ? " (Booked)" : ""}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    {rescheduleError && (
                                        <p className="text-sm text-red-500 font-medium">{rescheduleError}</p>
                                    )}
                                    <div className="flex gap-3 justify-end">
                                        <Button variant="outline" onClick={() => { setShowReschedule(false); setRescheduleError(null) }}>
                                            Cancel
                                        </Button>
                                        <Button onClick={handleReschedule} disabled={isRescheduling}>
                                            {isRescheduling ? (
                                                <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Rescheduling...</>
                                            ) : (
                                                "Confirm Reschedule"
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* Actions */}
                            {!isCancelled && !isCompleted && (
                                <div className="space-y-4 pt-4 border-t border-subtle">
                                    {showCancelConfirm ? (
                                        <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-xl border border-red-100 dark:border-red-900/20 text-center space-y-4">
                                            <div className="flex items-center justify-center gap-2 text-red-600 font-bold">
                                                <AlertTriangle className="w-5 h-5" />
                                                Are you sure?
                                            </div>
                                            <p className="text-sm text-caption">
                                                This cannot be undone. You will need to book a new appointment.
                                            </p>
                                            <div className="flex gap-3 justify-center">
                                                <Button variant="outline" onClick={() => setShowCancelConfirm(false)} className="w-32">
                                                    Go Back
                                                </Button>
                                                <Button 
                                                    variant="destructive" 
                                                    onClick={handleCancel} 
                                                    disabled={isCancelling}
                                                    className="w-32"
                                                >
                                                    {isCancelling ? "Cancelling..." : "Yes, Cancel"}
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col sm:flex-row gap-4">
                                            <Button 
                                                variant="outline" 
                                                className="flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/20"
                                                onClick={() => setShowCancelConfirm(true)}
                                            >
                                                Cancel Appointment
                                            </Button>
                                            <Button 
                                                className="flex-1 bg-brand-green hover:bg-brand-green/90"
                                                onClick={() => setShowReschedule(true)}
                                                disabled={!canReschedule}
                                            >
                                                <RefreshCw className="w-4 h-4 mr-2" />
                                                {canReschedule ? "Reschedule" : "Cannot Reschedule (< 24h)"}
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            )}

                             {isCancelled && (
                                <div className="pt-4 border-t border-subtle text-center">
                                    <p className="text-caption mb-4">Need to book a new time?</p>
                                    <Button onClick={() => router.push("/booking")} className="w-full">
                                        Book New Appointment
                                    </Button>
                                </div>
                             )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
