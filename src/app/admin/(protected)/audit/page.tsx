"use client"

import { exportAuditLogsCsv, getAuditLogs } from "@/app/actions/audit"
import { TablePagination } from "@/components/admin/TablePagination"
import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/Dialog"
import { Input } from "@/components/ui/Input"
import {
    Calendar,
    Download,
    Filter,
    Loader2,
    Search,
    Shield,
    X,
} from "lucide-react"
import { useCallback, useEffect, useRef, useState, useTransition } from "react"

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
    const [pageSize, setPageSize] = useState(25)
    const [isLoading, startTransition] = useTransition()
    const [isExporting, startExportTransition] = useTransition()

    // Filters
    const [actionFilter, setActionFilter] = useState("")
    const [entityFilter, setEntityFilter] = useState("")
    const [searchQuery, setSearchQuery] = useState("")
    const [debouncedSearch, setDebouncedSearch] = useState("")
    const [showFilters, setShowFilters] = useState(false)

    // Detail modal
    const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null)

    // Debounce search
    const debounceRef = useRef<NodeJS.Timeout | null>(null)
    const handleSearchChange = (value: string) => {
        setSearchQuery(value)
        if (debounceRef.current) clearTimeout(debounceRef.current)
        debounceRef.current = setTimeout(() => {
            setDebouncedSearch(value)
            setPage(1)
        }, 400)
    }

    // All known entities and actions for filter dropdowns (fetched from the first page load)
    const [knownEntities, setKnownEntities] = useState<string[]>([])
    const [knownActions, setKnownActions] = useState<string[]>([])

    const loadLogs = useCallback(() => {
        startTransition(async () => {
            const result = await getAuditLogs(page, pageSize, {
                action: actionFilter || undefined,
                entity: entityFilter || undefined,
                search: debouncedSearch || undefined,
            })
            const mapped = result.logs.map(l => ({
                ...l,
                createdAt: l.createdAt.toISOString()
            }))
            setLogs(mapped)
            setTotalCount(result.totalCount)

            // Build filter options from first load
            if (knownEntities.length === 0 && mapped.length > 0) {
                const entities = [...new Set(mapped.map(l => l.entity))].sort()
                const actions = [...new Set(mapped.map(l => l.action))].sort()
                setKnownEntities(entities)
                setKnownActions(actions)
            }
        })
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, pageSize, actionFilter, entityFilter, debouncedSearch, knownEntities])

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
        setDebouncedSearch("")
        setPage(1)
    }

    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))

    return (
        <div className="space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold font-serif text-olive dark:text-off-white flex items-center gap-3">
                        <Shield className="w-8 h-8 text-brand-green" />
                        Audit Trail
                    </h1>
                    <p className="text-caption mt-1">
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
                                        onChange={(e) => handleSearchChange(e.target.value)}
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
                                    className="w-full h-10 rounded-xl surface-input border border-[var(--input-border)] px-3 text-sm focus:ring-2 focus:ring-brand-green focus:outline-none"
                                >
                                    <option value="">All Entities</option>
                                    {knownEntities.map(e => (
                                        <option key={e} value={e}>{e}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-1 min-w-[180px]">
                                <label className="text-xs font-bold uppercase tracking-wider text-caption">Action</label>
                                <select
                                    value={actionFilter}
                                    onChange={(e) => { setActionFilter(e.target.value); setPage(1) }}
                                    className="w-full h-10 rounded-xl surface-input border border-[var(--input-border)] px-3 text-sm focus:ring-2 focus:ring-brand-green focus:outline-none"
                                >
                                    <option value="">All Actions</option>
                                    {knownActions.map(a => (
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
            <Card className="glass overflow-hidden">
                <CardHeader className="border-b border-[var(--border-default)] pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-orange" />
                        Event Log
                    </CardTitle>
                    <CardDescription>
                        Showing page {page} of {totalPages} ({totalCount} events)
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-6 h-6 animate-spin text-brand-green" />
                        </div>
                    ) : logs.length === 0 ? (
                        <div className="text-center py-12" style={{ color: "var(--text-muted)" }}>
                            <Shield className="w-12 h-12 mx-auto mb-3 opacity-30" />
                            <p className="font-medium">No audit events found</p>
                            <p className="text-sm">Events will appear here as actions are performed.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-[var(--surface-secondary)] text-[var(--text-muted)] text-xs uppercase tracking-wider">
                                    <tr>
                                        <th className="py-3 px-4 text-left font-semibold">Timestamp</th>
                                        <th className="py-3 px-4 text-left font-semibold">Action</th>
                                        <th className="py-3 px-4 text-left font-semibold">Entity</th>
                                        <th className="py-3 px-4 text-left font-semibold">Entity ID</th>
                                        <th className="py-3 px-4 text-left font-semibold">Details</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--border-subtle)]">
                                    {logs.map((log) => (
                                        <tr
                                            key={log.id}
                                            className="hover:bg-brand-green/[0.02] dark:hover:bg-white/[0.02] transition-colors cursor-pointer"
                                            onClick={() => setSelectedLog(log)}
                                        >
                                            <td className="py-3 px-4 whitespace-nowrap text-xs font-mono" style={{ color: "var(--text-muted)" }}>
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
                                            <td className="py-3 px-4 font-mono text-xs max-w-[200px] truncate" style={{ color: "var(--text-muted)" }}>
                                                {log.entityId}
                                            </td>
                                            <td className="py-3 px-4 text-xs max-w-[250px] truncate" style={{ color: "var(--text-muted)" }}>
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
                    <TablePagination
                        currentPage={page}
                        totalCount={totalCount}
                        pageSize={pageSize}
                        onPageChange={setPage}
                        onPageSizeChange={(size) => { setPageSize(size); setPage(1) }}
                    />
                </CardContent>
            </Card>

            {/* Row-Click Detail Modal */}
            <Dialog open={!!selectedLog} onOpenChange={(open) => { if (!open) setSelectedLog(null) }}>
                <DialogContent className="sm:max-w-xl max-h-[80vh] overflow-y-auto">
                    <div className="pr-8">
                        <DialogTitle className="text-base sm:text-xl font-bold flex items-center gap-2">
                            <Shield className="w-5 h-5 text-brand-green" />
                            Audit Event Details
                        </DialogTitle>
                    </div>

                    {selectedLog && (
                        <div className="space-y-4 mt-2">
                            {/* Action badge */}
                            <div className="flex items-center gap-3">
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${getActionColor(selectedLog.action)}`}>
                                    {formatAction(selectedLog.action)}
                                </span>
                                <span className="text-sm font-mono" style={{ color: "var(--text-muted)" }}>
                                    {new Date(selectedLog.createdAt).toLocaleString("en-GB")}
                                </span>
                            </div>

                            {/* Key-value fields */}
                            <div className="rounded-xl p-4 space-y-3" style={{ background: "var(--surface-secondary)", borderColor: "var(--border-default)", borderWidth: "1px" }}>
                                <div className="grid grid-cols-[100px_1fr] gap-2 text-sm">
                                    <span className="text-caption font-semibold uppercase text-xs">Entity</span>
                                    <span className="font-medium text-olive dark:text-off-white">{selectedLog.entity}</span>
                                </div>
                                <div className="grid grid-cols-[100px_1fr] gap-2 text-sm">
                                    <span className="text-caption font-semibold uppercase text-xs">Entity ID</span>
                                    <span className="font-mono text-xs break-all" style={{ color: "var(--text-secondary)" }}>{selectedLog.entityId}</span>
                                </div>
                                {selectedLog.userId && (
                                    <div className="grid grid-cols-[100px_1fr] gap-2 text-sm">
                                        <span className="text-caption font-semibold uppercase text-xs">User ID</span>
                                        <span className="font-mono text-xs break-all" style={{ color: "var(--text-secondary)" }}>{selectedLog.userId}</span>
                                    </div>
                                )}
                                {selectedLog.ipAddress && (
                                    <div className="grid grid-cols-[100px_1fr] gap-2 text-sm">
                                        <span className="text-caption font-semibold uppercase text-xs">IP Address</span>
                                        <span className="font-mono text-xs" style={{ color: "var(--text-secondary)" }}>{selectedLog.ipAddress}</span>
                                    </div>
                                )}
                            </div>

                            {/* Metadata JSON */}
                            {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (
                                <div className="space-y-2">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-caption">Metadata</h4>
                                    <pre className="text-xs font-mono p-4 rounded-xl overflow-auto max-h-[300px]"
                                        style={{ background: "var(--surface-secondary)", color: "var(--text-secondary)", borderColor: "var(--border-default)", borderWidth: "1px" }}
                                    >
                                        {JSON.stringify(selectedLog.metadata, null, 2)}
                                    </pre>
                                </div>
                            )}

                            <div className="flex justify-end pt-2">
                                <Button variant="outline" size="sm" onClick={() => setSelectedLog(null)}>
                                    Close
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
