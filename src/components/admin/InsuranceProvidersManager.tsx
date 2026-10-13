"use client"

import {
    createInsuranceProvider,
    deleteInsuranceProvider,
    getAllInsuranceProviders,
    InsuranceProviderData,
    reorderInsuranceProviders,
    toggleInsuranceProvider,
    updateInsuranceProvider,
} from "@/app/actions/insurance"
import { MediaPickerModal } from "@/components/admin/MediaPickerModal"
import { Button } from "@/components/ui/Button"
import { ConfirmationDialog } from "@/components/ui/ConfirmationDialog"
import { Input } from "@/components/ui/Input"
import {
    ArrowDown,
    ArrowUp,
    Building2,
    Edit,
    ExternalLink,
    Globe,
    ImageIcon,
    Info,
    Loader2,
    Phone,
    Plus,
    Save,
    Shield,
    Trash2,
    X,
} from "lucide-react"
import Image from "next/image"
import { useEffect, useState, useTransition } from "react"

interface InsuranceProvidersManagerProps {
    initialProviders: InsuranceProviderData[]
}

const EMPTY_FORM = {
    name: "",
    logoUrl: "",
    description: "",
    contactInfo: "",
    websiteUrl: "",
}

export function InsuranceProvidersManager({ initialProviders }: InsuranceProvidersManagerProps) {
    const [providers, setProviders] = useState<InsuranceProviderData[]>(initialProviders)
    const [isPending, startTransition] = useTransition()

    // Form state
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [form, setForm] = useState(EMPTY_FORM)
    const [formError, setFormError] = useState("")
    const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false)

    // Delete confirmation
    const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)

    // Toast
    const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null)

    const showToast = (msg: string, type: "success" | "error" = "success") => {
        setToast({ msg, type })
        setTimeout(() => setToast(null), 3000)
    }

    const refresh = async () => {
        const result = await getAllInsuranceProviders()
        if (result.success) setProviders(result.data as InsuranceProviderData[])
    }

    // ── Form helpers ──────────────────────────────────────────────────────────
    const openCreate = () => {
        setEditingId(null)
        setForm(EMPTY_FORM)
        setFormError("")
        setIsFormOpen(true)
    }

    const openEdit = (p: InsuranceProviderData) => {
        setEditingId(p.id)
        setForm({
            name: p.name,
            logoUrl: p.logoUrl ?? "",
            description: p.description ?? "",
            contactInfo: p.contactInfo ?? "",
            websiteUrl: p.websiteUrl ?? "",
        })
        setFormError("")
        setIsFormOpen(true)
    }

    const closeForm = () => {
        setIsFormOpen(false)
        setEditingId(null)
        setForm(EMPTY_FORM)
        setFormError("")
    }

    // ── CRUD handlers ─────────────────────────────────────────────────────────
    const handleSave = () => {
        if (!form.name.trim()) {
            setFormError("Provider name is required.")
            return
        }
        startTransition(async () => {
            const payload = {
                name: form.name.trim(),
                logoUrl: form.logoUrl.trim() || null,
                description: form.description.trim() || null,
                contactInfo: form.contactInfo.trim() || null,
                websiteUrl: form.websiteUrl.trim() || null,
            }

            let result
            if (editingId) {
                result = await updateInsuranceProvider(editingId, payload)
            } else {
                result = await createInsuranceProvider(payload)
            }

            if (!result.success) {
                setFormError(result.error || "An error occurred.")
                return
            }

            closeForm()
            await refresh()
            showToast(editingId ? "Provider updated." : "Provider added.")
        })
    }

    const handleToggle = (id: string) => {
        startTransition(async () => {
            const result = await toggleInsuranceProvider(id)
            if (!result.success) { showToast(result.error || "Failed to toggle", "error"); return }
            await refresh()
            const updated = result.provider as InsuranceProviderData
            showToast(updated.isActive ? "Provider is now active." : "Provider suspended.")
        })
    }

    const handleDelete = () => {
        if (!pendingDeleteId) return
        const id = pendingDeleteId
        setPendingDeleteId(null)
        startTransition(async () => {
            const result = await deleteInsuranceProvider(id)
            if (!result.success) { showToast(result.error || "Delete failed", "error"); return }
            await refresh()
            showToast("Provider permanently deleted.")
        })
    }

    const handleMove = (id: string, direction: "up" | "down") => {
        const list = [...providers]
        const idx = list.findIndex(p => p.id === id)
        if (idx === -1) return
        const targetIdx = direction === "up" ? idx - 1 : idx + 1
        if (targetIdx < 0 || targetIdx >= list.length) return
        ;[list[idx], list[targetIdx]] = [list[targetIdx], list[idx]]
        setProviders(list)
        startTransition(async () => {
            await reorderInsuranceProviders(list.map(p => p.id))
        })
    }

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div className="space-y-6">
            {/* Toast */}
            {toast && (
                <div
                    className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl animate-in slide-in-from-bottom-4 text-white text-sm font-medium ${
                        toast.type === "success" ? "bg-brand-green" : "bg-red-500"
                    }`}
                >
                    <Shield className="w-4 h-4 shrink-0" />
                    {toast.msg}
                </div>
            )}

            {/* Header Row */}
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-green/10 flex items-center justify-center">
                        <Shield className="w-5 h-5 text-brand-green" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-body text-base md:text-lg">Accepted Insurance Providers</h3>
                        <p className="text-xs md:text-sm text-caption">
                            {providers.filter(p => p.isActive).length} active · {providers.length} total
                        </p>
                    </div>
                </div>
                <Button onClick={openCreate} variant="accent" className="gap-2 shrink-0" disabled={isPending}>
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">Add Insurance</span>
                    <span className="sm:hidden">Add</span>
                </Button>
            </div>

            {/* Info banner explaining the billing model */}
            <div className="flex gap-3 p-4 rounded-xl bg-brand-green/5 border border-brand-green/15">
                <Info className="w-4 h-4 text-brand-green shrink-0 mt-0.5" />
                <p className="text-xs md:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
                    <span className="font-semibold text-olive dark:text-off-white">Clinic billing model:</span>{" "}
                    Clients visiting your partner clinic pay their insurance company directly for clinical nutrition services.
                    The clinic then settles your fee on a monthly basis. Insurance does <strong>not</strong> apply to free
                    Discovery Calls or online-only meal plan orders.
                </p>
            </div>

            {/* Provider List */}
            {providers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-neutral-200 dark:border-white/10 rounded-2xl">
                    <Shield className="w-12 h-12 text-neutral-300 dark:text-neutral-600 mb-4" />
                    <p className="text-base font-semibold text-body mb-1">No insurance providers yet</p>
                    <p className="text-sm text-caption mb-6 max-w-xs">
                        Add the insurers you accept at your partner clinic. They will appear on your public website immediately.
                    </p>
                    <Button onClick={openCreate} variant="accent" className="gap-2">
                        <Plus className="w-4 h-4" /> Add First Provider
                    </Button>
                </div>
            ) : (
                <div className="space-y-3">
                    {providers.map((p, index) => (
                        <div
                            key={p.id}
                            className={`group flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl border transition-all duration-200 ${
                                p.isActive
                                    ? "surface-card border-neutral-200/80 dark:border-white/10"
                                    : "bg-neutral-50 dark:bg-white/2 border-neutral-200/50 dark:border-white/5 opacity-60"
                            }`}
                        >
                            {/* Logo */}
                            <div className="w-12 h-12 rounded-xl bg-neutral-100 dark:bg-white/5 flex items-center justify-center shrink-0 overflow-hidden border border-neutral-200 dark:border-white/10">
                                {p.logoUrl ? (
                                    <Image
                                        src={p.logoUrl}
                                        alt={p.name}
                                        width={48}
                                        height={48}
                                        className="object-contain w-10 h-10"
                                    />
                                ) : (
                                    <Building2 className="w-5 h-5 text-neutral-400" />
                                )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-semibold text-sm md:text-base text-body">{p.name}</span>
                                    <span
                                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                                            p.isActive
                                                ? "bg-brand-green/10 text-brand-green"
                                                : "bg-neutral-200 dark:bg-white/10 text-neutral-500"
                                        }`}
                                    >
                                        {p.isActive ? "Active" : "Suspended"}
                                    </span>
                                </div>
                                {p.description && (
                                    <p className="text-xs md:text-sm text-caption mt-0.5 line-clamp-1">{p.description}</p>
                                )}
                                {p.contactInfo && (
                                    <p className="text-[10px] md:text-xs text-neutral-400 dark:text-neutral-500 mt-0.5 flex items-center gap-1">
                                        <Phone className="w-3 h-3" /> {p.contactInfo}
                                    </p>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 shrink-0">
                                {/* Reorder */}
                                <div className="flex flex-col gap-0.5">
                                    <button
                                        onClick={() => handleMove(p.id, "up")}
                                        disabled={index === 0 || isPending}
                                        className="w-6 h-6 flex items-center justify-center rounded text-neutral-400 hover:text-brand-green disabled:opacity-20 transition-colors"
                                        title="Move up"
                                    >
                                        <ArrowUp className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        onClick={() => handleMove(p.id, "down")}
                                        disabled={index === providers.length - 1 || isPending}
                                        className="w-6 h-6 flex items-center justify-center rounded text-neutral-400 hover:text-brand-green disabled:opacity-20 transition-colors"
                                        title="Move down"
                                    >
                                        <ArrowDown className="w-3.5 h-3.5" />
                                    </button>
                                </div>

                                {p.websiteUrl && (
                                    <a
                                        href={p.websiteUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-neutral-100 dark:hover:bg-white/10 text-neutral-400 hover:text-brand-green transition-colors"
                                        title="Visit website"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                    </a>
                                )}

                                {/* Toggle active/suspended */}
                                <button
                                    onClick={() => handleToggle(p.id)}
                                    disabled={isPending}
                                    className={`h-8 px-3 rounded-lg text-xs font-semibold transition-all border ${
                                        p.isActive
                                            ? "border-orange/30 text-orange hover:bg-orange/5"
                                            : "border-brand-green/30 text-brand-green hover:bg-brand-green/5"
                                    }`}
                                    title={p.isActive ? "Suspend" : "Re-activate"}
                                >
                                    {p.isActive ? "Suspend" : "Activate"}
                                </button>

                                <button
                                    onClick={() => openEdit(p)}
                                    disabled={isPending}
                                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-neutral-100 dark:hover:bg-white/10 text-neutral-400 hover:text-body transition-colors"
                                    title="Edit"
                                >
                                    <Edit className="w-4 h-4" />
                                </button>

                                <button
                                    onClick={() => setPendingDeleteId(p.id)}
                                    disabled={isPending}
                                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-neutral-400 hover:text-red-500 transition-colors"
                                    title="Delete permanently"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add / Edit Form Slide-in */}
            {isFormOpen && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/30 backdrop-blur-sm animate-in fade-in">
                    <div className="w-full max-w-lg bg-white dark:bg-charcoal rounded-2xl shadow-2xl border border-neutral-200 dark:border-white/10 overflow-hidden animate-in slide-in-from-bottom-4">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 dark:border-white/10">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-brand-green/10 flex items-center justify-center">
                                    <Shield className="w-4 h-4 text-brand-green" />
                                </div>
                                <h4 className="font-semibold text-body">
                                    {editingId ? "Edit Insurance Provider" : "Add Insurance Provider"}
                                </h4>
                            </div>
                            <button
                                onClick={closeForm}
                                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-neutral-100 dark:hover:bg-white/10 text-neutral-400 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Form Body */}
                        <div className="p-6 space-y-5 overflow-y-auto max-h-[70vh]">
                            {formError && (
                                <div className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg border border-red-200 dark:border-red-800">
                                    {formError}
                                </div>
                            )}

                            {/* Name */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-caption flex items-center gap-1">
                                    <Building2 className="w-3 h-3" /> Provider Name <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    value={form.name}
                                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                    placeholder="e.g. Cigna, CIC Insurance Group, AAR"
                                    className="surface-input"
                                    autoFocus
                                />
                            </div>

                            {/* Logo */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-caption flex items-center gap-1">
                                    <ImageIcon className="w-3 h-3" /> Logo URL
                                </label>
                                <div className="flex gap-2">
                                    <Input
                                        value={form.logoUrl}
                                        onChange={e => setForm(f => ({ ...f, logoUrl: e.target.value }))}
                                        placeholder="https://... or pick from media library"
                                        className="surface-input flex-1"
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        className="shrink-0 gap-1.5 text-xs"
                                        onClick={() => setIsMediaPickerOpen(true)}
                                    >
                                        <ImageIcon className="w-3.5 h-3.5" /> Pick
                                    </Button>
                                </div>
                                {form.logoUrl && (
                                    <div className="w-16 h-16 rounded-xl border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-white/5 flex items-center justify-center overflow-hidden">
                                        <img
                                            src={form.logoUrl}
                                            alt="logo preview"
                                            className="object-contain w-14 h-14"
                                            onError={e => { (e.target as HTMLImageElement).style.display = "none" }}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-caption flex items-center gap-1">
                                    <Info className="w-3 h-3" /> Coverage Description
                                </label>
                                <textarea
                                    value={form.description}
                                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                                    placeholder="e.g. Covers outpatient nutrition consultations at our partner clinic."
                                    rows={2}
                                    className="w-full text-sm rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-charcoal px-4 py-3 text-body placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-green/30 resize-none transition"
                                />
                            </div>

                            {/* Contact Info */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-caption flex items-center gap-1">
                                    <Phone className="w-3 h-3" /> Contact / Verification Info
                                </label>
                                <Input
                                    value={form.contactInfo}
                                    onChange={e => setForm(f => ({ ...f, contactInfo: e.target.value }))}
                                    placeholder="e.g. Call 0703 099 120 to verify your cover"
                                    className="surface-input"
                                />
                            </div>

                            {/* Website */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-caption flex items-center gap-1">
                                    <Globe className="w-3 h-3" /> Website URL
                                </label>
                                <Input
                                    value={form.websiteUrl}
                                    onChange={e => setForm(f => ({ ...f, websiteUrl: e.target.value }))}
                                    placeholder="https://www.cigna.com"
                                    className="surface-input"
                                />
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-neutral-100 dark:border-white/10">
                            <Button variant="ghost" onClick={closeForm} disabled={isPending}>
                                Cancel
                            </Button>
                            <Button variant="accent" onClick={handleSave} disabled={isPending} className="gap-2">
                                {isPending ? (
                                    <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                                ) : (
                                    <><Save className="w-4 h-4" /> {editingId ? "Save Changes" : "Add Provider"}</>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Media Picker */}
            <MediaPickerModal
                open={isMediaPickerOpen}
                onOpenChange={setIsMediaPickerOpen}
                onSelect={(url, _publicId) => {
                    setForm(f => ({ ...f, logoUrl: url }))
                    setIsMediaPickerOpen(false)
                }}
                allowedTypes="image"
            />

            {/* Delete Confirmation */}
            <ConfirmationDialog
                open={!!pendingDeleteId}
                onOpenChange={open => { if (!open) setPendingDeleteId(null) }}
                title="Permanently delete provider?"
                description="This will remove the insurance provider from your website immediately. This action cannot be undone. To temporarily remove, use 'Suspend' instead."
                confirmText="Yes, delete permanently"
                variant="destructive"
                onConfirm={handleDelete}
            />
        </div>
    )
}
