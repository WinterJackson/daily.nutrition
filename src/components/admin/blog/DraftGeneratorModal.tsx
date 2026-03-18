"use client"

import { generateRawDraft, getApprovedIdeas } from "@/app/actions/ai"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Textarea } from "@/components/ui/Textarea"
import { cn } from "@/lib/utils"
import { Bot, FileText, Loader2, Sparkles, Wand2, X } from "lucide-react"
import { useEffect, useState } from "react"
import { createPortal } from "react-dom"

interface QueueIdea {
    id: string
    title: string
    angle: string
    keywords: string[]
    score: number
    status: string
}

interface DraftGeneratorModalProps {
    isOpen: boolean
    onClose: () => void
    onGenerate: (title: string, content: string) => void
}

export function DraftGeneratorModal({ isOpen, onClose, onGenerate }: DraftGeneratorModalProps) {
    const [tab, setTab] = useState<"queue" | "custom">("queue")
    const [ideas, setIdeas] = useState<QueueIdea[]>([])
    const [loadingIdeas, setLoadingIdeas] = useState(true)

    // Custom form states
    const [customTopic, setCustomTopic] = useState("")
    const [customAngle, setCustomAngle] = useState("")
    
    // Process states
    const [isGenerating, setIsGenerating] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        if (isOpen && tab === "queue" && ideas.length === 0) {
            loadIdeas()
        }
    }, [isOpen, tab, ideas.length])

    const loadIdeas = async () => {
        setLoadingIdeas(true)
        const data = await getApprovedIdeas()
        setIdeas(data as QueueIdea[])
        setLoadingIdeas(false)
    }

    const handleGenerate = async (topic: string, angle: string) => {
        if (!topic.trim()) {
            setError("Topic is required to generate a post.")
            return
        }

        setIsGenerating(true)
        setError(null)
        
        try {
            const res = await generateRawDraft(topic, angle)
            if (res.success && res.data) {
                onGenerate(res.data.title, res.data.content)
                onClose() // Close modal after success
            } else {
                setError(res.error || "Failed to generate draft.")
            }
        } catch (err: any) {
             setError(err?.message || "An unexpected error occurred.")
        } finally {
            setIsGenerating(false)
        }
    }

    if (!isOpen || !mounted) return null

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-neutral-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-charcoal w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-neutral-100 dark:border-white/5 bg-neutral-50/50 dark:bg-charcoal/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-orange/10 flex items-center justify-center">
                            <Sparkles className="w-5 h-5 text-orange" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold font-serif text-olive dark:text-off-white">Generate with AI</h2>
                            <p className="text-sm text-neutral-500">Seed your next post instantly.</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        disabled={isGenerating}
                        className="p-2 rounded-full hover:bg-neutral-200 dark:hover:bg-white/10 transition-colors disabled:opacity-50 text-neutral-500"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="grid grid-cols-2 p-4 pb-0">
                    <button
                        onClick={() => setTab("queue")}
                        disabled={isGenerating}
                        className={cn(
                            "pb-4 text-sm font-medium transition-all duration-300 relative disabled:opacity-50",
                            tab === "queue" 
                                ? "text-orange" 
                                : "text-neutral-500 hover:text-neutral-700 dark:text-neutral-400"
                        )}
                    >
                        <span className="flex items-center justify-center gap-2">
                           <FileText className="w-4 h-4" /> From Idea Queue
                        </span>
                        {tab === "queue" && (
                            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange rounded-t-full shadow-[0_0_10px_rgba(232,117,26,0.5)]" />
                        )}
                    </button>
                    <button
                        onClick={() => setTab("custom")}
                        disabled={isGenerating}
                        className={cn(
                            "pb-4 text-sm font-medium transition-all duration-300 relative disabled:opacity-50",
                            tab === "custom" 
                                ? "text-orange" 
                                : "text-neutral-500 hover:text-neutral-700 dark:text-neutral-400"
                        )}
                    >
                         <span className="flex items-center justify-center gap-2">
                           <Wand2 className="w-4 h-4" /> Custom Topic
                        </span>
                        {tab === "custom" && (
                            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange rounded-t-full shadow-[0_0_10px_rgba(232,117,26,0.5)]" />
                        )}
                    </button>
                </div>

                {/* Content Area */}
                <div className="p-6 overflow-y-auto flex-1 bg-white dark:bg-charcoal min-h-[300px]">
                    {isGenerating ? (
                        <div className="h-full min-h-[250px] flex flex-col items-center justify-center text-center space-y-4">
                            <div className="relative">
                                <div className="absolute inset-0 bg-brand-green/20 rounded-full blur-xl animate-pulse" />
                                <Bot className="w-12 h-12 text-brand-green relative z-10 animate-bounce" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-olive dark:text-off-white">Writing your masterpiece...</h3>
                                <p className="text-sm text-neutral-500">The AI is crafting paragraphs based on the chosen topic.</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            {error && (
                                <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-600 border border-red-100 dark:border-red-500/20 text-sm flex items-start gap-2 animate-in slide-in-from-top-2">
                                    <X className="w-4 h-4 mt-0.5 shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}

                            {tab === "queue" && (
                                <div className="space-y-4">
                                    {loadingIdeas ? (
                                        <div className="flex flex-col items-center justify-center py-12 text-neutral-400 gap-3">
                                            <Loader2 className="w-6 h-6 animate-spin" />
                                            <span className="text-sm">Loading approved ideas...</span>
                                        </div>
                                    ) : ideas.length === 0 ? (
                                        <div className="text-center py-12 text-neutral-500">
                                            <p className="font-medium text-olive dark:text-off-white mb-1">Queue is empty</p>
                                            <p className="text-sm">There are no approved ideas in the queue right now.</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 gap-3">
                                            {ideas.map((idea) => (
                                                <button
                                                    key={idea.id}
                                                    onClick={() => handleGenerate(idea.title, idea.angle)}
                                                    className="text-left w-full p-4 rounded-2xl border border-neutral-100 dark:border-white/5 hover:border-brand-green hover:bg-brand-green/5 dark:hover:bg-white/5 transition-all group relative overflow-hidden"
                                                >
                                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                                                        <Sparkles className="w-5 h-5 text-brand-green" />
                                                    </div>
                                                    <h3 className="font-semibold text-olive dark:text-off-white pr-8">{idea.title}</h3>
                                                    <p className="text-sm text-neutral-500 mt-1 line-clamp-2">{idea.angle}</p>
                                                    <div className="flex gap-2 mt-3 flex-wrap">
                                                        {idea.keywords.slice(0, 3).map(kw => (
                                                            <span key={kw} className="px-2 py-0.5 text-[10px] uppercase tracking-wider font-semibold rounded bg-neutral-100 dark:bg-white/10 text-neutral-500">
                                                                {kw}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {tab === "custom" && (
                                <div className="space-y-5 animate-in fade-in duration-300">
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Core Topic</label>
                                        <Input 
                                            placeholder="e.g., The benefits of intermittent fasting"
                                            value={customTopic}
                                            onChange={(e) => setCustomTopic(e.target.value)}
                                            className="bg-neutral-50 dark:bg-white/5 border-neutral-200 dark:border-white/10"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Specific Angle (Optional)</label>
                                        <Textarea 
                                            placeholder="e.g., Focus on women over 40, mention hormonal balance..."
                                            value={customAngle}
                                            onChange={(e) => setCustomAngle(e.target.value)}
                                            className="bg-neutral-50 dark:bg-white/5 border-neutral-200 dark:border-white/10 resize-none min-h-[120px]"
                                        />
                                    </div>

                                    <div className="pt-4 flex justify-end">
                                        <Button
                                            onClick={() => handleGenerate(customTopic, customAngle)}
                                            disabled={!customTopic.trim() || isGenerating}
                                            variant="accent"
                                            className="shadow-lg shadow-orange/20"
                                        >
                                            <Sparkles className="w-4 h-4 mr-2" />
                                            Generate Post
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>,
        document.body
    )
}
