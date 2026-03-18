"use client"

import { createCategory, deleteCategory, getCategories } from "@/app/actions/categories"
import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Input } from "@/components/ui/Input"
import { FolderOpen, Plus, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState, useTransition } from "react"

interface Category {
    id: string
    name: string
    _count: { posts: number }
}

export function CategoryManager() {
    const [categories, setCategories] = useState<Category[]>([])
    const [newCategory, setNewCategory] = useState("")
    const [isLoading, setIsLoading] = useState(true)
    const [isPending, startTransition] = useTransition()
    const router = useRouter()

    const fetchCategories = async () => {
        setIsLoading(true)
        const data = await getCategories()
        setCategories(data as any)
        setIsLoading(false)
    }

    useEffect(() => {
        fetchCategories()
    }, [])

    const handleCreate = async () => {
        if (!newCategory.trim()) return

        startTransition(async () => {
             const result = await createCategory(newCategory)
             if (result.success) {
                 setNewCategory("")
                 fetchCategories()
                 router.refresh()
             } else {
                 alert("Failed to create category")
             }
        })
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure?")) return

        startTransition(async () => {
            const result = await deleteCategory(id)
            if (result.success) {
                fetchCategories()
                router.refresh()
            } else {
                alert(result.error || "Failed to delete")
            }
        })
    }

    return (
        <Card className="border-none shadow-lg bg-white/90 dark:bg-white/5 backdrop-blur-sm">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl font-serif">
                    <FolderOpen className="w-5 h-5 text-olive" />
                    Manage Categories
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                
                {/* Create Form */}
                <div className="flex gap-2">
                    <Input 
                        placeholder="New category name..." 
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                        className="bg-white/50 dark:bg-white/5"
                    />
                    <Button onClick={handleCreate} disabled={isPending || !newCategory.trim()}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add
                    </Button>
                </div>

                {/* List */}
                <div className="space-y-2">
                    {isLoading ? (
                        <p className="text-sm text-neutral-400">Loading categories...</p>
                    ) : categories.length === 0 ? (
                        <p className="text-sm text-neutral-400">No categories found.</p>
                    ) : (
                        categories.map(cat => (
                            <div key={cat.id} className="flex items-center justify-between p-3 rounded-lg bg-neutral-50 dark:bg-white/5 border border-neutral-100 dark:border-white/5 group hover:border-olive/20 transition-colors">
                                <div className="flex items-center gap-3">
                                    <span className="font-medium text-neutral-700 dark:text-neutral-200">{cat.name}</span>
                                    <span className="text-xs text-neutral-400 bg-white dark:bg-black/20 px-2 py-0.5 rounded-full">
                                        {cat._count.posts} posts
                                    </span>
                                </div>
                                <Button 
                                    size="icon" 
                                    variant="ghost" 
                                    className="h-8 w-8 text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => handleDelete(cat.id)}
                                    disabled={cat._count.posts > 0 || isPending}
                                    title={cat._count.posts > 0 ? "Cannot delete category with posts" : "Delete category"}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
