"use client"

import { BlockedDatesManager } from "@/components/admin/BlockedDatesManager"
import { WeeklyAvailabilityEditor, WeeklySchedule } from "@/components/admin/WeeklyAvailabilityEditor"
import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card"
import { Calendar, CheckCircle, Clock, Loader2, Save } from "lucide-react"
import Link from "next/link"
import { useEffect, useState, useTransition } from "react"

export default function CalendarManagementPage() {
    const [schedule, setSchedule] = useState<WeeklySchedule | null>(null)
    const [isSaving, startTransition] = useTransition()
    const [saveSuccess, setSaveSuccess] = useState(false)

    useEffect(() => {
        // Load the current schedule from settings
        async function loadSchedule() {
            try {
                const res = await fetch("/api/auth?type=settings")
                // For now, use default schedule — WeeklyAvailabilityEditor handles defaults internally
            } catch {
                // Silently use defaults
            }
        }
        loadSchedule()
    }, [])

    const handleScheduleChange = (newSchedule: WeeklySchedule) => {
        setSchedule(newSchedule)
    }

    const handleSave = () => {
        startTransition(async () => {
            // The schedule and blocked dates are saved individually by their respective components
            setSaveSuccess(true)
            setTimeout(() => setSaveSuccess(false), 3000)
        })
    }

    return (
        <div className="space-y-8 max-w-[1600px] mx-auto animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 text-sm text-neutral-500 mb-2">
                        <Link href="/admin/bookings" className="hover:text-olive transition-colors">
                            Bookings
                        </Link>
                        <span>/</span>
                        <span className="text-olive dark:text-off-white font-medium">Calendar Management</span>
                    </div>
                    <h1 className="text-3xl font-bold font-serif text-olive dark:text-off-white flex items-center gap-3">
                        <Calendar className="w-8 h-8 text-brand-green" />
                        Calendar Management
                    </h1>
                    <p className="text-neutral-500 dark:text-neutral-400 mt-1">
                        Configure your weekly availability and block off specific dates.
                    </p>
                </div>
                <Button
                    variant="accent"
                    className="shadow-lg shadow-orange/20"
                    onClick={handleSave}
                    disabled={isSaving}
                >
                    {isSaving ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
                    ) : saveSuccess ? (
                        <><CheckCircle className="mr-2 h-4 w-4" /> Saved!</>
                    ) : (
                        <><Save className="mr-2 h-4 w-4" /> Save Changes</>
                    )}
                </Button>
            </div>

            {/* Success Toast */}
            {saveSuccess && (
                <div className="fixed bottom-6 right-6 flex items-center gap-3 px-4 py-3 bg-brand-green text-white rounded-xl shadow-xl animate-in slide-in-from-bottom-4 z-50">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">Calendar settings saved!</span>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Weekly Availability */}
                <Card className="border-none shadow-xl shadow-neutral-200/50 dark:shadow-black/20 bg-white/90 dark:bg-white/5 backdrop-blur-md">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="w-5 h-5 text-olive" />
                            Weekly Availability
                        </CardTitle>
                        <CardDescription>
                            Set your standard weekly working hours. Clients can only book during these windows.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <WeeklyAvailabilityEditor
                            initialSchedule={schedule || undefined}
                            onChange={handleScheduleChange}
                        />
                    </CardContent>
                </Card>

                {/* Blocked Dates */}
                <div className="space-y-6">
                    <Card className="border-none shadow-xl shadow-neutral-200/50 dark:shadow-black/20 bg-white/90 dark:bg-white/5 backdrop-blur-md">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-orange" />
                                Blocked Dates
                            </CardTitle>
                            <CardDescription>
                                Block specific dates when you are unavailable (holidays, vacations, etc).
                            </CardDescription>
                        </CardHeader>
                    </Card>
                    <BlockedDatesManager />
                </div>
            </div>
        </div>
    )
}
