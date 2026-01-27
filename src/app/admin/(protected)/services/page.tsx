import { getServices } from "@/app/actions/services"
import { ServicesEditor } from "@/components/admin/ServicesEditor"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Layers } from "lucide-react"

export const dynamic = 'force-dynamic'

export default async function AdminServicesPage() {
  const services = await getServices(true) // Include hidden services
  
  return (
    <div className="space-y-8 max-w-[1600px] mx-auto pb-24">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-serif text-olive dark:text-off-white">Service Management</h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1">Edit service details, prices, and visibility.</p>
        </div>
      </div>

      <Card className="border-none shadow-xl shadow-neutral-200/50 dark:shadow-black/20 bg-white/90 dark:bg-white/5 backdrop-blur-md overflow-hidden">
        <CardHeader className="border-b border-neutral-100 dark:border-white/5 pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Layers className="h-5 w-5 text-brand-green" />
            All Services ({services.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ServicesEditor services={services} />
        </CardContent>
      </Card>
    </div>
  )
}
