"use client"

import { EnvStatusMap, SettingsData, updateSettings, upsertIntegrationSecrets } from "@/app/actions/settings"
import { deleteImage, uploadImage } from "@/app/actions/upload"
import { AiConfig } from "@/components/admin/AiConfig"
import { CloudinaryConfig } from "@/components/admin/CloudinaryConfig"
import { DataExport } from "@/components/admin/DataExport"
import { EmailBrandingEditor } from "@/components/admin/EmailBrandingEditor"
import { LegalContentConfig } from "@/components/admin/LegalContentConfig"
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
import { Calendar, CheckCircle, ChevronRight, Database, ExternalLink, ImageIcon, Key, Loader2, Moon, Save, Sparkles, Sun, Trash2, Upload } from "lucide-react"
import Image from "next/image"
import { useRef, useState, useTransition } from "react"

// Calendly setup steps for the admin
const calendlySetupSteps = [
  {
    step: 1,
    title: "Create a Calendly Account",
    description: "Sign up for free at calendly.com using your business email.",
    action: { label: "Go to Calendly", url: "https://calendly.com/signup" }
  },
  {
    step: 2,
    title: "Choose Your Plan",
    description: "Free plan: 1 event type. Essentials ($10/mo): Unlimited events, custom branding.",
    action: { label: "View Pricing", url: "https://calendly.com/pricing" }
  },
  {
    step: 3,
    title: "Set Your Username",
    description: "Go to Account Settings → Profile and set a memorable URL like 'edwaknutrition'.",
  },
  {
    step: 4,
    title: "Create Event Types",
    description: "Create events for: Discovery Call (5 min, free), Virtual Consultation (60 min), In-Person (60 min).",
  },
  {
    step: 5,
    title: "Get Your Embed URL",
    description: "Click Share on your event → 'Add to website' → Copy the URL shown.",
  },
  {
    step: 6,
    title: "Paste URL Below",
    description: "Enter your Calendly URL in the field below and click Save.",
  },
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
    description: "Click 'API Keys' on the left sidebar. Click 'Create API Key', name it 'Daily Nutrition Prod', and give it Full Access.",
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

// Google Gemini Setup Steps
const geminiSetupSteps = [
  {
    step: 1,
    title: "Access Google AI Studio",
    description: "Go to Google AI Studio and sign in with your Google account. This powers the AI features in your dashboard.",
    url: "https://aistudio.google.com/"
  },
  {
    step: 2,
    title: "Get API Key",
    description: "Click 'Get API key' on the left sidebar, then click 'Create API key'. You may need to create a new Google Cloud project if you don't have one.",
  },
  {
    step: 3,
    title: "Secure Your Key",
    description: "Copy the generated API key (it will be a long string of random characters) and paste it into the field below.",
  }
]

export interface SettingsClientProps {
  initialSettings: SettingsData
  envStatus: EnvStatusMap
  secretStatuses: Record<string, boolean>
  is2FAEnabled: boolean
}

export default function SettingsClient({ initialSettings, envStatus, secretStatuses, is2FAEnabled }: SettingsClientProps) {
  const [activeTab, setActiveTab] = useState("general")
  const [settings, setSettings] = useState<SettingsData>(initialSettings)
  const [isSaving, startTransition] = useTransition()
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [expandedStep, setExpandedStep] = useState<number | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Collapsible section states
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({})
  const toggleSection = (key: string) => setOpenSections(prev => ({ ...prev, [key]: !prev[key] }))

  const [secrets, setSecrets] = useState({
      RESEND_API_KEY: "",
      CLOUDINARY_CLOUD_NAME: "",
      CLOUDINARY_API_KEY: "",
      CLOUDINARY_API_SECRET: "",
      GEMINI_API_KEY: ""
  })

  const handleChange = (key: keyof SettingsData, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
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

  const handleSave = () => {
    startTransition(async () => {
      // Save traditional settings
      await updateSettings(settings)

      // Save integrations encrypted
      const payload = Object.entries(secrets)
          .filter(([_, value]) => value.trim() !== "")
          .map(([key, value]) => ({ key, value }))

      if (payload.length > 0) {
          await upsertIntegrationSecrets(payload)
          // Clear after save
          setSecrets({
              RESEND_API_KEY: "",
              CLOUDINARY_CLOUD_NAME: "",
              CLOUDINARY_API_KEY: "",
              CLOUDINARY_API_SECRET: "",
              GEMINI_API_KEY: ""
          })
      }

      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    })
  }

  const isValidCalendlyUrl = (url: string) => {
    if (!url) return true // Empty is valid (optional)
    return url.startsWith("https://calendly.com/")
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
        if (res.success) {
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
    if (res.success) {
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
          disabled={isSaving || !isValidCalendlyUrl(settings.calendlyUrl)}
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
                </div>
              </CardContent>
            </Card>

            {/* Social Media Links Card */}
            <Card className="surface-card">
              <CardHeader>
                <CardTitle>Social Media</CardTitle>
                <CardDescription>Update the social links displayed in your website footer.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-caption">Facebook URL</label>
                    <Input
                      placeholder="https://facebook.com/edwaknutrition"
                      value={settings.facebookUrl || ""}
                      onChange={(e) => handleChange("facebookUrl", e.target.value)}
                      className="surface-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-caption">Instagram URL</label>
                    <Input
                      placeholder="https://instagram.com/edwaknutrition"
                      value={settings.instagramUrl || ""}
                      onChange={(e) => handleChange("instagramUrl", e.target.value)}
                      className="surface-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-caption">Twitter / X URL</label>
                    <Input
                      placeholder="https://twitter.com/edwaknutrition"
                      value={settings.twitterUrl || ""}
                      onChange={(e) => handleChange("twitterUrl", e.target.value)}
                      className="surface-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-caption">LinkedIn URL</label>
                    <Input
                      placeholder="https://linkedin.com/company/edwaknutrition"
                      value={settings.linkedinUrl || ""}
                      onChange={(e) => handleChange("linkedinUrl", e.target.value)}
                      className="surface-input"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Profile Image Card */}
            <Card className="surface-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-brand-green" />
                  Profile Image
                </CardTitle>
                <CardDescription>This image appears on the About page. Upload a professional photo.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                  {/* Image Preview */}
                  <div className="relative w-32 h-32 rounded-2xl overflow-hidden surface-secondary border-2 border-dashed border-default flex items-center justify-center">
                    {settings.profileImageUrl ? (
                      <Image
                        src={settings.profileImageUrl}
                        alt="Profile"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <ImageIcon className="w-10 h-10 text-muted" />
                    )}
                  </div>

                  {/* Actions */}
                  <div className="space-y-3">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="w-full sm:w-auto"
                    >
                      {isUploading ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...</>
                      ) : (
                        <><Upload className="mr-2 h-4 w-4" /> Upload New Image</>
                      )}
                    </Button>
                    {settings.profileImageUrl && (
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={handleImageDelete}
                        className="w-full sm:w-auto text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Remove Image
                      </Button>
                    )}
                    <p className="text-xs text-caption">
                      Recommended: Square image, at least 400x400px. JPG or PNG.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

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
                   <SecretCard
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

                   <SecretCard
                       title="Gemini API Key"
                       description="Powers the AI content workflows."
                       secretKey="GEMINI_API_KEY"
                       docsLink="https://aistudio.google.com/app/apikey"
                       docsLabel="Google AI Studio"
                       isConfigured={secretStatuses["GEMINI_API_KEY"]}
                       value={secrets.GEMINI_API_KEY}
                       onChange={(v) => setSecrets(p => ({ ...p, GEMINI_API_KEY: v }))}
                       setupSteps={geminiSetupSteps}
                   />

                   <div className="space-y-4 pt-4 border-t border-subtle">
                       <h4 className="font-bold text-body flex items-center gap-2">
                           <Sparkles className="w-4 h-4 text-purple-500" />
                           Cloudinary Media Pipeline
                       </h4>
                       <div className="flex flex-col gap-4">
                           <SecretCard
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
                           <SecretCard
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
                       <SecretCard
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
                       
                       <div className="pt-4 mt-4 border-t border-subtle">
                         <h5 className="font-medium text-sm mb-3">Legacy Configuration Manager</h5>
                         <CloudinaryConfig 
                             data={{
                                 cloudName: secrets.CLOUDINARY_CLOUD_NAME,
                                 apiKey: secrets.CLOUDINARY_API_KEY,
                                 apiSecret: secrets.CLOUDINARY_API_SECRET
                             }}
                             onChange={(field, value) => setSecrets(p => ({ 
                                 ...p, 
                                 [field === 'cloudName' ? 'CLOUDINARY_CLOUD_NAME' : field === 'apiKey' ? 'CLOUDINARY_API_KEY' : 'CLOUDINARY_API_SECRET']: value 
                             }))}
                             hasSecret={secretStatuses["CLOUDINARY_API_SECRET"]}
                         />
                       </div>
                   </div>

                   <div className="pt-6 border-t border-subtle">
                     <AiConfig 
                        hasApiKey={secretStatuses["GEMINI_API_KEY"]}
                        isOpen={openSections.ai ?? false}
                        onToggle={() => toggleSection('ai')}
                     />
                   </div>
              </CardContent>
            </Card>

            {/* Calendly Integration Card */}
            <Card className="surface-card overflow-hidden">
              {/* Header with gradient */}
              <div className="bg-olive p-6 text-white">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Calendly Integration</h2>
                    <p className="text-white/80 text-sm">Allow clients to book consultations directly from your website</p>
                  </div>
                </div>
              </div>

              <CardContent className="p-6 space-y-8">
                {/* Status */}
                <div className="flex items-center gap-4 p-4 rounded-xl surface-secondary">
                  <div className={`w-3 h-3 rounded-full ${settings.calendlyUrl ? 'bg-brand-green animate-pulse' : 'surface-elevated'}`} />
                  <div>
                    <p className="font-medium text-olive dark:text-off-white">
                      {settings.calendlyUrl ? 'Connected' : 'Not Connected'}
                    </p>
                    <p className="text-sm text-caption">
                      {settings.calendlyUrl 
                        ? 'Your booking calendar is live on the website' 
                        : 'Follow the setup guide below to get started'}
                    </p>
                  </div>
                </div>

                {/* Calendly URL Input */}
                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase tracking-wider text-caption">
                    Your Calendly URL
                  </label>
                  <Input
                    value={settings.calendlyUrl}
                    onChange={(e) => handleChange("calendlyUrl", e.target.value)}
                    placeholder="https://calendly.com/your-username/consultation"
                    className={`surface-input font-mono text-sm ${
                      !isValidCalendlyUrl(settings.calendlyUrl) ? 'border-red-500 focus:ring-red-500' : ''
                    }`}
                  />
                  {!isValidCalendlyUrl(settings.calendlyUrl) && (
                    <p className="text-xs text-red-500">URL must start with https://calendly.com/</p>
                  )}
                  <p className="text-xs text-caption">
                    Example: <code className="surface-secondary px-1 py-0.5 rounded">https://calendly.com/edwaknutrition/consultation</code>
                  </p>
                </div>

                {/* Setup Guide */}
                <div className="border-t border-default pt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-5 h-5 text-brand-green" />
                    <h3 className="font-bold text-olive dark:text-off-white">Setup Guide</h3>
                  </div>
                  <p className="text-sm text-caption mb-6">
                    Follow these steps to connect your Calendly account. It only takes a few minutes!
                  </p>

                  <div className="space-y-3">
                    {calendlySetupSteps.map((item) => (
                      <div 
                        key={item.step}
                        className="border border-default rounded-xl overflow-hidden"
                      >
                        <button
                          onClick={() => setExpandedStep(expandedStep === item.step ? null : item.step)}
                          className="w-full flex items-center gap-4 p-4 text-left hover:surface-secondary transition-colors"
                        >
                          <div className="w-8 h-8 rounded-full bg-brand-green/10 text-brand-green flex items-center justify-center text-sm font-bold shrink-0">
                            {item.step}
                          </div>
                          <div className="flex-grow">
                            <p className="font-medium text-olive dark:text-off-white">{item.title}</p>
                          </div>
                          <ChevronRight className={`w-5 h-5 text-muted transition-transform ${expandedStep === item.step ? 'rotate-90' : ''}`} />
                        </button>
                        
                        {expandedStep === item.step && (
                          <div className="px-4 pb-4 pt-0 ml-12 animate-in fade-in slide-in-from-top-2 duration-200">
                            <p className="text-sm text-caption mb-3">
                              {item.description}
                            </p>
                            {item.action && (
                              <a
                                href={item.action.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-sm font-medium text-[#006BFF] hover:underline"
                              >
                                {item.action.label}
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Links */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                  <a
                    href="https://calendly.com/signup"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 rounded-xl border border-default hover:border-brand-green hover:bg-brand-green/5 transition-all group"
                  >
                    <div className="w-10 h-10 bg-brand-green/10 rounded-lg flex items-center justify-center group-hover:bg-brand-green/20 transition-colors">
                      <ExternalLink className="w-5 h-5 text-brand-green" />
                    </div>
                    <div>
                      <p className="font-medium text-olive dark:text-off-white">Create Account</p>
                      <p className="text-xs text-caption">Sign up for Calendly</p>
                    </div>
                  </a>
                  <a
                    href="https://calendly.com/pricing"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 rounded-xl border border-default hover:border-orange hover:bg-orange/5 transition-all group"
                  >
                    <div className="w-10 h-10 bg-orange/10 rounded-lg flex items-center justify-center group-hover:bg-orange/20 transition-colors">
                      <Sparkles className="w-5 h-5 text-orange" />
                    </div>
                    <div>
                      <p className="font-medium text-olive dark:text-off-white">View Pricing</p>
                      <p className="text-xs text-caption">Compare Calendly plans</p>
                    </div>
                  </a>
                </div>
              </CardContent>
            </Card>

            {/* Notification Preferences */}
            <NotificationConfig
              settings={settings}
              onChange={(key: string, value: string | boolean) => handleChange(key as keyof SettingsData, value as never)}
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
