import { getCalendlyUrl } from "@/app/actions/calendly"
import { Skeleton } from "@/components/ui/Skeleton"
import { getServiceConfig } from "@/lib/service-manager"
import { Suspense } from "react"
import { BookingClient } from "./BookingClient"

export default async function BookingPage() {
  const [serviceConfig, calendlyUrl] = await Promise.all([
    getServiceConfig(),
    getCalendlyUrl()
  ])
  
  const activeServiceIds = Object.keys(serviceConfig).filter(id => serviceConfig[id])

  return (
    <Suspense fallback={<div className="container py-24"><Skeleton className="h-[600px] w-full rounded-3xl" /></div>}>
      <BookingClient activeServiceIds={activeServiceIds} calendlyUrl={calendlyUrl} />
    </Suspense>
  )
}
