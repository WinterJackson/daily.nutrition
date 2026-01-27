"use client"

import { deleteInquiry, InquiryStatus, updateInquiryStatus } from "@/app/actions/inquiries"
import { Button } from "@/components/ui/Button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/Dialog"
import { Input } from "@/components/ui/Input"
import { CheckCircle, ChevronLeft, ChevronRight, Clock, Eye, Mail, Search, Trash2 } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState, useTransition } from "react"

interface Inquiry {
  id: string
  name: string
  email: string
  message: string
  status: string
  createdAt: Date
}

interface InquiriesTableProps {
  inquiries: Inquiry[]
  totalCount: number
  currentPage: number
  pageSize: number
}

export function InquiriesTable({ inquiries: initialInquiries, totalCount, currentPage, pageSize }: InquiriesTableProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [inquiries, setInquiries] = useState(initialInquiries)
  const [isPending, startTransition] = useTransition()
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null)
  const [inquiryToDelete, setInquiryToDelete] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"ALL" | InquiryStatus>("ALL")

  useEffect(() => {
    setInquiries(initialInquiries)
  }, [initialInquiries])

  // Function to update URL with page
  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams)
    params.set("page", newPage.toString())
    router.push(`?${params.toString()}`)
  }

  const handleStatusChange = (id: string, status: InquiryStatus) => {
    startTransition(async () => {
      await updateInquiryStatus(id, status)
      setInquiries(inquiries.map(i => i.id === id ? { ...i, status } : i))
    })
  }

  const handleDelete = () => {
    if (!inquiryToDelete) return
    startTransition(async () => {
        const res = await deleteInquiry(inquiryToDelete)
        if (res.success) {
            setInquiries(inquiries.filter(i => i.id !== inquiryToDelete))
            setInquiryToDelete(null)
            if (selectedInquiry?.id === inquiryToDelete) setSelectedInquiry(null)
            router.refresh()
        }
    })
  }

  // Client-side filtering for current page data
  const filteredInquiries = inquiries.filter(inquiry => {
    const matchesSearch = 
        inquiry.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        inquiry.email.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === "ALL" || inquiry.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  // Generate Gmail compose URL with prefilled details
  const getGmailReplyUrl = (inquiry: Inquiry) => {
    const subject = encodeURIComponent(`Re: Your Inquiry to Daily Nutrition`)
    const body = encodeURIComponent(
      `Hi ${inquiry.name},\n\nThank you for reaching out to Daily Nutrition regarding:\n\n"${inquiry.message.substring(0, 200)}${inquiry.message.length > 200 ? '...' : ''}"\n\n---\n\nBest regards,\nDaily Nutrition Team`
    )
    return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(inquiry.email)}&su=${subject}&body=${body}`
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "NEW":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ring-1 ring-inset bg-orange/5 text-orange ring-orange/20">
            <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-orange animate-pulse"></span>
            New
          </span>
        )
      case "CONTACTED":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ring-1 ring-inset bg-blue-50 text-blue-600 ring-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:ring-blue-800">
            <Clock className="w-3 h-3 mr-1" />
            Contacted
          </span>
        )
      case "CLOSED":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ring-1 ring-inset bg-brand-green/5 text-brand-green ring-brand-green/20">
            <CheckCircle className="w-3 h-3 mr-1" />
            Closed
          </span>
        )
      default:
        return status
    }
  }

  const totalPages = Math.ceil(totalCount / pageSize)

  return (
    <>
      <div className="p-4 border-b border-neutral-100 dark:border-white/5 flex flex-col sm:flex-row gap-4 justify-between items-center bg-white/50 dark:bg-white/[0.02]">
         <div className="relative w-full sm:w-auto">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-500" />
            <Input
              placeholder="Search by name or email (current page)..."
              className="pl-9 w-full sm:w-64 bg-white dark:bg-black/20 border-neutral-200 dark:border-white/10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
         </div>
         <div className="flex items-center gap-3 w-full sm:w-auto">
             <span className="text-sm text-neutral-500 whitespace-nowrap hidden sm:inline">Filter by:</span>
             <select
                className="h-10 rounded-md border border-neutral-200 dark:border-white/10 bg-white dark:bg-black/20 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green w-full sm:w-auto"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
             >
                <option value="ALL">All Statuses</option>
                <option value="NEW">New</option>
                <option value="CONTACTED">Contacted</option>
                <option value="CLOSED">Closed</option>
             </select>
         </div>
      </div>

      <div className="overflow-x-auto scrollbar-thin-1px lg:overflow-visible">
        <table className="w-full text-sm text-left">
          <thead className="bg-neutral-50/50 dark:bg-white/[0.02] text-neutral-500 dark:text-neutral-400 font-medium">
            <tr>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold">Client</th>
              <th className="px-6 py-4 font-semibold">Message</th>
              <th className="px-6 py-4 font-semibold">Date</th>
              <th className="px-6 py-4 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 dark:divide-white/5">
            {filteredInquiries.length === 0 ? (
                <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-neutral-500">
                        {inquiries.length === 0 ? "No inquiries found." : "No inquiries match your filters."}
                    </td>
                </tr>
            ) : (
                filteredInquiries.map((inquiry) => (
                <tr key={inquiry.id} className="group hover:bg-neutral-50 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                    {getStatusBadge(inquiry.status)}
                    </td>
                    <td className="px-6 py-4">
                    <div className="font-semibold text-olive dark:text-off-white">{inquiry.name}</div>
                    <div className="text-xs text-neutral-400 font-normal">{inquiry.email}</div>
                    </td>
                    <td className="px-6 py-4 text-neutral-600 dark:text-neutral-300 max-w-xs truncate cursor-pointer" onClick={() => setSelectedInquiry(inquiry)}>
                    {inquiry.message.substring(0, 60)}...
                    </td>
                    <td className="px-6 py-4 text-neutral-500 font-mono text-xs">
                    {new Date(inquiry.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                        <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-neutral-400 hover:text-blue-500 hover:bg-blue-500/10 rounded-full"
                        onClick={() => setSelectedInquiry(inquiry)}
                        disabled={isPending}
                        data-tooltip="View Details"
                        >
                        <Eye className="w-4 h-4" />
                        </Button>
                        <a
                          href={getGmailReplyUrl(inquiry)}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => handleStatusChange(inquiry.id, "CONTACTED")}
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-neutral-400 hover:text-orange hover:bg-orange/10 rounded-full"
                            data-tooltip="Reply via Gmail"
                          >
                            <Mail className="w-4 h-4" />
                          </Button>
                        </a>
                        {inquiry.status === "NEW" && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-neutral-400 hover:text-brand-green hover:bg-brand-green/10 rounded-full"
                            onClick={() => handleStatusChange(inquiry.id, "CONTACTED")}
                            disabled={isPending}
                            data-tooltip="Mark as Contacted"
                        >
                            <Clock className="w-4 h-4" />
                        </Button>
                        )}
                        {inquiry.status === "CONTACTED" && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-neutral-400 hover:text-brand-green hover:bg-brand-green/10 rounded-full"
                            onClick={() => handleStatusChange(inquiry.id, "CLOSED")}
                            disabled={isPending}
                            data-tooltip="Close Inquiry"
                        >
                            <CheckCircle className="w-4 h-4" />
                        </Button>
                        )}
                        <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-neutral-400 hover:text-red-500 hover:bg-red-500/10 rounded-full"
                        onClick={() => setInquiryToDelete(inquiry.id)}
                        disabled={isPending}
                        data-tooltip="Delete Inquiry"
                        >
                        <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                    </td>
                </tr>
                ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination Controls */}
      <div className="p-4 border-t border-neutral-100 dark:border-white/5 bg-neutral-50/30 dark:bg-white/[0.01] flex items-center justify-between">
        <span className="text-xs text-neutral-400">
            Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} results
        </span>
        <div className="flex items-center gap-2">
            <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className="h-8 px-2"
            >
                <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm text-neutral-600 dark:text-neutral-400">
                Page {currentPage} of {totalPages}
            </span>
            <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="h-8 px-2"
            >
                <ChevronRight className="w-4 h-4" />
            </Button>
        </div>
      </div>

      {/* Detail Modal */}
      <Dialog open={!!selectedInquiry} onOpenChange={(open) => !open && setSelectedInquiry(null)}>
        <DialogContent className="sm:max-w-xl">
          {/* Header with Status Badge */}
          <div className="pr-8"> {/* Padding to avoid X button */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <DialogTitle className="text-xl font-bold truncate">
                  {selectedInquiry?.name}
                </DialogTitle>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                  {selectedInquiry?.email}
                </p>
              </div>
              {selectedInquiry && (
                <div className="shrink-0 mt-1">
                  {getStatusBadge(selectedInquiry.status)}
                </div>
              )}
            </div>
          </div>

          {/* Message Content */}
          <div className="bg-neutral-50 dark:bg-white/5 rounded-xl p-4 border border-neutral-100 dark:border-white/5">
            <p className="text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap text-sm leading-relaxed">
              {selectedInquiry?.message}
            </p>
          </div>

          {/* Footer with Actions */}
          <div className="flex flex-col gap-4 pt-2 border-t border-neutral-100 dark:border-white/10">
            <span className="text-xs text-neutral-400 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Received: {selectedInquiry && new Date(selectedInquiry.createdAt).toLocaleString()}
            </span>
            <div className="flex flex-wrap gap-2">
              {selectedInquiry && (
                <a
                  href={getGmailReplyUrl(selectedInquiry)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    handleStatusChange(selectedInquiry.id, "CONTACTED")
                    setSelectedInquiry(null)
                  }}
                >
                  <Button size="sm" className="bg-orange hover:bg-orange/90 text-white">
                    <Mail className="w-4 h-4 mr-2" />
                    Reply via Gmail
                  </Button>
                </a>
              )}
              {selectedInquiry?.status !== "CLOSED" && (
                <Button 
                  size="sm" 
                  variant="outline"
                  className="border-brand-green/50 text-brand-green hover:bg-brand-green/10"
                  onClick={() => {
                    if (selectedInquiry) handleStatusChange(selectedInquiry.id, "CLOSED")
                    setSelectedInquiry(null)
                  }}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Mark Closed
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={() => setSelectedInquiry(null)}>
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={!!inquiryToDelete} onOpenChange={(open) => !open && setInquiryToDelete(null)}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Delete Inquiry</DialogTitle>
                <DialogDescription>
                    Are you sure you want to delete this message? This action cannot be undone.
                </DialogDescription>
            </DialogHeader>
            <DialogFooter>
                <Button variant="outline" onClick={() => setInquiryToDelete(null)}>Cancel</Button>
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
