"use client"

import { EnvStatusMap, SettingsData, updateSettings, upsertIntegrationSecrets } from "@/app/actions/settings"
import { deleteImage, uploadImage } from "@/app/actions/upload"
import { DataExport } from "@/components/admin/DataExport"
import { EmailBrandingEditor } from "@/components/admin/EmailBrandingEditor"
import { LegalContentConfig } from "@/components/admin/LegalContentConfig"
import { MediaPickerModal } from "@/components/admin/MediaPickerModal"
import { NotificationConfig } from "@/components/admin/NotificationConfig"
import { SecurityConfig } from "@/components/admin/SecurityConfig"
import { SessionManagement } from "@/components/admin/SessionManagement"
import { SecretCard } from "@/components/admin/settings/SecretCard"
import { StatusCard } from "@/components/admin/settings/StatusCard"
import { SocialMediaConfig } from "@/components/admin/SocialMediaConfig"
import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card"
import { Input } from "@/components/ui/Input"
import { getPublicIdFromUrl } from "@/lib/cloudinary-utils"
import { Calendar, CheckCircle, ChevronDown, Clock, Database, Globe, ImageIcon, Key, Loader2, MapPin, Moon, Save, Sparkles, Star, Sun, Trash2 } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState, useTransition } from "react"

// Google Calendar Setup Steps
const googleCalendarSetupSteps = [
  {
    step: 1,
    title: "Create a Google Cloud Project",
    description: "Go to console.cloud.google.com → click the project selector dropdown at the top → 'New Project'. Give it any name (e.g. 'My Booking Calendar') and click Create. Wait ~30 seconds for it to provision.",
    action: { label: "Open Google Cloud Console", url: "https://console.cloud.google.com/" }
  },
  {
    step: 2,
    title: "Enable the Google Calendar API",
    description: "With your new project selected, go to the left sidebar → 'APIs & Services' → 'Library'. In the search bar, type 'Google Calendar API'. Click on the result and press the blue 'Enable' button. This gives your project permission to interact with Google Calendar.",
    action: { label: "Go to API Library", url: "https://console.cloud.google.com/apis/library/calendar-json.googleapis.com" }
  },
  {
    step: 3,
    title: "Create a Service Account",
    description: "Go to 'APIs & Services' → 'Credentials' in the sidebar. Click '+ Create Credentials' at the top → select 'Service Account'. Enter a name like 'booking-bot'. Leave all other options default and click 'Create and Continue' → 'Done'. You'll see it listed under Service Accounts.",
    action: { label: "Go to Credentials", url: "https://console.cloud.google.com/apis/credentials" }
  },
  {
    step: 4,
    title: "Generate a JSON Key File",
    description: "Click on the Service Account you just created → go to the 'Keys' tab → 'Add Key' → 'Create new key' → select 'JSON' → click 'Create'. A .json file will download automatically. Keep this file safe — it contains your credentials. Open it with any text editor to copy the 'client_email' and 'private_key' values.",
  },
  {
    step: 5,
    title: "Share Your Calendar with the Service Account",
    description: "Open Google Calendar (calendar.google.com) → click the ⚙️ gear icon → Settings. In the left sidebar under 'Settings for my calendars', find the calendar you want to use. Click 'Share with specific people or groups' → 'Add people and groups'. Paste the 'client_email' from your JSON file (it looks like booking-bot@project-name.iam.gserviceaccount.com). Set the permission to 'Make changes to events' → Click Send.",
    action: { label: "Open Google Calendar Settings", url: "https://calendar.google.com/calendar/r/settings" }
  },
  {
    step: 6,
    title: "Find Your Calendar ID",
    description: "Still in Google Calendar Settings, scroll down under your calendar's settings to 'Integrate calendar'. Copy the 'Calendar ID' — for your primary calendar this is usually your Gmail address (e.g. hello@edwaknutrition.co.ke). For other calendars, it will be a long string ending in @group.calendar.google.com.",
  },
  {
    step: 7,
    title: "Paste Everything Below",
    description: "Enter your Calendar ID in the field above. Then paste your 'client_email' and 'private_key' from the downloaded JSON file into their respective secure fields below. The private key is very long and starts with '-----BEGIN PRIVATE KEY-----'. Make sure you copy the entire value. Click Save when done.",
  }
]

// Resend Email Setup Steps
const resendSetupSteps = [
  {
    step: 1,
    title: "Create a Resend Account",
    description: "Go to resend.com and sign up for a free account using your business email.",
    url: "https://resend.com/signup"
  },
  {
    step: 2,
    title: "Verify Your Domain",
    description: "In the Resend dashboard, click 'Domains' and add edwaknutrition.co.ke. You will need to add the provided DNS records to your domain provider (e.g., GoDaddy, Namecheap) to prove you own it.",
  },
  {
    step: 3,
    title: "Generate API Key",
    description: "Click 'API Keys' on the left sidebar. Click 'Create API Key', name it 'Edwak Nutrition Prod', and give it Full Access.",
  },
  {
    step: 4,
    title: "Paste Key Below",
    description: "Copy the long string starting with 're_' and paste it securely into the input field below.",
  }
]

// Cloudinary Setup Steps
const cloudinarySetupSteps = [
  {
    step: 1,
    title: "Create a Cloudinary Account",
    description: "Create a free account at cloudinary.com. This service will host and optimize all your blog and profile images.",
    url: "https://cloudinary.com/users/register/free"
  },
  {
    step: 2,
    title: "Find Your Dashboard",
    description: "Once logged in, go to your main API Dashboard or Programmable Media section. You will see your 'Product Environment Credentials' prominently displayed.",
  },
  {
    step: 3,
    title: "Copy Cloud Name",
    description: "Copy the 'Cloud Name' (usually a random string of letters/numbers or your company name) and paste it into the Cloud Name field below.",
  },
  {
    step: 4,
    title: "Copy API Keys",
    description: "Copy both your 'API Key' and your 'API Secret' and paste them into their respective fields below.",
  }
]

// OpenRouter Setup Steps
const openRouterSetupSteps = [
  {
    step: 1,
    title: "Create an OpenRouter Account",
    description: "Go to openrouter.ai and sign up for a free account. No credit card required — the free tier gives you access to powerful AI models like Llama 3.3 70B.",
    url: "https://openrouter.ai/"
  },
  {
    step: 2,
    title: "Generate an API Key",
    description: "Go to your Dashboard → Keys → 'Create Key'. Give it a name like 'Edwak Nutrition'. The key starts with 'sk-or-'.",
    url: "https://openrouter.ai/keys"
  },
  {
    step: 3,
    title: "Paste Your Key Below",
    description: "Copy the full API key and paste it into the field below. Free tier includes 50 requests/day (upgradable to 1000/day with a one-time $10 credit top-up).",
  }
]

// Google Reviews (Places API) Setup Steps
const googleReviewsSetupSteps = [
  {
    step: 1,
    title: "Enable the Places API",
    description: "Go to the Google Cloud Console APIs Library and search for 'Places API (New)'. Click 'Enable'. If you already have a Google Cloud project from Calendar setup, use that same project.",
    url: "https://console.cloud.google.com/apis/library/places-backend.googleapis.com"
  },
  {
    step: 2,
    title: "Create an API Key",
    description: "Go to APIs & Services → Credentials → '+ CREATE CREDENTIALS' → 'API key'. Restrict this key to only the 'Places API (New)' for security.",
    url: "https://console.cloud.google.com/apis/credentials"
  },
  {
    step: 3,
    title: "Find Your Google Place ID",
    description: "Search for your business on the Place ID Finder tool. Copy the Place ID (it starts with 'ChIJ...'). Paste it into the 'Google Place ID' field below.",
    url: "https://developers.google.com/maps/documentation/places/web-service/place-id"
  },
  {
    step: 4,
    title: "Paste Your API Key Below",
    description: "Copy the API key you generated in Step 2 and paste it into the secure field below. Then click Save.",
  }
]

export interface SettingsClientProps {
  initialSettings: SettingsData
  envStatus: EnvStatusMap
  secretStatuses: Record<string, boolean>
  is2FAEnabled: boolean
}

export default function SettingsClient({ initialSettings, envStatus, secretStatuses, is2FAEnabled }: SettingsClientProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("general")
  const [settings, setSettings] = useState<SettingsData>(initialSettings)
  const [isSaving, startTransition] = useTransition()

  // Deep prop sync: Ensure incoming server props overwrite stale local state on navigation/revalidation
  useEffect(() => {
    setSettings(initialSettings)
  }, [initialSettings])

  const [saveSuccess, setSaveSuccess] = useState(false)
  const [expandedStep, setExpandedStep] = useState<number | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [isMediaPickerOneOpen, setIsMediaPickerOneOpen] = useState(false)
  const [isMediaPickerTwoOpen, setIsMediaPickerTwoOpen] = useState(false)

  // Collapsible section states
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({})
  const toggleSection = (key: string) => setOpenSections(prev => ({ ...prev, [key]: !prev[key] }))

  const [secrets, setSecrets] = useState({
      RESEND_API_KEY: "",
      CLOUDINARY_CLOUD_NAME: "",
      CLOUDINARY_API_KEY: "",
      CLOUDINARY_API_SECRET: "",
      OPENROUTER_API_KEY: "",
      GOOGLE_CALENDAR_CLIENT_EMAIL: "",
      GOOGLE_CALENDAR_PRIVATE_KEY: "",
      GOOGLE_MAPS_API_KEY: ""
  })

  const handleChange = (key: keyof SettingsData, value: string | number) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const handleMapEmbedChange = (value: string) => {
    const match = value.match(/src="([^"]+)"/)
    if (match && match[1]) {
      handleChange("googleMapsEmbedUrl", match[1])
    } else {
      handleChange("googleMapsEmbedUrl", value)
    }
  }

  const handleEmailBrandingChange = (key: keyof import("@/app/actions/email-branding").EmailBrandingData, value: string | null) => {
    setSettings((prev) => ({
      ...prev,
      emailBranding: {
        ...(prev.emailBranding || {
          logoUrl: null,
          primaryColor: "#516B4D",
          accentColor: "#C8553D",
          footerText: "",
          websiteUrl: "",
          supportEmail: ""
        }),
        [key]: value
      }
    }))
  }

  const handleNotificationChange = (key: string, value: string | boolean) => {
    setSettings((prev) => ({
      ...prev,
      notificationPreferences: {
        ...(prev.notificationPreferences || {
          emailOnNewBooking: true,
          emailOnCancellation: true,
          emailOnReschedule: true,
          emailDailyAgenda: false,
          agendaTime: "08:00"
        }),
        [key]: value
      }
    }))
  }

  const handleSave = () => {
    startTransition(async () => {
      const result = await updateSettings(settings)
      if (result && !result.success) {
        alert(`Save failed: ${result.error || "Unknown error"}`)
        return
      }

      // Critically: Update local state with the newly incremented version integer
      if (result && result.success) {
        setSettings(prev => ({ 
            ...prev, 
            version: (prev.version || 0) + 1,
            // Clear the locally typed credentials so the UI reverts to the "••••" mask
            googleCalendarConfig: prev.googleCalendarConfig ? {
                ...prev.googleCalendarConfig,
                clientEmail: "",
                privateKey: "",
                hasCredentials: true // Force it to show as connected
            } : undefined
        }))
      }

      // Save integrations encrypted
      const payload = Object.entries(secrets)
          .filter(([_, value]) => value.trim() !== "")
          .map(([key, value]) => ({ key, value }))

      if (payload.length > 0) {
          const secretResult = await upsertIntegrationSecrets(payload)
          if (secretResult && !secretResult.success) {
            alert(`Secret save failed: ${secretResult.error || "Unknown error"}`)
            return
          }
          // Clear after save
          setSecrets({
              RESEND_API_KEY: "",
              CLOUDINARY_CLOUD_NAME: "",
              CLOUDINARY_API_KEY: "",
              CLOUDINARY_API_SECRET: "",
              OPENROUTER_API_KEY: "",
              GOOGLE_CALENDAR_CLIENT_EMAIL: "",
              GOOGLE_CALENDAR_PRIVATE_KEY: "",
              GOOGLE_MAPS_API_KEY: ""
          })
      }

      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    })
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      const result = await uploadImage(formData)
      if (result.success && result.url) {
        setSettings(prev => ({ ...prev, profileImageUrl: result.url }))
        // Auto-save when image is uploaded
        const res = await updateSettings({ ...settings, profileImageUrl: result.url })
        if (res?.success) {
          setSaveSuccess(true)
          setTimeout(() => setSaveSuccess(false), 3000)
        }
      }
    } catch (error) {
      console.error("Upload failed:", error)
    } finally {
      setIsUploading(false)
    }
  }

  const handleImageDelete = async () => {
    const currentUrl = settings.profileImageUrl
    
    // First delete from Cloudinary if it's a Cloudinary URL
    if (currentUrl && currentUrl.includes('cloudinary.com')) {
      const publicId = getPublicIdFromUrl(currentUrl)
      if (publicId) {
        await deleteImage(publicId)
      }
    }

    // Clear the profileImageUrl in DB
    setSettings(prev => ({ ...prev, profileImageUrl: "" }))
    const res = await updateSettings({ ...settings, profileImageUrl: "" })
    if (res?.success) {
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    }
  }



  return (
    <div className="space-y-8 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-serif text-body flex items-center gap-3">Settings</h1>
          <p className="text-caption mt-1">Configure your platform preferences.</p>
        </div>
        <Button
          variant="accent"
          className="shadow-lg shadow-orange/20"
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : saveSuccess ? (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              Saved!
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      {/* Success Toast */}
      {saveSuccess && (
        <div className="fixed bottom-6 right-6 flex items-center gap-3 px-4 py-3 bg-brand-green text-white rounded-xl shadow-xl animate-in slide-in-from-bottom-4 z-50">
          <CheckCircle className="w-5 h-5" />
          <span className="font-medium">Settings saved successfully!</span>
        </div>
      )}

      {/* Custom Tabs Navigation */}
      <div className="flex items-center gap-1 p-1 surface-secondary rounded-xl w-fit">
        {[
          { id: "general", label: "General" },
          { id: "seo", label: "SEO" },
          { id: "integrations", label: "Integrations", icon: Calendar },
          { id: "environment", label: "Environment", icon: Database },
          { id: "access", label: "Access" },
        ].map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                isActive
                  ? "surface-elevated text-body shadow-sm"
                  : "text-label hover:text-body"
              }`}
            >
              {tab.icon && <tab.icon className="w-4 h-4" />}
              {tab.label}
            </button>
          )
        })}
      </div>

      <div className="relative min-h-[500px]">
        {/* General Tab */}
        {activeTab === "general" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <Card className="surface-card">
              <CardHeader>
                <CardTitle>Business Details</CardTitle>
                <CardDescription>This information is visible in the public footer and contact pages.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-caption">Business Name</label>
                    <Input
                      value={settings.businessName}
                      onChange={(e) => handleChange("businessName", e.target.value)}
                      className="surface-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-caption">Contact Email</label>
                    <Input
                      value={settings.contactEmail}
                      onChange={(e) => handleChange("contactEmail", e.target.value)}
                      className="surface-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-caption">Phone Number</label>
                    <Input
                      value={settings.phoneNumber}
                      onChange={(e) => handleChange("phoneNumber", e.target.value)}
                      className="surface-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-caption">Address</label>
                    <Input
                      value={settings.address}
                      onChange={(e) => handleChange("address", e.target.value)}
                      className="surface-input"
                    />
                  </div>
                  <div className="space-y-4 md:col-span-2 pt-4 border-t border-neutral-100 dark:border-white/5">
                    <h3 className="font-semibold text-olive dark:text-off-white text-base">Payment Credentials</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                           <label className="text-xs font-bold uppercase tracking-wider text-caption">Safaricom Till Number</label>
                           <Input
                             value={settings.paymentTillNumber || ""}
                             onChange={(e) => handleChange("paymentTillNumber", e.target.value)}
                             placeholder="e.g. 123456"
                             className="surface-input"
                           />
                           <p className="text-xs text-neutral-500">Leaving this blank hides it from confirmation emails.</p>
                        </div>
                        <div className="space-y-2">
                           <label className="text-xs font-bold uppercase tracking-wider text-caption">Safaricom Paybill</label>
                           <Input
                             value={settings.paymentPaybill || ""}
                             onChange={(e) => handleChange("paymentPaybill", e.target.value)}
                             placeholder="e.g. 123456"
                             className="surface-input"
                           />
                           <p className="text-xs text-neutral-500">Leaving this blank hides it from confirmation emails.</p>
                        </div>
                        <div className="space-y-2">
                           <label className="text-xs font-bold uppercase tracking-wider text-caption">Account Number</label>
                           <Input
                             value={settings.paymentAccountNumber || ""}
                             onChange={(e) => handleChange("paymentAccountNumber", e.target.value)}
                             placeholder="e.g. Edwak Nutrition"
                             className="surface-input"
                           />
                           <p className="text-xs text-neutral-500">Leaving this blank hides it from confirmation emails.</p>
                        </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4 md:col-span-2 pt-4 border-t border-neutral-100 dark:border-white/5">
                    <div className="space-y-2">
                       <label className="text-xs font-bold uppercase tracking-wider text-caption flex items-center gap-2">
                         <MapPin className="w-4 h-4 text-brand-green" />
                         Google Maps Embed HTML
                       </label>
                       <p className="text-xs text-neutral-500 pr-10">Paste the full <b>&lt;iframe&gt;</b> code from Google Maps here. We will securely extract your explicit Google Embed link to guarantee pixel-perfect UI synchronization on the public Contact page.</p>
                       <Input
                         value={settings.googleMapsEmbedUrl}
                         onChange={(e) => handleMapEmbedChange(e.target.value)}
                         placeholder='<iframe src="https://www.google.com/maps/embed?..." width="600" height="450"...></iframe>'
                         className="surface-input h-14 font-mono text-xs text-neutral-500"
                       />
                    </div>
                  
                    {/* Map Coordinates Preview */}
                    <div className="space-y-2 pt-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-caption mb-2 block flex items-center gap-2">
                         <Globe className="w-4 h-4 text-brand-green" />
                         Live Location Preview
                      </label>
                      <iframe 
                        src={settings.googleMapsEmbedUrl || `https://maps.google.com/maps?q=${encodeURIComponent(`${settings.businessName || "Edwak Nutrition"} ${settings.address || "Nairobi"}`)}&t=&z=16&ie=UTF8&iwloc=&output=embed`}
                        width="100%" 
                        height="300" 
                        style={{ border: 0 }} 
                        allowFullScreen 
                        loading="lazy" 
                        referrerPolicy="no-referrer-when-downgrade"
                        title="Admin Map Preview"
                        className="rounded-xl border border-neutral-200 dark:border-white/10 shadow-inner"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>



            {/* About Page Carousel Images */}
            <Card className="surface-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-brand-green" />
                  About Page Slideshow Images
                </CardTitle>
                <CardDescription>These 2 images will be automatically displayed inside a beautiful slider on the About page interface. Please use professional portrait or clinic photos.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Image One */}
                  <div className="space-y-4">
                    <label className="text-xs font-bold uppercase tracking-wider text-caption">Slideshow Image 1</label>
                    <div className="relative w-full aspect-[2/3] max-h-[300px] rounded-2xl overflow-hidden surface-secondary border-2 border-dashed border-default flex flex-col items-center justify-center p-4">
                      {settings.aboutImageOne ? (
                        <>
                          <Image src={settings.aboutImageOne} alt="About Slide 1" fill className="object-cover" />
                        </>
                      ) : (
                        <div className="text-center text-muted">
                           <ImageIcon className="w-10 h-10 mx-auto mb-2 opacity-50" />
                           <p className="text-xs">No image selected</p>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                       <Button type="button" variant="outline" onClick={() => setIsMediaPickerOneOpen(true)} className="flex-1">
                          {settings.aboutImageOne ? "Change Image" : "Select Image"}
                       </Button>
                       {settings.aboutImageOne && (
                          <Button type="button" variant="ghost" onClick={() => handleChange("aboutImageOne", "")} className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 px-3">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                       )}
                    </div>
                  </div>

                  {/* Image Two */}
                  <div className="space-y-4">
                    <label className="text-xs font-bold uppercase tracking-wider text-caption">Slideshow Image 2</label>
                    <div className="relative w-full aspect-[2/3] max-h-[300px] rounded-2xl overflow-hidden surface-secondary border-2 border-dashed border-default flex flex-col items-center justify-center p-4">
                      {settings.aboutImageTwo ? (
                        <>
                          <Image src={settings.aboutImageTwo} alt="About Slide 2" fill className="object-cover" />
                        </>
                      ) : (
                        <div className="text-center text-muted">
                           <ImageIcon className="w-10 h-10 mx-auto mb-2 opacity-50" />
                           <p className="text-xs">No image selected</p>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                       <Button type="button" variant="outline" onClick={() => setIsMediaPickerTwoOpen(true)} className="flex-1">
                          {settings.aboutImageTwo ? "Change Image" : "Select Image"}
                       </Button>
                       {settings.aboutImageTwo && (
                          <Button type="button" variant="ghost" onClick={() => handleChange("aboutImageTwo", "")} className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 px-3">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                       )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <MediaPickerModal 
              open={isMediaPickerOneOpen}
              onOpenChange={setIsMediaPickerOneOpen}
              onSelect={(url) => handleChange("aboutImageOne", url)}
              allowedTypes="image"
            />
            <MediaPickerModal 
              open={isMediaPickerTwoOpen}
              onOpenChange={setIsMediaPickerTwoOpen}
              onSelect={(url) => handleChange("aboutImageTwo", url)}
              allowedTypes="image"
            />

            {/* Theme Preference Card */}
            <Card className="surface-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sun className="w-5 h-5 text-orange" />
                  Default Theme
                </CardTitle>
                <CardDescription>Set the default theme for website visitors.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 p-4 rounded-xl surface-secondary">
                  <button
                    onClick={() => handleChange("themePreference", "light")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                      settings.themePreference === "light"
                        ? "bg-white dark:bg-charcoal shadow-md ring-2 ring-brand-green"
                        : "hover:bg-white/50 dark:hover:bg-white/10"
                    }`}
                  >
                    <Sun className="w-4 h-4" />
                    <span className="font-medium">Light</span>
                  </button>
                  <button
                    onClick={() => handleChange("themePreference", "dark")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                      settings.themePreference === "dark"
                        ? "bg-white dark:bg-charcoal shadow-md ring-2 ring-brand-green"
                        : "hover:bg-white/50 dark:hover:bg-white/10"
                    }`}
                  >
                    <Moon className="w-4 h-4" />
                    <span className="font-medium">Dark</span>
                  </button>
                </div>
                <p className="text-xs text-caption mt-3">
                  This sets the default theme for new visitors. Users can still toggle the theme manually.
                </p>
              </CardContent>
            </Card>

            {/* Social Media Links */}
            <SocialMediaConfig
              settings={settings}
              onChange={handleChange}
              onSave={handleSave}
              isSaving={isSaving}
              isOpen={openSections.social ?? false}
              onToggle={() => toggleSection('social')}
            />

            {/* Legal Content */}
            <LegalContentConfig
              settings={settings}
              onChange={handleChange}
              onSave={handleSave}
              isSaving={isSaving}
              isOpen={openSections.legal ?? false}
              onToggle={() => toggleSection('legal')}
            />

            {/* Email Branding */}
            <div className="bg-white dark:bg-charcoal rounded-xl border border-neutral-200 dark:border-white/10 overflow-hidden">
                <div 
                    className="p-6 cursor-pointer flex justify-between items-center hover:bg-neutral-50 dark:hover:bg-white/5 transition-colors"
                    onClick={() => toggleSection('branding')}
                >
                    <div>
                        <h3 className="font-semibold text-olive dark:text-off-white flex items-center gap-2">
                            <ImageIcon className="w-5 h-5" />
                            Email Branding
                        </h3>
                        <p className="text-sm text-neutral-500 mt-1">Configure logos and colors for outbound emails</p>
                    </div>
                </div>
                {openSections.branding && (
                    <div className="p-6 border-t border-neutral-100 dark:border-white/5 bg-neutral-50/50 dark:bg-black/20">
                        <EmailBrandingEditor 
                            branding={{
                                logoUrl: settings.emailBranding?.logoUrl || null,
                                primaryColor: settings.emailBranding?.primaryColor || "#516B4D",
                                accentColor: settings.emailBranding?.accentColor || "#C8553D",
                                footerText: settings.emailBranding?.footerText || "",
                                websiteUrl: settings.emailBranding?.websiteUrl || "",
                                supportEmail: settings.emailBranding?.supportEmail || ""
                            }} 
                            onChange={handleEmailBrandingChange} 
                        />
                    </div>
                )}
            </div>
          </div>
        )}

        {/* SEO Tab */}
        {activeTab === "seo" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <Card className="surface-card">
              <CardHeader>
                <CardTitle>SEO Configuration</CardTitle>
                <CardDescription>Optimize how your site appears in search engine results.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-caption">Default Page Title</label>
                    <Input
                      value={settings.pageTitle}
                      onChange={(e) => handleChange("pageTitle", e.target.value)}
                      className="surface-input"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-caption">Meta Description</label>
                    <textarea
                      className="flex min-h-[100px] w-full rounded-xl surface-input border-default px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green focus-visible:ring-offset-2 dark:ring-offset-charcoal"
                      value={settings.metaDescription}
                      onChange={(e) => handleChange("metaDescription", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-caption">Keywords</label>
                    <Input
                      value={settings.keywords}
                      onChange={(e) => handleChange("keywords", e.target.value)}
                      className="surface-input"
                    />
                    <p className="text-xs text-caption italic">Separate keywords with commas.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Integrations Tab - EXTENDED WITH SECRETS */}
        {activeTab === "integrations" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">

            <Card className="surface-card">
              <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                       <Key className="w-5 h-5 text-olive" />
                       Encrypted API Keys
                  </CardTitle>
                  <CardDescription>
                      These keys are encrypted via AES-256-GCM before being stored in the DB.
                  </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-6 surface-secondary rounded-xl p-6">
                   <SecretCard saveSuccess={saveSuccess}
                       title="Resend API Key"
                       description="Used for dispatching transactional emails."
                       secretKey="RESEND_API_KEY"
                       docsLink="https://resend.com/api-keys"
                       docsLabel="Resend Console"
                       isConfigured={secretStatuses["RESEND_API_KEY"]}
                       value={secrets.RESEND_API_KEY}
                       onChange={(v) => setSecrets(p => ({ ...p, RESEND_API_KEY: v }))}
                       setupSteps={resendSetupSteps}
                   />

                   <SecretCard saveSuccess={saveSuccess}
                       title="OpenRouter API Key"
                       description="Powers the AI content workflows (TrendScout, Draft Generation). Free tier uses Llama 3.3 70B."
                       secretKey="OPENROUTER_API_KEY"
                       docsLink="https://openrouter.ai/keys"
                       docsLabel="OpenRouter Dashboard"
                       isConfigured={secretStatuses["OPENROUTER_API_KEY"]}
                       value={secrets.OPENROUTER_API_KEY}
                       onChange={(v) => setSecrets(p => ({ ...p, OPENROUTER_API_KEY: v }))}
                       setupSteps={openRouterSetupSteps}
                   />

                   <div className="space-y-4 pt-4 border-t border-subtle">
                       <h4 className="font-bold text-body flex items-center gap-2">
                           <Sparkles className="w-4 h-4 text-purple-500" />
                           Cloudinary Media Pipeline
                       </h4>
                       <div className="flex flex-col gap-4">
                           <SecretCard saveSuccess={saveSuccess}
                               title="Cloud Name"
                               description="Your Cloudinary instance name."
                               secretKey="CLOUDINARY_CLOUD_NAME"
                               docsLink="https://cloudinary.com/console"
                               docsLabel="Dashboard"
                               isConfigured={secretStatuses["CLOUDINARY_CLOUD_NAME"]}
                               value={secrets.CLOUDINARY_CLOUD_NAME}
                               onChange={(v) => setSecrets(p => ({ ...p, CLOUDINARY_CLOUD_NAME: v }))}
                               setupSteps={cloudinarySetupSteps}
                           />
                           <SecretCard saveSuccess={saveSuccess}
                               title="API Key"
                               description="The public API key."
                               secretKey="CLOUDINARY_API_KEY"
                               docsLink="https://cloudinary.com/console"
                               docsLabel="Dashboard"
                               isConfigured={secretStatuses["CLOUDINARY_API_KEY"]}
                               value={secrets.CLOUDINARY_API_KEY}
                               onChange={(v) => setSecrets(p => ({ ...p, CLOUDINARY_API_KEY: v }))}
                               setupSteps={cloudinarySetupSteps}
                           />
                       </div>
                       <SecretCard saveSuccess={saveSuccess}
                           title="API Secret"
                           description="The high-security API secret. Never expose this."
                           secretKey="CLOUDINARY_API_SECRET"
                           docsLink="https://cloudinary.com/console"
                           docsLabel="Security Docs"
                           isConfigured={secretStatuses["CLOUDINARY_API_SECRET"]}
                           value={secrets.CLOUDINARY_API_SECRET}
                           onChange={(v) => setSecrets(p => ({ ...p, CLOUDINARY_API_SECRET: v }))}
                           setupSteps={cloudinarySetupSteps}
                       />
                   </div>

              </CardContent>
            </Card>

            {/* Google Reviews Integration Card */}
            <Card className="surface-card overflow-hidden">
              {/* Header with gradient */}
              <div className="bg-orange p-6 text-white">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <Star className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Google Reviews Integration</h2>
                    <p className="text-white/80 text-sm">Sync your Google Business Profile reviews to display on your website</p>
                  </div>
                </div>
              </div>

              <CardContent className="p-6 space-y-8">
                {/* Status */}
                <div className="flex items-center gap-4 p-4 rounded-xl surface-secondary">
                  <div className={`w-3 h-3 rounded-full ${secretStatuses["GOOGLE_MAPS_API_KEY"] && settings.googlePlaceId ? 'bg-brand-green animate-pulse' : 'surface-elevated'}`} />
                  <div>
                    <p className="font-medium text-olive dark:text-off-white">
                      {secretStatuses["GOOGLE_MAPS_API_KEY"] && settings.googlePlaceId ? 'Connected' : 'Not Connected'}
                    </p>
                    <p className="text-sm text-caption">
                      {secretStatuses["GOOGLE_MAPS_API_KEY"] && settings.googlePlaceId
                        ? 'Google Reviews sync is ready. Go to Testimonials to fetch reviews.'
                        : 'Provide your Place ID and API key below to enable review syncing.'}
                    </p>
                  </div>
                </div>

                {/* Setup Guide (Collapsible) */}
                <div className="space-y-3">
                  <button
                    onClick={() => toggleSection('googleReviewsSetup')}
                    className="flex items-center justify-between w-full text-left font-bold text-body"
                  >
                    <span className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-orange" />
                      Setup Guide
                    </span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${openSections.googleReviewsSetup ? 'rotate-180' : ''}`} />
                  </button>

                  {openSections.googleReviewsSetup && (
                    <div className="space-y-3 pl-6 border-l-2 border-orange/20">
                      {googleReviewsSetupSteps.map((step) => (
                        <div key={step.step} className="space-y-1">
                          <p className="text-sm font-semibold text-body">
                            {step.step}. {step.title}
                          </p>
                          <p className="text-xs text-caption leading-relaxed">{step.description}</p>
                          {step.url && (
                            <a href={step.url} target="_blank" rel="noopener noreferrer" className="text-xs text-orange hover:underline inline-flex items-center gap-1">
                              Open Link →
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Google Place ID Input */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-caption">Google Place ID</label>
                  <Input
                    placeholder="ChIJ... (Find yours at the Place ID Finder link above)"
                    value={settings.googlePlaceId || ""}
                    onChange={(e) => handleChange("googlePlaceId", e.target.value)}
                    className="surface-input font-mono text-sm"
                  />
                  <p className="text-xs text-caption">Your unique Google Place ID. Find it using the <a href="https://developers.google.com/maps/documentation/places/web-service/place-id" target="_blank" rel="noopener noreferrer" className="text-orange hover:underline">Place ID Finder</a>.</p>
                </div>

                {/* Google Maps API Key Secret */}
                <SecretCard saveSuccess={saveSuccess}
                    title="Google Maps API Key"
                    description="Powers the Google Reviews sync. Must have the Places API enabled."
                    secretKey="GOOGLE_MAPS_API_KEY"
                    docsLink="https://console.cloud.google.com/apis/credentials"
                    docsLabel="Google Cloud Console"
                    isConfigured={secretStatuses["GOOGLE_MAPS_API_KEY"]}
                    value={secrets.GOOGLE_MAPS_API_KEY}
                    onChange={(v) => setSecrets(p => ({ ...p, GOOGLE_MAPS_API_KEY: v }))}
                    setupSteps={googleReviewsSetupSteps}
                />
              </CardContent>
            </Card>

            {/* Google Calendar Integration Card */}
            <Card className="surface-card overflow-hidden">
              {/* Header with gradient */}
              <div className="bg-olive p-6 text-white">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Google Calendar Integration</h2>
                    <p className="text-white/80 text-sm">Two-way sync for live booking availability and events</p>
                  </div>
                </div>
              </div>

              <CardContent className="p-6 space-y-8">
                {/* Status */}
                <div className="flex items-center gap-4 p-4 rounded-xl surface-secondary">
                  <div className={`w-3 h-3 rounded-full ${settings.googleCalendarConfig?.hasCredentials ? 'bg-brand-green animate-pulse' : 'surface-elevated'}`} />
                  <div>
                    <p className="font-medium text-olive dark:text-off-white">
                      {settings.googleCalendarConfig?.hasCredentials ? 'Connected' : 'Not Connected'}
                    </p>
                    <p className="text-sm text-caption">
                      {settings.googleCalendarConfig?.hasCredentials 
                        ? 'Your booking calendar is live and syncing' 
                        : 'Follow the setup guide below to get started'}
                    </p>
                  </div>
                </div>

                {/* Google Calendar ID Input */}
                <div className="space-y-3 pt-4">
                  <label className="text-xs font-bold uppercase tracking-wider text-caption">
                    Your Calendar ID
                  </label>
                  <Input
                    value={settings.googleCalendarId || ""}
                    onChange={(e) => handleChange("googleCalendarId", e.target.value)}
                    placeholder="e.g. hello@edwaknutrition.co.ke"
                    className="surface-input font-mono text-sm"
                  />
                  <p className="text-xs text-caption leading-relaxed">
                    Find this in Google Calendar → Settings → Your calendar → 'Integrate calendar' section. For your primary calendar, this is usually your Gmail address. For secondary calendars, it will be a long string ending in <span className="font-mono text-olive dark:text-brand-green">@group.calendar.google.com</span>.
                  </p>
                </div>

                {/* Booking Rules */}
                <div className="pt-6 mt-6 border-t border-subtle">
                   <h4 className="font-bold text-body flex items-center gap-2 mb-2">
                       <Clock className="w-4 h-4 text-olive" />
                       Booking Rules
                   </h4>
                   <p className="text-xs text-caption mb-4 leading-relaxed">
                     These rules control how time slots are generated on your public booking page. <strong>Event Duration</strong> sets the length of each appointment. <strong>Buffer Time</strong> adds a gap between back-to-back slots for preparation. <strong>Min Notice</strong> prevents last-minute bookings by requiring advance notice.
                   </p>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-3">
                        <label className="text-xs font-bold uppercase tracking-wider text-caption">
                          Event Duration (mins)
                        </label>
                        <Input
                          type="number"
                          value={settings.googleCalendarConfig?.eventDuration || 30}
                          onChange={(e) => setSettings(p => ({ ...p, googleCalendarConfig: { ...(p.googleCalendarConfig || { eventDuration: 30, bufferTime: 15, minNotice: 120, availability: {} }), eventDuration: parseInt(e.target.value) || 30 } }))}
                          className="surface-input"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-xs font-bold uppercase tracking-wider text-caption">
                          Buffer Time (mins)
                        </label>
                        <Input
                          type="number"
                          value={settings.googleCalendarConfig?.bufferTime || 15}
                          onChange={(e) => setSettings(p => ({ ...p, googleCalendarConfig: { ...(p.googleCalendarConfig || { eventDuration: 30, bufferTime: 15, minNotice: 120, availability: {} }), bufferTime: parseInt(e.target.value) || 15 } }))}
                          className="surface-input"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-xs font-bold uppercase tracking-wider text-caption">
                          Min Notice (hrs)
                        </label>
                        <Input
                          type="number"
                          value={(settings.googleCalendarConfig?.minNotice || 120) / 60}
                          onChange={(e) => setSettings(p => ({ ...p, googleCalendarConfig: { ...(p.googleCalendarConfig || { eventDuration: 30, bufferTime: 15, minNotice: 120, availability: {} }), minNotice: (parseInt(e.target.value) || 2) * 60 } }))}
                          className="surface-input"
                        />
                      </div>
                   </div>
                </div>

                {/* Service Account Credentials */}
                <div className="space-y-4 pt-6 mt-6 border-t border-subtle">
                   <h4 className="font-bold text-body flex items-center gap-2">
                       <Key className="w-4 h-4 text-olive" />
                       Service Account Credentials
                   </h4>
                   <p className="text-sm text-caption mb-2 leading-relaxed">
                     These credentials allow the platform to securely read your calendar's free/busy status and automatically create events when clients book. They come from the JSON key file that you downloaded from the Google Cloud Console (Step 4 above). All credentials are encrypted before being stored in the database.
                   </p>
                   
                   <SecretCard saveSuccess={saveSuccess}
                       title="Client Email"
                       description="Extract this from your Service Account JSON file."
                       secretKey="GOOGLE_CALENDAR_CLIENT_EMAIL"
                       docsLink="https://console.cloud.google.com/"
                       docsLabel="Google Cloud Console"
                       isConfigured={settings.googleCalendarConfig?.hasCredentials || false}
                       value={settings.googleCalendarConfig?.clientEmail || ""}
                       onChange={(v) => setSettings(p => ({ ...p, googleCalendarConfig: { ...(p.googleCalendarConfig || { eventDuration: 30, bufferTime: 15, minNotice: 120, availability: {} }), clientEmail: v } }))}
                       setupSteps={googleCalendarSetupSteps}
                       placeholder="e.g. calendar-sync@edwak-nutrition-live.iam.gserviceaccount.com"
                   />
                   <SecretCard saveSuccess={saveSuccess}
                       title="Private Key"
                       description="The large RSA private key from the JSON file. Ensure you copy the entire string including -----BEGIN PRIVATE KEY-----."
                       secretKey="GOOGLE_CALENDAR_PRIVATE_KEY"
                       docsLink="https://console.cloud.google.com/"
                       docsLabel="Google Cloud Console"
                       isConfigured={settings.googleCalendarConfig?.hasCredentials || false}
                       value={settings.googleCalendarConfig?.privateKey || ""}
                       onChange={(v) => setSettings(p => ({ ...p, googleCalendarConfig: { ...(p.googleCalendarConfig || { eventDuration: 30, bufferTime: 15, minNotice: 120, availability: {} }), privateKey: v } }))}
                       setupSteps={googleCalendarSetupSteps}
                       placeholder="-----BEGIN PRIVATE KEY-----\nMIIEvg...-----END PRIVATE KEY-----\n"
                   />
                </div>
              </CardContent>
            </Card>

            {/* Notification Preferences */}
            <NotificationConfig
              settings={settings}
              onChange={handleNotificationChange}
              onSave={handleSave}
              isSaving={isSaving}
              isOpen={openSections.notifications ?? false}
              onToggle={() => toggleSection('notifications')}
            />
          </div>
        )}

        {/* Environment Tab */}
        {activeTab === "environment" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="bg-red-50 dark:bg-red-500/10 border-l-4 border-red-500 p-4 rounded-r-xl">
                <h4 className="font-bold text-red-800 dark:text-red-400">Strict Server Configuration</h4>
                <p className="text-sm text-red-700/80 dark:text-red-300 mt-1">
                    These variables represent the physical boot configuration of your server. If an item is red, you must update your hosting environment variables and redeploy.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatusCard 
                    envKey="DATABASE_URL" 
                    isConfigured={envStatus.DATABASE_URL}
                    description="The connection string verifying the server has successfully connected to the PostgreSQL database housing all encrypted records."
                    className="md:col-span-2"
                />
                <StatusCard 
                    envKey="ENCRYPTION_KEY" 
                    isConfigured={envStatus.ENCRYPTION_KEY}
                    description="The 32-byte master encryption sequence (AES-256-GCM) that protects your SecretConfig table."
                    className="md:col-span-1"
                />
                <StatusCard 
                    envKey="NEXT_PUBLIC_APP_URL" 
                    isConfigured={envStatus.NEXT_PUBLIC_APP_URL}
                    description="The absolute domain resolution pathing used by internal Next.js components."
                    className="md:col-span-1"
                />
                <StatusCard 
                    envKey="RESEND_WEBHOOK_SECRET" 
                    isConfigured={envStatus.RESEND_WEBHOOK_SECRET}
                    description="Secures inbound payload verifications from email bounces or delivery notifications."
                    className="md:col-span-2"
                />
            </div>
          </div>
        )}

        {/* Access Tab */}
        {activeTab === "access" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <SecurityConfig
              isOpen={openSections.security ?? false}
              onToggle={() => toggleSection('security')}
              is2FAEnabled={is2FAEnabled}
            />
            <SessionManagement
              isOpen={openSections.sessions ?? false}
              onToggle={() => toggleSection('sessions')}
            />
            <DataExport
              isOpen={openSections.export ?? false}
              onToggle={() => toggleSection('export')}
            />
          </div>
        )}
      </div>
    </div>
  )
}
