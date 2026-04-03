"use client"

import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Plus, Search, Sparkles, Trash2, X } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { useDebounce } from "use-debounce"
import { AIBlogGeneratorModal } from "./AIBlogGeneratorModal"

interface BlogFilterBarProps {
    categories: string[]
}

export function BlogFilterBar({ categories }: BlogFilterBarProps) {
    const router = useRouter()
    const searchParams = useSearchParams()
    
    // State for Search only (needs debounce)
    const [text, setText] = useState(searchParams.get("q") || "")
    const [query] = useDebounce(text, 500)
    
    // Sync Search to URL
    useEffect(() => {
        const params = new URLSearchParams(searchParams.toString())
        
        if (query && query !== (searchParams.get("q") || "")) {
            params.set("q", query)
            params.set("page", "1")
            router.push(`?${params.toString()}`)
        } else if (!query && searchParams.has("q")) {
            params.delete("q")
            params.set("page", "1")
            router.push(`?${params.toString()}`)
        }
    }, [query, router, searchParams])

    const handleFilterChange = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString())
        if (value && value !== "All") {
            params.set(key, value)
        } else {
            params.delete(key)
        }
        params.set("page", "1")
        router.push(`?${params.toString()}`)
    }

    const hasActiveFilters = searchParams.has("q") || searchParams.has("status") || searchParams.has("category")

    const clearFilters = () => {
        setText("")
        router.push("?") // Clear all
    }

    return (
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-6">
            {/* Left: Filters */}
            <div className="flex flex-col sm:flex-row gap-3 flex-1 xl:max-w-3xl">
                {/* Search Group */}
                <div className="relative flex-1 w-full min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none" />
                    <Input 
                        placeholder="Search posts..." 
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        className="pl-9 bg-white/80 dark:bg-white/5 border-neutral-200 dark:border-white/10 w-full"
                    />
                    {text && (
                        <button 
                            onClick={() => {
                                setText("")
                            }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    )}
                </div>

                {/* Dropdowns Group */}
                <div className="flex gap-2 items-start shrink-0">
                    <select 
                        value={searchParams.get("status") || "All"} 
                        onChange={(e) => handleFilterChange("status", e.target.value)}
                        className="h-10 pl-3 pr-8 rounded-md border border-neutral-200 bg-white/80 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 dark:border-white/10 dark:bg-white/5 min-w-[120px]"
                    >
                        <option value="All">All Status</option>
                        <option value="Published">Published</option>
                        <option value="Draft">Draft</option>
                    </select>

                    <select
                        value={searchParams.get("category") || "All"}
                        onChange={(e) => handleFilterChange("category", e.target.value)}
                        className="h-10 pl-3 pr-8 rounded-md border border-neutral-200 bg-white/80 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 dark:border-white/10 dark:bg-white/5 min-w-[140px]"
                    >
                        <option value="All">All Categories</option>
                        {categories.map(c => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>

                    {hasActiveFilters && (
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={clearFilters}
                            className="text-neutral-500 hover:text-red-500 h-10 px-2"
                        >
                            <span className="sr-only">Clear filters</span>
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    )}
                </div>
            </div>

            {/* Right: Actions */}
            <div className="flex flex-wrap items-center gap-2 self-start xl:self-auto w-full xl:w-auto mt-4 xl:mt-0">
                <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                    <Link href="/admin/blog/categories" className="flex-1 sm:flex-none">
                        <Button variant="outline" size="sm" className="w-full sm:w-auto shadow-sm rounded-md transition-all whitespace-nowrap">
                            Categories
                        </Button>
                    </Link>
                    <Link href="/admin/blog/new" className="flex-1 sm:flex-none">
                        <Button size="sm" className="w-full sm:w-auto bg-olive hover:bg-olive/90 text-white shadow-md rounded-md transition-all whitespace-nowrap">
                            <Plus className="w-4 h-4 mr-1" />
                            New Post
                        </Button>
                    </Link>
                    <div className="flex-1 sm:flex-none">
                        <AIBlogGeneratorModal />
                    </div>
                    <Link href="/admin/blog/ai" className="flex-1 sm:flex-none">
                        <Button variant="outline" size="sm" className="w-full sm:w-auto shadow-sm rounded-md transition-all whitespace-nowrap border-orange/20 hover:bg-orange/5">
                            <Sparkles className="w-4 h-4 mr-1 text-orange" />
                            AI Hub
                        </Button>
                    </Link>
                </div>

                {/* View Toggle */}
                <div className="hidden sm:flex items-center bg-white/80 dark:bg-white/5 rounded-md border border-neutral-200 dark:border-white/10 p-1 shrink-0 ml-auto lg:ml-0">
                    <button
                        onClick={() => {
                            const params = new URLSearchParams(searchParams)
                            params.delete("view") // Default to list
                            router.replace(`?${params.toString()}`, { scroll: false })
                        }}
                        className={`p-1 rounded-md transition-all ${
                            !searchParams.get("view") || searchParams.get("view") === "list"
                                ? "bg-white dark:bg-white/10 shadow-sm text-olive dark:text-brand-green"
                                : "text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                        }`}
                        title="List View"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="8" y1="6" x2="21" y2="6"></line>
                            <line x1="8" y1="12" x2="21" y2="12"></line>
                            <line x1="8" y1="18" x2="21" y2="18"></line>
                            <line x1="3" y1="6" x2="3.01" y2="6"></line>
                            <line x1="3" y1="12" x2="3.01" y2="12"></line>
                            <line x1="3" y1="18" x2="3.01" y2="18"></line>
                        </svg>
                    </button>
                    <button
                        onClick={() => {
                            const params = new URLSearchParams(searchParams)
                            params.set("view", "grid")
                            router.replace(`?${params.toString()}`, { scroll: false })
                        }}
                        className={`p-1 rounded-md transition-all ${
                            searchParams.get("view") === "grid"
                                ? "bg-white dark:bg-white/10 shadow-sm text-olive dark:text-brand-green"
                                : "text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                        }`}
                        title="Grid View"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="7" height="7"></rect>
                            <rect x="14" y="3" width="7" height="7"></rect>
                            <rect x="14" y="14" width="7" height="7"></rect>
                            <rect x="3" y="14" width="7" height="7"></rect>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    )
}
