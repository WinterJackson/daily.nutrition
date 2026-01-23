"use client"

import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Edit2, Plus, Trash2 } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

interface BlogPost {
  id: number
  title: string
  category: string
  date: string
  status: "Published" | "Draft"
  content?: string
}

const initialPosts: BlogPost[] = [
  { id: 1, title: "How to manage diabetes during holidays", category: "Education", date: "2024-03-10", status: "Published", content: "The holidays can be challenging for diabetes management..." },
  { id: 2, title: "New Clinic Opening in South C", category: "Announcement", date: "2024-03-01", status: "Published", content: "We are excited to announce our new clinic location..." },
  { id: 3, title: "Top 5 Gut Friendly Foods", category: "Nutrition Tips", date: "2024-02-28", status: "Draft", content: "Good gut health starts with what you eat..." },
]

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>(initialPosts)

  const handleDelete = (id: number) => {
    setPosts((prev) => prev.filter((p) => p.id !== id))
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-serif text-olive dark:text-off-white">Blog & Announcements</h1>
          <p className="text-neutral-500 dark:text-neutral-400">Manage featured content and news updates.</p>
        </div>
        <Link href="/admin/blog/new" className="inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:ring-offset-charcoal dark:focus-visible:ring-brand-green bg-orange text-charcoal hover:bg-orange/90 font-semibold h-10 px-4 py-2">
            <Plus className="mr-2 h-4 w-4" />
            Create New Post
        </Link>
      </div>

      <Card className="border-none shadow-xl shadow-neutral-200/50 dark:shadow-black/20 bg-white/90 dark:bg-white/5 backdrop-blur-md overflow-hidden">
        <CardHeader>
          <CardTitle>All Posts</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-neutral-50 dark:bg-white/5 text-neutral-500 dark:text-neutral-400 font-medium">
                <tr>
                  <th className="px-6 py-4">Title</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-white/5">
                {posts.map((post) => (
                  <tr key={post.id} className="group hover:bg-neutral-50/50 dark:hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-medium text-olive dark:text-off-white">
                      {post.title}
                    </td>
                    <td className="px-6 py-4 text-neutral-500">
                      <span className="bg-brand-green/10 text-brand-green px-2 py-1 rounded-md text-xs">
                        {post.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-neutral-500 font-mono text-xs">{post.date}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          post.status === "Published"
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-gray-100 text-gray-800 dark:bg-white/10 dark:text-gray-400"
                        }`}
                      >
                        {post.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link 
                           href={`/admin/blog/${post.id}`}
                           className="inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:ring-offset-charcoal dark:focus-visible:ring-brand-green hover:bg-brand-green/10 hover:text-brand-green h-8 w-8"
                        >
                            <Edit2 className="w-4 h-4" />
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-neutral-500 hover:text-red-500"
                          onClick={() => handleDelete(post.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
