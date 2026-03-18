import { getServerEnvStatus, getSettings } from "@/app/actions/settings"
import { hasSecret } from "@/lib/ai/secrets"
import { getCurrentUser } from "@/lib/auth"
import { Loader2 } from "lucide-react"
import SettingsClient from "./SettingsClient"

export default async function AdminSettingsPage() {
  const settings = await getSettings()
  const envStatus = await getServerEnvStatus()
  const user = await getCurrentUser()

  // Generate the configuration map for the frontend to show the Green Encrypted badges securely
  const secretKeysToCheck = [
    "RESEND_API_KEY",
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET",
    "GEMINI_API_KEY"
  ]
  
  const secretStatuses: Record<string, boolean> = {}
  for (const key of secretKeysToCheck) {
      secretStatuses[key] = await hasSecret(key)
  }

  if (!settings || !envStatus) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-brand-green" />
      </div>
    )
  }

  return (
    <SettingsClient 
      initialSettings={settings}
      envStatus={envStatus as any}
      secretStatuses={secretStatuses}
      is2FAEnabled={user?.twoFactorEnabled || false}
    />
  )
}
