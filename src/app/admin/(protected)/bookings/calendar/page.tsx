"use client"

import { getSettings, SettingsData, updateSettings } from "@/app/actions/settings"
import { BlockedDatesManager } from "@/components/admin/BlockedDatesManager"
import { WeeklyAvailabilityEditor, WeeklySchedule } from "@/components/admin/WeeklyAvailabilityEditor"
import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card"
import { AnimatePresence, motion } from "framer-motion"
import { Calendar, CheckCircle, ChevronRight, Clock, Info, Loader2, Save } from "lucide-react"
import Link from "next/link"
import { useEffect, useState, useTransition } from "react"

export default function CalendarManagementPage() {
    const [fullSettings, setFullSettings] = useState<SettingsData | null>(null)
    const [schedule, setSchedule] = useState<WeeklySchedule | null>(null)
    const [isSaving, startTransition] = useTransition()
    const [saveSuccess, setSaveSuccess] = useState(false)
    const [isInstructionsOpen, setIsInstructionsOpen] = useState(false)

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

            {/* Collapsible Instruction Card */}
            <div className="mb-8 bg-brand-green/5 dark:bg-brand-green/10 rounded-2xl border border-brand-green/20 overflow-hidden transition-all shadow-xl shadow-brand-green/5 max-w-5xl">
                <button 
                    onClick={() => setIsInstructionsOpen(!isInstructionsOpen)}
                    className="w-full flex items-center justify-between p-6 text-left hover:bg-brand-green/10 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-brand-green/20 flex items-center justify-center">
                            <Info className="w-5 h-5 text-brand-green" />
                        </div>
                        <h3 className="text-xl font-bold font-serif text-brand-green dark:text-brand-green-light">
                            How Scheduling Works
                        </h3>
                    </div>
                    <ChevronRight className={`w-6 h-6 text-brand-green transition-transform duration-300 ${isInstructionsOpen ? 'rotate-90' : ''}`} />
                </button>
                
                <AnimatePresence>
                    {isInstructionsOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="p-8 pt-0 border-t border-brand-green/10 text-sm leading-relaxed">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
                                    <div className="space-y-4">
                                        <div className="w-8 h-8 rounded-full bg-brand-green/20 text-brand-green flex items-center justify-center font-bold text-sm">1</div>
                                        <h4 className="font-bold text-olive dark:text-off-white text-base">Generating Time Slots</h4>
                                        <p className="text-neutral-600 dark:text-neutral-300">
                                            The system mathematically generates automated slots based exclusively on the global business hours you set in the "Weekly Schedule" on the left. You do <strong>NOT</strong> manually create slots for specific calendar dates.
                                        </p>
                                    </div>
                                    
                                    <div className="space-y-4">
                                        <div className="w-8 h-8 rounded-full bg-brand-green/20 text-brand-green flex items-center justify-center font-bold text-sm">2</div>
                                        <h4 className="font-bold text-olive dark:text-off-white text-base">Removing Slots</h4>
                                        <p className="text-neutral-600 dark:text-neutral-300">
                                            If you need to take a specific day off (e.g., a holiday or vacation), use the "Blocked Dates" tool on the right. Blocking a date instantly obliterates the Weekly Schedule rule and permanently grays out the public calendar.
                                        </p>
                                    </div>
                                    
                                    <div className="space-y-4">
                                        <div className="w-8 h-8 rounded-full bg-brand-green/20 text-brand-green flex items-center justify-center font-bold text-sm">3</div>
                                        <h4 className="font-bold text-olive dark:text-off-white text-base">Handling Google Sync</h4>
                                        <p className="text-neutral-600 dark:text-neutral-300">
                                            The backend algorithm reads your Google Calendar "Busy" events in real-time. If you create a personal event in your Google Calendar app during business hours, that exact time block is instantly vaporized from the website!
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="mt-10 pt-8 border-t border-brand-green/10">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-8 h-8 rounded-full bg-brand-green/20 text-brand-green flex items-center justify-center font-bold text-sm shrink-0">4</div>
                                        <h4 className="font-bold text-olive dark:text-off-white text-base">The "Invisible Padding" Architecture</h4>
                                    </div>
                                    <div className="ml-11">
                                        <p className="text-neutral-600 dark:text-neutral-300 mb-4">
                                            To rigidly protect your time, the system continuously enforces a <strong>15-minute preparation buffer</strong> between appointments using an invisible collision matrix.
                                        </p>
                                        <ul className="list-disc pl-5 space-y-3 text-neutral-600 dark:text-neutral-300">
                                            <li><strong className="text-olive dark:text-off-white font-medium">Empty Calendar Example:</strong> The system displays a perfectly clean, highly professional grid of 30-minute intervals (9:00 AM, 9:30 AM, 10:00 AM) to new clients.</li>
                                            <li><strong className="text-olive dark:text-off-white font-medium">Active Booking Example:</strong> If a client books 9:00 AM, the system detects your 15-minute buffer requirement and mathematically realizes a 9:30 AM appointment would give you 0 minutes of physical preparation. It silently destroys the 9:30 AM button instantly, forcing 10:00 AM to become the next globally available slot. This natively guarantees you never suffer from back-to-back booking fatigue.</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

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
