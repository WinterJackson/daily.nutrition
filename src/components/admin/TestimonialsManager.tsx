"use client"

import { createTestimonial, deleteTestimonial, TestimonialStatus, updateTestimonial } from "@/app/actions/testimonials"
import { TablePagination } from "@/components/admin/TablePagination"
import { Button } from "@/components/ui/Button"
import { ConfirmationDialog } from "@/components/ui/ConfirmationDialog"
import { Input } from "@/components/ui/Input"
import { cn } from "@/lib/utils"
import { CheckCircle, Clock, Plus, Search, Star, Trash2, XCircle } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useRef, useState, useTransition } from "react"

interface Testimonial {
  id: string
  authorName: string
  rating: number
  content: string
  contentStatus: string
  serviceId: string | null
  createdAt: Date
}

interface TestimonialsManagerProps {
  testimonials: Testimonial[]
  totalCount: number
  currentPage: number
  pageSize: number
}

export function TestimonialsManager({ testimonials: initialTestimonials, totalCount, currentPage, pageSize }: TestimonialsManagerProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [testimonials, setTestimonials] = useState(initialTestimonials)
  const [isPending, startTransition] = useTransition()
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "")
  const [activeTab, setActiveTab] = useState<"ALL" | TestimonialStatus>((searchParams.get("status") as any) || "ALL")
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [testimonialToDelete, setTestimonialToDelete] = useState<string | null>(null)
  
  // Bulk Selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const allSelected = testimonials.length > 0 && selectedIds.size === testimonials.length
  const someSelected = selectedIds.size > 0

  const toggleSelectAll = () => {
    if (allSelected) setSelectedIds(new Set())
    else setSelectedIds(new Set(testimonials.map(t => t.id)))
  }
  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedIds(next)
  }

  const [formData, setFormData] = useState({
    authorName: "",
    rating: 5,
    content: "",
  })

  // URL-based navigation for server-side pagination and search
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  const pushParams = useCallback((overrides: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString())
    for (const [k, v] of Object.entries(overrides)) {
      if (v) params.set(k, v)
      else params.delete(k)
    }
    if (!overrides.page) params.set("page", "1")
    router.push(`?${params.toString()}`)
    setSelectedIds(new Set())
  }, [router, searchParams])

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      pushParams({ search: value })
    }, 400)
  }

  const handleTabChange = (tab: "ALL" | TestimonialStatus) => {
    setActiveTab(tab)
    pushParams({ status: tab === "ALL" ? "" : tab })
  }

  const handlePageChange = (newPage: number) => {
    pushParams({ page: String(newPage) })
  }

  const handlePageSizeChange = (size: number) => {
    pushParams({ pageSize: String(size), page: "1" })
  }

  useEffect(() => {
    setTestimonials(initialTestimonials)
    setSelectedIds(new Set())
  }, [initialTestimonials])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    startTransition(async () => {
      if (editingId) {
        const res = await updateTestimonial(editingId, formData)
        if (res.success && res.testimonial) {
             setTestimonials(testimonials.map(t => t.id === editingId ? { ...t, ...formData } : t))
        }
        setEditingId(null)
      } else {
        const res = await createTestimonial({ ...formData, status: "IN_REVIEW" })
        if (res.success && res.testimonial) {
            // Optimistic update
            const newT = {
                ...res.testimonial,
                createdAt: new Date(res.testimonial.createdAt) // Ensure Date object
            } as Testimonial
            setTestimonials([newT, ...testimonials])
            // router.refresh() // To update strict sort/pagination
        }
      }
      setFormData({ authorName: "", rating: 5, content: "" })
      setShowForm(false)
    })
  }

  const handleEdit = (testimonial: Testimonial) => {
    setFormData({
      authorName: testimonial.authorName,
      rating: testimonial.rating,
      content: testimonial.content,
    })
    setEditingId(testimonial.id)
    setShowForm(true)
  }

  const handleStatusChange = (id: string, status: TestimonialStatus) => {
    startTransition(async () => {
      await updateTestimonial(id, { status })
      setTestimonials(testimonials.map(t => t.id === id ? { ...t, contentStatus: status } : t))
    })
  }

  // Bulk actions
  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selectedIds.size} testimonial(s)?`)) return
    startTransition(async () => {
      for (const id of selectedIds) {
        await deleteTestimonial(id)
      }
      setSelectedIds(new Set())
      router.refresh()
    })
  }

  const handleBulkApprove = async () => {
    startTransition(async () => {
      for (const id of selectedIds) {
        await updateTestimonial(id, { status: "PUBLISHED" })
      }
      setSelectedIds(new Set())
      router.refresh()
    })
  }

  const totalPages = Math.ceil(totalCount / pageSize)

  return (
    <div>
      {/* Header & Tabs */}
      <div className="border-b border-neutral-100 dark:border-white/5">
         <div className="flex flex-col sm:flex-row items-center justify-between p-4 gap-4">
             <div className="flex flex-wrap items-center gap-2 bg-[var(--surface-secondary)] p-1 rounded-lg w-full sm:w-auto overflow-x-auto">
                {(["ALL", "IN_REVIEW", "PUBLISHED", "ARCHIVED"] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => handleTabChange(tab)}
                        className={cn(
                            "px-4 py-1.5 rounded-md text-xs md:text-sm font-medium transition-all whitespace-nowrap",
                            activeTab === tab 
                                ? "bg-[var(--surface-primary)] text-[var(--text-primary)] shadow-sm" 
                                : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                        )}
                    >
                        {tab === "ALL" ? "All Reviews" : tab === "IN_REVIEW" ? "Pending" : tab === "PUBLISHED" ? "Approved" : "Archived"}
                    </button>
                ))}
             </div>
             
             {!showForm && (
                <Button onClick={() => setShowForm(true)} className="bg-brand-green hover:bg-brand-green/90">
                    <Plus className="w-4 h-4 mr-2" /> Add Manual Review
                </Button>
            )}
         </div>
         
         {/* Form Area */}
         {showForm && (
            <div className="p-4 bg-neutral-50/50 dark:bg-white/[0.02]">
                <form onSubmit={handleSubmit} className="bg-white dark:bg-white/5 rounded-xl p-4 space-y-4 border border-neutral-200 dark:border-white/10 shadow-sm">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="font-semibold text-olive dark:text-off-white">{editingId ? "Edit Review" : "Add New Review"}</h3>
                        <Button variant="ghost" size="sm" onClick={() => { setShowForm(false); setEditingId(null) }}><XCircle className="w-5 h-5" /></Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs md:text-sm font-medium text-neutral-600 dark:text-neutral-400">Author Name</label>
                            <Input
                            value={formData.authorName}
                            onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
                            placeholder="John Doe"
                            required
                            className="mt-1"
                            />
                        </div>
                        <div>
                            <label className="text-xs md:text-sm font-medium text-neutral-600 dark:text-neutral-400">Rating (1-5)</label>
                            <div className="flex items-center gap-2 mt-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, rating: star })}
                                        className="focus:outline-none"
                                    >
                                        <Star 
                                            className={cn(
                                                "w-6 h-6 transition-colors", 
                                                formData.rating >= star ? "fill-gold text-gold" : "text-neutral-300 dark:text-neutral-600"
                                            )} 
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div>
                        <label className="text-xs md:text-sm font-medium text-neutral-600 dark:text-neutral-400">Content</label>
                        <textarea
                            value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                            placeholder="Share the customer's experience..."
                            required
                            rows={3}
                            className="mt-1 w-full rounded-lg border border-neutral-200 dark:border-white/10 bg-white dark:bg-black/20 p-3 text-xs md:text-sm focus:ring-2 focus:ring-brand-green focus:outline-none"
                        />
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingId(null) }}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isPending} className="bg-brand-green hover:bg-brand-green/90">
                        {isPending ? "Saving..." : editingId ? "Update Review" : "Create Review"}
                      </Button>
                    </div>
                </form>
            </div>
         )}
      </div>

      {/* Secondary Toolbar (Search + Bulk Actions) */}
      <div className="border-b border-[var(--border-default)] p-4 flex flex-col sm:flex-row items-center justify-between gap-4 surface-secondary">
        {someSelected ? (
            <div className="flex items-center gap-3 animate-in fade-in w-full sm:w-auto">
                <span className="text-xs md:text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{selectedIds.size} selected</span>
                {activeTab !== "PUBLISHED" && (
                    <Button size="sm" variant="outline" className="border-green-300 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20" onClick={handleBulkApprove} disabled={isPending}>
                        <CheckCircle className="w-3.5 h-3.5 mr-1.5" /> Approve
                    </Button>
                )}
                <Button size="sm" variant="outline" className="border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20" onClick={handleBulkDelete} disabled={isPending}>
                    <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Delete
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setSelectedIds(new Set())}>Clear</Button>
            </div>
        ) : (
            <div className="relative w-full sm:max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <Input
                    placeholder="Search reviews or authors..."
                    className="pl-9 w-full surface-input"
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                />
            </div>
        )}
      </div>

      {/* Testimonials List */}
      {testimonials.length === 0 ? (
        <div className="p-12 text-center" style={{ color: "var(--text-muted)" }}>
            {searchQuery 
                ? "No reviews match your search." 
                : activeTab === "IN_REVIEW" 
                    ? "No pending reviews! All caught up." 
                    : "No reviews found in this category."}
        </div>
      ) : (
        <div className="divide-y divide-[var(--border-subtle)]">
          {/* Header row with select-all */}
          <div className="px-4 py-3 surface-secondary border-b border-[var(--border-subtle)] flex items-center gap-4">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={toggleSelectAll}
                className="rounded border-neutral-300 dark:border-neutral-600 text-brand-green focus:ring-brand-green mt-0.5"
              />
              <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Select All Reviews</span>
          </div>

          {testimonials.map((testimonial) => (
            <div 
                key={testimonial.id} 
                className="p-4 hover:bg-brand-green/[0.02] dark:hover:bg-white/[0.02] transition-colors flex flex-col sm:flex-row items-start justify-between gap-4 cursor-pointer"
                onClick={() => handleEdit(testimonial)}
            >
              <div className="flex items-start gap-4">
                  <div className="pt-1 select-none" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedIds.has(testimonial.id)}
                        onChange={() => toggleSelect(testimonial.id)}
                        className="rounded border-neutral-300 dark:border-neutral-600 text-brand-green focus:ring-brand-green"
                      />
                  </div>
                  <div className="flex-1 space-y-1">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-olive dark:text-off-white text-base md:text-lg">{testimonial.authorName}</span>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star 
                        key={i} 
                        className={cn(
                            "w-3.5 h-3.5",
                            i < testimonial.rating ? "fill-gold text-gold" : "text-neutral-200 dark:text-neutral-700"
                        )} 
                      />
                    ))}
                  </div>
                  {activeTab === "ALL" && (
                       <span className={cn(
                           "text-[8px] md:text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border",
                           testimonial.contentStatus === "PUBLISHED" ? "bg-green-100 text-green-700 border-green-200" : 
                           testimonial.contentStatus === "IN_REVIEW" ? "bg-orange/10 text-orange border-orange/20" : 
                           "bg-neutral-100 text-neutral-500 border-neutral-200"
                       )}>
                           {testimonial.contentStatus === "IN_REVIEW" ? "PENDING" : testimonial.contentStatus === "PUBLISHED" ? "APPROVED" : testimonial.contentStatus}
                       </span>
                  )}
                </div>
                <p className="text-sm md:text-base text-neutral-600 dark:text-neutral-300 italic">"{testimonial.content}"</p>
                <p className="text-[10px] md:text-xs text-neutral-400 flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    {new Date(testimonial.createdAt).toLocaleDateString()}
                </p>
              </div>
              
              
              <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                {testimonial.contentStatus === "IN_REVIEW" && (
                  <Button
                    size="sm"
                    className="bg-brand-green/10 text-brand-green hover:bg-brand-green hover:text-white border border-brand-green/20"
                    onClick={() => handleStatusChange(testimonial.id, "PUBLISHED")}
                    disabled={isPending}
                    data-tooltip="Approve Review"
                  >
                    <CheckCircle className="w-4 h-4 mr-1.5" /> Approve
                  </Button>
                )}
                
                {testimonial.contentStatus === "PUBLISHED" && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-neutral-400 hover:text-orange hover:bg-orange/10 rounded-full"
                        onClick={() => handleStatusChange(testimonial.id, "IN_REVIEW")}
                        disabled={isPending}
                        data-tooltip="Move to Pending"
                    >
                        <Clock className="w-4 h-4" />
                    </Button>
                )}

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-neutral-400 hover:text-red-500 hover:bg-red-500/10 rounded-full"
                  onClick={() => setTestimonialToDelete(testimonial.id)}
                  disabled={isPending}
                  data-tooltip="Delete Review"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      <ConfirmationDialog 
        open={!!testimonialToDelete} 
        onOpenChange={(open) => !open && setTestimonialToDelete(null)}
        title="Delete Testimonial"
        description="Are you sure you want to delete this review? This action cannot be undone."
        confirmText="Delete Permanently"
        variant="destructive"
        onConfirm={async () => {
            if (!testimonialToDelete) return
            startTransition(async () => {
              await deleteTestimonial(testimonialToDelete)
              setTestimonialToDelete(null)
              router.refresh()
            })
        }}
        isLoading={isPending}
      />

      {/* Pagination Controls */}
      <TablePagination
        currentPage={currentPage}
        totalCount={totalCount}
        pageSize={pageSize}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />
    </div>
  )
}
