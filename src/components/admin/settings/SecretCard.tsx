"use client"

import { AnimatePresence, motion } from "framer-motion"
import { CheckCircle2, ChevronDown, ExternalLink, Eye, EyeOff, Lock } from "lucide-react"
import { useState } from "react"

export interface SecretCardProps {
    title: string
    description: string
    secretKey: string
    docsLink: string
    docsLabel: string
    isConfigured: boolean
    value: string
    onChange: (val: string) => void
    setupSteps?: { step: number; title: string; description: string; url?: string }[]
    placeholder?: string
}

export function SecretCard({
    title,
    description,
    secretKey,
    docsLink,
    docsLabel,
    isConfigured,
    value,
    onChange,
    setupSteps,
    placeholder
}: SecretCardProps) {
    const [showPreview, setShowPreview] = useState(false)
    const [isFocused, setIsFocused] = useState(false)
    const [showGuide, setShowGuide] = useState(false)

    // Mask value when not editing/previewing and configured
    const displayValue = isConfigured && !value && !showPreview
        ? "••••••••••••••••••••••••••••••••"
        : value

    return (
        <div className={`relative p-5 rounded-xl border transition-all duration-300 ${
            isFocused 
              ? "border-olive shadow-sm bg-olive/5 dark:bg-olive/10" 
              : "border-neutral-200 dark:border-white/10 bg-white dark:bg-white/5 hover:border-olive/30"
        }`}>
            <div className="flex items-start justify-between mb-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-neutral-800 dark:text-neutral-200">
                            {title}
                        </h4>
                        {isConfigured && (
                            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-[10px] font-bold tracking-wider uppercase">
                                <Lock className="w-3 h-3" />
                                Encrypted
                            </span>
                        )}
                    </div>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        {description}
                    </p>
                </div>
                
                <div className="flex items-center gap-2">
                    {setupSteps && setupSteps.length > 0 && (
                        <button
                            onClick={() => setShowGuide(!showGuide)}
                            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
                                showGuide 
                                  ? "bg-charcoal text-white dark:bg-white dark:text-charcoal shadow-md scale-95" 
                                  : "bg-neutral-100 dark:bg-white/5 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-white/10"
                            }`}
                        >
                            Setup Guide
                            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${showGuide ? "rotate-180" : ""}`} />
                        </button>
                    )}
                    <a 
                        href={docsLink}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 text-xs font-medium text-olive hover:text-olive-light transition-colors px-3 py-1.5 rounded-lg bg-olive/10 hover:bg-olive/20"
                    >
                        <ExternalLink className="w-3.5 h-3.5" />
                        {docsLabel}
                    </a>
                </div>
            </div>

            <div className="relative group">
                <input
                    type={showPreview ? "text" : "password"}
                    value={displayValue}
                    onChange={(e) => {
                        // Prevent editing the proxy mask
                        if (isConfigured && !value && !showPreview) return
                        onChange(e.target.value)
                    }}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder={isConfigured ? "Encrypted safely in database" : placeholder || `Enter ${title}`}
                    className={`w-full bg-neutral-50 dark:bg-black/20 border transition-all duration-200 rounded-lg pr-12 pl-10 py-2.5 text-sm font-mono ${
                        isFocused
                          ? "border-olive ring-1 ring-olive/20"
                          : "border-neutral-200 dark:border-white/10"
                    } ${isConfigured && !value ? "text-neutral-400 cursor-not-allowed" : "text-neutral-900 dark:text-neutral-100"}`}
                    readOnly={isConfigured && !value && !showPreview}
                />
                
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
                    <Lock className="w-4 h-4" />
                </div>

                {(!isConfigured || value) && (
                    <button
                        type="button"
                        onClick={() => setShowPreview(!showPreview)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors p-1"
                    >
                        {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                )}
            </div>

            {isConfigured && !value && (
                <div className="mt-2 flex items-center gap-1.5 text-xs text-neutral-500">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                    Key is securely stored. Type above to overwrite.
                </div>
            )}

            {/* Collapsible Setup Guide */}
            <AnimatePresence>
                {showGuide && setupSteps && (
                    <motion.div
                        initial={{ height: 0, opacity: 0, marginTop: 0 }}
                        animate={{ height: "auto", opacity: 1, marginTop: 16 }}
                        exit={{ height: 0, opacity: 0, marginTop: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                    >
                        <div className="bg-neutral-50 dark:bg-black/20 rounded-xl p-5 border border-neutral-200 dark:border-white/10 space-y-4">
                            <h5 className="text-sm font-bold text-neutral-800 dark:text-neutral-200 mb-2 font-serif">
                                How to find your {title}
                            </h5>
                            {setupSteps.map((s, index) => (
                                <motion.div 
                                    key={s.step}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="flex gap-4 group"
                                >
                                    <div className="flex flex-col items-center">
                                        <div className="w-6 h-6 rounded-full bg-olive text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-sm">
                                            {s.step}
                                        </div>
                                        {index !== setupSteps.length - 1 && (
                                            <div className="w-px h-full bg-neutral-200 dark:bg-white/10 my-1 group-hover:bg-olive/40 transition-colors" />
                                        )}
                                    </div>
                                    <div className="pb-4">
                                        <p className="font-semibold text-sm text-neutral-800 dark:text-neutral-200">
                                            {s.title}
                                        </p>
                                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">
                                            {s.description}
                                        </p>
                                        {s.url && (
                                            <a
                                                href={s.url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex items-center gap-1 mt-2 text-[11px] font-bold text-olive hover:text-brand-green bg-olive/10 hover:bg-olive/20 px-2.5 py-1 rounded-full transition-colors"
                                            >
                                                {s.url.includes("console.cloud.google") ? "Google Cloud Console" : s.url.includes("resend") ? "Resend Dashboard" : "Cloudinary Dashboard"}
                                                <ExternalLink className="w-3 h-3" />
                                            </a>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
