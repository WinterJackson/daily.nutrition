import { getServices } from "@/app/actions/services"
import { ServicesPageContent } from "@/components/services/ServicesPageContent"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Services | Edwak Nutrition",
  description: "Explore our nutrition services: oncology nutrition, diabetes management, gut health, weight management, and more. Virtual and in-person consultations available.",
  openGraph: {
    title: "Nutrition Services | Edwak Nutrition",
    description: "Expert nutrition services including oncology nutrition, diabetes management, gut health, and weight management consultations.",
    type: "website",
  },
}

export default async function ServicesPage() {
  let services: any[] = []
  try {
    services = await getServices()
  } catch {
    // Database unavailable — render without services
  }

  return (
    <ServicesPageContent services={services} />
  )
}
