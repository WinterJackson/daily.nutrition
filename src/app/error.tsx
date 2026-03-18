"use client"

import Link from "next/link"
import { useEffect } from "react"

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error("Unhandled error:", error)
    }, [error])

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-50 to-stone-100 dark:from-charcoal dark:to-black px-4">
            <div className="text-center max-w-md space-y-6">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/20 mx-auto">
                    <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                    </svg>
                </div>

                <h1 className="text-3xl font-bold font-serif text-olive dark:text-off-white">
                    Something went wrong
                </h1>
                <p className="text-neutral-500 dark:text-neutral-400">
                    We encountered an unexpected error. Please try again or contact support if the problem persists.
                </p>

                {error.digest && (
                    <p className="text-xs text-neutral-400 dark:text-neutral-500 font-mono">
                        Error ID: {error.digest}
                    </p>
                )}

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                        onClick={reset}
                        className="px-6 py-3 rounded-xl bg-brand-green text-white font-semibold hover:bg-brand-green/90 transition-colors shadow-lg shadow-brand-green/20"
                    >
                        Try Again
                    </button>
                    <Link
                        href="/"
                        className="px-6 py-3 rounded-xl border border-neutral-200 dark:border-white/10 text-neutral-600 dark:text-neutral-300 font-semibold hover:bg-neutral-50 dark:hover:bg-white/5 transition-colors"
                    >
                        Go Home
                    </Link>
                </div>
            </div>
        </div>
    )
}
