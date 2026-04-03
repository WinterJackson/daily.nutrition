"use client"

import {
    deleteAllReadNotifications,
    deleteNotification,
    getNotifications,
    markAllNotificationsRead,
    markNotificationRead,
} from "@/app/actions/notifications"
import { cn } from "@/lib/utils"
import { AnimatePresence, motion } from "framer-motion"
import {
    Bell,
    CheckCheck,
    Info,
    Loader2,
    Trash2,
    TriangleAlert,
    X,
} from "lucide-react"
import Link from "next/link"
import { useCallback, useEffect, useRef, useState } from "react"

interface Notification {
    id: string
    type: string
    title: string
    message: string
    priority: string
    link: string | null
    isRead: boolean
    readAt: Date | null
    expiresAt: Date | null
    createdAt: Date
}

export function NotificationBell() {
    const [open, setOpen] = useState(false)
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [loading, setLoading] = useState(false)
    const panelRef = useRef<HTMLDivElement>(null)

    // Fetch notifications
    const fetchNotifications = useCallback(async () => {
        try {
            const result = await getNotifications()
            setNotifications(result.notifications as Notification[])
            setUnreadCount(result.unreadCount)
        } catch (err) {
            console.error("Failed to fetch notifications", err)
        }
    }, [])

    // Initial fetch + polling
    useEffect(() => {
        fetchNotifications()
        const interval = setInterval(fetchNotifications, 30000) // 30s poll
        return () => clearInterval(interval)
    }, [fetchNotifications])

    // Close on outside click
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
                setOpen(false)
            }
        }
        if (open) document.addEventListener("mousedown", handleClick)
        return () => document.removeEventListener("mousedown", handleClick)
    }, [open])

    const handleMarkRead = async (id: string) => {
        await markNotificationRead(id)
        setNotifications(prev =>
            prev.map(n => (n.id === id ? { ...n, isRead: true, readAt: new Date() } : n))
        )
        setUnreadCount(prev => Math.max(0, prev - 1))
    }

    const handleMarkAllRead = async () => {
        setLoading(true)
        await markAllNotificationsRead()
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true, readAt: new Date() })))
        setUnreadCount(0)
        setLoading(false)
    }

    const handleDelete = async (id: string) => {
        await deleteNotification(id)
        setNotifications(prev => prev.filter(n => n.id !== id))
    }

    const handleClearRead = async () => {
        setLoading(true)
        await deleteAllReadNotifications()
        setNotifications(prev => prev.filter(n => !n.isRead))
        setLoading(false)
    }

    const getIcon = (type: string) => {
        switch (type) {
            case "WARNING":
            case "ERROR":
                return <TriangleAlert className="w-4 h-4 text-orange" />
            case "SUCCESS":
                return <CheckCheck className="w-4 h-4 text-brand-green" />
            default:
                return <Info className="w-4 h-4 text-blue-500" />
        }
    }

    const timeAgo = (date: Date) => {
        const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
        if (seconds < 60) return "just now"
        const minutes = Math.floor(seconds / 60)
        if (minutes < 60) return `${minutes}m ago`
        const hours = Math.floor(minutes / 60)
        if (hours < 24) return `${hours}h ago`
        const days = Math.floor(hours / 24)
        return `${days}d ago`
    }

    return (
        <div ref={panelRef} className="relative">
            {/* Bell Button */}
            <button
                onClick={() => setOpen(!open)}
                className="relative p-2 rounded-full hover:bg-white/10 transition-colors text-white"
                aria-label="Notifications"
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.6)]"
                    >
                        {unreadCount > 99 ? "99+" : unreadCount}
                    </motion.span>
                )}
            </button>

            {/* Dropdown Panel */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white dark:bg-charcoal rounded-2xl shadow-2xl border border-neutral-200 dark:border-white/10 z-[200] overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100 dark:border-white/10 bg-neutral-50 dark:bg-white/5">
                            <h3 className="text-sm font-bold text-olive dark:text-off-white">
                                Notifications
                                {unreadCount > 0 && (
                                    <span className="ml-2 text-[10px] font-bold bg-red-500 text-white px-1.5 py-0.5 rounded-full">
                                        {unreadCount}
                                    </span>
                                )}
                            </h3>
                            <div className="flex items-center gap-1">
                                {unreadCount > 0 && (
                                    <button
                                        onClick={handleMarkAllRead}
                                        disabled={loading}
                                        className="text-xs text-brand-green hover:text-orange transition-colors px-2 py-1 rounded-lg hover:bg-brand-green/10"
                                        title="Mark all as read"
                                    >
                                        {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : "Mark all read"}
                                    </button>
                                )}
                                <button
                                    onClick={() => setOpen(false)}
                                    className="p-1 rounded-lg hover:bg-neutral-200 dark:hover:bg-white/10 text-neutral-500 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Notification List */}
                        <div className="max-h-[360px] overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="py-12 text-center text-neutral-400">
                                    <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                    <p className="text-sm">No notifications yet</p>
                                </div>
                            ) : (
                                notifications.map((n) => {
                                    const content = (
                                        <div
                                            key={n.id}
                                            className={cn(
                                                "flex items-start gap-3 px-4 py-3 border-b border-neutral-50 dark:border-white/5 transition-colors group",
                                                !n.isRead
                                                    ? "bg-orange/5 hover:bg-orange/10"
                                                    : "hover:bg-neutral-50 dark:hover:bg-white/5"
                                            )}
                                        >
                                            {/* Icon */}
                                            <div className="mt-0.5 shrink-0">
                                                {getIcon(n.type)}
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p className={cn(
                                                        "text-sm truncate",
                                                        !n.isRead ? "font-semibold text-olive dark:text-off-white" : "font-medium text-neutral-600 dark:text-neutral-300"
                                                    )}>
                                                        {n.title}
                                                    </p>
                                                    {!n.isRead && (
                                                        <span className="w-2 h-2 rounded-full bg-orange shrink-0" />
                                                    )}
                                                </div>
                                                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 line-clamp-2">
                                                    {n.message}
                                                </p>
                                                <p className="text-[10px] text-neutral-400 mt-1">
                                                    {timeAgo(n.createdAt)}
                                                </p>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                                {!n.isRead && (
                                                    <button
                                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleMarkRead(n.id) }}
                                                        className="p-1 rounded hover:bg-brand-green/10 text-brand-green"
                                                        title="Mark as read"
                                                    >
                                                        <CheckCheck className="w-3.5 h-3.5" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete(n.id) }}
                                                    className="p-1 rounded hover:bg-red-500/10 text-red-400"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    )

                                    // Wrap in Link if notification has a link
                                    return n.link ? (
                                        <Link
                                            key={n.id}
                                            href={n.link}
                                            onClick={() => {
                                                if (!n.isRead) handleMarkRead(n.id)
                                                setOpen(false)
                                            }}
                                        >
                                            {content}
                                        </Link>
                                    ) : (
                                        <div key={n.id}>{content}</div>
                                    )
                                })
                            )}
                        </div>

                        {/* Footer */}
                        {notifications.some(n => n.isRead) && (
                            <div className="px-4 py-2 border-t border-neutral-100 dark:border-white/10 bg-neutral-50 dark:bg-white/5">
                                <button
                                    onClick={handleClearRead}
                                    disabled={loading}
                                    className="text-xs text-red-400 hover:text-red-500 transition-colors flex items-center gap-1.5"
                                >
                                    {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                                    Clear read notifications
                                </button>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
