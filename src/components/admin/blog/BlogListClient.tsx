"use client"

import { deletePost, deletePosts, getBlogStats } from "@/app/actions/blog"; // deletePosts added
import { getCategories } from "@/app/actions/categories"; // Import getCategories
import { BlogFilterBar } from "@/components/admin/blog/BlogFilterBar";
import { BlogStatsCards } from "@/components/admin/blog/BlogStatsCards";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/checkbox"; // Capitalization might vary based on installation, usually lowercase file
import { ConfirmationDialog } from "@/components/ui/ConfirmationDialog";
import { cn } from "@/lib/utils";
import { Calendar, ChevronLeft, ChevronRight, Clock, Edit2, Eye, FileText, Search, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

interface BlogPost {
  id: string
  title: string
  slug: string
  published: boolean
  createdAt: Date
  category: { name: string } | null
  image: string | null
  content?: string
  metaDescription?: string | null
}

interface BlogListClientProps {
  initialPosts: BlogPost[]
  totalCount: number
  currentPage: number
  pageSize: number
}

export function BlogListClient({ initialPosts, totalCount, currentPage, pageSize }: BlogListClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [posts, setPosts] = useState(initialPosts)
  const [stats, setStats] = useState<any>(null)
  const [loadingStats, setLoadingStats] = useState(true)
  const [allCategories, setAllCategories] = useState<string[]>([]) // Store all category names
  
  // Selection
  const [selectedPosts, setSelectedPosts] = useState<string[]>([])
  const [isAllSelected, setIsAllSelected] = useState(false)

  const [postToDelete, setPostToDelete] = useState<string | null>(null) // Single delete
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false) // Bulk delete
  
  const [isPending, startTransition] = useTransition()

  // Get view mode
  const viewMode = searchParams.get("view") === "grid" ? "grid" : "list"

  // Update posts when props change (server-side refresh)
  useEffect(() => {
    setPosts(initialPosts)
    setSelectedPosts([]) 
    setIsAllSelected(false)
  }, [initialPosts])

  // Fetch Stats and Categories dynamically on mount
  useEffect(() => {
      const fetchData = async () => {
          setLoadingStats(true)
          try {
              const [statsData, categoriesData] = await Promise.all([
                  getBlogStats(),
                  getCategories()
              ])
              setStats(statsData)
              // Extract names from category objects
              setAllCategories(categoriesData.map((c: any) => c.name))
          } catch (error) {
              console.error("Failed to fetch dashboard data:", error)
          } finally {
              setLoadingStats(false)
          }
      }
      fetchData()
  }, []) 

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", newPage.toString())
    router.push(`?${params.toString()}`, { scroll: false })
  }

  // Selection Logic
  const toggleSelectAll = () => {
      if (isAllSelected) {
          setSelectedPosts([])
          setIsAllSelected(false)
      } else {
          setSelectedPosts(posts.map(p => p.id))
          setIsAllSelected(true)
      }
  }

  const toggleSelectPost = (id: string) => {
      if (selectedPosts.includes(id)) {
          setSelectedPosts(selectedPosts.filter(pid => pid !== id))
          setIsAllSelected(false)
      } else {
          const newSelected = [...selectedPosts, id]
          setSelectedPosts(newSelected)
          if (newSelected.length === posts.length) setIsAllSelected(true)
      }
  }

  const handleDelete = async () => {
    if (!postToDelete) return
    
    startTransition(async () => {
        const result = await deletePost(postToDelete)
        if (result.success) {
            setPosts(posts.filter(p => p.id !== postToDelete))
            setPostToDelete(null)
            
            // Re-fetch stats
            const newStats = await getBlogStats()
            setStats(newStats)
            
            router.refresh()
        }
    })
  }

  const handleBulkDelete = async () => {
      if (selectedPosts.length === 0) return

      startTransition(async () => {
          const result = await deletePosts(selectedPosts) // Verify import exists
          if (result.success) {
              setPosts(posts.filter(p => !selectedPosts.includes(p.id)))
              setSelectedPosts([])
              setIsAllSelected(false)
              setShowBulkDeleteConfirm(false)
              
              const newStats = await getBlogStats()
              setStats(newStats)
              
              router.refresh()
          }
      })
  }

  const calculateReadTime = (content: string) => {
      if (!content) return "1 min read"
      const wordsPerMinute = 200;
      const noOfWords = content.split(/\s/g).length;
      const minutes = Math.ceil(noOfWords / wordsPerMinute);
      return `${minutes} min read`;
  }

  const totalPages = Math.ceil(totalCount / pageSize)
  // Use fetched allCategories instead of stats-derived list
  const availableCategories = allCategories.length > 0 ? allCategories : []

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* Header */}
      <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold font-serif text-neutral-900 dark:text-white tracking-tight">
                Blogs
            </h1>
            {selectedPosts.length > 0 && (
                <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => setShowBulkDeleteConfirm(true)}
                    className="animate-in fade-in slide-in-from-right-4"
                >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete ({selectedPosts.length})
                </Button>
            )}
      </div>

      {/* 1. Dashboard Stats */}
      <BlogStatsCards stats={stats} isLoading={loadingStats} />

      {/* 2. Filters & Actions */}
      <BlogFilterBar categories={availableCategories} />

      {/* 3. Main Content */}
       <div className="min-w-full min-h-[400px]">
             {posts.length > 0 ? (
                 <>
                    {viewMode === "list" ? (
                        // LIST VIEW
                        <Card className="border-none shadow-lg bg-white/90 dark:bg-white/5 backdrop-blur-sm overflow-hidden">
                            <CardContent className="p-0">
                                <div className="p-4 border-b border-neutral-100 dark:border-white/5 flex items-center gap-4 bg-neutral-50/50 dark:bg-white/5">
                                    <Checkbox 
                                        checked={isAllSelected}
                                        onCheckedChange={toggleSelectAll}
                                        aria-label="Select all"
                                    />
                                    <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Select All</span>
                                </div>
                                <div className="divide-y divide-neutral-100 dark:divide-white/5">
                                    {posts.map((post) => (
                                        <div key={post.id} className={cn(
                                            "group relative flex items-center gap-6 p-6 transition-colors",
                                            selectedPosts.includes(post.id) ? "bg-brand-green/5 dark:bg-brand-green/10" : "hover:bg-neutral-50/50 dark:hover:bg-white/5"
                                        )}>
                                            <Checkbox 
                                                checked={selectedPosts.includes(post.id)}
                                                onCheckedChange={() => toggleSelectPost(post.id)}
                                                className="translate-y-[2px]"
                                            />

                                            {/* Thumbnail */}
                                            <Link href={`/admin/blog/${post.id}`} className="relative h-20 w-20 md:h-24 md:w-24 rounded-xl overflow-hidden flex-shrink-0 bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10 shadow-sm cursor-pointer group-hover:shadow-md transition-all">
                                                {post.image ? (
                                                    <Image 
                                                        src={post.image} 
                                                        alt={post.title} 
                                                        fill 
                                                        className="object-cover transition-transform group-hover:scale-105"
                                                    />
                                                ) : (
                                                    <div className="h-full w-full flex items-center justify-center text-xs text-neutral-400 font-medium bg-neutral-50 dark:bg-white/5">
                                                        <FileText className="w-8 h-8 opacity-20" />
                                                    </div>
                                                )}
                                            </Link>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0 pr-4 space-y-2">
                                                <div className="flex items-center gap-3">
                                                    <span className={cn(
                                                        "px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider",
                                                        post.published 
                                                            ? "bg-green-100 text-green-700 dark:bg-brand-green/20 dark:text-brand-green" 
                                                            : "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400"
                                                    )}>
                                                        {post.published ? "Published" : "Draft"}
                                                    </span>
                                                    <span className="text-xs text-neutral-400 flex items-center gap-1.5">
                                                        <Calendar className="w-3.5 h-3.5" />
                                                        {new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </span>
                                                    <span className="text-xs text-neutral-400 flex items-center gap-1.5 border-l border-neutral-200 dark:border-white/10 pl-3">
                                                        <Clock className="w-3.5 h-3.5" />
                                                        {(post as any).content ? calculateReadTime((post as any).content) : "1 min read"}
                                                    </span>
                                                </div>
                                                <h3 className="text-xl font-serif font-bold text-neutral-800 dark:text-neutral-100 truncate group-hover:text-olive dark:group-hover:text-brand-green transition-colors">
                                                    <Link href={`/admin/blog/${post.id}`} className="focus:outline-none">
                                                        {post.title}
                                                    </Link>
                                                </h3>
                                                <div className="flex items-center gap-2">
                                                    <span className="px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-neutral-100 dark:bg-white/10 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-white/5">
                                                        {post.category?.name || "Uncategorized"}
                                                    </span>
                                                    <span className="text-xs text-neutral-400 font-mono hidden sm:inline-block">
                                                        /{post.slug}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-2">
                                                <Button 
                                                    asChild
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className="h-9 w-9 hover:bg-neutral-100 dark:hover:bg-white/10 text-neutral-500"
                                                    title="View Public Link"
                                                >
                                                    <Link href={`/blog/${post.slug}`} target="_blank">
                                                        <Eye className="w-4 h-4" />
                                                    </Link>
                                                </Button>
                                                
                                                <Button 
                                                    asChild
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className="h-9 w-9 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-500/20 dark:hover:text-blue-400"
                                                    title="Edit"
                                                >
                                                    <Link href={`/admin/blog/${post.id}`}>
                                                        <Edit2 className="w-4 h-4" />
                                                    </Link>
                                                </Button>

                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className="h-9 w-9 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/20 dark:hover:text-red-400"
                                                    onClick={(e) => {
                                                        e.preventDefault()
                                                        e.stopPropagation()
                                                        setPostToDelete(post.id)
                                                    }}
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        // GRID VIEW
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                             {posts.map((post) => (
                                <div key={post.id} className={cn(
                                    "group relative flex flex-col bg-white dark:bg-white/5 rounded-2xl overflow-hidden border transition-all duration-300",
                                    selectedPosts.includes(post.id) ? "border-brand-green ring-2 ring-brand-green/20" : "border-neutral-200 dark:border-white/5 hover:border-olive/30 dark:hover:border-brand-green/30 hover:shadow-xl hover:shadow-olive/5"
                                )}>
                                    {/* Selection Overlay */}
                                    <div className="absolute top-3 left-3 z-20">
                                         <Checkbox 
                                            checked={selectedPosts.includes(post.id)}
                                            onCheckedChange={() => toggleSelectPost(post.id)}
                                            className="bg-white/80 backdrop-blur-sm border-neutral-300 data-[state=checked]:bg-brand-green"
                                        />
                                    </div>

                                    {/* Image Area */}
                                    <Link href={`/admin/blog/${post.id}`} className="relative aspect-[16/10] w-full bg-neutral-100 dark:bg-white/5 overflow-hidden block">
                                        {post.image ? (
                                            <Image 
                                                src={post.image} 
                                                alt={post.title} 
                                                fill 
                                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center text-neutral-300 dark:text-neutral-600">
                                                <FileText className="w-12 h-12 opacity-50" />
                                            </div>
                                        )}
                                        <div className="absolute top-3 right-3 flex gap-2">
                                             <span className={cn(
                                                "px-2.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider backdrop-blur-md shadow-sm border border-white/20",
                                                post.published 
                                                    ? "bg-white/90 text-green-700 dark:bg-black/60 dark:text-brand-green" 
                                                    : "bg-white/90 text-amber-700 dark:bg-black/60 dark:text-amber-400"
                                            )}>
                                                {post.published ? "Published" : "Draft"}
                                            </span>
                                        </div>
                                    </Link>

                                    {/* Content Area */}
                                    <div className="flex-1 p-6 flex flex-col gap-3">
                                        <div className="flex items-center justify-between text-xs text-neutral-400">
                                             <span className="font-medium text-olive dark:text-brand-green px-2 py-0.5 rounded bg-olive/5 dark:bg-brand-green/10">
                                                {post.category?.name || "Uncategorized"}
                                             </span>
                                             <span>
                                                 {new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                             </span>
                                        </div>

                                        <h3 className="text-xl font-serif font-bold text-neutral-800 dark:text-neutral-100 line-clamp-2 leading-tight group-hover:text-olive dark:group-hover:text-brand-green transition-colors">
                                            <Link href={`/admin/blog/${post.id}`} className="focus:outline-none">
                                                {post.title}
                                            </Link>
                                        </h3>
                                        
                                        <p className="text-sm text-neutral-500 line-clamp-2 mb-2">
                                            {(post as any).metaDescription || "No description provided."}
                                        </p>

                                        <div className="mt-auto pt-4 border-t border-neutral-100 dark:border-white/5 flex items-center justify-between">
                                             <span className="text-xs text-neutral-400">
                                                {(post as any).content ? calculateReadTime((post as any).content) : "1 min read"}
                                             </span>
                                             
                                             <div className="flex items-center gap-1 z-10 relative">
                                                <Button 
                                                    asChild
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className="h-8 w-8 hover:bg-neutral-100 dark:hover:bg-white/10 text-neutral-500"
                                                >
                                                    <Link href={`/admin/blog/${post.id}`}>
                                                        <Edit2 className="w-3.5 h-3.5" />
                                                    </Link>
                                                </Button>
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className="h-8 w-8 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/20 dark:hover:text-red-400"
                                                    onClick={(e) => {
                                                        e.preventDefault()
                                                        e.stopPropagation()
                                                        setPostToDelete(post.id)
                                                    }}
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </Button>
                                             </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                 </>
             ) : (
                 <div className="py-20 text-center flex flex-col items-center justify-center bg-white/50 dark:bg-white/5 rounded-3xl border border-dashed border-neutral-300 dark:border-white/10">
                    <div className="h-20 w-20 bg-neutral-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-6 animate-float-slow">
                        <Search className="w-10 h-10 text-neutral-300" />
                    </div>
                    <h3 className="text-xl font-bold font-serif text-neutral-900 dark:text-neutral-100 mb-2">No posts found</h3>
                    <p className="text-neutral-500 max-w-sm mx-auto mb-8">
                        We couldn't find any blog posts matching your filters. Try adjusting your criteria or create a fresh post.
                    </p>
                    <Button 
                        variant="outline"
                        onClick={() => {
                            const params = new URLSearchParams(searchParams.toString());
                            params.delete("q");
                            params.delete("status");
                            params.delete("category");
                            router.push(`?${params.toString()}`);
                        }}
                        className="bg-white hover:bg-neutral-50 dark:bg-transparent dark:hover:bg-white/5"
                    >
                        Clear all filters
                    </Button>
                 </div>
             )}
       </div>
          
      {/* Pagination */}
      {posts.length > 0 && (
        <div className="flex items-center justify-between pt-4">
            <span className="text-xs text-neutral-400">
                Showing {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, totalCount)} of {totalCount}
            </span>
            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage <= 1}
                    className="h-9 w-9 bg-white dark:bg-white/5"
                >
                    <ChevronLeft className="w-4 h-4" />
                </Button>
                <div className="px-4 text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    Page {currentPage} of {totalPages || 1}
                </div>
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                    className="h-9 w-9 bg-white dark:bg-white/5"
                >
                    <ChevronRight className="w-4 h-4" />
                </Button>
            </div>
        </div>
      )}

      {/* Single Delete Dialog */}
      <ConfirmationDialog 
        open={!!postToDelete} 
        onOpenChange={(open) => !open && setPostToDelete(null)}
        title="Delete Post"
        description="Are you sure you want to delete this post? This action cannot be undone."
        confirmText="Delete Permanently"
        variant="destructive"
        onConfirm={handleDelete}
        isLoading={isPending}
      />

      {/* Bulk Delete Dialog */}
        <ConfirmationDialog 
        open={showBulkDeleteConfirm} 
        onOpenChange={(open) => !open && setShowBulkDeleteConfirm(false)}
        title={`Delete ${selectedPosts.length} Posts`}
        description="Are you sure you want to delete the selected posts? This action cannot be undone."
        confirmText="Delete All Selected"
        variant="destructive"
        onConfirm={handleBulkDelete}
        isLoading={isPending}
      />
    </div>
  )
}
