"use client"

import { BookingStatus, deleteBooking, updateBookingNotes, updateBookingStatus } from "@/app/actions/bookings"
import { Button } from "@/components/ui/Button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/Dialog"
import { Input } from "@/components/ui/Input"
import { Calendar, CheckCircle, Clock, Eye, FileText, Search, Trash2, User, Video, XCircle } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState, useTransition } from "react"

interface Booking {
  id: string
  calendlyId: string | null
  clientName: string
  clientEmail: string
  clientPhone: string | null
  serviceId: string | null
  serviceName: string
  sessionType: string
  scheduledAt: Date
  duration: number
  status: string
  notes: string | null
  createdAt: Date
  updatedAt: Date
}

interface BookingsClientProps {
  initialBookings: Booking[]
}

export function BookingsClient({ initialBookings }: BookingsClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [bookings, setBookings] = useState(initialBookings)
  const [isPending, startTransition] = useTransition()
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [bookingToDelete, setBookingToDelete] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"ALL" | BookingStatus>("ALL")
  const [timeFilter, setTimeFilter] = useState<"all" | "upcoming" | "past" | "today">("all")
  const [editNotes, setEditNotes] = useState("")

  useEffect(() => {
    setBookings(initialBookings)
  }, [initialBookings])

  // Update URL with filter
  const handleTimeFilterChange = (filter: string) => {
    const params = new URLSearchParams(searchParams)
    params.set("filter", filter)
    router.push(`?${params.toString()}`)
  }

  const handleStatusChange = (id: string, status: BookingStatus) => {
    startTransition(async () => {
      await updateBookingStatus(id, status)
      setBookings(bookings.map(b => b.id === id ? { ...b, status } : b))
    })
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

  // Client-side filtering
  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.clientName.toLowerCase().includes(searchQuery.toLowerCase()) || 
      booking.clientEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.serviceName.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === "ALL" || booking.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

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
      {/* Filters */}
      <div className="p-4 border-b border-neutral-100 dark:border-white/5 flex flex-col sm:flex-row gap-4 justify-between items-center bg-white/50 dark:bg-white/[0.02]">
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-500" />
          <Input
            placeholder="Search by name, email, or service..."
            className="pl-9 w-full sm:w-64 bg-white dark:bg-black/20 border-neutral-200 dark:border-white/10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap">
          <select
            className="h-10 rounded-md border border-neutral-200 dark:border-white/10 bg-white dark:bg-black/20 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
          >
            <option value="ALL">All Statuses</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="NO_SHOW">No Show</option>
          </select>
          <select
            className="h-10 rounded-md border border-neutral-200 dark:border-white/10 bg-white dark:bg-black/20 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green"
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

      {/* Table */}
      <div className="overflow-x-auto scrollbar-thin-1px lg:overflow-visible">
        <table className="w-full text-sm text-left">
          <thead className="bg-neutral-50/50 dark:bg-white/[0.02] text-neutral-500 dark:text-neutral-400 font-medium">
            <tr>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold">Client</th>
              <th className="px-6 py-4 font-semibold">Service</th>
              <th className="px-6 py-4 font-semibold">Date & Time</th>
              <th className="px-6 py-4 font-semibold">Type</th>
              <th className="px-6 py-4 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 dark:divide-white/5">
            {filteredBookings.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-neutral-500">
                  {bookings.length === 0 ? "No bookings found. Bookings will appear here when synced from Calendly." : "No bookings match your filters."}
                </td>
              </tr>
            ) : (
              filteredBookings.map((booking) => {
                const { date, time } = formatDateTime(booking.scheduledAt)
                return (
                  <tr key={booking.id} className="group hover:bg-neutral-50 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      {getStatusBadge(booking.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-olive dark:text-off-white">{booking.clientName}</div>
                      <div className="text-xs text-neutral-400 font-normal">{booking.clientEmail}</div>
                    </td>
                    <td className="px-6 py-4 text-neutral-600 dark:text-neutral-300">
                      {booking.serviceName}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-olive dark:text-off-white">{date}</div>
                      <div className="text-xs text-neutral-400">{time} ({booking.duration} min)</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 text-xs">
                        {booking.sessionType === "virtual" ? (
                          <><Video className="w-3 h-3" /> Virtual</>
                        ) : (
                          <><User className="w-3 h-3" /> In-Person</>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-neutral-400 hover:text-blue-500 hover:bg-blue-500/10 rounded-full"
                          onClick={() => {
                            setSelectedBooking(booking)
                            setEditNotes(booking.notes || "")
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

      {/* Detail Modal */}
      <Dialog open={!!selectedBooking} onOpenChange={(open) => !open && setSelectedBooking(null)}>
        <DialogContent className="sm:max-w-xl">
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

          {/* Booking Details */}
          <div className="bg-neutral-50 dark:bg-white/5 rounded-xl p-4 border border-neutral-100 dark:border-white/5 space-y-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-orange" />
              <span className="font-medium text-olive dark:text-off-white">
                {selectedBooking && formatDateTime(selectedBooking.scheduledAt).date} at {selectedBooking && formatDateTime(selectedBooking.scheduledAt).time}
              </span>
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
                  className="border-red-300 text-red-600 hover:bg-red-50"
                  onClick={() => {
                    if (selectedBooking) handleStatusChange(selectedBooking.id, "CANCELLED")
                    setSelectedBooking(null)
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
            <Button variant="outline" size="sm" onClick={() => setSelectedBooking(null)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={!!bookingToDelete} onOpenChange={(open) => !open && setBookingToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Booking</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this booking? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBookingToDelete(null)}>Cancel</Button>
            <Button 
              className="bg-red-500 hover:bg-red-600 text-white" 
              onClick={handleDelete}
              disabled={isPending}
            >
              {isPending ? "Deleting..." : "Delete Permanently"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
