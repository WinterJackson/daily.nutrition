"use client"

import { Input } from "@/components/ui/Input"
import { Search } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { useDebounce } from "use-debounce"

export function SearchInput({ placeholder = "Search..." }: { placeholder?: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const currentQuery = searchParams.get("q") || ""
  
  const [text, setText] = useState(currentQuery)
  const [query] = useDebounce(text, 500)

  useEffect(() => {
    const params = new URLSearchParams(searchParams)
    if (query) {
      params.set("q", query)
      params.set("page", "1") // Reset to page 1 on new search
    } else {
      params.delete("q")
    }
    router.push(`${pathname}?${params.toString()}`)
  }, [query, router, pathname, searchParams])

  return (
    <div className="relative w-full max-w-md mx-auto mb-8">
      <div className="relative group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 group-focus-within:text-brand-green transition-colors" />
        <Input 
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={placeholder}
          className="pl-10 h-10 rounded-full border-neutral-200 dark:border-white/10 bg-white/50 dark:bg-white/5 backdrop-blur-sm focus-visible:ring-brand-green/30"
        />
      </div>
    </div>
  )
}
