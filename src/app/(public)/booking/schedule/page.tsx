import { getCalendarConfig } from "@/app/actions/calendly"
import { Skeleton } from "@/components/ui/Skeleton"
import { Suspense } from "react"
import { ScheduleClient } from "./ScheduleClient"

export default async function SchedulePage() {
  const calendarConfig = await getCalendarConfig()

  return (
    <Suspense fallback={
        <div className="container py-36 max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                <div className="lg:col-span-4 space-y-6">
                    <Skeleton className="h-64 rounded-2xl w-full" />
                    <Skeleton className="h-40 rounded-2xl w-full" />
                </div>
                <div className="lg:col-span-8">
                    <Skeleton className="h-[800px] w-full rounded-2xl" />
                </div>
            </div>
        </div>
    }>
      <ScheduleClient 
        calendarProvider={calendarConfig.provider}
        calendarUrl={calendarConfig.url} 
        googleCalendarConfig={calendarConfig.googleConfig}
      />
    </Suspense>
  )
}
