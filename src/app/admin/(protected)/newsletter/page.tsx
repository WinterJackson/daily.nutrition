"use client"

import { deleteSubscriberAction, dispatchCampaign, draftCampaign, getNewsletterData } from "@/app/actions/newsletter"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { Input } from "@/components/ui/Input"
import { Textarea } from "@/components/ui/Textarea"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/Tooltip"
import { format } from "date-fns"
import { AlertTriangle, CheckCircle, Loader2, Mail, RefreshCcw, Search, Send, Trash2, Users } from "lucide-react"
import { useEffect, useState } from "react"

type TabType = "SUBSCRIBERS" | "CAMPAIGNS"
type FilterType = "ALL" | "ACTIVE" | "UNSUBSCRIBED"

export default function NewsletterPage() {
    const [activeTab, setActiveTab] = useState<TabType>("SUBSCRIBERS")
    const [filter, setFilter] = useState<FilterType>("ALL")
    const [search, setSearch] = useState("")
    const [page, setPage] = useState(1)
    const [loading, setLoading] = useState(true)
    
    // Data States
    const [subscribers, setSubscribers] = useState<any[]>([])
    const [campaigns, setCampaigns] = useState<any[]>([])
    const [totalSubs, setTotalSubs] = useState(0)
    const [quota, setQuota] = useState<any>(null)

    // Draft State
    const [draftSubject, setDraftSubject] = useState("")
    const [draftPreview, setDraftPreview] = useState("")
    const [draftContent, setDraftContent] = useState("")
    const [isDrafting, setIsDrafting] = useState(false)
    const [isDispatching, setIsDispatching] = useState<string | null>(null)
    const [isDeleting, setIsDeleting] = useState<string | null>(null)

    const loadData = async () => {
        setLoading(true)
        try {
            const data = await getNewsletterData(page, 20, filter, search)
            setSubscribers(data.subscribers)
            setCampaigns(data.campaigns)
            setTotalSubs(data.totalCount)
            setQuota(data.quotaInfo)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadData()
    }, [page, filter, search])

    const handleDeleteSubscriber = async (id: string) => {
        if (!confirm("Are you sure you want to soft-delete this subscriber? They will be hidden from normal operations.")) return
        setIsDeleting(id)
        await deleteSubscriberAction(id)
        await loadData()
        setIsDeleting(null)
    }

    const handleDraftCampaign = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!draftSubject || !draftContent) return
        
        setIsDrafting(true)
        const res = await draftCampaign({
            subject: draftSubject,
            previewText: draftPreview,
            content: draftContent,
            targetAudience: "ACTIVE_ONLY"
        })

        if (res.success) {
            setDraftSubject("")
            setDraftPreview("")
            setDraftContent("")
            await loadData()
            setActiveTab("CAMPAIGNS")
        } else {
            alert(res.error)
        }
        setIsDrafting(false)
    }

    const handleDispatch = async (campaignId: string) => {
        if (!quota?.canSendToAll) {
            alert("Cannot send: Math limit exceeded. Your active subscribers outnumber your remaining Resend API Quota.")
            return
        }

        if (!confirm("Are you sure you want to broadcast this campaign to all active subscribers? This action cannot be undone.")) return
        
        setIsDispatching(campaignId)
        const res = await dispatchCampaign(campaignId)
        if (res.success) {
            alert(`Success! Dispatched to ${res.sentCount} subscribers.`)
            await loadData()
        } else {
            alert(res.error)
        }
        setIsDispatching(null)
    }

    return (
        <TooltipProvider>
            <div className="space-y-8 max-w-[1600px] mx-auto animate-in fade-in duration-500">
                
                {/* Header Widget */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-2">
                    <div>
                        <h1 className="text-3xl font-serif font-medium text-body flex items-center gap-3">
                            <Mail className="w-8 h-8 text-olive dark:text-brand-green" />
                            Newsletter & Campaigns
                        </h1>
                        <p className="text-caption mt-2">Manage subscribers and deploy standardized email blasts.</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 p-1 surface-secondary rounded-xl w-fit">
                    <button
                        onClick={() => setActiveTab("SUBSCRIBERS")}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            activeTab === "SUBSCRIBERS"
                                ? "surface-elevated text-body shadow-sm"
                                : "text-label hover:text-body"
                        }`}
                    >
                        Subscribers ({totalSubs})
                    </button>
                    <button
                        onClick={() => setActiveTab("CAMPAIGNS")}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            activeTab === "CAMPAIGNS"
                                ? "surface-elevated text-body shadow-sm"
                                : "text-label hover:text-body"
                        }`}
                    >
                        Campaigns
                    </button>
                </div>

                {/* Content Area */}
                {activeTab === "SUBSCRIBERS" ? (
                    <Card className="surface-card overflow-hidden">
                        {/* Toolbar */}
                        <div className="p-4 border-b border-default flex flex-col sm:flex-row gap-4 justify-between items-center surface-secondary">
                            <div className="relative w-full sm:w-64">
                                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-caption" />
                                <Input
                                    placeholder="Search emails..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-9 surface-input"
                                />
                            </div>
                            <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                                {["ALL", "ACTIVE", "UNSUBSCRIBED"].map((f) => (
                                    <button
                                        key={f}
                                        onClick={() => setFilter(f as FilterType)}
                                        className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors border ${
                                            filter === f 
                                            ? "bg-charcoal text-white dark:bg-white dark:text-charcoal border-transparent" 
                                            : "surface-primary text-label border-subtle hover:surface-secondary"
                                        }`}
                                    >
                                        {f === "ALL" ? "All Subscribers" : f === "ACTIVE" ? "Active Only" : "Unsubscribed"}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Data Grid table */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-caption uppercase surface-secondary">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold">Email</th>
                                        <th className="px-6 py-4 font-semibold">Status</th>
                                        <th className="px-6 py-4 font-semibold">Joined At</th>
                                        <th className="px-6 py-4 font-semibold text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-12 text-center text-caption">
                                                <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                                            </td>
                                        </tr>
                                    ) : subscribers.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-12 text-center text-caption">
                                                No subscribers found.
                                            </td>
                                        </tr>
                                    ) : (
                                        subscribers.map((sub) => (
                                            <tr key={sub.id} className="border-b border-subtle last:border-0 hover:surface-secondary transition-colors">
                                                <td className="px-6 py-4 font-medium text-body">
                                                    {sub.email}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {sub.isActive ? (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-brand-green/10 text-brand-green">
                                                            <CheckCircle className="w-3 h-3" /> Active
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium surface-elevated text-caption border border-default">
                                                            <Users className="w-3 h-3" /> Unsubscribed
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-label">
                                                    {format(new Date(sub.createdAt), "MMM d, yyyy")}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDeleteSubscriber(sub.id)}
                                                        disabled={isDeleting === sub.id}
                                                        className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
                                                    >
                                                        {isDeleting === sub.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="p-4 border-t border-default flex justify-between items-center surface-secondary">
                            <span className="text-sm text-caption">
                                Showing {subscribers.length} of {totalSubs}
                            </span>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={page === 1 || loading}
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                >
                                    Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={subscribers.length < 20 || loading}
                                    onClick={() => setPage(p => p + 1)}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Control Panel (Quota + Draft) */}
                        <div className="lg:col-span-1 space-y-6">
                            
                            {/* PREMIUM QUOTA TRACKER */}
                            {quota && (
                                <Card className="relative overflow-hidden p-6 surface-card isolate">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-caption flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-orange animate-pulse" />
                                            API Quota
                                        </h3>
                                        <Tooltip>
                                            <TooltipTrigger className="hover:surface-elevated p-1.5 rounded-full transition-colors border border-transparent hover:border-default">
                                                <RefreshCcw className="w-4 h-4 text-label hover:text-orange transition-colors" onClick={loadData} />
                                            </TooltipTrigger>
                                            <TooltipContent className="surface-elevated text-body border-default">Refresh Math</TooltipContent>
                                        </Tooltip>
                                    </div>
                                    
                                    <div className="space-y-6">
                                        {/* Daily Stats */}
                                        <div className="group">
                                            <div className="flex justify-between items-end mb-2">
                                                <p className="text-xs text-label font-medium group-hover:text-body transition-colors">Daily Allowed</p>
                                                <div className="flex items-baseline gap-1">
                                                    <span className={`text-2xl font-bold font-serif ${quota.dailyRemaining < 10 ? 'text-red-500' : 'text-body'}`}>
                                                        {quota.dailySent}
                                                    </span>
                                                    <span className="text-xs text-caption font-mono">/ {quota.dailyLimit}</span>
                                                </div>
                                            </div>
                                            <div className="w-full surface-input h-1.5 rounded-full overflow-hidden backdrop-blur-sm">
                                                <div 
                                                    className={`h-full rounded-full transition-all duration-1000 ease-out ${quota.dailyRemaining < 10 ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-gradient-to-r from-orange to-[#ff8f00]'}`} 
                                                    style={{ width: `${(quota.dailySent / quota.dailyLimit) * 100}%` }}
                                                />
                                            </div>
                                        </div>

                                        {/* Monthly Stats */}
                                        <div className="group">
                                            <div className="flex justify-between items-end mb-2">
                                                <p className="text-xs text-label font-medium group-hover:text-body transition-colors">Monthly Allowed</p>
                                                <div className="flex items-baseline gap-1">
                                                    <span className={`text-2xl font-bold font-serif ${quota.monthlyRemaining < 100 ? 'text-red-500' : 'text-body'}`}>
                                                        {quota.monthlySent}
                                                    </span>
                                                    <span className="text-xs text-caption font-mono">/ {quota.monthlyLimit}</span>
                                                </div>
                                            </div>
                                            <div className="w-full surface-input h-1.5 rounded-full overflow-hidden backdrop-blur-sm">
                                                <div 
                                                    className={`h-full rounded-full transition-all duration-1000 ease-out ${quota.monthlyRemaining < 100 ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-gradient-to-r from-brand-green to-[#5A7A3A]'}`} 
                                                    style={{ width: `${(quota.monthlySent / quota.monthlyLimit) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-6 pt-4 border-t border-subtle flex items-center justify-between">
                                        <span className="text-xs text-caption uppercase tracking-widest">Sendable Capacity</span>
                                        <span className={`text-sm font-bold flex items-center gap-1.5 ${!quota.canSendToAll ? 'text-red-500' : 'text-body'}`}>
                                            {!quota.canSendToAll && <AlertTriangle className="w-4 h-4" />}
                                            {quota.maxSendableCapacity}
                                        </span>
                                    </div>
                                </Card>
                            )}

                            {/* Draft Campaign Form */}
                            <Card className="p-6 surface-card">
                                <h2 className="text-xl font-serif text-body mb-4">Draft New Campaign</h2>
                                <form onSubmit={handleDraftCampaign} className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-wider text-caption">Email Subject</label>
                                        <Input 
                                            value={draftSubject}
                                            onChange={(e) => setDraftSubject(e.target.value)}
                                            placeholder="Exciting news from Edwak Nutrition!"
                                            required
                                            className="surface-input"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-wider text-caption">Preview Text <span className="font-normal lowercase text-muted">(optional)</span></label>
                                        <Input 
                                            value={draftPreview}
                                            onChange={(e) => setDraftPreview(e.target.value)}
                                            placeholder="Check out our latest holistic guides..."
                                            className="surface-input"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-wider text-caption">Email Body (Text/Markdown)</label>
                                        <Textarea 
                                            value={draftContent}
                                            onChange={(e) => setDraftContent(e.target.value)}
                                            placeholder="Write your email content here..."
                                            required
                                            className="min-h-[200px] surface-input custom-scrollbar"
                                        />
                                    </div>
                                    <Button 
                                        type="submit" 
                                        className="w-full border-default text-body surface-elevated hover:surface-secondary transition-colors"
                                        disabled={isDrafting}
                                    >
                                        {isDrafting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                                        Save as Draft
                                    </Button>
                                </form>
                            </Card>
                        </div>

                        {/* Recent Campaigns List */}
                        <div className="lg:col-span-2 space-y-4">
                            <h2 className="text-xl font-serif text-body mb-4">Recent Campaigns</h2>
                            
                            {campaigns.length === 0 && !loading && (
                                <div className="p-8 text-center border border-dashed border-subtle rounded-2xl text-caption">
                                    <Mail className="w-8 h-8 mx-auto mb-3 opacity-20" />
                                    <p>No campaigns drafted yet.</p>
                                </div>
                            )}

                            {campaigns.map((camp) => (
                                <Card key={camp.id} className="p-5 surface-card flex flex-col md:flex-row gap-4 justify-between md:items-center">
                                    <div className="space-y-1 w-full">
                                        <div className="flex items-center justify-between xl:justify-start gap-2">
                                            <h3 className="font-semibold text-body uppercase tracking-wide">
                                                {camp.subject}
                                            </h3>
                                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                                camp.status === "SENT" ? "bg-brand-green/10 text-brand-green" :
                                                camp.status === "SENDING" ? "bg-orange/10 text-orange border border-orange/20 animate-pulse" :
                                                "surface-elevated text-caption border border-subtle"
                                            }`}>
                                                {camp.status}
                                            </span>
                                        </div>
                                        <p className="text-sm text-label line-clamp-1">{camp.previewText || camp.content.substring(0, 50) + "..."}</p>
                                        
                                        <div className="flex items-center gap-4 text-xs text-caption font-medium pt-2">
                                            <span>Created: {format(new Date(camp.createdAt), "MMM d")}</span>
                                            {camp.status === "SENT" && (
                                                <span className="flex items-center gap-1 text-olive dark:text-brand-green">
                                                    <Send className="w-3 h-3" />
                                                    Sent to {camp.sentCount}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className="shrink-0">
                                        {camp.status === "DRAFT" && (
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <div className="inline-block">
                                                        <Button
                                                            variant="accent"
                                                            onClick={() => handleDispatch(camp.id)}
                                                            disabled={isDispatching === camp.id || !quota?.canSendToAll}
                                                            className={`shadow-lg shadow-orange/20 ${!quota?.canSendToAll ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
                                                        >
                                                            {isDispatching === camp.id ? (
                                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                            ) : (
                                                                <Send className="w-4 h-4 mr-2" />
                                                            )}
                                                            Dispatch Blast
                                                        </Button>
                                                    </div>
                                                </TooltipTrigger>
                                                {!quota?.canSendToAll && (
                                                    <TooltipContent className="bg-red-500 text-white border-red-600">
                                                        <p>Insufficient API Quota to broadcast.</p>
                                                    </TooltipContent>
                                                )}
                                            </Tooltip>
                                        )}
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </TooltipProvider>
    )
}
