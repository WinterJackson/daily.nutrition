"use client"

import { createTestimonial, deleteTestimonial, TestimonialStatus, updateTestimonial } from "@/app/actions/testimonials"
import { Button } from "@/components/ui/Button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/Dialog"
import { Input } from "@/components/ui/Input"
import { cn } from "@/lib/utils"
import { CheckCircle, ChevronLeft, ChevronRight, Clock, Edit, Plus, Star, Trash2, XCircle } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState, useTransition } from "react"

interface Testimonial {
  id: string
  authorName: string
  rating: number
  content: string
  status: string
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
  const [activeTab, setActiveTab] = useState<"ALL" | TestimonialStatus>("PENDING")
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [testimonialToDelete, setTestimonialToDelete] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    authorName: "",
    rating: 5,
    content: "",
  })

  useEffect(() => {
    setTestimonials(initialTestimonials)
  }, [initialTestimonials])

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams)
    params.set("page", newPage.toString())
    router.push(`?${params.toString()}`)
  }

  // Derive counts for tabs within CURRENT PAGE (Note: True count requires DB aggregation, this is partial UX)
  const pendingCount = testimonials.filter(t => t.status === "PENDING").length
  const approvedCount = testimonials.filter(t => t.status === "APPROVED").length

  const filteredTestimonials = testimonials.filter(t => 
    activeTab === "ALL" ? true : t.status === activeTab
  )

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
        const res = await createTestimonial({ ...formData, status: "PENDING" })
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
      setTestimonials(testimonials.map(t => t.id === id ? { ...t, status } : t))
    })
  }

  const handleDelete = () => {
    if (!testimonialToDelete) return
    startTransition(async () => {
      await deleteTestimonial(testimonialToDelete)
      setTestimonials(testimonials.filter(t => t.id !== testimonialToDelete))
      setTestimonialToDelete(null)
      router.refresh()
    })
  }

  const totalPages = Math.ceil(totalCount / pageSize)

  return (
    <div>
      {/* Header & Tabs */}
      <div className="border-b border-neutral-100 dark:border-white/5">
         <div className="flex flex-col sm:flex-row items-center justify-between p-4 gap-4">
             <div className="flex bg-neutral-100 dark:bg-white/5 p-1 rounded-lg">
                {(["PENDING", "APPROVED", "ARCHIVED", "ALL"] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={cn(
                            "px-4 py-1.5 rounded-md text-sm font-medium transition-all",
                            activeTab === tab 
                                ? "bg-white dark:bg-charcoal text-olive dark:text-off-white shadow-sm" 
                                : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                        )}
                    >
                        {tab.charAt(0) + tab.slice(1).toLowerCase()}
                        {tab === "PENDING" && pendingCount > 0 && (
                            <span className="ml-2 bg-orange text-white text-[10px] px-1.5 py-0.5 rounded-full">{pendingCount}</span>
                        )}
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
                        <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Author Name</label>
                        <Input
                        value={formData.authorName}
                        onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
                        placeholder="John Doe"
                        required
                        className="mt-1"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Rating (1-5)</label>
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
                    <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Content</label>
                    <textarea
                        value={formData.content}
                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                        placeholder="Share the customer's experience..."
                        required
                        rows={3}
                        className="mt-1 w-full rounded-lg border border-neutral-200 dark:border-white/10 bg-white dark:bg-black/20 p-3 text-sm focus:ring-2 focus:ring-brand-green focus:outline-none"
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

      {/* Testimonials List */}
      {filteredTestimonials.length === 0 ? (
        <div className="p-12 text-center text-neutral-500 dark:text-neutral-400">
            {testimonials.length === 0 
                ? "No testimonials yet." 
                : activeTab === "PENDING" 
                    ? "No pending reviews! All caught up." 
                    : "No reviews found in this category."}
        </div>
      ) : (
        <div className="divide-y divide-neutral-100 dark:divide-white/5">
          {filteredTestimonials.map((testimonial) => (
            <div key={testimonial.id} className="p-4 hover:bg-neutral-50 dark:hover:bg-white/[0.02] transition-colors flex flex-col sm:flex-row items-start justify-between gap-4">
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-olive dark:text-off-white text-lg">{testimonial.authorName}</span>
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
                           "text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border",
                           testimonial.status === "APPROVED" ? "bg-green-100 text-green-700 border-green-200" : 
                           testimonial.status === "PENDING" ? "bg-orange/10 text-orange border-orange/20" : 
                           "bg-neutral-100 text-neutral-500 border-neutral-200"
                       )}>
                           {testimonial.status}
                       </span>
                  )}
                </div>
                <p className="text-neutral-600 dark:text-neutral-300 italic">"{testimonial.content}"</p>
                <p className="text-xs text-neutral-400 flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    {new Date(testimonial.createdAt).toLocaleDateString()}
                </p>
              </div>
              
              <div className="flex items-center gap-2 shrink-0">
                {testimonial.status === "PENDING" && (
                  <Button
                    size="sm"
                    className="bg-brand-green/10 text-brand-green hover:bg-brand-green hover:text-white border border-brand-green/20"
                    onClick={() => handleStatusChange(testimonial.id, "APPROVED")}
                    disabled={isPending}
                    data-tooltip="Approve Review"
                  >
                    <CheckCircle className="w-4 h-4 mr-1.5" /> Approve
                  </Button>
                )}
                
                {testimonial.status === "APPROVED" && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-neutral-400 hover:text-orange hover:bg-orange/10 rounded-full"
                        onClick={() => handleStatusChange(testimonial.id, "PENDING")}
                        disabled={isPending}
                        data-tooltip="Move to Pending"
                    >
                        <Clock className="w-4 h-4" />
                    </Button>
                )}

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-neutral-400 hover:text-blue-500 hover:bg-blue-500/10 rounded-full"
                  onClick={() => handleEdit(testimonial)}
                  disabled={isPending}
                  data-tooltip="Edit Review"
                >
                  <Edit className="w-4 h-4" />
                </Button>
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
          ))}
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      <Dialog open={!!testimonialToDelete} onOpenChange={(open) => !open && setTestimonialToDelete(null)}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Delete Testimonial</DialogTitle>
                <DialogDescription>
                    Are you sure you want to delete this review? This action cannot be undone.
                </DialogDescription>
            </DialogHeader>
            <DialogFooter>
                <Button variant="outline" onClick={() => setTestimonialToDelete(null)}>Cancel</Button>
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

      {/* Pagination Controls */}
      <div className="p-4 border-t border-neutral-100 dark:border-white/5 bg-neutral-50/30 dark:bg-white/[0.01] flex items-center justify-between">
        <span className="text-xs text-neutral-400">
            Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} reviews
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
    </div>
  )
}
