import { exportUserData } from "@/app/actions/settings"
import { Button } from "@/components/ui/Button"
import { Database, Download, FileJson, Loader2 } from "lucide-react"
import { useState } from "react"
import { CollapsibleCard } from "./CollapsibleCard"

interface DataExportProps {
    isOpen: boolean
    onToggle: () => void
}

export function DataExport({ isOpen, onToggle }: DataExportProps) {
    const [isExporting, setIsExporting] = useState(false)

    const handleExport = async () => {
        setIsExporting(true)
        try {
            const res = await exportUserData()
            if (res.success && res.data) {
                // Create JSON file and download
                const blob = new Blob([res.data], { type: "application/json" })
                const url = URL.createObjectURL(blob)
                const a = document.createElement("a")
                a.href = url
                a.download = `daily-nutrition-export-${new Date().toISOString().split("T")[0]}.json`
                document.body.appendChild(a)
                a.click()
                document.body.removeChild(a)
                URL.revokeObjectURL(url)
            } else {
                console.error("Export failed:", res.error)
            }
        } catch (error) {
            console.error("Export error:", error)
        } finally {
            setIsExporting(false)
        }
    }

    return (
        <CollapsibleCard
            title="Data Export"
            description="Download all system data as JSON"
            icon={Database}
            isOpen={isOpen}
            onToggle={onToggle}
            status="inactive"
        >
            <div className="space-y-4">
                <div className="p-4 bg-neutral-50 dark:bg-white/5 rounded-xl border border-neutral-100 dark:border-white/5">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-white dark:bg-white/5 rounded-lg border border-neutral-100 dark:border-white/5">
                            <FileJson className="w-6 h-6 text-olive" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="font-medium text-olive dark:text-off-white">Full System Export</h3>
                            <p className="text-sm text-neutral-500">
                                This will generate a JSON file containing all Bookings, Inquiries, Blog Posts, and Services.
                                Use this for backups or migrating data.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end mt-4 pt-4 border-t border-neutral-100 dark:border-white/5">
                    <Button 
                        onClick={handleExport}
                        disabled={isExporting}
                        variant="outline"
                        className="border-neutral-200 dark:border-white/10 hover:bg-neutral-50 dark:hover:bg-white/5"
                    >
                        {isExporting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Generating Export...
                            </>
                        ) : (
                            <>
                                <Download className="mr-2 h-4 w-4" />
                                Download JSON
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </CollapsibleCard>
    )
}
