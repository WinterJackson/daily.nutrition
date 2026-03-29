import { Skeleton } from "@/components/ui/Skeleton"
import { getServiceConfig } from "@/lib/service-manager"
import type { Metadata } from "next"
import { Suspense } from "react"
import { BookingClient } from "./BookingClient"

export const metadata: Metadata = {
  title: "Book a Consultation | Edwak Nutrition",
  description: "Book a virtual or in-person nutrition consultation with Edwak Nutrition. Choose your service, select a time, and get expert dietary guidance tailored to your needs.",
  openGraph: {
    title: "Book a Consultation | Edwak Nutrition",
    description: "Schedule your personalized nutrition consultation — virtual or in-person appointments available.",
    type: "website",
  },
}

export default async function BookingPage() {
  const [serviceConfig, services] = await Promise.all([
      getServiceConfig(),
      import('@/app/actions/services').then(mod => mod.getServices())
  ])
  const activeServiceIds = Object.keys(serviceConfig).filter(id => serviceConfig[id])

  return (
    <Suspense fallback={<div className="container py-24"><Skeleton className="h-[600px] w-full rounded-3xl" /></div>}>
      <BookingClient activeServiceIds={activeServiceIds} services={services} />
    </Suspense>
  )
}
