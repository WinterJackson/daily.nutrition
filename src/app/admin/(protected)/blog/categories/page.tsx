import { CategoryManager } from "@/components/admin/blog/CategoryManager"
import { Button } from "@/components/ui/Button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export const metadata = {
  title: "Manage Categories | Admin",
}

export default function CategoriesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon">
          <Link href="/admin/blog">
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </Button>
        <h1 className="text-2xl sm:text-3xl font-bold font-serif text-neutral-900 dark:text-white">
          Categories
        </h1>
      </div>

      <div className="max-w-2xl">
        <CategoryManager />
      </div>
    </div>
  )
}
