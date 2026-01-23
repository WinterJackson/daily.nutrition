"use client"

import { Button } from "@/components/ui/Button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/Dialog"
import { cn } from "@/lib/utils"
import { Calendar, Clock, Mail, MessageSquare, Phone, Reply, User } from "lucide-react"

interface Inquiry {
  id: number
  name: string
  email: string
  phone?: string
  subject: string
  message?: string
  date: string
  status: "New" | "Read" | "Replied"
}

interface InquiryDetailModalProps {
  inquiry: Inquiry | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onStatusChange?: (id: number, status: Inquiry["status"]) => void
}

export function InquiryDetailModal({
  inquiry,
  open,
  onOpenChange,
  onStatusChange,
}: InquiryDetailModalProps) {
  if (!inquiry) return null

  const statusColors = {
    New: "bg-orange/10 text-orange border-orange/20",
    Read: "bg-neutral-100 text-neutral-600 border-neutral-200 dark:bg-white/10 dark:text-neutral-400 dark:border-white/10",
    Replied: "bg-brand-green/10 text-brand-green border-brand-green/20",
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <div className="flex items-start justify-between pr-8">
            <div>
              <DialogTitle className="text-xl font-serif flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-brand-green" />
                {inquiry.subject}
              </DialogTitle>
              <DialogDescription className="mt-1">
                Inquiry #{inquiry.id}
              </DialogDescription>
            </div>
            <span
              className={cn(
                "px-3 py-1 rounded-full text-xs font-semibold border",
                statusColors[inquiry.status]
              )}
            >
              {inquiry.status}
            </span>
          </div>
        </DialogHeader>

        {/* Client Info */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-neutral-50 dark:bg-white/5 rounded-xl border border-neutral-100 dark:border-white/10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-olive/10 flex items-center justify-center">
              <User className="w-5 h-5 text-olive dark:text-off-white" />
            </div>
            <div>
              <p className="text-xs text-neutral-400 uppercase tracking-wide">Client</p>
              <p className="font-medium text-olive dark:text-off-white">{inquiry.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-orange/10 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-orange" />
            </div>
            <div>
              <p className="text-xs text-neutral-400 uppercase tracking-wide">Received</p>
              <p className="font-medium text-olive dark:text-off-white">{inquiry.date}</p>
            </div>
          </div>
        </div>

        {/* Contact Details */}
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <Mail className="w-4 h-4 text-neutral-400" />
            <a href={`mailto:${inquiry.email}`} className="text-brand-green hover:underline">
              {inquiry.email}
            </a>
          </div>
          {inquiry.phone && (
            <div className="flex items-center gap-3 text-sm">
              <Phone className="w-4 h-4 text-neutral-400" />
              <a href={`tel:${inquiry.phone}`} className="text-neutral-600 dark:text-neutral-300 hover:underline">
                {inquiry.phone}
              </a>
            </div>
          )}
        </div>

        {/* Message Body */}
        <div className="border-t border-neutral-100 dark:border-white/10 pt-4">
          <p className="text-xs text-neutral-400 uppercase tracking-wide mb-2 flex items-center gap-1">
            <Clock className="w-3 h-3" /> Message
          </p>
          <div className="prose prose-sm dark:prose-invert max-w-none text-neutral-600 dark:text-neutral-300 leading-relaxed bg-white dark:bg-white/5 p-4 rounded-xl border border-neutral-100 dark:border-white/10">
            {inquiry.message || "Hello, I am interested in your nutrition services. Please get in touch at your earliest convenience."}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="dark:border-white/10 dark:text-white"
          >
            Close
          </Button>
          <Button
            variant="accent"
            className="shadow-md"
            onClick={() => {
              if (onStatusChange) onStatusChange(inquiry.id, "Replied")
              window.location.href = `mailto:${inquiry.email}?subject=Re: ${inquiry.subject}`
            }}
          >
            <Reply className="w-4 h-4 mr-2" />
            Reply via Email
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
