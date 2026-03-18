"use client"

import { getActiveSessions, revokeAllOtherSessions, revokeSession } from "@/app/actions/auth"
import { Button } from "@/components/ui/Button"
import { format } from "date-fns"
import { Info, Loader2, LogOut, Monitor, Phone, ShieldAlert } from "lucide-react"
import { useEffect, useState } from "react"
import { CollapsibleCard } from "./CollapsibleCard"

interface SessionManagementProps {
  isOpen: boolean
  onToggle: () => void
}

type SessionData = {
  id: string
  isCurrent: boolean
  ipAddress: string | null
  userAgent: string | null
  createdAt: Date
  expiresAt: Date
}

export function SessionManagement({ isOpen, onToggle }: SessionManagementProps) {
  const [sessions, setSessions] = useState<SessionData[]>([])
  const [loading, setLoading] = useState(false)
  const [revokingId, setRevokingId] = useState<string | null>(null)
  const [revokingAll, setRevokingAll] = useState(false)

  const loadSessions = async () => {
    setLoading(true)
    try {
      const data = await getActiveSessions()
      // @ts-ignore
      setSessions(data)
    } catch (e) {
      console.error("Failed to load sessions", e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      loadSessions()
    }
  }, [isOpen])

  const handleRevoke = async (id: string) => {
    setRevokingId(id)
    await revokeSession(id)
    await loadSessions()
    setRevokingId(null)
  }

  const handleRevokeAllOther = async () => {
    setRevokingAll(true)
    await revokeAllOtherSessions()
    await loadSessions()
    setRevokingAll(false)
  }

  const getDeviceIcon = (userAgent: string | null) => {
    const ua = (userAgent || "").toLowerCase()
    return ua.includes("mobile") || ua.includes("android") || ua.includes("iphone") ? (
      <Phone className="w-5 h-5 text-neutral-400" />
    ) : (
      <Monitor className="w-5 h-5 text-neutral-400" />
    )
  }

  return (
    <CollapsibleCard
      title="Active Sessions"
      description="Manage devices currently logged into your account"
      icon={ShieldAlert}
      isOpen={isOpen}
      onToggle={onToggle}
      status={sessions.length > 1 ? "active" : "inactive"}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-neutral-500">
            If you notice a device you do not recognize, revoke it immediately.
          </p>
          {sessions.length > 1 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRevokeAllOther}
              disabled={revokingAll}
              className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 border-red-200"
            >
              {revokingAll ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Revoking...</>
              ) : (
                <><LogOut className="w-4 h-4 mr-2" /> Log out of all other devices</>
              )}
            </Button>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-neutral-400" />
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => (
              <div
                key={session.id}
                className={`flex items-start justify-between p-4 rounded-xl border ${
                  session.isCurrent
                    ? "bg-brand-green/5 border-brand-green/20 dark:bg-brand-green/10 dark:border-brand-green/20"
                    : "bg-neutral-50 border-neutral-200 dark:bg-white/5 dark:border-white/10"
                }`}
              >
                <div className="flex gap-4">
                  <div className="mt-1">{getDeviceIcon(session.userAgent)}</div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-charcoal dark:text-off-white text-sm">
                        {session.userAgent ? session.userAgent.split(" ").slice(0, 3).join(" ") : "Unknown Device"}
                      </span>
                      {session.isCurrent && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand-green text-white">
                          Current Session
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-neutral-500">
                      <span className="flex items-center gap-1">
                        <Info className="w-3 h-3" />
                        IP: {session.ipAddress || "Unknown"}
                      </span>
                      <span>•</span>
                      <span>Started: {format(new Date(session.createdAt), "MMM d, yyyy")}</span>
                    </div>
                  </div>
                </div>

                {!session.isCurrent && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRevoke(session.id)}
                    disabled={revokingId === session.id}
                    className="text-neutral-500 hover:text-red-500"
                  >
                    {revokingId === session.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Revoke"
                    )}
                  </Button>
                )}
              </div>
            ))}

            {sessions.length === 0 && (
              <p className="text-center text-sm text-neutral-500 py-4">No active sessions found.</p>
            )}
          </div>
        )}
      </div>
    </CollapsibleCard>
  )
}
