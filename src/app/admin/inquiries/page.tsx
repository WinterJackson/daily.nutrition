"use client"

import { InquiryDetailModal } from "@/components/admin/InquiryDetailModal"
import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Eye, Mail, Trash2 } from "lucide-react"
import { useState } from "react"

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

const initialInquiries: Inquiry[] = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    phone: "+254 712 345 678",
    subject: "Diabetes Management Consultation",
    message: "Hello, I was recently diagnosed with Type 2 diabetes and am looking for nutritional guidance to help manage my condition. I'm particularly interested in meal planning and understanding how different foods affect my blood sugar. Please let me know your availability for a consultation.",
    date: "2024-03-15",
    status: "New",
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane@test.com",
    phone: "+254 798 765 432",
    subject: "Gut Health Inquiry",
    message: "I've been experiencing digestive issues for a few months now and would like professional guidance. My doctor suggested I consult with a dietitian for a possible FODMAP diet. What does an initial consultation involve?",
    date: "2024-03-14",
    status: "Read",
  },
  {
    id: 3,
    name: "Michael Brown",
    email: "michael@domain.com",
    subject: "General Assessment",
    message: "I'm interested in a general nutrition assessment to improve my overall health and energy levels. Looking forward to hearing from you.",
    date: "2024-03-12",
    status: "Replied",
  },
]

export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>(initialInquiries)
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleView = (inquiry: Inquiry) => {
    setSelectedInquiry(inquiry)
    setIsModalOpen(true)
    // Mark as read if it was new
    if (inquiry.status === "New") {
      setInquiries((prev) =>
        prev.map((i) => (i.id === inquiry.id ? { ...i, status: "Read" } : i))
      )
    }
  }

  const handleStatusChange = (id: number, status: Inquiry["status"]) => {
    setInquiries((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status } : i))
    )
  }

  const handleDelete = (id: number) => {
    setInquiries((prev) => prev.filter((i) => i.id !== id))
  }

  const exportToCSV = () => {
    const headers = ["ID", "Name", "Email", "Subject", "Date", "Status"]
    const rows = inquiries.map((i) => [i.id, i.name, i.email, i.subject, i.date, i.status])
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n")
    const link = document.createElement("a")
    link.href = encodeURI(csvContent)
    link.download = "inquiries.csv"
    link.click()
  }

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-serif text-olive dark:text-off-white">Inquiries</h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1">Manage incoming messages and consultation requests.</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="border-neutral-200 dark:border-white/10 dark:text-white dark:hover:bg-white/10"
            onClick={exportToCSV}
          >
            Export CSV
          </Button>
        </div>
      </div>

      <Card className="border-none shadow-xl shadow-neutral-200/50 dark:shadow-black/20 bg-white/90 dark:bg-white/5 backdrop-blur-md overflow-hidden">
        <CardHeader className="border-b border-neutral-100 dark:border-white/5 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Mail className="h-5 w-5 text-orange" />
              Recent Messages
            </CardTitle>
            <div className="w-full max-w-sm">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search inquiries..."
                  className="w-full pl-4 pr-4 py-2 rounded-lg bg-neutral-50 dark:bg-white/5 border-none focus:ring-2 focus:ring-brand-green/20 text-sm"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-neutral-50/50 dark:bg-white/[0.02] text-neutral-500 dark:text-neutral-400 font-medium">
                <tr>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Client</th>
                  <th className="px-6 py-4 font-semibold">Subject</th>
                  <th className="px-6 py-4 font-semibold">Date Received</th>
                  <th className="px-6 py-4 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-white/5">
                {inquiries.map((inquiry) => (
                  <tr key={inquiry.id} className="group hover:bg-neutral-50 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ring-1 ring-inset ${
                          inquiry.status === "New"
                            ? "bg-orange/5 text-orange ring-orange/20"
                            : inquiry.status === "Replied"
                              ? "bg-brand-green/5 text-brand-green ring-brand-green/20"
                              : "bg-neutral-100 text-neutral-600 ring-neutral-200 dark:bg-white/5 dark:text-neutral-400 dark:ring-white/10"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                            inquiry.status === "New"
                              ? "bg-orange animate-pulse"
                              : inquiry.status === "Replied"
                                ? "bg-brand-green"
                                : "bg-neutral-400"
                          }`}
                        ></span>
                        {inquiry.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-olive dark:text-off-white">{inquiry.name}</div>
                      <div className="text-xs text-neutral-400 font-normal">{inquiry.email}</div>
                    </td>
                    <td className="px-6 py-4 text-neutral-600 dark:text-neutral-300 font-medium">{inquiry.subject}</td>
                    <td className="px-6 py-4 text-neutral-500 font-mono text-xs">{inquiry.date}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-neutral-400 hover:text-brand-green hover:bg-brand-green/10 rounded-full transition-colors"
                          onClick={() => handleView(inquiry)}
                        >
                          <Eye className="w-4 h-4" />
                          <span className="sr-only">View</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-neutral-400 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-colors"
                          onClick={() => handleDelete(inquiry.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-neutral-100 dark:border-white/5 bg-neutral-50/30 dark:bg-white/[0.01] flex justify-center">
            <span className="text-xs text-neutral-400">Showing {inquiries.length} results</span>
          </div>
        </CardContent>
      </Card>

      {/* Inquiry Detail Modal */}
      <InquiryDetailModal
        inquiry={selectedInquiry}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onStatusChange={handleStatusChange}
      />
    </div>
  )
}
