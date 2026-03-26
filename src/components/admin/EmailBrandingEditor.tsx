"use client"

import { EmailBrandingData } from "@/app/actions/email-branding"
import { MediaPickerModal } from "@/components/admin/MediaPickerModal"
import { ConfirmationDialog } from "@/components/ui/ConfirmationDialog"
import { Input } from "@/components/ui/Input"
import { ExternalLink, ImageIcon, Mail, Trash2 } from "lucide-react"
import Image from "next/image"
import { useState } from "react"

const DEFAULT_COLORS = {
    olive: "#556B2F",
    orange: "#E87A1E", 
    teal: "#2F6B5C",
    purple: "#5C2F6B",
    blue: "#2F5C6B"
}

interface EmailBrandingEditorProps {
    branding: EmailBrandingData
    onChange: (field: keyof EmailBrandingData, value: string | null) => void
}

export function EmailBrandingEditor({ branding, onChange }: EmailBrandingEditorProps) {
    const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false)

    const handleMediaSelect = (url: string) => {
        onChange("logoUrl", url)
    }

    const [showRemoveConfirm, setShowRemoveConfirm] = useState(false)

    const handleRemoveLogoClick = () => {
        setShowRemoveConfirm(true)
    }

    const handleConfirmRemoveLogo = () => {
        onChange("logoUrl", null)
        setShowRemoveConfirm(false)
    }

    return (
        <div className="space-y-6">
            {/* Logo Upload */}
            <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-widest text-neutral-500">
                    Email Header Logo
                </label>
                <div className="flex items-center gap-4">
                    {branding.logoUrl ? (
                        <div className="relative group">
                            <div className="w-64 h-32 bg-neutral-100 dark:bg-white/5 rounded-lg overflow-hidden flex items-center justify-center border border-neutral-200 dark:border-white/10 relative">
                                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '10px 10px' }}></div>
                                <Image 
                                    src={branding.logoUrl} 
                                    alt="Email Logo" 
                                    width={240} 
                                    height={100} 
                                    className="object-contain w-auto h-auto max-w-full max-h-full relative z-10 p-4"
                                />
                            </div>
                            <button
                                onClick={handleRemoveLogoClick}
                                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <Trash2 className="w-3 h-3" />
                            </button>
                        </div>
                    ) : (
                        <div 
                            onClick={() => setIsMediaPickerOpen(true)}
                            className="w-32 h-16 bg-neutral-100 dark:bg-white/10 rounded-lg border-2 border-dashed border-neutral-300 dark:border-white/20 flex flex-col items-center justify-center cursor-pointer hover:border-brand-green transition-colors"
                        >
                            <ImageIcon className="w-5 h-5 text-neutral-400 mb-1" />
                            <span className="text-xs text-neutral-400">Choose Logo</span>
                        </div>
                    )}
                    <p className="text-xs text-neutral-500">
                        Recommended: 200x80px, PNG with transparent background
                    </p>
                </div>
            </div>

            {/* Color Pickers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                    <label className="text-xs font-bold uppercase tracking-widest text-neutral-500">
                        Primary Color (Buttons, Headers)
                    </label>
                    <div className="flex items-center gap-3">
                        <input
                            type="color"
                            value={branding.primaryColor}
                            onChange={(e) => onChange("primaryColor", e.target.value)}
                            className="w-12 h-12 rounded-lg border-2 border-neutral-200 dark:border-white/10 cursor-pointer"
                        />
                        <div className="flex gap-2">
                            {Object.entries(DEFAULT_COLORS).map(([name, color]) => (
                                <button
                                    key={name}
                                    onClick={() => onChange("primaryColor", color)}
                                    className={`w-8 h-8 rounded-lg border-2 transition-all ${
                                        branding.primaryColor === color 
                                            ? "border-olive scale-110" 
                                            : "border-neutral-200 dark:border-white/10 hover:scale-105"
                                    }`}
                                    style={{ backgroundColor: color }}
                                    title={name}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <label className="text-xs font-bold uppercase tracking-widest text-neutral-500">
                        Accent Color (Links, Highlights)
                    </label>
                    <div className="flex items-center gap-3">
                        <input
                            type="color"
                            value={branding.accentColor}
                            onChange={(e) => onChange("accentColor", e.target.value)}
                            className="w-12 h-12 rounded-lg border-2 border-neutral-200 dark:border-white/10 cursor-pointer"
                        />
                        <div className="flex gap-2">
                            {Object.entries(DEFAULT_COLORS).map(([name, color]) => (
                                <button
                                    key={name}
                                    onClick={() => onChange("accentColor", color)}
                                    className={`w-8 h-8 rounded-lg border-2 transition-all ${
                                        branding.accentColor === color 
                                            ? "border-olive scale-110" 
                                            : "border-neutral-200 dark:border-white/10 hover:scale-105"
                                    }`}
                                    style={{ backgroundColor: color }}
                                    title={name}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Text */}
            <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-widest text-neutral-500">
                    Footer Text
                </label>
                <Input
                    value={branding.footerText}
                    onChange={(e) => onChange("footerText", e.target.value)}
                    placeholder="Edwak Nutrition, Nairobi, Kenya"
                    className="bg-white dark:bg-charcoal border-neutral-200 dark:border-white/10"
                />
                <p className="text-xs text-neutral-400">Appears at the bottom of every email</p>
            </div>

            {/* Website & Support */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                    <label className="text-xs font-bold uppercase tracking-widest text-neutral-500">
                        Website URL
                    </label>
                    <div className="relative">
                        <Input
                            value={branding.websiteUrl}
                            onChange={(e) => onChange("websiteUrl", e.target.value)}
                            placeholder="https://edwaknutrition.co.ke"
                            className="pl-10 bg-white dark:bg-charcoal border-neutral-200 dark:border-white/10"
                        />
                        <ExternalLink className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>
                </div>

                <div className="space-y-3">
                    <label className="text-xs font-bold uppercase tracking-widest text-neutral-500">
                        Support Email
                    </label>
                    <div className="relative">
                        <Input
                            value={branding.supportEmail}
                            onChange={(e) => onChange("supportEmail", e.target.value)}
                            placeholder="support@edwaknutrition.co.ke"
                            className="pl-10 bg-white dark:bg-charcoal border-neutral-200 dark:border-white/10"
                        />
                        <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>
                </div>
            </div>
            {/* Preview Section - skipping for brevity if not modifying */}
            
            <ConfirmationDialog 
                open={showRemoveConfirm} 
                onOpenChange={setShowRemoveConfirm}
                title="Remove Logo"
                description="Are you sure you want to remove the branding logo?"
                confirmText="Remove Logo"
                variant="destructive"
                onConfirm={handleConfirmRemoveLogo}
            />

            <MediaPickerModal 
                open={isMediaPickerOpen}
                onOpenChange={setIsMediaPickerOpen}
                onSelect={handleMediaSelect}
                folder="daily_nutrition/branding"
                allowedTypes="image"
            />
        </div>
    )
}
