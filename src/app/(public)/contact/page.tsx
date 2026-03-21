import { getSettings } from "@/app/actions/settings"
import type { Metadata } from "next"
import ContactClient from "./ContactClient"

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings()
  return {
    title: `Contact Us | ${settings?.businessName || "Daily Nutrition"}`,
    description: `Get in touch with ${settings?.businessName || "Daily Nutrition"}. ${settings?.metaDescription || ""}`,
  }
}

export default async function ContactPage() {
  const settings = await getSettings()
  
  if (!settings) {
    return <div className="min-h-screen flex items-center justify-center">Loading settings...</div>
  }

  return <ContactClient settings={settings} />
}
