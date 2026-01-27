"use client"

import { deletePost } from "@/app/actions/blog"
import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/Dialog"
import { Input } from "@/components/ui/Input"
import { ChevronLeft, ChevronRight, Edit2, Plus, Search, Trash2 } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState, useTransition } from "react"

interface BlogPost {
  id: string
  title: string
  slug: string
  published: boolean
  createdAt: Date
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
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PUBLISHED" | "DRAFT">("ALL")
  const [postToDelete, setPostToDelete] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    setPosts(initialPosts)
  }, [initialPosts])

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams)
    params.set("page", newPage.toString())
    router.push(`?${params.toString()}`)
  }

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = 
      statusFilter === "ALL" ? true :
      statusFilter === "PUBLISHED" ? post.published :
      !post.published
    
    return matchesSearch && matchesStatus
  })

  const handleDelete = async () => {
    if (!postToDelete) return
    
    startTransition(async () => {
        const result = await deletePost(postToDelete)
        if (result.success) {
            setPosts(posts.filter(p => p.id !== postToDelete))
            setPostToDelete(null)
            router.refresh()
        }
    })
  }

  const totalPages = Math.ceil(totalCount / pageSize)

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-serif text-olive dark:text-off-white">Blog & Announcements</h1>
          <p className="text-neutral-500 dark:text-neutral-400">Manage featured content and news updates.</p>
        </div>
        <Link href="/admin/blog/new">
            <Button className="bg-orange hover:bg-orange/90 text-charcoal font-semibold" data-tooltip="Create New Blog Post">
                <Plus className="mr-2 h-4 w-4" />
                Create New Post
            </Button>
        </Link>
      </div>

      <Card className="border-none shadow-xl shadow-neutral-200/50 dark:shadow-black/20 bg-white/90 dark:bg-white/5 backdrop-blur-md overflow-hidden">
        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 space-y-0">
          <CardTitle>All Posts ({totalCount})</CardTitle>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
             <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-500" />
                <Input
                  placeholder="Search current page..."
                  className="pl-9 w-full sm:w-64 bg-white dark:bg-black/20 border-neutral-200 dark:border-white/10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
             </div>
             <select
                className="h-10 rounded-md border border-neutral-200 dark:border-white/10 bg-white dark:bg-black/20 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
             >
                <option value="ALL">All Status</option>
                <option value="PUBLISHED">Published</option>
                <option value="DRAFT">Draft</option>
             </select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto scrollbar-thin-1px lg:overflow-visible">
            <table className="w-full text-sm text-left">
              <thead className="bg-neutral-50 dark:bg-white/5 text-neutral-500 dark:text-neutral-400 font-medium">
                <tr>
                  <th className="px-6 py-4">Title</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-white/5">
                {filteredPosts.map((post) => (
                  <tr key={post.id} className="group hover:bg-neutral-50/50 dark:hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-medium text-olive dark:text-off-white max-w-xs sm:max-w-md truncate">
                      {post.title}
                    </td>
                    <td className="px-6 py-4 text-neutral-500 font-mono text-xs whitespace-nowrap">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          post.published
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-gray-100 text-gray-800 dark:bg-white/10 dark:text-gray-400"
                        }`}
                      >
                        {post.published ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link 
                           href={`/admin/blog/${post.id}`}
                        >
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 hover:bg-brand-green/10 hover:text-brand-green"
                                data-tooltip="Edit Post"
                            >
                                <Edit2 className="w-4 h-4" />
                            </Button>
                        </Link>
                        
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 hover:bg-red-500/10 hover:text-red-500"
                            onClick={() => setPostToDelete(post.id)}
                            data-tooltip="Delete Post"
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredPosts.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-neutral-500">
                        {posts.length === 0 ? "No posts found. Create one to get started!" : "No posts match your search."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          <div className="p-4 border-t border-neutral-100 dark:border-white/5 bg-neutral-50/30 dark:bg-white/[0.01] flex items-center justify-between">
            <span className="text-xs text-neutral-400">
                Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} posts
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
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!postToDelete} onOpenChange={(open) => !open && setPostToDelete(null)}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Delete Post</DialogTitle>
                <DialogDescription>
                    Are you sure you want to delete this post? This action cannot be undone.
                </DialogDescription>
            </DialogHeader>
            <DialogFooter>
                <Button variant="outline" onClick={() => setPostToDelete(null)}>Cancel</Button>
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
    </div>
  )
}
