"use client"

import { exportAuditLogsCsv, getAuditLogs } from "@/app/actions/audit"
import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card"
import { Input } from "@/components/ui/Input"
import {
    Calendar,
    ChevronLeft,
    ChevronRight,
    Download,
    Filter,
    Loader2,
    Search,
    Shield,
    X,
} from "lucide-react"
import { useCallback, useEffect, useState, useTransition } from "react"

interface AuditLogEntry {
    id: string
    action: string
    entity: string
    entityId: string
    userId: string | null
    metadata: any
    ipAddress: string | null
    createdAt: string
}

const ACTION_COLORS: Record<string, string> = {
    CREATED: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    UPDATED: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    DELETED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    TOGGLED: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    LOGIN: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400",
    REPLIED: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
    ARCHIVED: "bg-neutral-100 text-neutral-800 dark:bg-neutral-800/50 dark:text-neutral-400",
    PUBLISHED: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
    CANCELLED: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
    RESCHEDULED: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400",
}

function getActionColor(action: string) {
    const key = Object.keys(ACTION_COLORS).find(k => action.includes(k))
    return key ? ACTION_COLORS[key] : "bg-neutral-100 text-neutral-700 dark:bg-white/10 dark:text-neutral-300"
}

function formatAction(action: string) {
    return action.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())
}

export default function AuditLogPage() {
    const [logs, setLogs] = useState<AuditLogEntry[]>([])
    const [totalCount, setTotalCount] = useState(0)
    const [page, setPage] = useState(1)
    const [isLoading, startTransition] = useTransition()
    const [isExporting, startExportTransition] = useTransition()

    // Filters
    const [actionFilter, setActionFilter] = useState("")
    const [entityFilter, setEntityFilter] = useState("")
    const [searchQuery, setSearchQuery] = useState("")
    const [showFilters, setShowFilters] = useState(false)
    const pageSize = 25

    const loadLogs = useCallback(() => {
        startTransition(async () => {
            const result = await getAuditLogs(page, pageSize, {
                action: actionFilter || undefined,
                entity: entityFilter || undefined,
            })
            setLogs(result.logs.map(l => ({
                ...l,
                createdAt: l.createdAt.toISOString()
            })))
            setTotalCount(result.totalCount)
        })
    }, [page, actionFilter, entityFilter])

    useEffect(() => {
        loadLogs()
    }, [loadLogs])

    const handleExport = () => {
        startExportTransition(async () => {
            const result = await exportAuditLogsCsv({
                action: actionFilter || undefined,
                entity: entityFilter || undefined,
            })
            if (result.success && result.csv) {
                const blob = new Blob([result.csv], { type: "text/csv" })
                const url = URL.createObjectURL(blob)
                const a = document.createElement("a")
                a.href = url
                a.download = `audit-log-${new Date().toISOString().slice(0, 10)}.csv`
                a.click()
                URL.revokeObjectURL(url)
            }
        })
    }

    const clearFilters = () => {
        setActionFilter("")
        setEntityFilter("")
        setSearchQuery("")
        setPage(1)
    }

    const totalPages = Math.ceil(totalCount / pageSize)

    const filteredLogs = searchQuery
        ? logs.filter(l =>
            l.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
            l.entity.toLowerCase().includes(searchQuery.toLowerCase()) ||
            l.entityId.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (l.userId || "").toLowerCase().includes(searchQuery.toLowerCase())
        )
        : logs

    const entities = [...new Set(logs.map(l => l.entity))].sort()
    const actions = [...new Set(logs.map(l => l.action))].sort()

    return (
        <div className="space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold font-serif text-olive dark:text-off-white flex items-center gap-3">
                        <Shield className="w-8 h-8 text-brand-green" />
                        Audit Trail
                    </h1>
                    <p className="text-neutral-500 dark:text-neutral-400 mt-1">
                        {totalCount} total events recorded across the platform.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        onClick={() => setShowFilters(!showFilters)}
                        className={showFilters ? "ring-2 ring-brand-green" : ""}
                    >
                        <Filter className="w-4 h-4 mr-2" />
                        Filters
                    </Button>
                    <Button
                        variant="accent"
                        onClick={handleExport}
                        disabled={isExporting}
                        className="shadow-lg shadow-orange/20"
                    >
                        {isExporting ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                            <Download className="w-4 h-4 mr-2" />
                        )}
                        Export CSV
                    </Button>
                </div>
            </div>

            {/* Filters Panel */}
            {showFilters && (
                <Card className="surface-card animate-in slide-in-from-top-2 duration-200">
                    <CardContent className="p-4">
                        <div className="flex flex-wrap items-end gap-4">
                            <div className="space-y-1 flex-1 min-w-[200px]">
                                <label className="text-xs font-bold uppercase tracking-wider text-caption">Search</label>
                                <div className="relative">
                                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                                    <Input
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search actions, entities, IDs..."
                                        className="pl-9 surface-input"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1 min-w-[180px]">
                                <label className="text-xs font-bold uppercase tracking-wider text-caption">Entity</label>
                                <select
                                    value={entityFilter}
                                    onChange={(e) => { setEntityFilter(e.target.value); setPage(1) }}
                                    className="w-full h-10 rounded-xl surface-input border-default px-3 text-sm focus:ring-2 focus:ring-brand-green"
                                >
                                    <option value="">All Entities</option>
                                    {entities.map(e => (
                                        <option key={e} value={e}>{e}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-1 min-w-[180px]">
                                <label className="text-xs font-bold uppercase tracking-wider text-caption">Action</label>
                                <select
                                    value={actionFilter}
                                    onChange={(e) => { setActionFilter(e.target.value); setPage(1) }}
                                    className="w-full h-10 rounded-xl surface-input border-default px-3 text-sm focus:ring-2 focus:ring-brand-green"
                                >
                                    <option value="">All Actions</option>
                                    {actions.map(a => (
                                        <option key={a} value={a}>{formatAction(a)}</option>
                                    ))}
                                </select>
                            </div>
                            {(actionFilter || entityFilter || searchQuery) && (
                                <Button variant="ghost" onClick={clearFilters} className="text-red-500">
                                    <X className="w-4 h-4 mr-1" /> Clear
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Audit Log Table */}
            <Card className="border-none shadow-xl shadow-neutral-200/50 dark:shadow-black/20 bg-white/90 dark:bg-white/5 backdrop-blur-md overflow-hidden">
                <CardHeader className="border-b border-neutral-100 dark:border-white/5 pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-orange" />
                        Event Log
                    </CardTitle>
                    <CardDescription>
                        Showing {filteredLogs.length} of {totalCount} events (page {page} of {totalPages || 1})
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-6 h-6 animate-spin text-brand-green" />
                        </div>
                    ) : filteredLogs.length === 0 ? (
                        <div className="text-center py-12 text-neutral-500">
                            <Shield className="w-12 h-12 mx-auto mb-3 opacity-30" />
                            <p className="font-medium">No audit events found</p>
                            <p className="text-sm">Events will appear here as actions are performed.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-neutral-50 dark:bg-white/5 text-neutral-500 text-xs uppercase tracking-wider">
                                    <tr>
                                        <th className="py-3 px-4 text-left font-semibold">Timestamp</th>
                                        <th className="py-3 px-4 text-left font-semibold">Action</th>
                                        <th className="py-3 px-4 text-left font-semibold">Entity</th>
                                        <th className="py-3 px-4 text-left font-semibold">Entity ID</th>
                                        <th className="py-3 px-4 text-left font-semibold">Details</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-100 dark:divide-white/5">
                                    {filteredLogs.map((log) => (
                                        <tr key={log.id} className="hover:bg-neutral-50 dark:hover:bg-white/5 transition-colors">
                                            <td className="py-3 px-4 whitespace-nowrap text-neutral-500 text-xs font-mono">
                                                {new Date(log.createdAt).toLocaleDateString("en-GB", {
                                                    day: "2-digit",
                                                    month: "short",
                                                    year: "numeric",
                                                })}{" "}
                                                {new Date(log.createdAt).toLocaleTimeString("en-GB", {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                    second: "2-digit",
                                                })}
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                                                    {formatAction(log.action)}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 font-medium text-olive dark:text-off-white">
                                                {log.entity}
                                            </td>
                                            <td className="py-3 px-4 text-neutral-500 font-mono text-xs max-w-[200px] truncate">
                                                {log.entityId}
                                            </td>
                                            <td className="py-3 px-4 text-neutral-500 text-xs max-w-[250px] truncate">
                                                {log.metadata
                                                    ? Object.entries(log.metadata as Record<string, unknown>)
                                                        .map(([k, v]) => `${k}: ${v}`)
                                                        .join(", ")
                                                    : "—"}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between px-4 py-3 border-t border-neutral-100 dark:border-white/5">
                            <p className="text-sm text-neutral-500">
                                Page {page} of {totalPages}
                            </p>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={page <= 1}
                                    onClick={() => setPage(p => p - 1)}
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={page >= totalPages}
                                    onClick={() => setPage(p => p + 1)}
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
