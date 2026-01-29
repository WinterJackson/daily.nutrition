"use client"

import { Button } from "@/components/ui/Button"
import { pricing, services } from "@/lib/data"
import { cn } from "@/lib/utils"
import { CheckCircle2, Globe, MapPin, Sparkles } from "lucide-react"
import { useState } from "react"

interface ServiceSelectionProps {
  onServiceSelect: (serviceId: string) => void
  selectedServiceId?: string
  activeServiceIds?: string[]
}

export function ServiceSelection({ onServiceSelect, selectedServiceId, activeServiceIds }: ServiceSelectionProps) {
  const [sessionType, setSessionType] = useState<"virtual" | "in-person">("virtual")

  const visibleServices = activeServiceIds 
    ? services.filter(s => activeServiceIds.includes(s.id))
    : services;

  const discoveryService = visibleServices.find(s => s.id === "discovery-call")
  const gridServices = visibleServices.filter(s => s.id !== "discovery-call")

  return (
    <div className="space-y-12">
      {/* Session Type Toggle */}
      <div className="flex justify-center">
        <div className="inline-flex bg-neutral-100 dark:bg-white/5 p-1 rounded-xl">
          <button
            onClick={() => setSessionType("virtual")}
            className={cn(
              "flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-medium transition-all duration-300",
              sessionType === "virtual" 
                ? "bg-white dark:bg-charcoal text-brand-green shadow-sm" 
                : "text-neutral-500 hover:text-olive dark:hover:text-off-white"
            )}
          >
            <Globe className="w-4 h-4" />
            Virtual Session
          </button>
          <button
            onClick={() => setSessionType("in-person")}
            className={cn(
              "flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-medium transition-all duration-300",
              sessionType === "in-person"
                ? "bg-white dark:bg-charcoal text-brand-green shadow-sm"
                : "text-neutral-500 hover:text-olive dark:hover:text-off-white"
            )}
          >
            <MapPin className="w-4 h-4" />
            In-Person Visit
          </button>
        </div>
      </div>

      {/* Pricing Display */}
      <div className="text-center space-y-2">
        <p className="text-3xl font-bold font-serif text-olive dark:text-off-white">
          {selectedServiceId === "discovery-call" 
            ? "Free"
            : `Ksh ${sessionType === "virtual" ? pricing.default.virtual.toLocaleString() : pricing.default.inPerson.toLocaleString()}`
          }
        </p>
        <p className="text-neutral-500 dark:text-neutral-400">
          {selectedServiceId === "discovery-call"
            ? "15-minute complimentary consultation"
            : `per 45-60 minute ${sessionType} consultation`
          }
        </p>
      </div>

      {/* Featured Service (Discovery Call) */}
      {/* Featured Service (Discovery Call) */}
      {discoveryService && (
        <div 
          onClick={() => onServiceSelect(discoveryService.id)}
          className={cn(
            "relative group cursor-pointer rounded-3xl p-8 md:p-10 border transition-all duration-300 hover:shadow-xl overflow-hidden max-w-5xl mx-auto",
            selectedServiceId === discoveryService.id
              ? "bg-white dark:bg-white/5 border-brand-green ring-1 ring-brand-green shadow-lg shadow-brand-green/10"
              : "bg-white/60 dark:bg-white/[0.02] border-neutral-200 dark:border-white/10 hover:border-brand-green/50 backdrop-blur-sm"
          )}
        >
           {/* Selection Check */}
           <div className={cn(
              "absolute top-6 right-6 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors z-10",
              selectedServiceId === discoveryService.id
                ? "bg-brand-green border-brand-green text-white"
                : "border-neutral-300 dark:border-white/20"
            )}>
              {selectedServiceId === discoveryService.id && <CheckCircle2 className="w-5 h-5" />}
            </div>

           <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-shrink-0">
                 <div className={cn("w-20 h-20 rounded-2xl flex items-center justify-center", discoveryService.bgColor, discoveryService.color)}>
                    <discoveryService.icon className="w-10 h-10" />
                 </div>
              </div>
              <div className="flex-grow text-center md:text-left">
                 <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-green/10 text-brand-green text-xs font-bold uppercase tracking-wider mb-3">
                    <Sparkles className="w-3 h-3" />
                    Most Popular
                 </div>
                 <h3 className="text-2xl font-serif font-bold text-olive dark:text-off-white mb-2">
                    {discoveryService.title}
                 </h3>
                 <p className="text-neutral-600 dark:text-neutral-300 mb-6 max-w-2xl leading-relaxed">
                    {discoveryService.fullDescription}
                 </p>
                 <Button 
                    variant={selectedServiceId === discoveryService.id ? "accent" : "default"} 
                    className={cn(
                      "w-full md:w-auto min-w-[200px] h-12 rounded-full font-semibold shadow-md",
                      selectedServiceId === discoveryService.id ? "" : "bg-brand-green hover:bg-brand-green/90 text-white"
                    )}
                 >
                    {selectedServiceId === discoveryService.id ? "Selected" : "Select Free Discovery Call"}
                 </Button>
              </div>
           </div>
        </div>
      )}

      {/* Service Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {gridServices.map((service) => (
          <div 
            key={service.id}
            onClick={() => onServiceSelect(service.id)}
            className={cn(
              "relative group cursor-pointer rounded-2xl p-6 border transition-all duration-300 hover:shadow-xl",
              selectedServiceId === service.id
                ? "bg-white dark:bg-white/5 border-brand-green ring-1 ring-brand-green shadow-lg shadow-brand-green/10"
                : "bg-white/50 dark:bg-white/[0.02] border-neutral-200 dark:border-white/10 hover:border-brand-green/50"
            )}
          >
            {/* Selection Check */}
            <div className={cn(
              "absolute top-4 right-4 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
              selectedServiceId === service.id
                ? "bg-brand-green border-brand-green text-white"
                : "border-neutral-300 dark:border-white/20"
            )}>
              {selectedServiceId === service.id && <CheckCircle2 className="w-4 h-4" />}
            </div>

            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110", service.bgColor, service.color)}>
              <service.icon className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-serif font-bold text-olive dark:text-off-white mb-2 pr-6">
              {service.title}
            </h3>

            <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed mb-4 line-clamp-3">
              {service.shortDescription}
            </p>

            <ul className="space-y-2 mb-6">
               {service.features.slice(0, 2).map((feat, i) => (
                 <li key={i} className="flex items-start gap-2 text-xs text-neutral-500">
                    <span className={`w-1 h-1 rounded-full mt-1.5 shrink-0 ${service.color.replace('text-', 'bg-')}`} />
                    {feat}
                 </li>
               ))}
            </ul>

            <Button 
               variant={selectedServiceId === service.id ? "accent" : "outline"} 
               className="w-full h-10 text-xs"
            >
               {selectedServiceId === service.id ? "Selected" : "Select Service"}
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
