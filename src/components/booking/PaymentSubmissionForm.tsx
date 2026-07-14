"use client"

import { submitPaymentProof } from "@/app/actions/bookings"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { CheckCircle2, Loader2, Send } from "lucide-react"
import { useState } from "react"

export function PaymentSubmissionForm({ referenceCode }: { referenceCode: string }) {
    const [code, setCode] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!code.trim()) return

        setIsLoading(true)
        setError(null)
        setSuccess(false)

        try {
            const res = await submitPaymentProof(referenceCode, code)
            if (res.success) {
                setSuccess(true)
            } else {
                setError(res.error || "Failed to submit code.")
            }
        } catch (err) {
            setError("An unexpected error occurred. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    if (success) {
        return (
            <div className="bg-brand-green/10 text-brand-green border border-brand-green/20 rounded-xl p-4 flex flex-col items-center justify-center text-center space-y-2 mt-4">
                <CheckCircle2 className="w-8 h-8" />
                <p className="font-semibold">Payment Code Submitted</p>
                <p className="text-sm">We are verifying your payment. This page will update automatically once confirmed.</p>
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="mt-4 space-y-3 border-t border-amber-200 dark:border-amber-900/30 pt-4">
            <div>
                <label htmlFor="mpesaCode" className="block text-xs uppercase font-bold text-amber-800 dark:text-amber-500 mb-1">
                    Submit M-Pesa Code
                </label>
                <p className="text-xs text-amber-700 dark:text-amber-400 mb-2">
                    Paid? Enter the 10-character transaction code from your SMS below to secure this slot.
                </p>
                <div className="flex gap-2">
                    <Input
                        id="mpesaCode"
                        type="text"
                        placeholder="e.g. QKT5ABCDEF"
                        value={code}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCode(e.target.value.toUpperCase())}
                        maxLength={10}
                        className="font-mono uppercase bg-white dark:bg-charcoal border-amber-200 focus:border-amber-500 focus:ring-amber-500"
                        required
                    />
                    <Button 
                        type="submit" 
                        disabled={isLoading || code.length < 10}
                        className="bg-amber-600 hover:bg-amber-700 text-white shrink-0"
                    >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                        {isLoading ? "Verifying..." : "Submit"}
                    </Button>
                </div>
                {error && (
                    <p className="text-red-500 text-xs mt-2 font-semibold">{error}</p>
                )}
            </div>
        </form>
    )
}
