"use client"

import { getSettings, SettingsData, updateSettings } from "@/app/actions/settings"
import { deleteImage, uploadImage } from "@/app/actions/upload"
import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card"
import { Input } from "@/components/ui/Input"
import { getPublicIdFromUrl } from "@/lib/cloudinary-utils"
import { Calendar, CheckCircle, ChevronRight, ExternalLink, ImageIcon, Loader2, Moon, Save, ShieldCheck, Sparkles, Sun, Trash2, Upload } from "lucide-react"
import Image from "next/image"
import { useEffect, useRef, useState, useTransition } from "react"

const defaultSettings: SettingsData = {
  businessName: "Daily Nutrition",
  contactEmail: "info@dailynutrition.com",
  phoneNumber: "+254 700 000 000",
  address: "Parklands & South C, Nairobi",
  pageTitle: "Daily Nutrition | Professional Nutrition Consultancy",
  metaDescription: "Expert nutrition care for cancer, diabetes, and gut health. Virtual and in-person consultations.",
  keywords: "nutrition, cancer, diabetes, gut health, kenya, dietitian",
  calendlyUrl: "",
  profileImageUrl: "",
  themePreference: "light",
}

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
    description: "Go to Account Settings → Profile and set a memorable URL like 'dailynutrition'.",
  },
  {
    step: 4,
    title: "Create Event Types",
    description: "Create events for: Discovery Call (15 min, free), Virtual Consultation (60 min), In-Person (60 min).",
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

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState("general")
  const [settings, setSettings] = useState<SettingsData>(defaultSettings)
  const [isSaving, startTransition] = useTransition()
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [expandedStep, setExpandedStep] = useState<number | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    async function load() {
      const data = await getSettings()
      if (data) {
        setSettings(data)
      }
      setIsLoading(false)
    }
    load()
  }, [])

  const handleChange = (key: keyof SettingsData, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const handleSave = () => {
    startTransition(async () => {
      const res = await updateSettings(settings)
      if (res.success) {
        setSaveSuccess(true)
        setTimeout(() => setSaveSuccess(false), 3000)
      }
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-brand-green" />
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-serif text-olive dark:text-off-white">Settings</h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1">Configure your platform preferences.</p>
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
      <div className="flex items-center gap-1 p-1 bg-neutral-100 dark:bg-white/5 rounded-xl w-fit">
        {["General", "SEO", "Integrations", "Access"].map((tab) => {
          const id = tab.toLowerCase()
          const isActive = activeTab === id
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                isActive
                  ? "bg-white dark:bg-charcoal text-olive dark:text-off-white shadow-sm"
                  : "text-neutral-500 hover:text-olive dark:hover:text-off-white"
              }`}
            >
              {tab === "Integrations" && <Calendar className="w-4 h-4" />}
              {tab}
            </button>
          )
        })}
      </div>

      <div className="relative min-h-[500px]">
        {/* General Tab */}
        {activeTab === "general" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <Card className="border-none shadow-xl shadow-neutral-200/50 dark:shadow-black/20 bg-white/90 dark:bg-white/5 backdrop-blur-md">
              <CardHeader>
                <CardTitle>Business Details</CardTitle>
                <CardDescription>This information is visible in the public footer and contact pages.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Business Name</label>
                    <Input
                      value={settings.businessName}
                      onChange={(e) => handleChange("businessName", e.target.value)}
                      className="bg-neutral-50 dark:bg-white/5 border-neutral-200 dark:border-white/10"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Contact Email</label>
                    <Input
                      value={settings.contactEmail}
                      onChange={(e) => handleChange("contactEmail", e.target.value)}
                      className="bg-neutral-50 dark:bg-white/5 border-neutral-200 dark:border-white/10"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Phone Number</label>
                    <Input
                      value={settings.phoneNumber}
                      onChange={(e) => handleChange("phoneNumber", e.target.value)}
                      className="bg-neutral-50 dark:bg-white/5 border-neutral-200 dark:border-white/10"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Address</label>
                    <Input
                      value={settings.address}
                      onChange={(e) => handleChange("address", e.target.value)}
                      className="bg-neutral-50 dark:bg-white/5 border-neutral-200 dark:border-white/10"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Profile Image Card */}
            <Card className="border-none shadow-xl shadow-neutral-200/50 dark:shadow-black/20 bg-white/90 dark:bg-white/5 backdrop-blur-md">
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
                  <div className="relative w-32 h-32 rounded-2xl overflow-hidden bg-neutral-100 dark:bg-white/5 border-2 border-dashed border-neutral-200 dark:border-white/10 flex items-center justify-center">
                    {settings.profileImageUrl ? (
                      <Image
                        src={settings.profileImageUrl}
                        alt="Profile"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <ImageIcon className="w-10 h-10 text-neutral-300" />
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
                    <p className="text-xs text-neutral-400">
                      Recommended: Square image, at least 400x400px. JPG or PNG.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Theme Preference Card */}
            <Card className="border-none shadow-xl shadow-neutral-200/50 dark:shadow-black/20 bg-white/90 dark:bg-white/5 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sun className="w-5 h-5 text-orange" />
                  Default Theme
                </CardTitle>
                <CardDescription>Set the default theme for website visitors.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 p-4 rounded-xl bg-neutral-50 dark:bg-white/5">
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
                <p className="text-xs text-neutral-400 mt-3">
                  This sets the default theme for new visitors. Users can still toggle the theme manually.
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* SEO Tab */}
        {activeTab === "seo" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <Card className="border-none shadow-xl shadow-neutral-200/50 dark:shadow-black/20 bg-white/90 dark:bg-white/5 backdrop-blur-md">
              <CardHeader>
                <CardTitle>SEO Configuration</CardTitle>
                <CardDescription>Optimize how your site appears in search engine results.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Default Page Title</label>
                    <Input
                      value={settings.pageTitle}
                      onChange={(e) => handleChange("pageTitle", e.target.value)}
                      className="bg-neutral-50 dark:bg-white/5 border-neutral-200 dark:border-white/10"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Meta Description</label>
                    <textarea
                      className="flex min-h-[100px] w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green focus-visible:ring-offset-2 dark:border-white/10 dark:bg-white/5 dark:ring-offset-charcoal"
                      value={settings.metaDescription}
                      onChange={(e) => handleChange("metaDescription", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Keywords</label>
                    <Input
                      value={settings.keywords}
                      onChange={(e) => handleChange("keywords", e.target.value)}
                      className="bg-neutral-50 dark:bg-white/5 border-neutral-200 dark:border-white/10"
                    />
                    <p className="text-xs text-neutral-400 italic">Separate keywords with commas.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Integrations Tab - NEW */}
        {activeTab === "integrations" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Calendly Integration Card */}
            <Card className="border-none shadow-xl shadow-neutral-200/50 dark:shadow-black/20 bg-white/90 dark:bg-white/5 backdrop-blur-md overflow-hidden">
              {/* Header with gradient */}
              <div className="bg-gradient-to-r from-[#006BFF] to-[#00A2FF] p-6 text-white">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Calendly Integration</h2>
                    <p className="text-white/80 text-sm">Allow clients to book consultations directly from your website</p>
                  </div>
                </div>
              </div>

              <CardContent className="p-6 space-y-8">
                {/* Status */}
                <div className="flex items-center gap-4 p-4 rounded-xl bg-neutral-50 dark:bg-white/5">
                  <div className={`w-3 h-3 rounded-full ${settings.calendlyUrl ? 'bg-brand-green animate-pulse' : 'bg-neutral-300'}`} />
                  <div>
                    <p className="font-medium text-olive dark:text-off-white">
                      {settings.calendlyUrl ? 'Connected' : 'Not Connected'}
                    </p>
                    <p className="text-sm text-neutral-500">
                      {settings.calendlyUrl 
                        ? 'Your booking calendar is live on the website' 
                        : 'Follow the setup guide below to get started'}
                    </p>
                  </div>
                </div>

                {/* Calendly URL Input */}
                <div className="space-y-3">
                  <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                    Your Calendly URL
                  </label>
                  <Input
                    value={settings.calendlyUrl}
                    onChange={(e) => handleChange("calendlyUrl", e.target.value)}
                    placeholder="https://calendly.com/your-username/consultation"
                    className={`bg-neutral-50 dark:bg-white/5 border-neutral-200 dark:border-white/10 font-mono text-sm ${
                      !isValidCalendlyUrl(settings.calendlyUrl) ? 'border-red-500 focus:ring-red-500' : ''
                    }`}
                  />
                  {!isValidCalendlyUrl(settings.calendlyUrl) && (
                    <p className="text-xs text-red-500">URL must start with https://calendly.com/</p>
                  )}
                  <p className="text-xs text-neutral-400">
                    Example: <code className="bg-neutral-100 dark:bg-white/10 px-1 py-0.5 rounded">https://calendly.com/dailynutrition/consultation</code>
                  </p>
                </div>

                {/* Setup Guide */}
                <div className="border-t border-neutral-100 dark:border-white/10 pt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-5 h-5 text-brand-green" />
                    <h3 className="font-bold text-olive dark:text-off-white">Setup Guide</h3>
                  </div>
                  <p className="text-sm text-neutral-500 mb-6">
                    Follow these steps to connect your Calendly account. It only takes a few minutes!
                  </p>

                  <div className="space-y-3">
                    {calendlySetupSteps.map((item) => (
                      <div 
                        key={item.step}
                        className="border border-neutral-200 dark:border-white/10 rounded-xl overflow-hidden"
                      >
                        <button
                          onClick={() => setExpandedStep(expandedStep === item.step ? null : item.step)}
                          className="w-full flex items-center gap-4 p-4 text-left hover:bg-neutral-50 dark:hover:bg-white/5 transition-colors"
                        >
                          <div className="w-8 h-8 rounded-full bg-brand-green/10 text-brand-green flex items-center justify-center text-sm font-bold shrink-0">
                            {item.step}
                          </div>
                          <div className="flex-grow">
                            <p className="font-medium text-olive dark:text-off-white">{item.title}</p>
                          </div>
                          <ChevronRight className={`w-5 h-5 text-neutral-400 transition-transform ${expandedStep === item.step ? 'rotate-90' : ''}`} />
                        </button>
                        
                        {expandedStep === item.step && (
                          <div className="px-4 pb-4 pt-0 ml-12 animate-in fade-in slide-in-from-top-2 duration-200">
                            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
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
                    className="flex items-center gap-3 p-4 rounded-xl border border-neutral-200 dark:border-white/10 hover:border-brand-green hover:bg-brand-green/5 transition-all group"
                  >
                    <div className="w-10 h-10 bg-brand-green/10 rounded-lg flex items-center justify-center group-hover:bg-brand-green/20 transition-colors">
                      <ExternalLink className="w-5 h-5 text-brand-green" />
                    </div>
                    <div>
                      <p className="font-medium text-olive dark:text-off-white">Create Account</p>
                      <p className="text-xs text-neutral-500">Sign up for Calendly</p>
                    </div>
                  </a>
                  <a
                    href="https://calendly.com/pricing"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 rounded-xl border border-neutral-200 dark:border-white/10 hover:border-orange hover:bg-orange/5 transition-all group"
                  >
                    <div className="w-10 h-10 bg-orange/10 rounded-lg flex items-center justify-center group-hover:bg-orange/20 transition-colors">
                      <Sparkles className="w-5 h-5 text-orange" />
                    </div>
                    <div>
                      <p className="font-medium text-olive dark:text-off-white">View Pricing</p>
                      <p className="text-xs text-neutral-500">Compare Calendly plans</p>
                    </div>
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Access Tab */}
        {activeTab === "access" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <Card className="border-none shadow-xl shadow-neutral-200/50 dark:shadow-black/20 bg-white/90 dark:bg-white/5 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-brand-green" />
                  Admin Access
                </CardTitle>
                <CardDescription>Manage password and security settings.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 bg-orange/5 border border-orange/10 rounded-xl">
                  <p className="text-sm text-orange font-medium mb-1">Security Note</p>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400">
                    Regularly updating your admin password improves security. Enable 2FA for extra protection.
                  </p>
                </div>
                <div className="max-w-md space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Current Password</label>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      className="bg-neutral-50 dark:bg-white/5 border-neutral-200 dark:border-white/10"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">New Password</label>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      className="bg-neutral-50 dark:bg-white/5 border-neutral-200 dark:border-white/10"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Confirm New Password</label>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      className="bg-neutral-50 dark:bg-white/5 border-neutral-200 dark:border-white/10"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
