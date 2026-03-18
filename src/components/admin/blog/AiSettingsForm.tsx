"use client"

import { autoSuggestExclusions, getAiConfig, getSecretStatus, updateAiConfig, updateGeminiKey } from "@/app/actions/ai"
import type { AiConfig } from "@/lib/ai/prompts"
import { AlertCircle, Check, Key, Loader2, Mic, Plus, Shield, Sparkles, Tags, X } from "lucide-react"
import { useEffect, useState } from "react"

export function AiSettingsForm() {
    const [config, setConfig] = useState<AiConfig | null>(null)
    const [keyConfigured, setKeyConfigured] = useState(false)
    const [apiKey, setApiKey] = useState("")
    const [newNiche, setNewNiche] = useState("")
    const [newExclusion, setNewExclusion] = useState("")
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [savingKey, setSavingKey] = useState(false)
    const [suggesting, setSuggesting] = useState(false)
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
    const [suggestions, setSuggestions] = useState<string[]>([])

    async function loadConfig() {
        setLoading(true)
        const [cfg, status] = await Promise.all([getAiConfig(), getSecretStatus()])
        setConfig(cfg)
        setKeyConfigured(status.configured)
        setLoading(false)
    }

    useEffect(() => {
        loadConfig()
    }, [])

    async function handleSaveKey() {
        if (!apiKey.trim()) return
        setSavingKey(true)
        const result = await updateGeminiKey(apiKey)
        setSavingKey(false)
        if (result.success) {
            setKeyConfigured(true)
            setApiKey("")
            showMessage("success", "Gemini API key updated and encrypted successfully")
        } else {
            showMessage("error", result.error || "Failed to save key")
        }
    }

    async function handleSaveConfig() {
        if (!config) return
        setSaving(true)
        const result = await updateAiConfig(config)
        setSaving(false)
        if (result.success) {
            showMessage("success", "AI configuration saved successfully")
        } else {
            showMessage("error", result.error || "Failed to save configuration")
        }
    }

    async function handleAutoSuggest() {
        setSuggesting(true)
        setSuggestions([])
        const result = await autoSuggestExclusions()
        setSuggesting(false)
        if (result.success && result.suggestions) {
            setSuggestions(result.suggestions)
        } else {
            showMessage("error", result.error || "Failed to generate suggestions")
        }
    }

    function addNiche() {
        if (!newNiche.trim() || !config) return
        setConfig({ ...config, targetNiches: [...config.targetNiches, newNiche.trim()] })
        setNewNiche("")
    }

    function removeNiche(idx: number) {
        if (!config) return
        setConfig({ ...config, targetNiches: config.targetNiches.filter((_, i) => i !== idx) })
    }

    function addExclusion(word?: string) {
        const term = word || newExclusion.trim()
        if (!term || !config) return
        if (config.excludedKeywords.includes(term)) return
        setConfig({ ...config, excludedKeywords: [...config.excludedKeywords, term] })
        setNewExclusion("")
    }

    function removeExclusion(idx: number) {
        if (!config) return
        setConfig({ ...config, excludedKeywords: config.excludedKeywords.filter((_, i) => i !== idx) })
    }

    function showMessage(type: "success" | "error", text: string) {
        setMessage({ type, text })
        setTimeout(() => setMessage(null), 4000)
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-6 h-6 animate-spin text-brand-green" />
            </div>
        )
    }

    if (!config) return null

    return (
        <div className="space-y-6">
            {message && (
                <div className={`p-3 rounded-lg text-sm flex items-center gap-2 ${
                    message.type === "success"
                        ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800"
                        : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800"
                }`}>
                    {message.type === "success" ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    {message.text}
                </div>
            )}

            {/* ── Gemini API Key ── */}
            <div className="rounded-xl border p-6 space-y-4" style={{ borderColor: "var(--border-default)", backgroundColor: "var(--card-bg)" }}>
                <div className="flex items-center gap-2">
                    <Key className="w-5 h-5 text-brand-green" />
                    <h3 className="font-semibold text-olive dark:text-off-white">Gemini API Key</h3>
                    {keyConfigured && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                            Configured
                        </span>
                    )}
                </div>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    Encrypted with AES-256-GCM and stored in the database. You can rotate this key anytime without redeployment.
                </p>
                <div className="flex gap-2">
                    <input
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder={keyConfigured ? "Enter new key to rotate..." : "Paste your Gemini API key..."}
                        className="flex-1 px-3 py-2 rounded-lg border text-sm"
                        style={{ borderColor: "var(--input-border)", backgroundColor: "var(--input-bg)", color: "var(--text-primary)" }}
                    />
                    <button
                        onClick={handleSaveKey}
                        disabled={savingKey || !apiKey.trim()}
                        className="px-4 py-2 rounded-lg bg-brand-green text-white text-sm font-medium hover:bg-brand-green/90 disabled:opacity-50 transition-colors"
                    >
                        {savingKey ? <Loader2 className="w-4 h-4 animate-spin" /> : "Encrypt & Save"}
                    </button>
                </div>
            </div>

            {/* ── Target Niches ── */}
            <div className="rounded-xl border p-6 space-y-4" style={{ borderColor: "var(--border-default)", backgroundColor: "var(--card-bg)" }}>
                <div className="flex items-center gap-2">
                    <Tags className="w-5 h-5 text-brand-green" />
                    <h3 className="font-semibold text-olive dark:text-off-white">Target Niches</h3>
                </div>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    The AI will focus its trend research and content creation on these nutrition specialties.
                </p>
                <div className="flex flex-wrap gap-2">
                    {config.targetNiches.map((niche, idx) => (
                        <span key={idx} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-brand-green/10 text-brand-green text-xs font-medium">
                            {niche}
                            <button onClick={() => removeNiche(idx)} className="ml-0.5 hover:text-red-500">
                                <X className="w-3 h-3" />
                            </button>
                        </span>
                    ))}
                </div>
                <div className="flex gap-2">
                    <input
                        value={newNiche}
                        onChange={(e) => setNewNiche(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && addNiche()}
                        placeholder="Add a niche (e.g., &quot;Pediatric Nutrition&quot;)"
                        className="flex-1 px-3 py-2 rounded-lg border text-sm"
                        style={{ borderColor: "var(--input-border)", backgroundColor: "var(--input-bg)", color: "var(--text-primary)" }}
                    />
                    <button onClick={addNiche} className="p-2 rounded-lg bg-brand-green/10 text-brand-green hover:bg-brand-green/20 transition-colors">
                        <Plus className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* ── Excluded Keywords ── */}
            <div className="rounded-xl border p-6 space-y-4" style={{ borderColor: "var(--border-default)", backgroundColor: "var(--card-bg)" }}>
                <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-orange" />
                    <h3 className="font-semibold text-olive dark:text-off-white">Excluded Keywords</h3>
                </div>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    The AI will never generate content related to these terms. Protects your premium, clinical brand.
                </p>
                <div className="flex flex-wrap gap-2">
                    {config.excludedKeywords.map((kw, idx) => (
                        <span key={idx} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-medium">
                            {kw}
                            <button onClick={() => removeExclusion(idx)} className="ml-0.5 hover:text-red-900">
                                <X className="w-3 h-3" />
                            </button>
                        </span>
                    ))}
                </div>
                <div className="flex gap-2">
                    <input
                        value={newExclusion}
                        onChange={(e) => setNewExclusion(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && addExclusion()}
                        placeholder="Add a keyword to blacklist..."
                        className="flex-1 px-3 py-2 rounded-lg border text-sm"
                        style={{ borderColor: "var(--input-border)", backgroundColor: "var(--input-bg)", color: "var(--text-primary)" }}
                    />
                    <button onClick={() => addExclusion()} className="p-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
                        <Plus className="w-4 h-4" />
                    </button>
                </div>

                {/* Auto-Suggest Button */}
                <div className="pt-2 border-t" style={{ borderColor: "var(--border-subtle)" }}>
                    <button
                        onClick={handleAutoSuggest}
                        disabled={suggesting}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium hover:bg-brand-green/5 transition-colors"
                        style={{ borderColor: "var(--border-default)", color: "var(--text-secondary)" }}
                    >
                        {suggesting ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Analyzing brand profile...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-4 h-4 text-brand-green" />
                                Auto-Suggest Exclusions
                            </>
                        )}
                    </button>
                    {suggestions.length > 0 && (
                        <div className="mt-3 space-y-2">
                            <p className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>AI Suggestions — click to add:</p>
                            <div className="flex flex-wrap gap-1.5">
                                {suggestions.map((s, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => {
                                            addExclusion(s)
                                            setSuggestions((prev) => prev.filter((_, i) => i !== idx))
                                        }}
                                        className="text-xs px-2.5 py-1 rounded-lg border border-dashed hover:bg-brand-green/5 transition-colors"
                                        style={{ borderColor: "var(--accent-primary)", color: "var(--accent-primary)" }}
                                    >
                                        + {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Brand Voice ── */}
            <div className="rounded-xl border p-6 space-y-4" style={{ borderColor: "var(--border-default)", backgroundColor: "var(--card-bg)" }}>
                <div className="flex items-center gap-2">
                    <Mic className="w-5 h-5 text-brand-green" />
                    <h3 className="font-semibold text-olive dark:text-off-white">Brand Voice</h3>
                </div>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    Describes the tone, style, and personality the AI should use when generating content.
                </p>
                <textarea
                    value={config.brandVoice}
                    onChange={(e) => setConfig({ ...config, brandVoice: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 rounded-lg border text-sm"
                    style={{ borderColor: "var(--input-border)", backgroundColor: "var(--input-bg)", color: "var(--text-primary)" }}
                    placeholder="Describe your brand's voice and tone..."
                />
            </div>

            {/* Save All */}
            <div className="flex justify-end">
                <button
                    onClick={handleSaveConfig}
                    disabled={saving}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-brand-green text-white font-medium text-sm hover:bg-brand-green/90 disabled:opacity-50 transition-colors"
                >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    Save Configuration
                </button>
            </div>
        </div>
    )
}
