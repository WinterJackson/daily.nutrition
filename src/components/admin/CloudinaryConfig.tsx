"use client"

import { Input } from "@/components/ui/Input"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/Tooltip"
import { CheckCircle, Cloud, ExternalLink, Eye, EyeOff, Info, ShieldCheck } from "lucide-react"
import { useState } from "react"

export interface CloudinaryConfigData {
    cloudName: string
    apiKey: string
    apiSecret: string
    uploadPreset?: string
}

interface CloudinaryConfigProps {
    data: CloudinaryConfigData
    onChange: (field: keyof CloudinaryConfigData, value: string) => void
    hasSecret?: boolean // Indicates if secret is already saved on server
}

export function CloudinaryConfig({ data, onChange, hasSecret = false }: CloudinaryConfigProps) {
    const [showSecret, setShowSecret] = useState(false)

    return (
        <TooltipProvider>
            <div className="space-y-6">
                <div className="bg-neutral-50 dark:bg-white/5 p-4 rounded-xl border border-neutral-100 dark:border-white/5 flex items-start gap-3">
                    <Info className="w-5 h-5 text-olive shrink-0 mt-0.5" />
                    <div>
                         <p className="text-sm text-neutral-600 dark:text-neutral-300">
                            These credentials allow the system to store and optimize images securely. 
                            Get them from your <a href="https://console.cloudinary.com/pm/settings/keys" target="_blank" rel="noopener noreferrer" className="text-olive hover:underline font-medium inline-flex items-center gap-1">Cloudinary Dashboard <ExternalLink className="w-3 h-3"/></a>.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Cloud Name */}
                    <div className="space-y-3">
                        <label className="text-xs font-bold uppercase tracking-widest text-neutral-500">
                            Cloud Name
                        </label>
                        <div className="relative">
                            <Input
                                value={data.cloudName}
                                onChange={(e) => onChange("cloudName", e.target.value)}
                                placeholder="e.g. daily-nutrition"
                                className="pl-10 font-mono bg-white dark:bg-charcoal border-neutral-200 dark:border-white/10"
                            />
                            <Cloud className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        </div>
                    </div>

                    {/* Upload Preset */}
                    <div className="space-y-3">
                         <div className="flex items-center gap-2">
                             <label className="text-xs font-bold uppercase tracking-widest text-neutral-500">
                                Upload Preset
                            </label>
                             <Tooltip>
                                <TooltipTrigger>
                                    <Info className="w-3 h-3 text-neutral-400 hover:text-olive transition-colors" />
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p className="max-w-xs">Optional: Use "unsigned" presets for direct client uploads if needed.</p>
                                </TooltipContent>
                            </Tooltip>
                        </div>
                        <Input
                            value={data.uploadPreset || ""}
                            onChange={(e) => onChange("uploadPreset", e.target.value)}
                            placeholder="Optional"
                            className="bg-white dark:bg-charcoal border-neutral-200 dark:border-white/10"
                        />
                    </div>

                    {/* API Key */}
                    <div className="space-y-3">
                        <label className="text-xs font-bold uppercase tracking-widest text-neutral-500">
                            API Key
                        </label>
                        <div className="relative">
                            <Input
                                value={data.apiKey}
                                onChange={(e) => onChange("apiKey", e.target.value)}
                                placeholder="e.g. 123456789012345"
                                className="pl-10 font-mono bg-white dark:bg-charcoal border-neutral-200 dark:border-white/10"
                            />
                            <ShieldCheck className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        </div>
                    </div>

                    {/* API Secret */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-bold uppercase tracking-widest text-neutral-500">
                                API Secret
                            </label>
                            {hasSecret && !data.apiSecret && (
                                <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1 bg-green-50 dark:bg-green-900/10 px-2 py-0.5 rounded-full">
                                    <CheckCircle className="w-3 h-3" />
                                    Secret Saved
                                </span>
                            )}
                        </div>
                        <div className="relative">
                            <Input
                                type={showSecret ? "text" : "password"}
                                value={data.apiSecret}
                                onChange={(e) => onChange("apiSecret", e.target.value)}
                                placeholder={hasSecret ? "•••••••••••••••••••• (Unchanged)" : "Enter API Secret"}
                                className="pl-10 pr-10 font-mono bg-white dark:bg-charcoal border-neutral-200 dark:border-white/10"
                            />
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
                                <ShieldCheck className="w-4 h-4" />
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowSecret(!showSecret)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-olive transition-colors"
                            >
                                {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                        <p className="text-xs text-neutral-400">
                            {hasSecret 
                                ? "Enter a new value only if you want to update it." 
                                : "This is encrypted before storage."}
                        </p>
                    </div>
                </div>
            </div>
        </TooltipProvider>
    )
}
