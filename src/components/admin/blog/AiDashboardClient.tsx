"use client"

import { ListChecks, Settings, Sparkles } from "lucide-react"
import { useState } from "react"
import { AiSettingsForm } from "./AiSettingsForm"
import { IdeaQueue } from "./IdeaQueue"
import { TrendScout } from "./TrendScout"

interface AiDashboardClientProps {
    userRole: string
}

const tabs = [
    { id: "newsroom", label: "Newsroom", icon: Sparkles, description: "Scout AI-powered content trends" },
    { id: "queue", label: "Queue", icon: ListChecks, description: "Manage approved ideas pipeline" },
    { id: "config", label: "Config", icon: Settings, description: "AI settings & secrets" },
] as const

type TabId = (typeof tabs)[number]["id"]

export function AiDashboardClient({ userRole }: AiDashboardClientProps) {
    const [activeTab, setActiveTab] = useState<TabId>("newsroom")

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-olive dark:text-off-white">
                    AI Content Assistant
                </h1>
                <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
                    AI-powered content ideation and drafting for Edwak Nutrition
                </p>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-1 p-1 rounded-xl" style={{ backgroundColor: "var(--surface-secondary)" }}>
                {tabs.map((tab) => {
                    // Config only visible to SUPER_ADMIN
                    if (tab.id === "config" && userRole !== "SUPER_ADMIN") return null
                    
                    const Icon = tab.icon
                    const isActive = activeTab === tab.id
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 flex-1 justify-center ${
                                isActive
                                    ? "bg-white dark:bg-white/10 text-olive dark:text-off-white shadow-sm"
                                    : "text-neutral-500 hover:text-olive dark:hover:text-off-white"
                            }`}
                        >
                            <Icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    )
                })}
            </div>

            {/* Tab Content */}
            <div className="min-h-[500px]">
                {activeTab === "newsroom" && <TrendScout />}
                {activeTab === "queue" && <IdeaQueue />}
                {activeTab === "config" && userRole === "SUPER_ADMIN" && <AiSettingsForm />}
            </div>
        </div>
    )
}
