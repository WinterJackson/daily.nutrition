"use client"

import { updateGeminiKey } from "@/app/actions/ai"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Bot, CheckCircle, Loader2, Save, Sparkles, XCircle } from "lucide-react"
import { useState, useTransition } from "react"
import { CollapsibleCard } from "./CollapsibleCard"

interface AiConfigProps {
    hasApiKey: boolean
    isOpen: boolean
    onToggle: () => void
}

export function AiConfig({
    hasApiKey: initialHasApiKey,
    isOpen,
    onToggle
}: AiConfigProps) {
    const [apiKey, setApiKey] = useState("")
    const [hasApiKey, setHasApiKey] = useState(initialHasApiKey)
    const [isSaving, startTransition] = useTransition()
    const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle")

    const handleSave = () => {
        if (!apiKey.trim()) return

        setSaveStatus("idle")
        startTransition(async () => {
            const result = await updateGeminiKey(apiKey.trim())
            
            if (result.success) {
                setSaveStatus("success")
                setHasApiKey(true)
                setApiKey("")
                setTimeout(() => setSaveStatus("idle"), 3000)
            } else {
                setSaveStatus("error")
                setTimeout(() => setSaveStatus("idle"), 3000)
            }
        })
    }

    return (
        <CollapsibleCard
            title="Gemini AI Assistant"
            description="Configure API key for AI blog generation and content assistance"
            icon={Bot}
            isOpen={isOpen}
            onToggle={onToggle}
            status={hasApiKey ? "active" : "inactive"}
        >
            <div className="space-y-6">
                <div className="bg-orange/5 border border-orange/10 rounded-xl p-4 flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-orange flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-neutral-600 dark:text-neutral-400">
                        <p className="font-medium text-neutral-900 dark:text-neutral-200 mb-1">
                            Google Gemini Integration
                        </p>
                        <p>
                            To use the AI Blog Assistant, you need a Google Gemini API Key. You can get a free API key from Google AI Studio. 
                            The key is securely encrypted in the database before storage.
                        </p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                            Gemini API Key
                        </label>
                        {hasApiKey && (
                            <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-md border border-green-200 flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" />
                                Key Configured
                            </span>
                        )}
                    </div>
                    
                    <div className="flex gap-3">
                        <Input
                            type="password"
                            placeholder={hasApiKey ? "•••••••••••••••••••••••••••••• (Saved)" : "AIzaSy..."}
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            className="bg-neutral-50 dark:bg-white/5 border-neutral-200 dark:border-white/10 font-mono"
                        />
                        <Button
                            onClick={handleSave}
                            disabled={isSaving || !apiKey.trim()}
                            variant="accent"
                            className="min-w-[100px] shadow-lg shadow-orange/20"
                        >
                            {isSaving ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <>
                                    <Save className="w-4 h-4 mr-2" />
                                    Save
                                </>
                            )}
                        </Button>
                    </div>

                    {saveStatus === "success" && (
                        <p className="text-sm text-green-600 flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1">
                            <CheckCircle className="w-4 h-4" />
                            API Key securely encrypted and saved.
                        </p>
                    )}
                    {saveStatus === "error" && (
                        <p className="text-sm text-red-600 flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1">
                            <XCircle className="w-4 h-4" />
                            Failed to save API key. Please check the logs.
                        </p>
                    )}
                </div>
            </div>
        </CollapsibleCard>
    )
}
