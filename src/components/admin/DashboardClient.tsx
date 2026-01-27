"use client"

import { DashboardStats } from "@/app/actions/dashboard"
import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { ScrollReveal3D } from "@/components/ui/ScrollReveal3D"
import { Calendar, FileText, TrendingUp, Users } from "lucide-react"
import Link from "next/link"

interface DashboardClientProps {
  stats: DashboardStats
}

export function DashboardClient({ stats }: DashboardClientProps) {
  const statCards = [
    {
      title: "Total Inquiries",
      value: stats.inquiries.total.toString(),
      change: `+${stats.inquiries.new} new`,
      icon: Users,
      color: "text-olive",
      bgColor: "bg-olive/10",
    },
    {
      title: "Consultations Booked",
      value: stats.consultations.booked.toString(),
      change: `+${stats.consultations.today} today`,
      icon: Calendar,
      color: "text-brand-green",
      bgColor: "bg-brand-green/10",
    },
    {
      title: "Active Services",
      value: stats.services.active.toString(),
      change: `${stats.services.total} total`,
      icon: FileText,
      color: "text-orange",
      bgColor: "bg-orange/10",
    },
    {
      title: "Blog Posts",
      value: stats.blog.total.toString(),
      change: `${stats.blog.views} views`,
      icon: TrendingUp,
      color: "text-gold",
      bgColor: "bg-gold/10",
    },
  ]

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto pb-8">
      {/* Header */}
      <ScrollReveal3D>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
            <h1 className="text-3xl font-bold font-serif text-olive dark:text-off-white">Dashboard Overview</h1>
            <p className="text-neutral-500 dark:text-neutral-400 mt-1">Welcome back, get a bird's eye view of your platform.</p>
            </div>
            <div className="flex items-center gap-3">
                <span className="text-sm text-neutral-500 bg-white/50 dark:bg-white/5 px-3 py-1.5 rounded-full border border-neutral-200 dark:border-white/10">
                Last updated: Just now
                </span>
            </div>
        </div>
      </ScrollReveal3D>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <ScrollReveal3D key={index} delay={index * 0.1}>
            <Card className="border-none shadow-lg shadow-neutral-200/50 dark:shadow-black/20 bg-white/90 dark:bg-white/5 backdrop-blur-md overflow-hidden relative h-full group hover:-translate-y-1 transition-all duration-300">
                <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${stat.bgColor} rounded-full blur-2xl -mr-8 -mt-8 opacity-50 group-hover:opacity-100 transition-opacity`} />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle className="text-sm font-semibold text-neutral-600 dark:text-neutral-300">
                    {stat.title}
                </CardTitle>
                <div className={`p-2.5 rounded-xl ${stat.bgColor} ${stat.color} shadow-sm group-hover:scale-110 transition-transform`}>
                    <stat.icon className="h-5 w-5" />
                </div>
                </CardHeader>
                <CardContent className="relative z-10">
                <div className="text-3xl font-bold text-olive dark:text-off-white mb-1">{stat.value}</div>
                <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
                    <span className="text-brand-green bg-brand-green/10 px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wide">
                        Status
                    </span>
                    {stat.change}
                </p>
                </CardContent>
            </Card>
          </ScrollReveal3D>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Main Content Area / Activity Feed */}
         <div className="lg:col-span-2 space-y-6">
            <ScrollReveal3D delay={0.4}>
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold font-serif text-olive dark:text-off-white">Recent Activity</h3>
                    <Link href="/admin/inquiries">
                        <Button variant="ghost" size="sm" className="text-brand-green hover:text-orange hover:bg-transparent p-0">View All Inquiries</Button>
                    </Link>
                </div>
                
                <div className="bg-white/80 dark:bg-white/5 backdrop-blur-sm rounded-2xl shadow-sm border border-neutral-100 dark:border-white/10 overflow-hidden mt-4">
                    {stats.recentActivity.length === 0 ? (
                        <div className="p-8 text-center text-neutral-400">No recent activity</div>
                    ) : (
                        stats.recentActivity.map((item, i) => (
                            <div key={item.id} className="flex items-center gap-4 p-4 border-b border-neutral-100 dark:border-white/5 last:border-0 hover:bg-white/50 dark:hover:bg-white/[0.02] transition-colors">
                                <div className="h-10 w-10 rounded-full bg-neutral-100 dark:bg-white/10 flex items-center justify-center shrink-0">
                                    {item.type === 'inquiry' ? <Users className="w-5 h-5 text-olive" /> : <TrendingUp className="w-5 h-5 text-orange" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-olive dark:text-white truncate">
                                        {item.title}
                                    </p>
                                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                        {item.description}
                                    </p>
                                </div>
                                <div className="text-xs text-neutral-400 whitespace-nowrap">
                                    {new Date(item.time).toLocaleDateString()}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </ScrollReveal3D>
         </div>

         {/* Quick Actions Sidebar */}
         <div className="space-y-6">
            <ScrollReveal3D delay={0.5} direction="right">
                <h3 className="text-xl font-bold font-serif text-olive dark:text-off-white">Quick Actions</h3>
                <div className="grid grid-cols-1 gap-3 mt-4">
                    <Link href="/admin/blog/new">
                        <Button variant="outline" className="w-full h-auto py-4 px-4 justify-start bg-white/50 dark:bg-white/5 border-neutral-200 dark:border-white/10 hover:border-brand-green/30 hover:bg-brand-green/5 text-left group transition-all">
                            <div className="h-10 w-10 rounded-full bg-brand-green/10 text-brand-green flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                                <FileText className="w-5 h-5" />
                            </div>
                            <div>
                                <span className="block font-semibold text-olive dark:text-off-white">Post New Article</span>
                                <span className="text-xs text-neutral-500">Update the blog</span>
                            </div>
                        </Button>
                    </Link>

                    <Link href="/admin/services">
                        <Button variant="outline" className="w-full h-auto py-4 px-4 justify-start bg-white/50 dark:bg-white/5 border-neutral-200 dark:border-white/10 hover:border-orange/30 hover:bg-orange/5 text-left group transition-all">
                        <div className="h-10 w-10 rounded-full bg-orange/10 text-orange flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                                <FileText className="w-5 h-5" />
                            </div>
                            <div>
                                <span className="block font-semibold text-olive dark:text-off-white">Manage Services</span>
                                <span className="text-xs text-neutral-500">Edit offerings</span>
                            </div>
                        </Button>
                    </Link>

                    <Link href="/admin/inquiries">
                        <Button variant="outline" className="w-full h-auto py-4 px-4 justify-start bg-white/50 dark:bg-white/5 border-neutral-200 dark:border-white/10 hover:border-gold/30 hover:bg-gold/5 text-left group transition-all">
                        <div className="h-10 w-10 rounded-full bg-gold/10 text-gold flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                                <Users className="w-5 h-5" />
                            </div>
                            <div>
                                <span className="block font-semibold text-olive dark:text-off-white">View Inquiries</span>
                                <span className="text-xs text-neutral-500">Access messages</span>
                            </div>
                        </Button>
                    </Link>
                </div>
            </ScrollReveal3D>

            {/* System Status */}
            <ScrollReveal3D delay={0.6} direction="up">
                <div className="bg-olive/5 dark:bg-white/5 rounded-2xl p-6 border border-olive/10 dark:border-white/5 mt-6">
                    <h4 className="font-semibold text-olive dark:text-off-white mb-4 text-sm uppercase tracking-wide">System Status</h4>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-neutral-600 dark:text-neutral-400">Database</span>
                            <span className="flex items-center text-brand-green font-medium text-xs"><span className="w-2 h-2 rounded-full bg-brand-green mr-2"></span> Operational</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-neutral-600 dark:text-neutral-400">API Gateway</span>
                            <span className="flex items-center text-brand-green font-medium text-xs"><span className="w-2 h-2 rounded-full bg-brand-green mr-2"></span> Operational</span>
                        </div>
                    </div>
                </div>
            </ScrollReveal3D>
         </div>
      </div>
    </div>
  )
}
