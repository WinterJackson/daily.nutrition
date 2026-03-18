"use client"

import { approveIdea, scoutTrends, type ScoutedIdea } from "@/app/actions/ai"
import { Brain, Check, Eye, Loader2, Search, Sparkles, Target, TrendingUp, X, Zap } from "lucide-react"
import { useState, useTransition } from "react"

export function TrendScout() {
    const [ideas, setIdeas] = useState<ScoutedIdea[]>([])
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)
    const [approving, setApproving] = useState<string | null>(null)
    const [dismissed, setDismissed] = useState<Set<string>>(new Set())

    function handleScout() {
        setError(null)
        startTransition(async () => {
            const result = await scoutTrends()
            if (result.success && result.ideas) {
                setIdeas(result.ideas)
                setDismissed(new Set())
            } else {
                setError(result.error || "Failed to scout trends")
            }
        })
    }

    async function handleApprove(idea: ScoutedIdea) {
        setApproving(idea.title)
        const result = await approveIdea(idea)
        setApproving(null)
        if (result.success) {
            setDismissed((prev) => new Set([...prev, idea.title]))
        }
    }

    function handleDiscard(title: string) {
        setDismissed((prev) => new Set([...prev, title]))
    }

    function getScoreBadge(score: number) {
        if (score >= 80) return { color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400", label: "Excellent" }
        if (score >= 60) return { color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400", label: "Good" }
        if (score >= 40) return { color: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400", label: "Fair" }
        return { color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400", label: "Low" }
    }

    const visibleIdeas = ideas.filter((i) => !dismissed.has(i.title))

    return (
        <div className="space-y-6">
            {/* Scout Button */}
            <div className="rounded-xl border p-6 text-center" style={{ borderColor: "var(--border-default)", backgroundColor: "var(--surface-primary)" }}>
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-green/10 mb-4">
                    <Sparkles className="w-8 h-8 text-brand-green" />
                </div>
                <h3 className="text-lg font-semibold text-olive dark:text-off-white mb-2">
                    TrendScout AI
                </h3>
                <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>
                    Scout emerging nutrition trends relevant to the Kenyan market. Each idea is scored across 5 dimensions.
                </p>
                <button
                    onClick={handleScout}
                    disabled={isPending}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-brand-green text-white font-medium text-sm hover:bg-brand-green/90 transition-colors disabled:opacity-50"
                >
                    {isPending ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Scouting trends...
                        </>
                    ) : (
                        <>
                            <Zap className="w-4 h-4" />
                            Scout Trends
                        </>
                    )}
                </button>
            </div>

            {/* Error */}
            {error && (
                <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
                    {error}
                </div>
            )}

            {/* Ideas Grid */}
            {visibleIdeas.length > 0 && (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {visibleIdeas.map((idea, idx) => {
                        const badge = getScoreBadge(idea.score)
                        return (
                            <div
                                key={`${idea.title}-${idx}`}
                                className="rounded-xl border p-5 space-y-4 transition-all hover:shadow-md"
                                style={{ borderColor: "var(--border-default)", backgroundColor: "var(--card-bg)" }}
                            >
                                {/* Score Badge */}
                                <div className="flex items-start justify-between">
                                    <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${badge.color}`}>
                                        <TrendingUp className="w-3 h-3" />
                                        {idea.score}/100
                                    </div>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${badge.color}`}>{badge.label}</span>
                                </div>

                                {/* Title & Angle */}
                                <div>
                                    <h4 className="font-semibold text-olive dark:text-off-white leading-snug">{idea.title}</h4>
                                    <p className="text-xs mt-2 leading-relaxed" style={{ color: "var(--text-muted)" }}>{idea.angle}</p>
                                </div>

                                {/* Keywords */}
                                <div className="flex flex-wrap gap-1.5">
                                    {idea.keywords.slice(0, 4).map((kw) => (
                                        <span
                                            key={kw}
                                            className="text-xs px-2 py-0.5 rounded-md bg-brand-green/10 text-brand-green dark:bg-brand-green/20"
                                        >
                                            {kw}
                                        </span>
                                    ))}
                                </div>

                                {/* Score Breakdown */}
                                <div className="grid grid-cols-5 gap-1 text-center">
                                    {[
                                        { label: "REL", value: idea.breakdown.relevance, icon: Target },
                                        { label: "SEO", value: idea.breakdown.seo, icon: Search },
                                        { label: "AUTH", value: idea.breakdown.authority, icon: Brain },
                                        { label: "NEW", value: idea.breakdown.novelty, icon: Sparkles },
                                        { label: "CLR", value: idea.breakdown.clarity, icon: Eye },
                                    ].map((dim) => (
                                        <div key={dim.label} className="text-xs">
                                            <div className="font-medium text-olive dark:text-off-white">{dim.value}</div>
                                            <div style={{ color: "var(--text-muted)", fontSize: "10px" }}>{dim.label}</div>
                                        </div>
                                    ))}
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2 pt-1">
                                    <button
                                        onClick={() => handleApprove(idea)}
                                        disabled={approving === idea.title}
                                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-brand-green text-white text-xs font-medium hover:bg-brand-green/90 transition-colors disabled:opacity-50"
                                    >
                                        {approving === idea.title ? (
                                            <Loader2 className="w-3 h-3 animate-spin" />
                                        ) : (
                                            <Check className="w-3 h-3" />
                                        )}
                                        Approve
                                    </button>
                                    <button
                                        onClick={() => handleDiscard(idea.title)}
                                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                        style={{ borderColor: "var(--border-default)", color: "var(--text-secondary)" }}
                                    >
                                        <X className="w-3 h-3" />
                                        Discard
                                    </button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
