import { SettingsData } from "@/app/actions/settings"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Facebook, Instagram, Linkedin, Loader2, Save, Share2, Twitter } from "lucide-react"
import { CollapsibleCard } from "./CollapsibleCard"

interface SocialMediaConfigProps {
    settings: SettingsData
    onChange: (key: keyof SettingsData, value: string) => void
    onSave: () => void
    isSaving: boolean
    isOpen: boolean
    onToggle: () => void
}

export function SocialMediaConfig({
    settings,
    onChange,
    onSave,
    isSaving,
    isOpen,
    onToggle
}: SocialMediaConfigProps) {
    const isActive = settings.instagramUrl || settings.facebookUrl || settings.twitterUrl || settings.linkedinUrl

    return (
        <CollapsibleCard
            title="Social Media Links"
            description="Connect your profile with social platforms"
            icon={Share2}
            isOpen={isOpen}
            onToggle={onToggle}
            status={isActive ? "active" : "inactive"}
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-[10px] md:text-xs font-semibold uppercase tracking-wider text-neutral-500 flex items-center gap-2">
                        <Instagram className="w-3 h-3" /> Instagram
                    </label>
                    <Input
                        value={settings.instagramUrl}
                        onChange={(e) => onChange("instagramUrl", e.target.value)}
                        placeholder="https://instagram.com/username"
                        className="bg-neutral-50 dark:bg-white/5 border-neutral-200 dark:border-white/10"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] md:text-xs font-semibold uppercase tracking-wider text-neutral-500 flex items-center gap-2">
                        <Facebook className="w-3 h-3" /> Facebook
                    </label>
                    <Input
                        value={settings.facebookUrl}
                        onChange={(e) => onChange("facebookUrl", e.target.value)}
                        placeholder="https://facebook.com/username"
                        className="bg-neutral-50 dark:bg-white/5 border-neutral-200 dark:border-white/10"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] md:text-xs font-semibold uppercase tracking-wider text-neutral-500 flex items-center gap-2">
                        <Twitter className="w-3 h-3" /> Twitter / X
                    </label>
                    <Input
                        value={settings.twitterUrl}
                        onChange={(e) => onChange("twitterUrl", e.target.value)}
                        placeholder="https://twitter.com/username"
                        className="bg-neutral-50 dark:bg-white/5 border-neutral-200 dark:border-white/10"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] md:text-xs font-semibold uppercase tracking-wider text-neutral-500 flex items-center gap-2">
                        <Linkedin className="w-3 h-3" /> LinkedIn
                    </label>
                    <Input
                        value={settings.linkedinUrl}
                        onChange={(e) => onChange("linkedinUrl", e.target.value)}
                        placeholder="https://linkedin.com/in/username"
                        className="bg-neutral-50 dark:bg-white/5 border-neutral-200 dark:border-white/10"
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
