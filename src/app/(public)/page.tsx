import { Hero } from "@/components/home/Hero"
import { HomeCTA } from "@/components/home/HomeCTA"
import { MissionStatement } from "@/components/home/MissionStatement"
import { ServicesOverview } from "@/components/home/ServicesOverview"
import { Testimonials } from "@/components/home/Testimonials"
import { getServiceConfig } from "@/lib/service-manager"

export default async function Home() {
  const serviceConfig = await getServiceConfig()
  // If config is missing for a key, it defaults to true (or handled in ServiceOverview logic, but better to be explicit).
  // Actually, ServiceOverview logic: visibleServices = active ? filter : all.
  // We need to pass the IDs that are TRUE.
  const activeServiceIds = Object.keys(serviceConfig).filter(id => serviceConfig[id])
  
  // Note: If config is empty (first run), we might want to pass undefined or all IDs.
  // service-manager.ts ensures config file exists with default values.
  
  return (
    <>
      <Hero />
      <ServicesOverview activeServiceIds={activeServiceIds.length > 0 ? activeServiceIds : undefined} />
      <MissionStatement />
      <Testimonials />
      <HomeCTA />
    </>
  )
}
