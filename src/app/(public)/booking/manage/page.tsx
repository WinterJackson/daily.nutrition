"use client"

import { lookupBooking } from "@/app/actions/booking-management"
import { Button } from "@/components/ui/Button"
import { Card, CardContent } from "@/components/ui/Card"
import { Input } from "@/components/ui/Input"
import { AnimatePresence, motion } from "framer-motion"
import { ArrowRight, Calendar, Loader2, Search, ShieldCheck } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function BookingManagePage() {
    const router = useRouter()
    const [referenceCode, setReferenceCode] = useState("")
    const [email, setEmail] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setIsLoading(true)

        try {
            const res = await lookupBooking(referenceCode.trim(), email.trim())
            
            if (res.success && res.booking) {
                router.push(`/booking/manage/${res.booking.referenceCode}`)
            } else {
                setError(res.error || "Booking not found. Please check your details.")
            }
        } catch (err) {
            setError("Something went wrong. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-off-white dark:bg-charcoal flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-brand-green/10 to-transparent pointer-events-none" />
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-brand-orange/10 rounded-full blur-3xl pointer-events-none" />
            
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md relative z-10"
            >
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-white dark:bg-white/10 rounded-2xl shadow-xl flex items-center justify-center mx-auto mb-6 transform -rotate-6">
                        <Calendar className="w-8 h-8 text-olive" />
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-body mb-2">
                        Manage Booking
                    </h1>
                    <p className="text-caption">
                        Enter your booking reference and email to reschedule or cancel your appointment.
                    </p>
                </div>

                <Card className="surface-card shadow-2xl backdrop-blur-md">
                    <CardContent className="p-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-caption">
                                    Reference Code
                                </label>
                                <div className="relative">
                                    <Input
                                        value={referenceCode}
                                        onChange={(e) => setReferenceCode(e.target.value.toUpperCase())}
                                        placeholder="DN-XXXXXX"
                                        className="pl-10 font-mono text-lg uppercase tracking-wider"
                                        required
                                    />
                                    <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                                </div>
                                <p className="text-xs text-caption">Found in your confirmation email.</p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-caption">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <Input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="hello@example.com"
                                        className="pl-10"
                                        required
                                    />
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                                </div>
                            </div>

                            <AnimatePresence>
                                {error && (
                                    <motion.div 
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 text-sm p-3 rounded-lg flex items-center gap-2"
                                    >
                                        <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                        {error}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <Button 
                                type="submit" 
                                className="w-full h-12 text-base shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                        Searching...
                                    </>
                                ) : (
                                    <>
                                        Find Booking
                                        <ArrowRight className="w-5 h-5 ml-2" />
                                    </>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    )
}
