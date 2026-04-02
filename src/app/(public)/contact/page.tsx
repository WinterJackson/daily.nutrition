import { getSettings } from "@/app/actions/settings"
import type { Metadata } from "next"
import ContactClient from "./ContactClient"

export async function generateMetadata(): Promise<Metadata> {
  let settings = null
  try {
    settings = await getSettings()
  } catch (error) {
    console.warn("Contact metadata: Failed to fetch settings:", error instanceof Error ? error.message : String(error))
  }
  return {
    title: `Contact Us | ${settings?.businessName || "Edwak Nutrition"}`,
    description: `Get in touch with ${settings?.businessName || "Edwak Nutrition"}. ${settings?.metaDescription || ""}`,
  }
}

export default async function ContactPage() {
  let settings = null
  try {
    settings = await getSettings()
  } catch (error) {
    console.warn("Contact page: Failed to fetch settings:", error instanceof Error ? error.message : String(error))
  }
  
  if (!settings) {
    return <div className="min-h-screen flex items-center justify-center">Loading settings...</div>
  }

  return <ContactClient settings={settings} />
}
