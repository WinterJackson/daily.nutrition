"use client"

import { toggleServiceVisibility } from "@/app/actions/services"
import { Card } from "@/components/ui/Card"
import { Switch } from "@/components/ui/Switch"
import { Activity } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"

// Map icon names back to components if needed, or pass full object
// Since we can't pass functions (components) from server to client easily in some setups, 
// we'll just handle the visuals simply or assume data structure is pure JSON.
// Actually, `services` in data.ts has `icon` as a Component. 
// When passed from Server Component to Client Component, React handles simple serializable data. 
// Components (Functions) trigger warnings. 
// I will treat the icon separately or just not render the specific icon in the admin list to avoid serialization issues, 
// OR I will import the icons in this Client Component and map them by ID.

import { Activity as ActivityIcon, Apple as AppleIcon, HeartPulse as HeartPulseIcon, Phone as PhoneIcon, Scale as ScaleIcon } from "lucide-react"

const iconMap: Record<string, any> = {
  "discovery-call": PhoneIcon,
  "cancer-nutrition": ActivityIcon,
  "diabetes-management": HeartPulseIcon,
  "gut-health": AppleIcon,
  "general-counselling": ScaleIcon,
}

interface Service {
  id: string
  title: string
  shortDescription: string
  isVisible: boolean
}

export function ServiceManagerClient({ initialServices }: { initialServices: Service[] }) {
  const [services, setServices] = useState(initialServices)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleToggle = async (id: string, currentState: boolean) => {
    // Optimistic update
    setServices(prev => prev.map(s => s.id === id ? { ...s, isVisible: !currentState } : s))

    startTransition(async () => {
      const result = await toggleServiceVisibility(id)
      if (!result.success) {
        // Revert on failure
        setServices(prev => prev.map(s => s.id === id ? { ...s, isVisible: currentState } : s))
        console.error(result.error)
      } else {
        router.refresh()
      }
    })
  }

  return (
    <div className="grid grid-cols-1 gap-6">
      {services.map((service) => {
        const Icon = iconMap[service.id] || Activity // Fallback
        return (
          <Card key={service.id} className="flex flex-row items-center justify-between p-6 transition-all hover:shadow-md">
            <div className="flex items-center gap-6">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${service.isVisible ? 'bg-brand-green/10 text-brand-green' : 'bg-neutral-100 text-neutral-400'}`}>
                <Icon className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                    <h3 className={`font-serif font-bold text-lg ${service.isVisible ? 'text-olive dark:text-off-white' : 'text-neutral-500'}`}>
                        {service.title}
                    </h3>
                    <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${service.isVisible ? 'bg-brand-green/10 text-brand-green border-brand-green/20' : 'bg-neutral-100 text-neutral-500 border-neutral-200'}`}>
                        {service.isVisible ? "Active" : "Inactive"}
                    </div>
                </div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-xl">
                  {service.shortDescription}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-neutral-500 hidden md:block">
                {service.isVisible ? "Visible to public" : "Hidden from site"}
              </span>
              <Switch 
                checked={service.isVisible} 
                onCheckedChange={() => handleToggle(service.id, service.isVisible)}
                disabled={isPending}
              />
            </div>
          </Card>
        )
      })}
    </div>
  )
}
