"use client"

import { generateDraft, getApprovedIdeas, rejectIdea, updateIdeaContent } from "@/app/actions/ai"
import { Check, FileText, ListChecks, Loader2, Pencil, Trash2, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

interface QueueIdea {
    id: string
    title: string
    angle: string
    keywords: string[]
    score: number
    status: string
}

export function IdeaQueue() {
    const [ideas, setIdeas] = useState<QueueIdea[]>([])
    const [loading, setLoading] = useState(true)
    const [generating, setGenerating] = useState<string | null>(null)
    const [editing, setEditing] = useState<string | null>(null)
    const [editTitle, setEditTitle] = useState("")
    const [editAngle, setEditAngle] = useState("")
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    async function loadIdeas() {
        setLoading(true)
        const data = await getApprovedIdeas()
        setIdeas(data as QueueIdea[])
        setLoading(false)
    }

    useEffect(() => {
        loadIdeas()
    }, [])

    async function handleGenerate(ideaId: string) {
        setGenerating(ideaId)
        setError(null)
        const result = await generateDraft(ideaId)
        setGenerating(null)

        if (result.success && result.postId) {
            router.push(`/admin/blog/${result.postId}`)
        } else {
            setError(result.error || "Failed to generate draft")
        }
    }

    function startEdit(idea: QueueIdea) {
        setEditing(idea.id)
        setEditTitle(idea.title)
        setEditAngle(idea.angle)
    }

    async function saveEdit(ideaId: string) {
        await updateIdeaContent(ideaId, { title: editTitle, angle: editAngle })
        setEditing(null)
        loadIdeas()
    }

    async function handleRemove(ideaId: string) {
        await rejectIdea(ideaId)
        loadIdeas()
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-6 h-6 animate-spin text-brand-green" />
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-olive dark:text-off-white">Idea Pipeline</h3>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                        {ideas.length} approved {ideas.length === 1 ? "idea" : "ideas"} ready for drafting
                    </p>
                </div>
            </div>

            {error && (
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
                    {error}
                </div>
            )}

            {ideas.length === 0 ? (
                <div className="text-center py-16 rounded-xl border" style={{ borderColor: "var(--border-default)", backgroundColor: "var(--surface-primary)" }}>
                    <ListChecks className="w-12 h-12 mx-auto mb-3" style={{ color: "var(--text-muted)" }} />
                    <p className="font-medium text-olive dark:text-off-white">No ideas in queue</p>
                    <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
                        Scout trends in the Newsroom tab and approve ideas to see them here.
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {ideas.map((idea) => (
                        <div
                            key={idea.id}
                            className="rounded-xl border p-5 transition-all hover:shadow-sm"
                            style={{ borderColor: "var(--border-default)", backgroundColor: "var(--card-bg)" }}
                        >
                            {editing === idea.id ? (
                                /* Edit Mode */
                                <div className="space-y-3">
                                    <input
                                        value={editTitle}
                                        onChange={(e) => setEditTitle(e.target.value)}
                                        className="w-full px-3 py-2 rounded-lg border text-sm font-medium"
                                        style={{ borderColor: "var(--input-border)", backgroundColor: "var(--input-bg)", color: "var(--text-primary)" }}
                                    />
                                    <textarea
                                        value={editAngle}
                                        onChange={(e) => setEditAngle(e.target.value)}
                                        rows={3}
                                        className="w-full px-3 py-2 rounded-lg border text-sm"
                                        style={{ borderColor: "var(--input-border)", backgroundColor: "var(--input-bg)", color: "var(--text-primary)" }}
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => saveEdit(idea.id)}
                                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-brand-green text-white text-xs font-medium"
                                        >
                                            <Check className="w-3 h-3" /> Save
                                        </button>
                                        <button
                                            onClick={() => setEditing(null)}
                                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border text-xs font-medium"
                                            style={{ borderColor: "var(--border-default)", color: "var(--text-secondary)" }}
                                        >
                                            <X className="w-3 h-3" /> Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                /* View Mode */
                                <div className="flex items-start gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="font-semibold text-olive dark:text-off-white truncate">{idea.title}</h4>
                                            <span className="shrink-0 text-xs px-2 py-0.5 rounded-full bg-brand-green/10 text-brand-green font-medium">
                                                {idea.score}/100
                                            </span>
                                        </div>
                                        <p className="text-xs leading-relaxed line-clamp-2" style={{ color: "var(--text-muted)" }}>{idea.angle}</p>
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {idea.keywords.slice(0, 4).map((kw) => (
                                                <span key={kw} className="text-xs px-1.5 py-0.5 rounded bg-brand-green/5 text-brand-green/80">
                                                    {kw}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1.5 shrink-0">
                                        <button
                                            onClick={() => startEdit(idea)}
                                            className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-white/5 transition-colors"
                                            title="Edit"
                                        >
                                            <Pencil className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
                                        </button>
                                        <button
                                            onClick={() => handleRemove(idea.id)}
                                            className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                            title="Remove"
                                        >
                                            <Trash2 className="w-4 h-4 text-red-400" />
                                        </button>
                                        <button
                                            onClick={() => handleGenerate(idea.id)}
                                            disabled={generating === idea.id}
                                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-brand-green text-white text-xs font-medium hover:bg-brand-green/90 transition-colors disabled:opacity-50"
                                        >
                                            {generating === idea.id ? (
                                                <>
                                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                    Generating...
                                                </>
                                            ) : (
                                                <>
                                                    <FileText className="w-3.5 h-3.5" />
                                                    Generate Draft
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
