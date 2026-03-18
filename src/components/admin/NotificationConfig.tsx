import { SettingsData } from "@/app/actions/settings"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Switch } from "@/components/ui/Switch"
import { Bell, Loader2, Save } from "lucide-react"
import { CollapsibleCard } from "./CollapsibleCard"

interface NotificationConfigProps {
    settings: SettingsData
    onChange: (key: string, value: any) => void
    onSave: () => void
    isSaving: boolean
    isOpen: boolean
    onToggle: () => void
}

export function NotificationConfig({
    settings,
    onChange,
    onSave,
    isSaving,
    isOpen,
    onToggle
}: NotificationConfigProps) {
    const prefs = settings.notificationPreferences || {
        emailOnNewBooking: true,
        emailOnCancellation: true,
        emailOnReschedule: true,
        emailDailyAgenda: false,
        agendaTime: "08:00"
    }

    return (
        <CollapsibleCard
            title="Notification Preferences"
            description="Control when you receive email alerts"
            icon={Bell}
            isOpen={isOpen}
            onToggle={onToggle}
            status={prefs.emailOnNewBooking ? "active" : "inactive"}
        >
            <div className="space-y-6">
                
                {/* Booking Alerts */}
                <div className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-500">Booking Alerts</h3>
                    
                    <div className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-white/5 rounded-xl border border-neutral-100 dark:border-white/5">
                        <div className="space-y-1">
                            <p className="font-medium text-olive dark:text-off-white">New Bookings</p>
                            <p className="text-xs text-neutral-500">Receive an email when a client books a session.</p>
                        </div>
                        <Switch 
                            checked={prefs.emailOnNewBooking}
                            onCheckedChange={(checked) => onChange("emailOnNewBooking", checked)}
                        />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-white/5 rounded-xl border border-neutral-100 dark:border-white/5">
                        <div className="space-y-1">
                            <p className="font-medium text-olive dark:text-off-white">Cancellations</p>
                            <p className="text-xs text-neutral-500">Receive an email when a client cancels.</p>
                        </div>
                        <Switch 
                            checked={prefs.emailOnCancellation}
                            onCheckedChange={(checked) => onChange("emailOnCancellation", checked)}
                        />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-white/5 rounded-xl border border-neutral-100 dark:border-white/5">
                        <div className="space-y-1">
                            <p className="font-medium text-olive dark:text-off-white">Reschedule Requests</p>
                            <p className="text-xs text-neutral-500">Receive an email when a client reschedules.</p>
                        </div>
                        <Switch 
                            checked={prefs.emailOnReschedule}
                            onCheckedChange={(checked) => onChange("emailOnReschedule", checked)}
                        />
                    </div>
                </div>

                {/* Daily Agenda */}
                <div className="space-y-4 pt-4 border-t border-neutral-100 dark:border-white/5">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-500">Daily Digest</h3>
                    
                    <div className="bg-neutral-50 dark:bg-white/5 rounded-xl border border-neutral-100 dark:border-white/5 p-4 space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="font-medium text-olive dark:text-off-white">Daily Agenda</p>
                                <p className="text-xs text-neutral-500">Receive a summary of today's appointments.</p>
                            </div>
                            <Switch 
                                checked={prefs.emailDailyAgenda}
                                onCheckedChange={(checked) => onChange("emailDailyAgenda", checked)}
                            />
                        </div>
                        
                        {prefs.emailDailyAgenda && (
                            <div className="flex items-center gap-4 animate-in fade-in pt-2">
                                <label className="text-sm font-medium text-neutral-600 dark:text-neutral-300 whitespace-nowrap">
                                    Send at:
                                </label>
                                <Input 
                                    type="time"
                                    value={prefs.agendaTime}
                                    onChange={(e) => onChange("agendaTime", e.target.value)}
                                    className="w-32 bg-white dark:bg-black/20"
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex justify-end mt-4 pt-4 border-t border-neutral-100 dark:border-white/5">
                <Button 
                    onClick={onSave}
                    disabled={isSaving}
                    variant="accent"
                    className="shadow-lg shadow-orange/20"
                >
                    {isSaving ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save className="mr-2 h-4 w-4" />
                            Save
                        </>
                    )}
                </Button>
            </div>
        </CollapsibleCard>
    )
}
