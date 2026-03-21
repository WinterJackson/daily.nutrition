"use client"

import { getSettings, SettingsData, updateSettings } from "@/app/actions/settings"
import { BlockedDatesManager } from "@/components/admin/BlockedDatesManager"
import { WeeklyAvailabilityEditor, WeeklySchedule } from "@/components/admin/WeeklyAvailabilityEditor"
import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card"
import { Calendar, CheckCircle, Clock, Info, Loader2, Save } from "lucide-react"
import Link from "next/link"
import { useEffect, useState, useTransition } from "react"

export default function CalendarManagementPage() {
    const [fullSettings, setFullSettings] = useState<SettingsData | null>(null)
    const [schedule, setSchedule] = useState<WeeklySchedule | null>(null)
    const [isSaving, startTransition] = useTransition()
    const [saveSuccess, setSaveSuccess] = useState(false)

    useEffect(() => {
        // Load the true global settings down from the server
        async function loadSettings() {
            try {
                const settings = await getSettings()
                if (settings) {
                    setFullSettings(settings)
                    if (settings.googleCalendarConfig?.availability && Object.keys(settings.googleCalendarConfig.availability).length > 0) {
                        setSchedule(settings.googleCalendarConfig.availability)
                    }
                }
            } catch (error) {
                console.error("Failed to load settings:", error)
            }
        }
        loadSettings()
    }, [])

    const handleScheduleChange = (newSchedule: WeeklySchedule) => {
        setSchedule(newSchedule)
    }

    const handleSave = () => {
        if (!fullSettings || !schedule) return

        startTransition(async () => {
            // Merge the updated schedule into the global settings object and save
            const updatedSettings: SettingsData = {
                ...fullSettings,
                googleCalendarConfig: {
                    ...(fullSettings.googleCalendarConfig || { eventDuration: 30, bufferTime: 15, minNotice: 120, availability: {} }),
                    availability: schedule
                }
            }

            const result = await updateSettings(updatedSettings)
            if (result && !result.success) {
                alert(`Save failed: ${result.error || "Unknown error"}`)
                return
            }
            // Critically: Update local state with the newly incremented version integer
            setFullSettings({
                ...updatedSettings,
                version: (updatedSettings.version || 0) + 1
            })
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

            {/* Instructions Card */}
            <Card className="border-none shadow-xl shadow-neutral-200/50 dark:shadow-black/20 bg-brand-green/5 dark:bg-brand-green/10 backdrop-blur-md mb-8">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-brand-green dark:text-brand-green-light">
                        <Info className="w-5 h-5" />
                        How Scheduling Works
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-neutral-600 dark:text-neutral-300 space-y-4 text-sm leading-relaxed">
                    <p>
                        <strong className="text-olive dark:text-off-white">1. Generating Time Slots (Weekly Schedule):</strong> 
                        <span> The calendar automatically generates booking slots based exclusively on the global business hours you set in the "Weekly Schedule" on the left. For example, if you set Monday from 09:00 to 17:00, the system automatically creates 30-minute slots for every single Monday of the year. You do NOT manually create slots for specific calendar dates.</span>
                    </p>
                    <p>
                        <strong className="text-olive dark:text-off-white">2. Removing Slots (Blocked Dates):</strong> 
                        <span> If you need to take a specific day off (e.g., a holiday or vacation) that normally has working hours, use the "Blocked Dates" tool on the right. Blocking a date instantly overrides the Weekly Schedule and permanently grays out that specific day on the public calendar.</span>
                    </p>
                    <p>
                        <strong className="text-olive dark:text-off-white">3. Managing Google Sync:</strong>
                        <span> The system reads your Google Calendar "Busy" events in real-time. If you create a personal event in your Google Calendar during your normal business hours, that specific time slot is instantly removed from the website!</span>
                    </p>
                    <p>
                        <strong className="text-olive dark:text-off-white block mb-1">4. The "Invisible Padding" Architecture:</strong>
                        <span>To rigidly protect your time, the system enforces a 15-minute preparation buffer between appointments using an invisible collision algorithm.</span>
                        <ul className="list-disc pl-5 mt-2 space-y-1 text-sm">
                            <li><strong>Empty Calendar Example:</strong> The system displays a perfectly clean grid of 30-minute intervals (9:00, 9:30, 10:00 AM).</li>
                            <li><strong>Active Booking Example:</strong> If a client books 9:00 AM, the system detects your 15-minute buffer rule and realizes a 9:30 AM appointment would give you 0 minutes of preparation. It silently destroys the 9:30 AM button, making 10:00 AM the next globally available slot. This guarantees you never suffer from back-to-back booking fatigue.</li>
                        </ul>
                    </p>
                </CardContent>
            </Card>

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
