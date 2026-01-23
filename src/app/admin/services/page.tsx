import { ScrollReveal3D } from "@/components/ui/ScrollReveal3D"
import { getAllServicesWithStatus } from "@/lib/service-manager"
import { Settings } from "lucide-react"
import { ServiceManagerClient } from "./ServiceManagerClient"

export const dynamic = 'force-dynamic'

export default async function AdminServicesPage() {
  const services = await getAllServicesWithStatus()
  
  // Serialize: remove 'icon' function and 'color'/'bgColor' etc if they cause issues, 
  // but mostly just 'icon' (component) needs to be removed.
  const serializedServices = services.map(s => ({
    id: s.id,
    title: s.title,
    shortDescription: s.shortDescription,
    isVisible: s.isVisible
  }))

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto pb-24">
      <ScrollReveal3D>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
            <h1 className="text-3xl font-bold font-serif text-olive dark:text-off-white">Service Management</h1>
            <p className="text-neutral-500 dark:text-neutral-400 mt-1">Control which services are visible to your clients.</p>
            </div>
            <div className="flex items-center gap-3">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-white/5 border border-neutral-200 dark:border-white/10 rounded-lg text-sm text-neutral-600 dark:text-neutral-300">
                    <Settings className="w-4 h-4" />
                    <span>Configuration</span>
                </div>
            </div>
        </div>
      </ScrollReveal3D>

      <ScrollReveal3D delay={0.1}>
        <ServiceManagerClient initialServices={serializedServices} />
      </ScrollReveal3D>
    </div>
  )
}
