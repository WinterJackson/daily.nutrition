"use client"

import { adminCancelBooking, adminRescheduleBooking, adminUpdateMeetLink, approvePaymentAndSendLink, BookingStatus, deleteBooking, updateBookingNotes, updateBookingStatus } from "@/app/actions/bookings"
import { fetchAvailability } from "@/app/actions/google-calendar"
import { TablePagination } from "@/components/admin/TablePagination"
import { Button } from "@/components/ui/Button"
import { ConfirmationDialog } from "@/components/ui/ConfirmationDialog"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/Dialog"
import { Input } from "@/components/ui/Input"
import { Calendar, CheckCircle, Clock, Copy, Edit3, Eye, FileText, Loader2, RefreshCw, Search, Trash2, User, Video, XCircle } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useRef, useState, useTransition } from "react"

interface Booking {
  id: string
  clientName: string
  clientEmail: string
  clientPhone: string | null
  serviceId: string | null
  serviceName: string
  sessionType: string
  scheduledAt: Date
  duration: number
  status: string
  referenceCode: string | null
  clientTimezone: string
  notes: string | null
  meetLink?: string
  createdAt: Date
  updatedAt: Date
}

interface BookingsClientProps {
  initialBookings: Booking[]
  totalCount: number
  currentPage: number
  pageSize: number
}

export function BookingsClient({ initialBookings, totalCount, currentPage, pageSize }: BookingsClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [bookings, setBookings] = useState(initialBookings)
  const [isPending, startTransition] = useTransition()
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [bookingToDelete, setBookingToDelete] = useState<string | null>(null)
  const [bookingToCancel, setBookingToCancel] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "")
  const [statusFilter, setStatusFilter] = useState<"ALL" | BookingStatus>((searchParams.get("status") as any) || "ALL")
  const [timeFilter, setTimeFilter] = useState<"all" | "upcoming" | "past" | "today">((searchParams.get("filter") as any) || "all")
  const [editNotes, setEditNotes] = useState("")
  const [manualMeetLink, setManualMeetLink] = useState("")
  const [isEditingLink, setIsEditingLink] = useState(false)
  const [newMeetLink, setNewMeetLink] = useState("")
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const allSelected = bookings.length > 0 && selectedIds.size === bookings.length
  const someSelected = selectedIds.size > 0

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(bookings.map(b => b.id)))
    }
  }

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedIds(next)
  }

  // URL-based navigation for server-side pagination and search
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  const pushParams = useCallback((overrides: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString())
    for (const [k, v] of Object.entries(overrides)) {
      if (v) params.set(k, v)
      else params.delete(k)
    }
    // Reset page to 1 when search/filter changes (unless page is explicitly set)
    if (!overrides.page) params.set("page", "1")
    router.push(`?${params.toString()}`)
    setSelectedIds(new Set()) // Clear selection on navigation
  }, [router, searchParams])

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      pushParams({ search: value })
    }, 400)
  }

  const handlePageChange = (page: number) => {
    pushParams({ page: String(page) })
  }

  const handlePageSizeChange = (size: number) => {
    pushParams({ pageSize: String(size), page: "1" })
  }

  // Reschedule state
  const [showReschedule, setShowReschedule] = useState(false)
  const [rescheduleDate, setRescheduleDate] = useState("")
  const [rescheduleTime, setRescheduleTime] = useState("")
  const [isRescheduling, setIsRescheduling] = useState(false)
  const [rescheduleError, setRescheduleError] = useState<string | null>(null)
  const [availableSlots, setAvailableSlots] = useState<{ time: string, available: boolean }[]>([])
  const [isLoadingSlots, setIsLoadingSlots] = useState(false)

  useEffect(() => {
    setBookings(initialBookings)
    setSelectedIds(new Set())
  }, [initialBookings])

  // Load slots when reschedule date changes
  useEffect(() => {
    if (!rescheduleDate) {
      setAvailableSlots([])
      return
    }
    async function load() {
      setIsLoadingSlots(true)
      const res = await fetchAvailability(rescheduleDate)
      if (res.success && res.slots) {
        setAvailableSlots(res.slots)
      } else {
        setAvailableSlots([])
      }
      setIsLoadingSlots(false)
      setRescheduleTime("")
    }
    load()
  }, [rescheduleDate])

  // Update URL with filter
  const handleTimeFilterChange = (filter: string) => {
    pushParams({ filter })
  }

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status as any)
    pushParams({ status: status === "ALL" ? "" : status })
  }

  // Bulk delete
  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selectedIds.size} booking(s)? This cannot be undone.`)) return
    startTransition(async () => {
      for (const id of selectedIds) {
        await deleteBooking(id)
      }
      router.refresh()
      setSelectedIds(new Set())
    })
  }

  // Bulk cancel
  const handleBulkCancel = async () => {
    if (!confirm(`Cancel ${selectedIds.size} booking(s)? Clients will be notified.`)) return
    startTransition(async () => {
      for (const id of selectedIds) {
        await adminCancelBooking(id)
      }
      router.refresh()
      setSelectedIds(new Set())
    })
  }

  const handleStatusChange = (id: string, status: BookingStatus) => {
    startTransition(async () => {
      await updateBookingStatus(id, status)
      setBookings(bookings.map(b => b.id === id ? { ...b, status } : b))
    })
  }

  const handleAdminCancel = () => {
    if (!bookingToCancel) return
    startTransition(async () => {
      const res = await adminCancelBooking(bookingToCancel)
      if (res.success) {
        setBookings(bookings.map(b => b.id === bookingToCancel ? { ...b, status: "CANCELLED" } : b))
        setBookingToCancel(null)
        if (selectedBooking?.id === bookingToCancel) {
          setSelectedBooking({ ...selectedBooking, status: "CANCELLED" })
        }
        router.refresh()
      }
    })
  }

  const handleAdminReschedule = async () => {
    if (!selectedBooking || !rescheduleDate || !rescheduleTime) {
      setRescheduleError("Please select both a date and time")
      return
    }
    setIsRescheduling(true)
    setRescheduleError(null)
    try {
      const res = await adminRescheduleBooking(selectedBooking.id, rescheduleDate, rescheduleTime)
      if (res.success) {
        setShowReschedule(false)
        setRescheduleDate("")
        setRescheduleTime("")
        router.refresh()
        setSelectedBooking(null)
      } else {
        setRescheduleError(res.error || "Failed to reschedule")
      }
    } catch {
      setRescheduleError("An error occurred while rescheduling")
    } finally {
      setIsRescheduling(false)
    }
  }

  const handleSaveNotes = (id: string) => {
    startTransition(async () => {
      await updateBookingNotes(id, editNotes)
      setBookings(bookings.map(b => b.id === id ? { ...b, notes: editNotes } : b))
      if (selectedBooking?.id === id) {
        setSelectedBooking({ ...selectedBooking, notes: editNotes })
      }
    })
  }

  const handleDelete = () => {
    if (!bookingToDelete) return
    startTransition(async () => {
      const res = await deleteBooking(bookingToDelete)
      if (res.success) {
        setBookings(bookings.filter(b => b.id !== bookingToDelete))
        setBookingToDelete(null)
        if (selectedBooking?.id === bookingToDelete) setSelectedBooking(null)
        router.refresh()
      }
    })
  }

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  // Server-side filtering — bookings are already filtered by the server action
  // No client-side filtering needed
  const filteredBookings = bookings

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ring-1 ring-inset bg-blue-50 text-blue-600 ring-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:ring-blue-800">
            <Calendar className="w-3 h-3 mr-1" />
            Confirmed
          </span>
        )
      case "COMPLETED":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ring-1 ring-inset bg-brand-green/5 text-brand-green ring-brand-green/20">
            <CheckCircle className="w-3 h-3 mr-1" />
            Completed
          </span>
        )
      case "CANCELLED":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ring-1 ring-inset bg-red-50 text-red-600 ring-red-200 dark:bg-red-900/20 dark:text-red-400 dark:ring-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            Cancelled
          </span>
        )
      case "NO_SHOW":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ring-1 ring-inset bg-orange/5 text-orange ring-orange/20">
            <Clock className="w-3 h-3 mr-1" />
            No Show
          </span>
        )
      case "PENDING":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ring-1 ring-inset bg-yellow-50 text-yellow-600 ring-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:ring-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </span>
        )
      default:
        return status
    }
  }

  const formatDateTime = (date: Date) => {
    const d = new Date(date)
    return {
      date: d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
      time: d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
    }
  }

  return (
    <>
      {/* Bulk Action Toolbar */}
      {someSelected && (
        <div className="p-3 border-b border-[var(--border-default)] flex items-center gap-3 bg-brand-green/5 dark:bg-brand-green/10 animate-in fade-in duration-200">
          <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            {selectedIds.size} selected
          </span>
          <Button size="sm" variant="outline" className="border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20" onClick={handleBulkCancel} disabled={isPending}>
            <XCircle className="w-3.5 h-3.5 mr-1.5" /> Cancel Selected
          </Button>
          <Button size="sm" variant="outline" className="border-red-500 text-red-700 hover:bg-red-100 dark:hover:bg-red-900/30" onClick={handleBulkDelete} disabled={isPending}>
            <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Delete Selected
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setSelectedIds(new Set())}>
            Clear
          </Button>
        </div>
      )}

      {/* Filters */}
      <div className="sticky top-0 z-10 p-4 border-b border-[var(--border-default)] flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center" style={{ background: "var(--surface-primary)" }}>
        <div className="relative w-full sm:w-auto sm:min-w-[280px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <Input
            placeholder="Search name, email, service, ref code..."
            className="pl-9 w-full surface-input"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            className="h-10 flex-1 sm:flex-none rounded-md surface-input border border-[var(--input-border)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green"
            value={statusFilter}
            onChange={(e) => handleStatusFilterChange(e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="NO_SHOW">No Show</option>
          </select>
          <select
            className="h-10 flex-1 sm:flex-none rounded-md surface-input border border-[var(--input-border)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green"
            value={timeFilter}
            onChange={(e) => {
              setTimeFilter(e.target.value as any)
              handleTimeFilterChange(e.target.value)
            }}
          >
            <option value="all">All Time</option>
            <option value="upcoming">Upcoming</option>
            <option value="today">Today</option>
            <option value="past">Past</option>
          </select>
        </div>
      </div>

      {/* Table — always horizontal-scrollable with no text wrap */}
      <div className="overflow-x-auto scrollbar-thin-1px">
        <table className="w-full min-w-[960px] text-sm text-left">
          <thead className="bg-[var(--surface-secondary)] text-[var(--text-muted)] border-b border-[var(--border-default)]">
            <tr>
              <th className="px-3 py-3.5 font-semibold whitespace-nowrap text-xs uppercase tracking-wider">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleSelectAll}
                  className="rounded border-neutral-300 dark:border-neutral-600 text-brand-green focus:ring-brand-green"
                />
              </th>
              <th className="px-5 py-3.5 font-semibold whitespace-nowrap text-xs uppercase tracking-wider">Status</th>
              <th className="px-5 py-3.5 font-semibold whitespace-nowrap text-xs uppercase tracking-wider">Client</th>
              <th className="px-5 py-3.5 font-semibold whitespace-nowrap text-xs uppercase tracking-wider">Service</th>
              <th className="px-5 py-3.5 font-semibold whitespace-nowrap text-xs uppercase tracking-wider">Date & Time</th>
              <th className="px-5 py-3.5 font-semibold whitespace-nowrap text-xs uppercase tracking-wider">Reference</th>
              <th className="px-5 py-3.5 font-semibold whitespace-nowrap text-xs uppercase tracking-wider">Type</th>
              <th className="px-5 py-3.5 font-semibold whitespace-nowrap text-xs uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-subtle)]">
            {filteredBookings.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-5 py-16 text-center" style={{ color: "var(--text-muted)" }}>
                  <div className="flex flex-col items-center gap-2">
                    <Calendar className="w-8 h-8 text-neutral-300 dark:text-neutral-600" />
                    <p className="font-medium">{bookings.length === 0 ? "No bookings yet" : "No matches found"}</p>
                    <p className="text-xs max-w-xs">{bookings.length === 0 ? "Bookings will appear here when clients book consultations." : "Try adjusting your search or filters."}</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredBookings.map((booking) => {
                const { date, time } = formatDateTime(booking.scheduledAt)
                return (
                  <tr key={booking.id} className="group hover:bg-brand-green/[0.02] dark:hover:bg-white/[0.02] transition-colors cursor-pointer" onClick={() => { setSelectedBooking(booking); setEditNotes(booking.notes || ""); setShowReschedule(false); setRescheduleError(null) }}>
                    <td className="px-3 py-3.5 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedIds.has(booking.id)}
                        onChange={() => toggleSelect(booking.id)}
                        className="rounded border-neutral-300 dark:border-neutral-600 text-brand-green focus:ring-brand-green"
                      />
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      {getStatusBadge(booking.status)}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="font-semibold text-olive dark:text-off-white text-sm">{booking.clientName}</div>
                      <div className="text-xs text-neutral-400 font-normal">{booking.clientEmail}</div>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-neutral-600 dark:text-neutral-300">
                      {booking.serviceName}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="font-medium text-olive dark:text-off-white">{date}</div>
                      <div className="text-xs text-neutral-400">{time} · {booking.duration}min</div>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      {booking.referenceCode ? (
                        <button
                          onClick={() => handleCopyCode(booking.referenceCode!)}
                          className="group/code inline-flex items-center gap-1.5 font-mono text-xs font-bold text-brand-green bg-brand-green/5 px-2 py-1 rounded-md hover:bg-brand-green/10 transition-colors"
                          title="Click to copy"
                        >
                          {booking.referenceCode}
                          {copiedCode === booking.referenceCode ? (
                            <CheckCircle className="w-3 h-3 text-brand-green" />
                          ) : (
                            <Copy className="w-3 h-3 text-neutral-400 group-hover/code:text-brand-green transition-colors" />
                          )}
                        </button>
                      ) : (
                        <span className="text-xs text-neutral-400">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium">
                        {booking.sessionType === "virtual" ? (
                          <><Video className="w-3.5 h-3.5 text-blue-500" /> Virtual</>
                        ) : (
                          <><User className="w-3.5 h-3.5 text-purple-500" /> In-Person</>
                        )}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-0.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-neutral-400 hover:text-blue-500 hover:bg-blue-500/10 rounded-full"
                          onClick={() => {
                            setSelectedBooking(booking)
                            setEditNotes(booking.notes || "")
                            setShowReschedule(false)
                            setRescheduleError(null)
                          }}
                          disabled={isPending}
                          data-tooltip="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {booking.status === "CONFIRMED" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-neutral-400 hover:text-brand-green hover:bg-brand-green/10 rounded-full"
                            onClick={() => handleStatusChange(booking.id, "COMPLETED")}
                            disabled={isPending}
                            data-tooltip="Mark Completed"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-neutral-400 hover:text-red-500 hover:bg-red-500/10 rounded-full"
                          onClick={() => setBookingToDelete(booking.id)}
                          disabled={isPending}
                          data-tooltip="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <TablePagination
        currentPage={currentPage}
        totalCount={totalCount}
        pageSize={pageSize}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />

      {/* Detail Modal */}
      <Dialog open={!!selectedBooking} onOpenChange={(open) => { if (!open) { setSelectedBooking(null); setShowReschedule(false); setRescheduleError(null) } }}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="pr-8">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <DialogTitle className="text-xl font-bold truncate">
                  {selectedBooking?.clientName}
                </DialogTitle>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                  {selectedBooking?.clientEmail}
                  {selectedBooking?.clientPhone && ` • ${selectedBooking.clientPhone}`}
                </p>
              </div>
              {selectedBooking && (
                <div className="shrink-0 mt-1">
                  {getStatusBadge(selectedBooking.status)}
                </div>
              )}
            </div>
          </div>

          {/* Reference Code */}
          {selectedBooking?.referenceCode && (
            <div className="flex items-center gap-3 bg-brand-green/5 dark:bg-brand-green/10 p-3 rounded-xl border border-brand-green/20">
              <span className="text-xs font-bold uppercase text-neutral-500 tracking-wider">Ref Code</span>
              <button
                onClick={() => handleCopyCode(selectedBooking.referenceCode!)}
                className="font-mono text-lg font-bold text-brand-green hover:text-brand-green/80 transition-colors inline-flex items-center gap-2"
              >
                {selectedBooking.referenceCode}
                {copiedCode === selectedBooking.referenceCode ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4 text-neutral-400" />
                )}
              </button>
            </div>
          )}

          {/* Booking Details */}
          <div className="bg-neutral-50 dark:bg-white/5 rounded-xl p-4 border border-neutral-100 dark:border-white/5 space-y-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-orange" />
              <span className="font-medium text-olive dark:text-off-white">
                {selectedBooking && formatDateTime(selectedBooking.scheduledAt).date} at {selectedBooking && formatDateTime(selectedBooking.scheduledAt).time}
              </span>
              {selectedBooking?.clientTimezone && (
                <span className="text-xs text-neutral-400">({selectedBooking.clientTimezone})</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-brand-green" />
              <span>{selectedBooking?.serviceName}</span>
              <span className="text-xs text-neutral-400">({selectedBooking?.duration} min)</span>
            </div>
            <div className="flex items-center gap-2">
              {selectedBooking?.sessionType === "virtual" ? (
                <><Video className="w-4 h-4 text-blue-500" /> Virtual Session</>
              ) : (
                <><User className="w-4 h-4 text-purple-500" /> In-Person Visit</>
              )}
            </div>
          </div>

          {/* Admin Meet Link Editor (for CONFIRMED Virtual Sessions) */}
          {selectedBooking?.sessionType === "virtual" && selectedBooking?.status === "CONFIRMED" && (
              <div className="surface-secondary rounded-xl p-5 space-y-4 border border-blue-500/20">
                <div className="flex items-center gap-2 text-blue-500 font-bold text-sm">
                  <Video className="w-4 h-4" />
                  Meeting Link
                </div>
                
                {isEditingLink ? (
                  <div className="space-y-3">
                    <Input 
                      placeholder="https://meet.google.com/xxx-xxxx-xxx"
                      value={newMeetLink}
                      onChange={(e) => setNewMeetLink(e.target.value)}
                      className="bg-white dark:bg-black/20 font-mono text-sm"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        className="bg-blue-600 hover:bg-blue-700"
                        onClick={() => {
                          startTransition(async () => {
                            if (selectedBooking) {
                               const res = await adminUpdateMeetLink(selectedBooking.id, newMeetLink)
                               if (res.success) {
                                 setBookings(bookings.map(b => b.id === selectedBooking.id ? { ...b, meetLink: newMeetLink.trim() } : b))
                                 setSelectedBooking({...selectedBooking, meetLink: newMeetLink.trim()})
                                 setIsEditingLink(false)
                                 setNewMeetLink("")
                                 router.refresh()
                                 alert("Meeting link updated and client notified!")
                               } else {
                                 alert(res.error || "Failed to update link")
                               }
                            }
                          })
                        }}
                        disabled={isPending || !newMeetLink.trim()}
                      >
                        {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                        Save & Notify Client
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => { setIsEditingLink(false); setNewMeetLink(""); }} disabled={isPending}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    {selectedBooking.meetLink ? (
                      <>
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto" asChild>
                          <a href={selectedBooking.meetLink} target="_blank" rel="noreferrer">
                            Join Call
                          </a>
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => {
                            navigator.clipboard.writeText(selectedBooking.meetLink!)
                            setCopiedCode("link_" + selectedBooking.id)
                            setTimeout(() => setCopiedCode(null), 2000)
                          }}
                        >
                          {copiedCode === "link_" + selectedBooking.id ? <CheckCircle className="w-4 h-4 mr-2 text-green-500" /> : <Copy className="w-4 h-4 mr-2" />}
                          Copy Link
                        </Button>
                      </>
                    ) : (
                      <span className="text-sm text-neutral-500 italic">No link available.</span>
                    )}
                    
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="text-neutral-500 sm:ml-auto"
                      onClick={() => { 
                        setNewMeetLink(selectedBooking.meetLink || "")
                        setIsEditingLink(true) 
                      }}
                    >
                      <Edit3 className="w-4 h-4 mr-2" />
                      Change Link
                    </Button>
                  </div>
                )}
              </div>
          )}

          {/* Admin Reschedule Form */}
          {showReschedule && selectedBooking?.status === "CONFIRMED" && (
            <div className="surface-secondary rounded-xl p-5 space-y-4 border border-brand-green/20 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center gap-2 text-brand-green font-bold text-sm">
                <RefreshCw className="w-4 h-4" />
                Reschedule Appointment
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-neutral-500 tracking-wider">New Date</label>
                  <Input
                    type="date"
                    value={rescheduleDate}
                    onChange={(e) => setRescheduleDate(e.target.value)}
                    min={new Date(Date.now() + 86400000).toISOString().split("T")[0]}
                    className="bg-white dark:bg-black/20"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-neutral-500 tracking-wider">New Time</label>
                  <select
                    value={rescheduleTime}
                    onChange={(e) => setRescheduleTime(e.target.value)}
                    className="w-full h-10 rounded-md border border-neutral-200 dark:border-white/10 bg-white dark:bg-black/20 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green"
                    disabled={isLoadingSlots || !rescheduleDate || availableSlots.length === 0}
                  >
                    <option value="">
                      {!rescheduleDate ? "Pick a date first" : isLoadingSlots ? "Loading slots..." : availableSlots.length === 0 ? "No slots available" : "Select a time"}
                    </option>
                    {availableSlots.map(slot => (
                      <option key={slot.time} value={slot.time} disabled={!slot.available}>
                        {new Date(slot.time).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZone: selectedBooking?.clientTimezone || "Africa/Nairobi" })}
                        {!slot.available ? " (Booked)" : ""}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {rescheduleError && (
                <div className="text-sm text-red-500 font-medium bg-red-50 dark:bg-red-900/10 p-3 rounded-lg flex items-center gap-2">
                  <XCircle className="w-4 h-4 shrink-0" />
                  {rescheduleError}
                </div>
              )}

              <div className="flex gap-3 justify-end">
                <Button variant="outline" size="sm" onClick={() => { setShowReschedule(false); setRescheduleError(null) }}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  className="bg-brand-green hover:bg-brand-green/90"
                  onClick={handleAdminReschedule}
                  disabled={isRescheduling || !rescheduleDate || !rescheduleTime}
                >
                  {isRescheduling ? (
                    <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Rescheduling...</>
                  ) : (
                    "Confirm Reschedule"
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Notes Section */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-olive dark:text-off-white">Admin Notes</label>
            <textarea
              className="w-full h-24 rounded-lg border border-neutral-200 dark:border-white/10 bg-white dark:bg-black/20 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green resize-none"
              placeholder="Add private notes about this booking..."
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
            />
            <Button 
              size="sm" 
              onClick={() => selectedBooking && handleSaveNotes(selectedBooking.id)}
              disabled={isPending}
              className="bg-brand-green hover:bg-brand-green/90"
            >
              Save Notes
            </Button>
          </div>

          {/* Status Actions */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-neutral-100 dark:border-white/10">
            {selectedBooking?.status === "CONFIRMED" && (
              <>
                <Button 
                  size="sm" 
                  className="bg-brand-green hover:bg-brand-green/90"
                  onClick={() => {
                    if (selectedBooking) handleStatusChange(selectedBooking.id, "COMPLETED")
                    setSelectedBooking(null)
                  }}
                >
                  <CheckCircle className="w-4 h-4 mr-2" /> Mark Completed
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  className="border-blue-300 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  onClick={() => {
                    setShowReschedule(!showReschedule)
                    setRescheduleError(null)
                  }}
                >
                  <RefreshCw className="w-4 h-4 mr-2" /> Reschedule
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  className="border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                  onClick={() => {
                    if (selectedBooking) setBookingToCancel(selectedBooking.id)
                  }}
                >
                  <XCircle className="w-4 h-4 mr-2" /> Cancel
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  className="border-orange/50 text-orange hover:bg-orange/10"
                  onClick={() => {
                    if (selectedBooking) handleStatusChange(selectedBooking.id, "NO_SHOW")
                    setSelectedBooking(null)
                  }}
                >
                  <Clock className="w-4 h-4 mr-2" /> No Show
                </Button>
              </>
            )}

            {selectedBooking?.status === "PENDING" && (
              <div className="flex flex-col gap-3 w-full">
                {selectedBooking.sessionType === "virtual" && (
                  <div className="space-y-2 surface-secondary p-4 rounded-xl border border-neutral-100 dark:border-white/5">
                    <label className="text-xs font-bold uppercase text-neutral-500 tracking-wider flex items-center gap-2">
                       <Video className="w-4 h-4 text-blue-500" /> Manual Meeting Link
                    </label>
                    <p className="text-xs text-neutral-400 leading-relaxed mb-2">
                      Because you are using a standard @gmail.com account, the system cannot auto-generate Google Meet links. Paste a Meet or Zoom link below to instantly sync it to the client's confirmation email.
                    </p>
                    <Input 
                      placeholder="e.g. https://meet.google.com/xxx-xxxx-xxx" 
                      value={manualMeetLink}
                      onChange={(e) => setManualMeetLink(e.target.value)}
                      className="bg-white dark:bg-black/20 font-mono text-sm border-neutral-200 dark:border-white/10"
                    />
                  </div>
                )}
                
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <Button 
                    size="sm" 
                    className="bg-brand-green hover:bg-brand-green/90 animate-pulse border-brand-green shadow-xl shadow-brand-green/20 flex-1 sm:flex-none"
                    onClick={() => {
                      startTransition(async () => {
                        if (selectedBooking) {
                           const res = await approvePaymentAndSendLink(selectedBooking.id, manualMeetLink)
                           if (res.success) {
                             setBookings(bookings.map(b => b.id === selectedBooking.id ? { ...b, status: "CONFIRMED" } : b))
                             setSelectedBooking({...selectedBooking, status: "CONFIRMED"})
                             setManualMeetLink("") // Clear on success
                             router.refresh()
                           } else {
                             alert(res.error || "Failed to verify payment and release link.")
                           }
                        }
                      })
                    }}
                    disabled={isPending}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" /> Verify Payment & Send Link
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex-1 sm:flex-none"
                    onClick={() => {
                      if (selectedBooking) setBookingToCancel(selectedBooking.id)
                    }}
                  >
                    <XCircle className="w-4 h-4 mr-2" /> Reject & Cancel
                  </Button>
                </div>
              </div>
            )}

            <Button variant="outline" size="sm" onClick={() => setSelectedBooking(null)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Cancel Confirmation Modal */}
      <ConfirmationDialog 
        open={!!bookingToCancel} 
        onOpenChange={(open) => !open && setBookingToCancel(null)}
        title="Cancel Booking"
        description="This will cancel the booking, remove it from Google Calendar, and send a cancellation email to the client. Continue?"
        confirmText="Cancel Booking"
        variant="destructive"
        onConfirm={handleAdminCancel}
        isLoading={isPending}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationDialog 
        open={!!bookingToDelete} 
        onOpenChange={(open) => !open && setBookingToDelete(null)}
        title="Delete Booking"
        description="Are you sure you want to delete this booking? This action cannot be undone."
        confirmText="Delete Permanently"
        variant="destructive"
        onConfirm={handleDelete}
        isLoading={isPending}
      />
    </>
  )
}
