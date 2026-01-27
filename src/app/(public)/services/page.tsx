import { getServices } from "@/app/actions/services"
import { ServicesPageContent } from "@/components/services/ServicesPageContent"

export default async function ServicesPage() {
  const services = await getServices()

  return (
    <ServicesPageContent services={services} />
  )
}
