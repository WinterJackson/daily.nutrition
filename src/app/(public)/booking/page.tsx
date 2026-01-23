import { getServiceConfig } from "@/lib/service-manager"
import { BookingClient } from "./BookingClient"

export default async function BookingPage() {
  const serviceConfig = await getServiceConfig()
  const activeServiceIds = Object.keys(serviceConfig).filter(id => serviceConfig[id])

  return (
    <BookingClient activeServiceIds={activeServiceIds} />
  )
}
