"use client";

import { Button } from "@/components/ui/Button";
import { ServiceIcon } from "@/components/ui/ServiceIcon";
import { pricing } from "@/lib/data";
import { cn } from "@/lib/utils";
import { CheckCircle2, Globe, MapPin, Sparkles } from "lucide-react";
import Image from "next/image";

interface Service {
    id: string;
    title: string;
    slug: string;
    icon: string;
    shortDescription: string;
    fullDescription: string | null;
    features: string[];
    targetAudience: string | null;
    color: string;
    bgColor: string;
    image?: string | null;
}

interface ServiceSelectionProps {
    onServiceSelect: (serviceId: string) => void;
    selectedServiceId?: string;
    activeServiceIds?: string[];
    sessionType: "virtual" | "in-person";
    onSessionTypeChange: (type: "virtual" | "in-person") => void;
    services?: Service[];
}

export function ServiceSelection({
    onServiceSelect,
    selectedServiceId,
    activeServiceIds,
    sessionType,
    onSessionTypeChange,
    services = [],
}: ServiceSelectionProps) {
    const visibleServices = activeServiceIds
        ? services.filter((s) => activeServiceIds.includes(s.id))
        : services;

    const discoveryService = visibleServices.find(
        (s) => s.id === "discovery-call",
    );
    const gridServices = visibleServices.filter(
        (s) => s.id !== "discovery-call",
    );

    return (
        <div className="space-y-12">
            {/* Session Type Toggle - Hidden for Discovery Calls (virtual only) */}
            {selectedServiceId !== "discovery-call" ? (
                <div className="flex justify-center">
                    <div className="inline-flex bg-neutral-100 dark:bg-white/5 p-1 rounded-xl">
                        <button
                            onClick={() => onSessionTypeChange("virtual")}
                            className={cn(
                                "flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-medium transition-all duration-300",
                                sessionType === "virtual"
                                    ? "bg-white dark:bg-charcoal text-brand-green shadow-sm"
                                    : "text-neutral-500 hover:text-olive dark:hover:text-off-white",
                            )}
                        >
                            <Globe className="w-4 h-4" />
                            Virtual Session
                        </button>
                        <button
                            onClick={() => onSessionTypeChange("in-person")}
                            className={cn(
                                "flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-medium transition-all duration-300",
                                sessionType === "in-person"
                                    ? "bg-white dark:bg-charcoal text-brand-green shadow-sm"
                                    : "text-neutral-500 hover:text-olive dark:hover:text-off-white",
                            )}
                        >
                            <MapPin className="w-4 h-4" />
                            In-Person Visit
                        </button>
                    </div>
                </div>
            ) : (
                <div className="flex justify-center">
                    <div className="inline-flex items-center gap-2 bg-brand-green/10 text-brand-green px-6 py-3 rounded-xl font-medium">
                        <Globe className="w-4 h-4" />
                        Virtual Session Only
                    </div>
                </div>
            )}

            {/* Pricing Display */}
            <div className="text-center space-y-2">
                <p className="text-3xl font-bold font-serif text-olive dark:text-off-white">
                    {selectedServiceId === "discovery-call"
                        ? "Free"
                        : `Ksh ${sessionType === "virtual" ? pricing.default.virtual.toLocaleString() : pricing.default.inPerson.toLocaleString()}`}
                </p>
                {selectedServiceId === "discovery-call"
                    ? "5-15 Minute complimentary consultation"
                    : `per 45-60 minute ${sessionType} consultation`}
            </div>

            {/* Featured Service (Discovery Call) */}
            {discoveryService && (
                <div
                    onClick={() => onServiceSelect(discoveryService.id)}
                    className={cn(
                        "relative group cursor-pointer rounded-3xl border transition-all duration-300 hover:shadow-xl overflow-hidden max-w-5xl mx-auto",
                        selectedServiceId === discoveryService.id
                            ? "border-brand-green/30 dark:border-brand-green/20 shadow-xl shadow-brand-green/5 bg-white/60 dark:bg-white/5 backdrop-blur-md ring-1 ring-brand-green"
                            : "border-brand-green/30 dark:border-brand-green/20 shadow-xl shadow-brand-green/5 bg-white/60 dark:bg-white/5 backdrop-blur-md hover:border-brand-green/50",
                    )}
                >
                    <div className="grid grid-cols-1 md:grid-cols-12 min-h-75">
                        <div className="md:col-span-3 p-8 md:p-12 bg-brand-green/10 flex items-center justify-center md:border-r border-brand-green/10 z-10">
                            <div className="w-20 h-20 rounded-2xl bg-white dark:bg-charcoal text-brand-green flex items-center justify-center shadow-sm">
                                <ServiceIcon
                                    name={discoveryService.icon}
                                    className="w-10 h-10"
                                />
                            </div>
                        </div>
                        <div className="md:col-span-5 lg:col-span-6 p-8 md:p-12 text-center md:text-left z-10">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-green/10 text-brand-green text-xs font-bold uppercase tracking-wider mb-4">
                                <Sparkles className="w-3 h-3" />
                                Most Popular
                            </div>
                            <h3 className="text-2xl md:text-3xl font-serif font-bold text-olive dark:text-off-white mb-4">
                                {discoveryService.title}
                            </h3>
                            <p className="text-neutral-600 dark:text-neutral-300 mb-8 max-w-xl mx-auto md:mx-0 leading-relaxed">
                                {discoveryService.fullDescription}
                            </p>
                            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start">
                                <Button
                                    variant={
                                        selectedServiceId ===
                                        discoveryService.id
                                            ? "accent"
                                            : "default"
                                    }
                                    className={cn(
                                        "font-semibold px-8 h-12 rounded-full shadow-lg shadow-brand-green/20",
                                        selectedServiceId ===
                                            discoveryService.id
                                            ? ""
                                            : "bg-brand-green hover:bg-brand-green/90 text-white",
                                    )}
                                >
                                    {selectedServiceId === discoveryService.id
                                        ? "Selected"
                                        : "Book Now - Free"}
                                </Button>
                            </div>
                        </div>
                        <div className="hidden md:block md:col-span-4 lg:col-span-3 relative bg-neutral-100 dark:bg-white/5">
                            {discoveryService.image ? (
                                <>
                                    <div className="absolute inset-y-0 left-0 w-24 bg-linear-to-r from-white/60 dark:from-charcoal/0 to-transparent z-10" />
                                    <Image
                                        src={discoveryService.image}
                                        alt={discoveryService.title}
                                        fill
                                        className="object-cover object-center opacity-90"
                                    />
                                </>
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-brand-green/20">
                                    <ServiceIcon
                                        name={discoveryService.icon}
                                        className="w-32 h-32 opacity-20"
                                    />
                                </div>
                            )}
                            {/* Selection Check */}
                            <div
                                className={cn(
                                    "absolute top-4 right-4 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors z-20",
                                    selectedServiceId === discoveryService.id
                                        ? "bg-brand-green border-brand-green text-white"
                                        : "border-neutral-300 dark:border-white/20 bg-white/80 dark:bg-charcoal/80",
                                )}
                            >
                                {selectedServiceId === discoveryService.id && (
                                    <CheckCircle2 className="w-5 h-5" />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Service Cards Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {gridServices.map((service) => (
                    <div
                        key={service.id}
                        onClick={() => onServiceSelect(service.id)}
                        className={cn(
                            "relative group cursor-pointer rounded-2xl border transition-all duration-300 hover:shadow-xl flex flex-col h-full overflow-hidden",
                            selectedServiceId === service.id
                                ? "bg-white dark:bg-white/5 border-brand-green ring-1 ring-brand-green shadow-lg shadow-brand-green/10"
                                : "bg-white/50 dark:bg-white/2 border-neutral-200 dark:border-white/10 hover:border-brand-green/50",
                        )}
                    >
                        {/* Header / Image Area */}
                        <div className="relative w-full h-56 mb-4 bg-neutral-100 dark:bg-white/5">
                            {service.image ? (
                                <>
                                    <Image
                                        src={service.image}
                                        alt={service.title}
                                        fill
                                        className="object-cover"
                                    />
                                    <div className="absolute inset-0 bg-linear-to-t from-white/90 dark:from-charcoal/90 to-transparent"></div>
                                </>
                            ) : (
                                <div className="w-full h-full flex items-center justify-center opacity-10">
                                    <ServiceIcon
                                        name={service.icon}
                                        className={`w-12 h-12 ${service.color}`}
                                    />
                                </div>
                            )}
                            {/* Selection Check */}
                            <div
                                className={cn(
                                    "absolute top-4 right-4 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors z-20",
                                    selectedServiceId === service.id
                                        ? "bg-brand-green border-brand-green text-white"
                                        : "border-neutral-300 dark:border-white/20",
                                )}
                            >
                                {selectedServiceId === service.id && (
                                    <CheckCircle2 className="w-4 h-4" />
                                )}
                            </div>

                            <div
                                className={cn(
                                    "absolute -bottom-6 right-6 w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-md z-10",
                                    service.bgColor,
                                    service.color,
                                )}
                            >
                                <ServiceIcon
                                    name={service.icon}
                                    className="w-6 h-6"
                                />
                            </div>
                        </div>

                        {/* Content Area */}
                        <div className="p-6 pt-2 flex flex-col grow">
                            <h3 className="text-lg font-serif font-bold text-olive dark:text-off-white mb-2 pr-14 leading-tight">
                                {service.title}
                            </h3>

                            <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed mb-4 line-clamp-3">
                                {service.shortDescription}
                            </p>

                            <ul className="space-y-2 mb-6">
                                {service.features
                                    ?.slice(0, 2)
                                    .map((feat: string, i: number) => (
                                        <li
                                            key={i}
                                            className="flex items-start gap-2 text-xs text-neutral-500"
                                        >
                                            <span
                                                className={`w-1 h-1 rounded-full mt-1.5 shrink-0 ${service.color.replace("text-", "bg-")}`}
                                            />
                                            {feat}
                                        </li>
                                    ))}
                            </ul>

                            <Button
                                variant={
                                    selectedServiceId === service.id
                                        ? "accent"
                                        : "outline"
                                }
                                className="w-full h-10 text-xs mt-auto z-10"
                            >
                                {selectedServiceId === service.id
                                    ? "Selected"
                                    : "Select Service"}
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
