import { getTestimonials } from "@/app/actions/testimonials"
import { TestimonialsManager } from "@/components/admin/TestimonialsManager"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Star } from "lucide-react"

export default async function AdminTestimonialsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const page = typeof params.page === 'string' ? parseInt(params.page) : 1
  const pageSize = 10
  
  const { testimonials, totalCount } = await getTestimonials(undefined, page, pageSize)

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-serif text-olive dark:text-off-white">Testimonials</h1>
          <p className="text-caption mt-1">Manage customer reviews and success stories.</p>
        </div>
      </div>

      <Card className="surface-card overflow-hidden">
        <CardHeader className="border-b border-subtle pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Star className="h-5 w-5 text-gold" />
            All Reviews ({totalCount})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <TestimonialsManager 
            testimonials={testimonials as any} 
            totalCount={totalCount}
            currentPage={page}
            pageSize={pageSize}
          />
        </CardContent>
      </Card>
    </div>
  )
}
