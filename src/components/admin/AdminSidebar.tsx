"use client"

import { Button } from "@/components/ui/Button"
import { cn } from "@/lib/utils"
import { AnimatePresence, motion } from "framer-motion"
import {
    Calendar,
    ChevronLeft,
    Files,
    Laptop,
    LayoutDashboard,
    LogOut,
    Menu,
    Moon,
    Settings,
    Star,
    Sun,
    User,
    Users,
    X
} from "lucide-react"
import { useTheme } from "next-themes"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

const adminLinks = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Bookings", href: "/admin/bookings", icon: Calendar },
  { name: "Services", href: "/admin/services", icon: Files },
  { name: "Blog & News", href: "/admin/blog", icon: Files },
  { name: "Inquiries", href: "/admin/inquiries", icon: Users },
  { name: "Testimonials", href: "/admin/testimonials", icon: Star },
  { name: "Settings", href: "/admin/settings", icon: Settings },
]

export function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <>
      {/* Header */}
      <div className={cn(
        "h-20 flex items-center border-b border-white/10 overflow-hidden relative bg-white/5 shrink-0 transition-all duration-300",
        collapsed && !isMobile ? "justify-center" : "justify-between px-4"
      )}>
        {/* Collapsed State: Hamburger Icon */}
        {collapsed && !isMobile ? (
          <button
            onClick={() => setCollapsed(false)}
            className="p-2 rounded-[10px] bg-gradient-to-br from-white via-white to-olive/20 hover:to-olive/30 shadow-sm transition-all flex items-center justify-center text-olive"
            aria-label="Expand sidebar"
          >
            <Menu className="w-6 h-6" />
          </button>
        ) : (
          /* Expanded State: Logo + Collapse Button */
          <>
            <Link href="/admin" className="flex items-center gap-3 flex-1 min-w-0 pointer-events-none">
              <div className="relative h-12 w-32 shrink-0 bg-gradient-to-br from-white via-white to-olive/20 rounded-[10px] px-1 pointer-events-auto shadow-sm">
                 <Image 
                   src="/admin-logo.png" 
                   alt="Daily Nutrition Admin" 
                   fill
                   className="object-contain"
                   priority
                 />
              </div>
            </Link>
            
            {/* Collapse Toggle - Desktop Only */}
            {!isMobile && (
              <button
                onClick={() => setCollapsed(!collapsed)}
                className="bg-orange text-white rounded-full p-1.5 shadow-lg hover:bg-orange/90 hover:scale-110 transition-all shrink-0 ml-2"
                aria-label="Collapse sidebar"
              >
                <ChevronLeft size={16} />
              </button>
            )}

            {/* Close Button - Mobile Only */}
            {isMobile && (
               <button
                onClick={() => setMobileOpen(false)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </>
        )}
      </div>

      {/* Nav Links */}
      <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto overflow-x-hidden custom-scrollbar">
        {adminLinks.map((link) => {
          const isActive = pathname === link.href || (link.href !== "/admin" && pathname.startsWith(link.href))
          
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center rounded-xl transition-all duration-200 group relative min-h-[44px]",
                collapsed && !isMobile ? "justify-center px-0 py-3" : "gap-3 px-3 py-3",
                isActive 
                  ? "bg-white/15 text-white shadow-lg backdrop-blur-sm" 
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              )}
            >
              <link.icon className={cn(
                "w-5 h-5 shrink-0 transition-all duration-200", 
                isActive ? "text-orange" : "group-hover:text-orange group-hover:scale-110"
              )} />
              
              {(isMobile || !collapsed) && (
                <motion.span 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="whitespace-nowrap font-medium text-sm"
                >
                  {link.name}
                </motion.span>
              )}
              
              {/* Tooltip for collapsed state */}
              {collapsed && !isMobile && (
                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 bg-charcoal text-white text-xs rounded-lg shadow-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap border border-white/10">
                  {link.name}
                </div>
              )}

              {/* Active indicator */}
              {isActive && (
                <motion.div
                  layoutId={isMobile ? "mobile-active" : "desktop-active"}
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-orange rounded-r-full"
                />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/10 space-y-4 shrink-0 bg-black/10">
        
        {/* Custom Theme Toggle - Highly Visible */}
        {(isMobile || !collapsed) ? (
            <div className="bg-black/20 p-1 rounded-xl flex items-center justify-between relative shadow-inner border border-white/5">
                <button 
                  onClick={() => setTheme("light")}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg text-xs font-medium transition-all duration-300",
                    theme === 'light' 
                      ? "bg-white text-olive shadow-sm scale-100" 
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  )}
                >
                   <Sun size={14} />
                   <span>Light</span>
                </button>
                <button 
                  onClick={() => setTheme("system")}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg text-xs font-medium transition-all duration-300",
                    theme === 'system' 
                       ? "bg-white text-olive shadow-sm scale-100" 
                       : "text-white/60 hover:text-white hover:bg-white/5"
                  )}
                >
                   <Laptop size={14} />
                </button>
                <button 
                  onClick={() => setTheme("dark")}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg text-xs font-medium transition-all duration-300",
                    theme === 'dark' 
                       ? "bg-white text-olive shadow-sm scale-100" 
                       : "text-white/60 hover:text-white hover:bg-white/5"
                  )}
                >
                   <Moon size={14} />
                   <span>Dark</span>
                </button>
            </div>
        ) : (
            // Collapsed Theme Toggle (Cycle)
            <button 
               onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
               className="w-10 h-10 mx-auto bg-black/20 rounded-xl flex items-center justify-center text-white hover:bg-white/20 transition-all border border-white/5"
            >
               {theme === 'dark' ? <Moon size={18} /> : 
                theme === 'light' ? <Sun size={18} /> : <Laptop size={18} />}
            </button>
        )}

        <Button 
          variant="ghost" 
          className={cn(
            "w-full text-white/70 hover:text-white hover:bg-red-500/20 transition-all duration-200 flex items-center group",
            collapsed && !isMobile ? "justify-center px-0 h-10 w-10 mx-auto rounded-xl" : "justify-start px-3 py-2"
          )}
        >
          <LogOut className="w-5 h-5 shrink-0 group-hover:text-red-300 transition-colors" />
          {(isMobile || !collapsed) && <span className="ml-3 font-medium">Logout</span>}
        </Button>
      </div>
    </>
  )

  // Return a skeleton placeholder while not mounted to prevent layout shift
  if (!mounted) {
    return (
      <>
        {/* Mobile Header Skeleton */}
        <div className="lg:hidden fixed top-[2px] left-[2px] right-[2px] h-16 bg-olive/95 backdrop-blur-lg border-b border-white/10 z-50 flex items-center justify-between px-4 shadow-lg rounded-[10px]">
          <div className="w-10 h-10 bg-white/20 rounded-[10px] animate-pulse" />
          <div className="w-28 h-10 bg-white/20 rounded-[10px] animate-pulse" />
          <div className="w-9 h-9 bg-white/20 rounded-full animate-pulse" />
        </div>
        
        {/* Desktop Sidebar Skeleton */}
        <aside className="hidden lg:flex fixed top-[5px] left-[5px] bottom-[5px] w-[260px] bg-olive text-white shadow-2xl z-40 flex-col border border-white/10 rounded-xl overflow-hidden">
          <div className="h-20 flex items-center border-b border-white/10 px-4">
            <div className="h-12 w-32 bg-white/20 rounded-[10px] animate-pulse" />
          </div>
          <nav className="flex-1 p-3 space-y-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-11 bg-white/10 rounded-xl animate-pulse" />
            ))}
          </nav>
          <div className="p-4 border-t border-white/10 space-y-4 bg-black/10">
            <div className="h-10 bg-white/10 rounded-xl animate-pulse" />
            <div className="h-10 bg-white/10 rounded-xl animate-pulse" />
          </div>
        </aside>
        
        {/* Spacer for desktop sidebar */}
        <div className="hidden lg:block w-[265px] shrink-0 h-screen" />
      </>
    )
  }

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-[2px] left-[2px] right-[2px] h-16 bg-olive/95 backdrop-blur-lg border-b border-white/10 z-50 flex items-center justify-between px-4 shadow-lg rounded-[10px]">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-[10px] bg-gradient-to-br from-white via-white to-olive/20 hover:to-olive/30 shadow-sm transition-all text-olive"
          aria-label="Open menu"
        >
          <Menu className="w-6 h-6" />
        </button>
        
        <Link href="/admin" className="flex items-center gap-2">
           <div className="relative h-10 w-28 bg-gradient-to-br from-white via-white to-olive/20 rounded-[10px] px-1 shadow-sm">
               <Image 
                 src="/admin-logo.png" 
                 alt="Daily Nutrition" 
                 fill
                 className="object-contain"
               />
           </div>
        </Link>

        {/* User Avatar on Mobile Header */}
        <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white border border-white/10 shadow-inner">
            <User className="w-5 h-5" />
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="lg:hidden fixed top-[5px] left-[5px] bottom-[5px] w-72 bg-olive z-50 flex flex-col shadow-2xl rounded-[10px] overflow-hidden"
            >
               <SidebarContent isMobile />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <motion.aside
        initial={{ width: 260 }}
        animate={{ width: collapsed ? 80 : 260 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="hidden lg:flex fixed top-[5px] left-[5px] bottom-[5px] bg-olive text-white shadow-2xl z-40 flex-col border border-white/10 rounded-xl overflow-hidden"
      >
        <SidebarContent />
      </motion.aside>

      {/* Spacer for desktop sidebar */}
      <motion.div
        initial={{ width: 265 }}
        animate={{ width: collapsed ? 85 : 265 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="hidden lg:block shrink-0 h-screen"
      />

    </>
  )
}
