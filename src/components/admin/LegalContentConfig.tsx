import { SettingsData } from "@/app/actions/settings"
import { Button } from "@/components/ui/Button"
import { FileText, Loader2, Save, Scale } from "lucide-react"
import { CollapsibleCard } from "./CollapsibleCard"

interface LegalContentConfigProps {
    settings: SettingsData
    onChange: (key: keyof SettingsData, value: string) => void
    onSave: () => void
    isSaving: boolean
    isOpen: boolean
    onToggle: () => void
}

export function LegalContentConfig({
    settings,
    onChange,
    onSave,
    isSaving,
    isOpen,
    onToggle
}: LegalContentConfigProps) {
    const hasContent = settings.privacyPolicyContent || settings.termsContent

    return (
        <CollapsibleCard
            title="Legal Content"
            description="Manage privacy policy and terms of service"
            icon={Scale}
            isOpen={isOpen}
            onToggle={onToggle}
            status={hasContent ? "active" : "inactive"}
        >
            <div className="space-y-6">
                <div className="space-y-2">
                    <label className="text-[10px] md:text-xs font-semibold uppercase tracking-wider text-neutral-500 flex items-center gap-2">
                        <FileText className="w-3 h-3" /> Privacy Policy
                    </label>
                    <textarea
                        className="flex min-h-[150px] w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-xs md:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-olive focus-visible:ring-offset-2 dark:border-white/10 dark:bg-white/5 dark:ring-offset-charcoal font-mono"
                        value={settings.privacyPolicyContent}
                        onChange={(e) => onChange("privacyPolicyContent", e.target.value)}
                        placeholder="Markdown supported..."
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] md:text-xs font-semibold uppercase tracking-wider text-neutral-500 flex items-center gap-2">
                        <FileText className="w-3 h-3" /> Terms of Service
                    </label>
                    <textarea
                        className="flex min-h-[150px] w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-xs md:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-olive focus-visible:ring-offset-2 dark:border-white/10 dark:bg-white/5 dark:ring-offset-charcoal font-mono"
                        value={settings.termsContent}
                        onChange={(e) => onChange("termsContent", e.target.value)}
                        placeholder="Markdown supported..."
                    />
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
