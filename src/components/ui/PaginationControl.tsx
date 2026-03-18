"use client"

import { Button } from "@/components/ui/Button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

interface PaginationControlProps {
  totalCount: number
  pageSize: number
  currentPage: number
}

export function PaginationControl({ totalCount, pageSize, currentPage }: PaginationControlProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  const totalPages = Math.ceil(totalCount / pageSize)

  // Don't render if there's only 1 page
  if (totalPages <= 1) return null

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams)
    params.set("page", page.toString())
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="flex items-center justify-center gap-2 mt-12 mb-8">
      <Button
        variant="outline"
        size="icon"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="w-10 h-10 rounded-full border-neutral-200 dark:border-white/10 hover:bg-neutral-100 dark:hover:bg-white/10"
      >
        <ChevronLeft className="w-5 h-5" />
      </Button>
      
      <div className="flex items-center gap-1 mx-4 text-sm font-medium text-neutral-600 dark:text-neutral-400">
        <span>Page {currentPage}</span>
        <span className="text-neutral-300 dark:text-neutral-600">/</span>
        <span>{totalPages}</span>
      </div>

      <Button
        variant="outline"
        size="icon"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="w-10 h-10 rounded-full border-neutral-200 dark:border-white/10 hover:bg-neutral-100 dark:hover:bg-white/10"
      >
        <ChevronRight className="w-5 h-5" />
      </Button>
    </div>
  )
}
