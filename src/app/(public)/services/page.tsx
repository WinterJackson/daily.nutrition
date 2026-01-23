import { ServicesPageContent } from "@/components/services/ServicesPageContent"
import { getServiceConfig } from "@/lib/service-manager"

export default async function ServicesPage() {
  const serviceConfig = await getServiceConfig()
  const activeServiceIds = Object.keys(serviceConfig).filter(id => serviceConfig[id])

  return (
    <ServicesPageContent activeServiceIds={activeServiceIds} />
  )
}
