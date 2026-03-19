"use client"

import { syncGoogleReviews } from "@/app/actions/testimonials"
import { Button } from "@/components/ui/Button"
import { Cloud, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"

interface GoogleReviewsSyncButtonProps {
    isConfigured: boolean
}

export function GoogleReviewsSyncButton({ isConfigured }: GoogleReviewsSyncButtonProps) {
    const [isPending, startTransition] = useTransition()
    const [result, setResult] = useState<{ success: boolean; message?: string; error?: string } | null>(null)
    const router = useRouter()

    const handleSync = () => {
        setResult(null)
        startTransition(async () => {
            const res = await syncGoogleReviews()
            setResult(res)
            if (res.success) {
                router.refresh()
            }
        })
    }

    if (!isConfigured) {
        return (
            <div className="flex items-center gap-2 text-sm text-caption">
                <Cloud className="w-4 h-4 text-neutral-400" />
                <span>Google Reviews not configured. <a href="/admin/settings" className="text-orange hover:underline">Set up in Settings →</a></span>
            </div>
        )
    }

    return (
        <div className="flex items-center gap-3">
            <Button
                variant="outline"
                size="sm"
                onClick={handleSync}
                disabled={isPending}
                className="gap-2"
            >
                {isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                    <Cloud className="w-4 h-4" />
                )}
                {isPending ? "Syncing..." : "Sync Google Reviews"}
            </Button>

            {result && (
                <span className={`text-sm font-medium ${result.success ? "text-brand-green" : "text-red-500"}`}>
                    {result.success ? result.message : result.error}
                </span>
            )}
        </div>
    )
}
