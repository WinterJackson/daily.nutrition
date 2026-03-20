"use client"

import { addBlockedDate, getBlockedDates, removeBlockedDate } from "@/app/actions/blocked-dates"
import { Button } from "@/components/ui/Button"
import { Card, CardContent } from "@/components/ui/Card"
import { Input } from "@/components/ui/Input"
import { format, parseISO, startOfDay } from "date-fns"
import { Calendar, CheckCircle, Loader2, Plus, Trash2, X } from "lucide-react"
import { useEffect, useState, useTransition } from "react"

interface BlockedDate {
    id: string
    date: Date
    reason: string | null
}

export function BlockedDatesManager() {
    const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isPending, startTransition] = useTransition()
    const [showForm, setShowForm] = useState(false)
    const [newDate, setNewDate] = useState("")
    const [newReason, setNewReason] = useState("")
    const [error, setError] = useState("")
    const [showSuccess, setShowSuccess] = useState(false)

    const loadBlockedDates = async () => {
        setIsLoading(true)
        const result = await getBlockedDates()
        if (result.success) {
            setBlockedDates(result.blockedDates)
        }
        setIsLoading(false)
    }



    useEffect(() => {
        loadBlockedDates()
    }, [])

    const handleAdd = () => {
        if (!newDate) {
            setError("Please select a date")
            return
        }

        setError("")
        startTransition(async () => {
            const dateObj = startOfDay(parseISO(newDate))
            const result = await addBlockedDate(dateObj, newReason || undefined)
            
            if (result.success) {
                await loadBlockedDates()
                setNewDate("")
                setNewReason("")
                setShowForm(false)
            } else {
                setError(result.error || "Failed to add blocked date")
            }
        })
    }



    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-brand-green" />
            </div>
        )
    }

    return (
        <Card className="border-none shadow-xl shadow-neutral-200/50 dark:shadow-black/20 bg-white/90 dark:bg-white/5 backdrop-blur-md overflow-hidden relative">
            {showSuccess && (
                <div className="absolute top-0 left-0 right-0 z-50 bg-brand-green text-white px-4 py-2 text-sm font-medium flex items-center justify-center gap-2 animate-in slide-in-from-top-1">
                    <CheckCircle className="w-4 h-4" />
                    <span>Configuration synced</span>
                </div>
            )}
            <CardContent className="p-6 space-y-4">
                {/* Add New Button */}
                {!showForm && (
                    <Button 
                        variant="outline" 
                        className="w-full border-dashed border-2 border-neutral-300 dark:border-white/10 hover:border-brand-green hover:bg-brand-green/5"
                        onClick={() => setShowForm(true)}
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Blocked Date
                    </Button>
                )}

                {/* Add Form */}
                {showForm && (
                    <div className="p-4 bg-neutral-50 dark:bg-white/5 rounded-xl space-y-4 border border-neutral-200 dark:border-white/10">
                        <div className="flex items-center justify-between">
                            <h3 className="font-medium text-olive dark:text-off-white">Add Blocked Date</h3>
                            <button 
                                onClick={() => { setShowForm(false); setError(""); }}
                                className="p-1 rounded-lg hover:bg-neutral-200 dark:hover:bg-white/10 transition-colors"
                            >
                                <X className="w-4 h-4 text-neutral-500" />
                            </button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Date</label>
                                <Input
                                    type="date"
                                    value={newDate}
                                    onChange={(e) => setNewDate(e.target.value)}
                                    min={format(new Date(), 'yyyy-MM-dd')}
                                    className="bg-white dark:bg-charcoal border-neutral-200 dark:border-white/10"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Reason (Optional)</label>
                                <Input
                                    type="text"
                                    value={newReason}
                                    onChange={(e) => setNewReason(e.target.value)}
                                    placeholder="e.g., Holiday, Vacation"
                                    className="bg-white dark:bg-charcoal border-neutral-200 dark:border-white/10"
                                />
                            </div>
                        </div>

                        {error && (
                            <p className="text-sm text-red-500 flex items-center gap-2">
                                <X className="w-4 h-4" /> {error}
                            </p>
                        )}

                        <div className="flex justify-end gap-2">
                            <Button 
                                variant="ghost" 
                                onClick={() => { setShowForm(false); setError(""); }}
                            >
                                Cancel
                            </Button>
                            <Button 
                                variant="accent" 
                                onClick={handleAdd}
                                disabled={isPending}
                                className="shadow-lg shadow-orange/20"
                            >
                                {isPending ? (
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                ) : (
                                    <Plus className="w-4 h-4 mr-2" />
                                )}
                                Add Date
                            </Button>
                        </div>
                    </div>
                )}

                {/* Blocked Dates List */}
                {blockedDates.length === 0 ? (
                    <div className="text-center py-8 text-neutral-500 dark:text-neutral-400">
                        <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p className="font-medium">No blocked dates</p>
                        <p className="text-sm">Add dates when you're unavailable</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {blockedDates.map((blocked) => (
                            <div 
                                key={blocked.id}
                                className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-white/5 rounded-xl border border-neutral-200 dark:border-white/10 hover:border-orange/30 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-orange/10 rounded-lg flex items-center justify-center">
                                        <Calendar className="w-5 h-5 text-orange" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-olive dark:text-off-white">
                                            {format(new Date(blocked.date), 'EEEE, MMMM d, yyyy')}
                                        </p>
                                        {blocked.reason && (
                                            <p className="text-sm text-neutral-500">{blocked.reason}</p>
                                        )}
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
                                    onClick={() => {
                                        startTransition(async () => {
                                            await removeBlockedDate(blocked.id)
                                            await loadBlockedDates()
                                        })
                                    }}
                                    disabled={isPending}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                )}


            </CardContent>
        </Card>
    )
}
