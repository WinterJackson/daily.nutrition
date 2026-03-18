"use client"

import { cn } from "@/lib/utils"
import { CheckCircle2, XCircle } from "lucide-react"

export interface StatusCardProps {
    envKey: string
    isConfigured: boolean
    description: string
    className?: string
}

export function StatusCard({ envKey, isConfigured, description, className }: StatusCardProps) {
    return (
        <div className={cn(
            "flex flex-col gap-6 p-6 rounded-2xl border transition-all duration-300",
            "bg-white/5 backdrop-blur-sm border-neutral-200 dark:border-white/10",
            "hover:scale-[1.02] hover:border-olive/30 dark:hover:border-brand-green/30 hover:shadow-lg",
            className
        )}>
            {/* Top Section */}
            <div className="flex justify-between items-start">
                <code className="text-xs font-mono font-bold text-neutral-800 dark:text-neutral-200 bg-black/5 dark:bg-black/20 px-2.5 py-1.5 rounded-lg border border-black/5 dark:border-white/5 shadow-inner">
                    {envKey}
                </code>
                {isConfigured ? (
                    <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-green-700 bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Active
                    </span>
                ) : (
                    <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-red-700 bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20">
                        <XCircle className="w-3.5 h-3.5" />
                        Missing
                    </span>
                )}
            </div>
            
            {/* Bottom Section - Anchored */}
            <div className="mt-auto">
                <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed font-medium">
                    {description}
                </p>
            </div>
        </div>
    )
}
