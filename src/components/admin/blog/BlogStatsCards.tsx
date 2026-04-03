import { Card, CardContent } from "@/components/ui/Card"
import { Skeleton } from "@/components/ui/Skeleton"
import { CheckCircle2, FileText, LayoutList } from "lucide-react"

interface BlogStats {
    total: number
    published: number
    drafts: number
    categories: { category: string, count: number }[]
}

interface BlogStatsCardsProps {
    stats: BlogStats | null
    isLoading?: boolean
}

export function BlogStatsCards({ stats, isLoading = false }: BlogStatsCardsProps) {
    if (isLoading || !stats) {
        return <StatsSkeleton />
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Total Posts */}
            <Card className="border-none shadow-sm bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-neutral-200/50 dark:border-white/5">
                <CardContent className="p-6 flex flex-col justify-between h-full">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-olive/10 dark:bg-olive/20 rounded-xl text-olive dark:text-brand-green">
                            <LayoutList className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] md:text-xs font-semibold uppercase tracking-wider text-neutral-400">Total Posts</span>
                    </div>
                    <div>
                        <h3 className="text-2xl md:text-3xl font-bold text-neutral-800 dark:text-neutral-100 mb-1">{stats.total}</h3>
                        <p className="text-[10px] md:text-xs text-neutral-500 font-medium">Across {stats.categories.length} categories</p>
                    </div>
                </CardContent>
            </Card>

            {/* Published */}
            <Card className="border-none shadow-sm bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-neutral-200/50 dark:border-white/5">
                <CardContent className="p-6 flex flex-col justify-between h-full">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-green-50 dark:bg-green-500/10 rounded-xl text-brand-green">
                            <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] md:text-xs font-semibold uppercase tracking-wider text-neutral-400">Published</span>
                    </div>
                    <div>
                        <h3 className="text-2xl md:text-3xl font-bold text-neutral-800 dark:text-neutral-100 mb-1">{stats.published}</h3>
                        <div className="w-full bg-neutral-100 dark:bg-white/10 rounded-full h-1.5 mt-2 overflow-hidden">
                            <div 
                                className="bg-brand-green h-full rounded-full transition-all duration-500" 
                                style={{ width: `${stats.total > 0 ? (stats.published / stats.total) * 100 : 0}%` }} 
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Drafts */}
            <Card className="border-none shadow-sm bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-neutral-200/50 dark:border-white/5">
                <CardContent className="p-6 flex flex-col justify-between h-full">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-amber-50 dark:bg-amber-500/10 rounded-xl text-amber-600 dark:text-amber-400">
                             <FileText className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] md:text-xs font-semibold uppercase tracking-wider text-neutral-400">Drafts</span>
                    </div>
                    <div>
                        <h3 className="text-2xl md:text-3xl font-bold text-neutral-800 dark:text-neutral-100 mb-1">{stats.drafts}</h3>
                         <div className="w-full bg-neutral-100 dark:bg-white/10 rounded-full h-1.5 mt-2 overflow-hidden">
                            <div 
                                className="bg-amber-400 h-full rounded-full transition-all duration-500" 
                                style={{ width: `${stats.total > 0 ? (stats.drafts / stats.total) * 100 : 0}%` }} 
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

function StatsSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map((i) => (
                <Card key={i} className="border-none shadow-sm bg-white/80 dark:bg-white/5 border border-neutral-200/50">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                            <Skeleton className="h-9 w-9 rounded-xl" />
                            <Skeleton className="h-4 w-20 rounded" />
                        </div>
                        <Skeleton className="h-8 w-12 mb-2" />
                        <Skeleton className="h-3 w-32" />
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
