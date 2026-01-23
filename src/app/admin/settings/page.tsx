"use client"

import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card"
import { Input } from "@/components/ui/Input"
import { CheckCircle, Loader2, Save, ShieldCheck } from "lucide-react"
import { useState } from "react"

interface SettingsData {
  businessName: string
  contactEmail: string
  phoneNumber: string
  address: string
  pageTitle: string
  metaDescription: string
  keywords: string
}

const defaultSettings: SettingsData = {
  businessName: "Daily Nutrition",
  contactEmail: "info@dailynutrition.com",
  phoneNumber: "+254 700 000 000",
  address: "Parklands & South C, Nairobi",
  pageTitle: "Daily Nutrition | Professional Nutrition Consultancy",
  metaDescription: "Expert nutrition care for cancer, diabetes, and gut health. Virtual and in-person consultations.",
  keywords: "nutrition, cancer, diabetes, gut health, kenya, dietitian",
}

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState("general")
  const [settings, setSettings] = useState<SettingsData>(defaultSettings)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const handleChange = (key: keyof SettingsData, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    // Simulate API call - in production, this would call your backend
    await new Promise((resolve) => setTimeout(resolve, 1000))
    // Save to localStorage for demo persistence
    localStorage.setItem("dailyNutrition_settings", JSON.stringify(settings))
    setIsSaving(false)
    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 3000)
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-serif text-olive dark:text-off-white">Settings</h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1">Configure your platform preferences.</p>
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
      <div className="flex items-center gap-1 p-1 bg-neutral-100 dark:bg-white/5 rounded-xl w-fit">
        {["General", "SEO", "Access"].map((tab) => {
          const id = tab.toLowerCase()
          const isActive = activeTab === id
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                isActive
                  ? "bg-white dark:bg-charcoal text-olive dark:text-off-white shadow-sm"
                  : "text-neutral-500 hover:text-olive dark:hover:text-off-white"
              }`}
            >
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
