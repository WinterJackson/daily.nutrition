"use client"

import { getBookings } from "@/app/actions/bookings"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card"
import { format } from "date-fns"
import { Calendar as CalendarIcon, Clock, User } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

export function UpcomingBookingsList() {
    const [bookings, setBookings] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchBookings = async () => {
            setIsLoading(true)
            const result = await getBookings("upcoming", 1, 3)
            if (!result.error && result.bookings) {
                setBookings(result.bookings)
            }
            setIsLoading(false)
        }
        fetchBookings()
    }, [])

    return (
        <Card className="border-none shadow-xl shadow-neutral-200/50 dark:shadow-black/20 bg-white/90 dark:bg-white/5 backdrop-blur-md">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5 text-olive" />
                    Upcoming Bookings
                </CardTitle>
                <CardDescription>
                    Your next 3 scheduled appointments.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-16 bg-neutral-100 dark:bg-white/5 rounded-xl animate-pulse" />
                        ))}
                    </div>
                ) : bookings.length === 0 ? (
                    <div className="text-center py-6 text-neutral-500">
                        <CalendarIcon className="w-10 h-10 mx-auto mb-2 opacity-30" />
                        <p className="text-sm font-medium">No upcoming bookings</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {bookings.map(booking => (
                            <Link href={`/admin/bookings?search=${encodeURIComponent(booking.clientName)}`} key={booking.id}>
                                <div className="p-3 bg-neutral-50 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 rounded-xl border border-neutral-200 dark:border-white/10 transition-all group flex items-start justify-between gap-3">
                                    <div>
                                        <div className="flex items-center gap-2 font-medium text-olive dark:text-off-white group-hover:text-brand-green transition-colors">
                                            <User className="w-4 h-4" />
                                            {booking.clientName}
                                        </div>
                                        <div className="text-xs text-neutral-500 mt-1 flex items-center gap-1.5 flex-wrap">
                                            <span className="flex items-center gap-1">
                                                <CalendarIcon className="w-3 h-3" />
                                                {format(new Date(booking.scheduledAt), 'MMM d, yyyy')}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {format(new Date(booking.scheduledAt), 'h:mm a')}
                                            </span>
                                        </div>
                                        <div className="text-xs text-neutral-400 mt-1 line-clamp-1">
                                            {booking.serviceName}
                                        </div>
                                    </div>
                                    <div className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400 rounded-full shrink-0">
                                        UPCOMING
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
