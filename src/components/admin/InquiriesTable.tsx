"use client"

import {
    addInquiryNote,
    archiveInquiry,
    assignInquiry,
    deleteInquiry,
    InquiryStatus,
    markAsRead,
    replyToInquiry,
    toggleStarred,
    updateInquiryStatus,
} from "@/app/actions/inquiries"
import { InquiryNotesDrawer } from "@/components/admin/inquiries/InquiryNotesDrawer"
import { TablePagination } from "@/components/admin/TablePagination"
import { Button } from "@/components/ui/Button"
import { ConfirmationDialog } from "@/components/ui/ConfirmationDialog"
import { Input } from "@/components/ui/Input"
import { Textarea } from "@/components/ui/Textarea"
import {
    ArrowLeft,
    CheckCircle,
    History,
    Mail,
    PanelRight,
    Search,
    Send,
    Star,
    Trash2
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState, useTransition } from "react"

// Types matching the Prisma include structure
interface InquiryNote {
  id: string
  content: string
  userName: string
  createdAt: Date
}

interface InquiryReply {
  id: string
  content: string
  sentBy: string | null
  sentAt: Date
}

interface AssignedUser {
  id: string
  name: string | null
  email: string
}

interface Inquiry {
  id: string
  name: string
  email: string
  message: string
  statusString: string
  isStarred: boolean
  isArchived: boolean
  isRead: boolean
  createdAt: Date
  notes: InquiryNote[]
  replies: InquiryReply[]
  assignedTo: AssignedUser | null
  assignedToId: string | null
}

interface InquiriesTableProps {
  inquiries: Inquiry[] // Passed from server
  users: { id: string; name: string | null; email: string; role: string }[]
  totalCount: number
  currentPage: number
  pageSize: number
}

export function InquiriesTable({
  inquiries: initialInquiries,
  users,
  totalCount,
  currentPage,
  pageSize,
}: InquiriesTableProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  // Local state for optimistic updates
  const [inquiries, setInquiries] = useState<Inquiry[]>(initialInquiries)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  // Filters
  const [searchQuery, setSearchQuery] = useState("")
  const [listFilter, setListFilter] = useState<"ALL" | "UNREAD" | "STARRED">("ALL")

  // Detail Panes
  const [isNotesDrawerOpen, setIsNotesDrawerOpen] = useState(false)
  const [replyText, setReplyText] = useState("")
  const [inquiryToDelete, setInquiryToDelete] = useState<string | null>(null)

  useEffect(() => {
    setInquiries(initialInquiries)
    setSelectedIds(new Set())
  }, [initialInquiries])

  // Current Selection
  const selectedInquiry = inquiries.find((i) => i.id === selectedId) || null

  // --------------------------------------------------------
  // Selection Logic
  // --------------------------------------------------------
  const filteredInquiries = inquiries
    .filter((i) => !i.isArchived)
    .filter((i) => {
      const matchesSearch =
        i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        i.email.toLowerCase().includes(searchQuery.toLowerCase())

      if (listFilter === "UNREAD") return matchesSearch && !i.isRead
      if (listFilter === "STARRED") return matchesSearch && i.isStarred
      return matchesSearch
    })

  const allSelected = filteredInquiries.length > 0 && selectedIds.size === filteredInquiries.length
  const someSelected = selectedIds.size > 0 && selectedIds.size < filteredInquiries.length

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredInquiries.map((i) => i.id)))
    }
  }

  const toggleSelect = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation()
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedIds(newSelected)
  }

  // --------------------------------------------------------
  // Actions
  // --------------------------------------------------------
  const handleSelectInquiry = (inquiry: Inquiry) => {
    setSelectedId(inquiry.id)
    if (!inquiry.isRead) {
      startTransition(async () => {
        await markAsRead(inquiry.id)
        setInquiries((prev) =>
          prev.map((i) => (i.id === inquiry.id ? { ...i, isRead: true } : i))
        )
      })
    }
  }

  const handleToggleStar = (e: React.MouseEvent, id: string, current: boolean) => {
    e.stopPropagation()
    startTransition(async () => {
      // Optimistic
      setInquiries((prev) =>
        prev.map((i) => (i.id === id ? { ...i, isStarred: !current } : i))
      )
      await toggleStarred(id)
    })
  }

  const handleMarkAsReadIcon = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    startTransition(async () => {
        setInquiries((prev) =>
          prev.map((i) => (i.id === id ? { ...i, isRead: true } : i))
        )
        await markAsRead(id)
    })
  }

  const handleUpdateStatus = (id: string, status: InquiryStatus) => {
    startTransition(async () => {
      setInquiries((prev) =>
        prev.map((i) => (i.id === id ? { ...i, statusString: status } : i))
      )
      await updateInquiryStatus(id, status)
    })
  }

  const handleAssign = (id: string, userId: string | null) => {
    startTransition(async () => {
      const assignedUser = userId ? users.find((u) => u.id === userId) || null : null
      
      // We process the server action first to get the generated system note text
      const res = await assignInquiry(id, userId)

      if (res.success) {
        setInquiries((prev) =>
          prev.map((i) => {
            if (i.id !== id) return i
            
            return {
              ...i,
              assignedToId: userId,
              assignedTo: assignedUser as any,
              isRead: true, // Assigning auto-reads
              notes: [
                {
                  id: "temp-assign-" + Date.now(),
                  content: `Assigned to ${res.assignedUserName || "System"} by You`,
                  userName: "System",
                  createdAt: new Date(),
                },
                ...i.notes,
              ],
            }
          })
        )
      }
    })
  }

  const handleArchive = (id: string) => {
    startTransition(async () => {
      setInquiries((prev) => prev.filter((i) => i.id !== id))
      setSelectedId(null)
      await archiveInquiry(id)
    })
  }

  const handleBulkArchive = () => {
    startTransition(async () => {
      setInquiries((prev) => prev.filter((i) => !selectedIds.has(i.id)))
      if (selectedId && selectedIds.has(selectedId)) {
        setSelectedId(null)
      }
      setSelectedIds(new Set())
      
      for (const id of selectedIds) {
        await archiveInquiry(id)
      }
    })
  }

  const handleBulkDelete = () => {
    startTransition(async () => {
      for (const id of selectedIds) {
          await deleteInquiry(id)
      }
      setInquiries((prev) => prev.filter((i) => !selectedIds.has(i.id)))
      if (selectedId && selectedIds.has(selectedId)) {
        setSelectedId(null)
      }
      setSelectedIds(new Set())
    })
  }

  const handleDelete = () => {
    if (!inquiryToDelete) return
    startTransition(async () => {
      await deleteInquiry(inquiryToDelete)
      setInquiries((prev) => prev.filter((i) => i.id !== inquiryToDelete))
      if (selectedId === inquiryToDelete) setSelectedId(null)
      setInquiryToDelete(null)
    })
  }

  const handleSendReply = () => {
    if (!selectedInquiry || !replyText.trim()) return
    const text = replyText
    startTransition(async () => {
      const res = await replyToInquiry(selectedInquiry.id, text)
      if (res.success) {
        setReplyText("")
        setInquiries((prev) =>
          prev.map((i) => {
            if (i.id !== selectedInquiry.id) return i
            return {
              ...i,
              statusString: "CONTACTED",
              replies: [
                ...i.replies,
                {
                  id: "temp-" + Date.now(),
                  content: text,
                  sentBy: "Me", // Mock
                  sentAt: new Date(),
                },
              ],
            }
          })
        )
      } else {
        alert("Failed to send reply. Please try again.")
      }
    })
  }

  const handleAddNote = (text: string) => {
    if (!selectedInquiry || !text.trim()) return
    startTransition(async () => {
      const res = await addInquiryNote(selectedInquiry.id, text)
      if (res.success) {
        setInquiries((prev) =>
          prev.map((i) => {
            if (i.id !== selectedInquiry.id) return i
            return {
              ...i,
              notes: [
                {
                  id: "temp-" + Date.now(),
                  content: text,
                  userName: "System",
                  createdAt: new Date(),
                },
                ...i.notes,
              ],
            }
          })
        )
      }
    })
  }

  const copyToClipboard = (text: string) => {
      navigator.clipboard.writeText(text)
  }

  // --------------------------------------------------------
  // Utilities & Rendering
  // --------------------------------------------------------
  const getGmailReplyUrl = (inquiry: Inquiry) => {
    const subject = encodeURIComponent(`Re: Your Inquiry to Edwak Nutrition`)
    const body = encodeURIComponent(
      `Hi ${inquiry.name},\n\nThank you for reaching out to Edwak Nutrition.\n\n---\n\nBest regards,\nEdwak Nutrition Team`
    )
    return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
      inquiry.email
    )}&su=${subject}&body=${body}`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "NEW": return "border-orange text-orange"
      case "CONTACTED": return "border-blue-500 text-blue-500"
      case "CLOSED": return "border-brand-green text-brand-green"
      default: return "border-neutral-300 text-neutral-500"
    }
  }

  return (
    <div className="flex flex-1 gap-4 md:gap-6 min-h-0 relative h-full w-full">
      {/* ----------------------------------------------------- */}
      {/* LEFT PANE: LEAD LIST / INBOX */}
      {/* ----------------------------------------------------- */}
      <div className={`w-full lg:w-80 xl:w-96 flex flex-col shrink-0 bg-white/90 dark:bg-[#121212]/90 backdrop-blur-md rounded-[10px] border border-neutral-200 dark:border-white/10 shadow-xl overflow-hidden transition-all duration-300 ${selectedId ? 'hidden lg:flex' : 'flex'}`}>
        
        {/* Header / Search */}
        <div className="p-4 border-b border-neutral-100 dark:border-white/5 space-y-4 shrink-0 bg-neutral-50/50 dark:bg-white/[0.02]">
          {selectedIds.size > 0 ? (
             <div className="flex flex-wrap items-center gap-2 animate-in fade-in">
                 <span className="text-sm font-semibold">{selectedIds.size} selected</span>
                 <Button size="sm" variant="outline" className="border-neutral-300 hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800" onClick={handleBulkArchive} disabled={isPending}>
                     Archive
                 </Button>
                 <Button size="sm" variant="outline" className="border-red-300 text-red-600 hover:bg-red-50" onClick={handleBulkDelete} disabled={isPending}>
                     <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
                 </Button>
             </div>
          ) : (
            <>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
                <Input
                  placeholder="Search leads..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-white dark:bg-black/40 border-neutral-200 dark:border-white/10 rounded-full h-9 shadow-sm"
                />
              </div>
              <div className="flex gap-1 bg-neutral-100 dark:bg-black/40 p-1 rounded-lg">
                <button
                  onClick={() => setListFilter("ALL")}
                  className={`flex-1 text-[11px] font-bold uppercase tracking-wider py-1.5 rounded-md transition-all ${
                    listFilter === "ALL"
                      ? "bg-white text-charcoal dark:bg-white/10 dark:text-white shadow-sm"
                      : "text-neutral-500 hover:text-charcoal dark:hover:text-white"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setListFilter("UNREAD")}
                  className={`flex-1 text-[11px] font-bold uppercase tracking-wider py-1.5 rounded-md transition-all ${
                    listFilter === "UNREAD"
                      ? "bg-white text-brand-green dark:bg-brand-green/20 dark:text-brand-green shadow-sm"
                      : "text-neutral-500 hover:text-charcoal dark:hover:text-white"
                  }`}
                >
                  Unread
                </button>
                <button
                  onClick={() => setListFilter("STARRED")}
                  className={`flex-1 flex justify-center items-center gap-1 text-[11px] font-bold uppercase tracking-wider py-1.5 rounded-md transition-all ${
                    listFilter === "STARRED"
                      ? "bg-white text-yellow-500 dark:bg-yellow-500/20 dark:text-yellow-400 shadow-sm"
                      : "text-neutral-500 hover:text-charcoal dark:hover:text-white"
                  }`}
                >
                  <Star className="w-3 h-3" />
                  Starred
                </button>
              </div>
            </>
          )}
        </div>

        {/* Lead List Scroll */}
        <div className="flex-1 overflow-y-auto">
          {filteredInquiries.length === 0 ? (
            <div className="p-8 text-center text-neutral-400 text-sm">
              No leads found matching your criteria.
            </div>
          ) : (
            <div className="divide-y divide-neutral-100 dark:divide-white/5">
              {/* Header row with select-all */}
              <div className="px-4 py-3 bg-neutral-50/50 dark:bg-white/[0.02] border-b border-neutral-100 dark:border-white/5 flex items-center gap-4">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleSelectAll}
                    className="rounded border-neutral-300 dark:border-neutral-600 text-brand-green focus:ring-brand-green mt-0.5"
                  />
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">Select All Leads</span>
              </div>
              {filteredInquiries.map((inquiry) => (
                <div
                  key={inquiry.id}
                  onClick={() => handleSelectInquiry(inquiry)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      handleSelectInquiry(inquiry)
                    }
                  }}
                  tabIndex={0}
                  className={`w-full text-left p-4 hover:bg-neutral-50 dark:hover:bg-white/[0.04] transition-all group relative cursor-pointer ${
                    selectedId === inquiry.id
                      ? "bg-neutral-50 dark:bg-white/[0.06] shadow-inner"
                      : ""
                  } ${!inquiry.isRead ? "border-l-2 border-brand-green" : "border-l-2 border-transparent"}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="pt-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedIds.has(inquiry.id)}
                        onChange={(e) => toggleSelect(inquiry.id, e)}
                        className="rounded border-neutral-300 dark:border-neutral-600 text-brand-green focus:ring-brand-green"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1 gap-2">
                        <div className={`text-sm truncate pr-4 relative ${!inquiry.isRead ? 'font-bold text-charcoal dark:text-white' : 'font-medium text-neutral-700 dark:text-neutral-300'}`}>
                          {inquiry.name}
                        </div>
                        <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-400 whitespace-nowrap flex-shrink-0 mt-0.5">
                          {new Date(inquiry.createdAt).toLocaleDateString([], {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                      <div className="flex justify-between items-start gap-2 h-5">
                        <div className="text-xs text-neutral-500 truncate flex-1">
                          {inquiry.message}
                        </div>
                        {inquiry.isStarred && (
                          <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500 flex-shrink-0 mt-0.5" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Absolute Quick Actions (Xinteck CRM Pattern) */}
                  <div className="absolute right-2 bottom-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 dark:bg-[#121212]/90 backdrop-blur-sm px-2 py-1 flex items-center gap-2 rounded-md shadow-sm border border-neutral-200 dark:border-white/10">
                      <button 
                         className="text-neutral-400 hover:text-yellow-500 transition-colors p-1"
                         onClick={(e) => handleToggleStar(e, inquiry.id, inquiry.isStarred)}
                      >
                         <Star className={`w-3.5 h-3.5 ${inquiry.isStarred ? 'fill-yellow-500 text-yellow-500' : ''}`} />
                      </button>
                      {!inquiry.isRead && (
                          <button 
                            className="text-neutral-400 hover:text-brand-green transition-colors p-1"
                            onClick={(e) => handleMarkAsReadIcon(e, inquiry.id)}
                            title="Mark as Read"
                          >
                             <CheckCircle className="w-3.5 h-3.5" />
                          </button>
                      )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Pagination Footer */}
        {totalCount > pageSize && (
            <div className="border-t border-neutral-100 dark:border-white/5 bg-white dark:bg-black/20 shrink-0">
                <TablePagination
                    currentPage={currentPage}
                    totalCount={totalCount}
                    pageSize={pageSize}
                    onPageChange={(p) => {
                        const params = new URLSearchParams(window.location.search)
                        params.set("page", p.toString())
                        router.push(`/admin/inquiries?${params.toString()}`)
                    }}
                />
            </div>
        )}
      </div>

      {/* ----------------------------------------------------- */}
      {/* RIGHT PANE: DETAIL VIEWER */}
      {/* ----------------------------------------------------- */}
      <div
        className={`flex-1 flex bg-white/90 dark:bg-[#121212]/90 backdrop-blur-md rounded-[10px] border border-neutral-200 dark:border-white/10 shadow-xl overflow-hidden relative transition-all duration-300 ${
          !selectedId ? "hidden lg:flex" : "flex"
        }`}
      >
        {!selectedInquiry ? (
          <div className="flex-1 flex flex-col items-center justify-center text-neutral-400 p-8 text-center shrink-0 w-full h-full">
            <div className="w-16 h-16 rounded-full bg-neutral-100 dark:bg-white/5 flex items-center justify-center mb-4 border border-neutral-200 dark:border-white/10 shadow-sm">
              <Mail className="w-8 h-8 text-neutral-300" />
            </div>
            <p className="text-lg font-medium text-neutral-600 dark:text-neutral-300">
              Zero Inbox
            </p>
            <p className="text-sm mt-1 max-w-sm">
              Select a lead from the left pane to view details, assign staff, and collaborate.
            </p>
          </div>
        ) : (
          <>
            {/* The Main Content Body */}
            <div className="flex-1 flex flex-col min-w-0 bg-transparent relative z-0 h-full overflow-hidden">
                {/* Fixed Sticky Toolbar */}
                <div className="sticky top-0 z-10 bg-neutral-50/80 dark:bg-white/[0.02] backdrop-blur-md px-3 md:px-4 py-3 border-b border-neutral-200 dark:border-white/10 flex flex-wrap items-center justify-between gap-2 shrink-0">
                    <div className="flex flex-wrap items-center gap-1.5 md:gap-2">
                        <button
                          className="lg:hidden p-1.5 md:p-2 text-neutral-500 hover:text-charcoal dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-white/10 rounded-md transition-colors"
                          onClick={() => setSelectedId(null)}
                        >
                          <ArrowLeft className="w-5 h-5" />
                        </button>
                        
                        {/* Status Select */}
                        <select 
                            title="Change Status"
                            className="bg-transparent text-[10px] md:text-[11px] uppercase tracking-wider font-bold text-neutral-600 dark:text-neutral-300 outline-none cursor-pointer hover:bg-neutral-100 dark:hover:bg-white/10 py-1.5 px-1.5 md:px-2 rounded-md transition-colors disabled:opacity-50"
                            value={selectedInquiry.statusString}
                            onChange={(e) => handleUpdateStatus(selectedInquiry.id, e.target.value as InquiryStatus)}
                            disabled={isPending}
                        >
                            <option value="NEW">Status: New</option>
                            <option value="CONTACTED">Status: Contacted</option>
                            <option value="CLOSED">Status: Closed</option>
                        </select>
                    </div>

                    <div className="flex flex-wrap items-center gap-1">
                        <Button
                           variant="ghost"
                           size="sm"
                           onClick={() => setInquiryToDelete(selectedInquiry.id)}
                           className="text-neutral-500 hover:text-red-500 disabled:opacity-50 h-8 font-medium text-xs px-2 md:px-3"
                           disabled={isPending}
                        >
                            <Trash2 className="w-3.5 h-3.5 md:mr-1.5" />
                            <span className="hidden md:inline">Delete</span>
                        </Button>
                        <Button
                           variant="ghost"
                           size="sm"
                           onClick={() => setIsNotesDrawerOpen(!isNotesDrawerOpen)}
                           className={`h-8 font-medium text-xs px-2 md:px-3 transition-colors ${isNotesDrawerOpen ? 'bg-olive/10 text-olive dark:bg-olive/20' : 'text-neutral-500 hover:text-charcoal dark:hover:text-white'}`}
                        >
                            <PanelRight className="w-3.5 h-3.5 md:mr-1.5" />
                            <span className="hidden md:inline">Notes</span>
                            {selectedInquiry.notes.length > 0 && (
                                <span className="ml-1 md:ml-1.5 bg-neutral-200 dark:bg-white/20 px-1.5 py-[1px] rounded-full text-[10px] font-bold">
                                    {selectedInquiry.notes.length}
                                </span>
                            )}
                        </Button>
                    </div>
                </div>

                {/* Massive Scrollable Detail Feed */}
                <div className="flex-1 overflow-y-auto p-6 md:p-10">
                    
                    {/* Rich Header */}
                    <div className="flex gap-5 mb-8">
                        <div className={`w-14 h-14 rounded-full border-2 flex items-center justify-center shrink-0 \${getStatusColor(selectedInquiry.statusString)} bg-white dark:bg-black/50 shadow-md`}>
                            <span className="text-xl font-black uppercase text-inherit">
                                {selectedInquiry.name.charAt(0)}
                            </span>
                        </div>
                        <div className="flex-1 min-w-0 pt-1">
                            <h2 className="text-2xl md:text-3xl font-black text-charcoal dark:text-white leading-tight tracking-tight truncate mb-3">
                                {selectedInquiry.name}
                            </h2>
                            <div className="flex flex-wrap items-center gap-2">
                                <button
                                    onClick={() => copyToClipboard(selectedInquiry.email)}
                                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-neutral-100 dark:bg-white/5 hover:bg-brand-green/10 hover:text-brand-green border border-neutral-200 dark:border-white/10 hover:border-brand-green/30 text-xs font-semibold text-neutral-600 dark:text-neutral-300 transition-all"
                                >
                                    <Mail className="w-3.5 h-3.5" />
                                    {selectedInquiry.email}
                                </button>
                                <a 
                                    href={getGmailReplyUrl(selectedInquiry)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-neutral-100 dark:bg-white/5 hover:bg-orange/10 hover:text-orange border border-neutral-200 dark:border-white/10 hover:border-orange/30 text-xs font-semibold text-neutral-600 dark:text-neutral-300 transition-all"
                                    onClick={() => handleUpdateStatus(selectedInquiry.id, "CONTACTED")}
                                >
                                    Open in Gmail
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 border-y border-neutral-100 dark:border-white/5 py-6 mb-8">
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-1">Received</p>
                            <p className="text-sm font-semibold text-charcoal dark:text-white">
                                {new Date(selectedInquiry.createdAt).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}
                            </p>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-1">Assignee</p>
                            <select
                                value={selectedInquiry.assignedToId || ""}
                                onChange={(e) => handleAssign(selectedInquiry.id, e.target.value || null)}
                                className="w-full bg-transparent font-semibold text-sm text-charcoal dark:text-white outline-none cursor-pointer disabled:opacity-50"
                                disabled={isPending}
                            >
                                <option value="">+ Assign Staff</option>
                                {users.map((u) => {
                                    const displayName = u.name || u.email
                                    const roleLabel = u.role === "ADMIN" ? "Admin" : u.role.charAt(0) + u.role.slice(1).toLowerCase()
                                    return (
                                        <option key={u.id} value={u.id}>
                                            {displayName} ({roleLabel})
                                        </option>
                                    )
                                })}
                            </select>
                        </div>
                    </div>

                    {/* The Message Body */}
                    <div className="max-w-3xl mb-12">
                         <p className="text-sm font-semibold uppercase tracking-widest text-neutral-400 mb-4">Original Message</p>
                         <p className="text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap leading-relaxed">
                            {selectedInquiry.message}
                         </p>
                    </div>

                    {/* Replies Thread */}
                    {selectedInquiry.replies.length > 0 && (
                        <div className="max-w-3xl space-y-4 mb-12">
                            <p className="text-sm font-semibold uppercase tracking-widest text-neutral-400 mb-2 border-b border-neutral-200 dark:border-white/10 pb-2">Reply Thread / History</p>
                            {selectedInquiry.replies.map((reply) => (
                            <div key={reply.id} className="bg-brand-green/5 p-4 flex gap-4 border border-brand-green/20 rounded-xl relative">
                                <div className="mt-1">
                                    <History className="w-5 h-5 text-brand-green/60" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-[11px] uppercase tracking-wider font-bold text-brand-green/80 flex items-center justify-between mb-2">
                                        <span>Sent via Dashboard by {reply.sentBy || "System"}</span>
                                        <span>{new Date(reply.sentAt).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}</span>
                                    </div>
                                    <div className="text-sm text-neutral-800 dark:text-neutral-200 whitespace-pre-wrap leading-relaxed">{reply.content}</div>
                                </div>
                            </div>
                            ))}
                        </div>
                    )}

                    {/* Dashboard Composer */}
                    <div className="max-w-3xl bg-neutral-50 dark:bg-black/20 p-4 rounded-xl border border-neutral-200 dark:border-white/10">
                        <Textarea
                            placeholder="Draft an official email reply (Uses Resend API)..."
                            className="min-h-[140px] resize-y mb-4 bg-white dark:bg-black/40 border-neutral-200 dark:border-white/10 focus-visible:ring-brand-green"
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            disabled={isPending}
                        />
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mt-4 gap-4 md:gap-0">
                            <p className="text-[10px] md:text-xs text-neutral-400 dark:text-neutral-500 flex items-start md:items-center gap-1.5 w-full md:w-auto pr-0 md:pr-4">
                                <Mail size={12} className="text-brand-green opacity-70 shrink-0 mt-0.5 md:mt-0" />
                                <span className="flex-1">Replies automatically route to the platform's support email. Continue the conversation natively in Gmail.</span>
                            </p>
                            <Button
                                onClick={handleSendReply}
                                disabled={!replyText.trim() || isPending}
                                className="bg-olive hover:bg-olive/90 text-white gap-2 px-6 disabled:opacity-50 disabled:grayscale transition-all shadow-md shrink-0 w-full md:w-auto"
                            >
                                <Send className="w-4 h-4" />
                                {isPending ? "Sending..." : "Send Reply"}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Slide Out Notes Drawer */}
            <InquiryNotesDrawer 
                isOpen={isNotesDrawerOpen} 
                onClose={() => setIsNotesDrawerOpen(false)} 
                notes={selectedInquiry.notes} 
                onAddNote={handleAddNote}
                isPending={isPending} 
            />
          </>
        )}
      </div>

      <ConfirmationDialog
        open={!!inquiryToDelete}
        onOpenChange={(open) => !open && setInquiryToDelete(null)}
        title="Delete Inquiry"
        description="Are you sure you want to delete this message? This action removes tracking data and cannot be fully undone."
        confirmText="Delete"
        variant="destructive"
        onConfirm={handleDelete}
        isLoading={isPending}
      />
    </div>
  )
}
