"use client"

import { Button } from "@/components/ui/Button"
import { Cookie, X } from "lucide-react"
import { useEffect, useState } from "react"

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Check if user has already accepted/declined cookies
    const consent = localStorage.getItem("cookie-consent")
    if (!consent) {
      // Delay showing the banner slightly for better UX
      const timer = setTimeout(() => setIsVisible(true), 1500)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem("cookie-consent", "accepted")
    setIsVisible(false)
  }

  const handleDecline = () => {
    localStorage.setItem("cookie-consent", "declined")
    setIsVisible(false)
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-4 right-4 z-[9999] max-w-sm animate-in slide-in-from-bottom-4 fade-in duration-500">
      <div className="bg-white dark:bg-charcoal rounded-2xl shadow-2xl shadow-black/20 border border-neutral-200 dark:border-white/10 p-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-orange/10 flex items-center justify-center shrink-0">
            <Cookie className="w-5 h-5 text-orange" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-olive dark:text-off-white text-sm">Cookie Notice</h3>
              <button
                onClick={handleDecline}
                className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4 leading-relaxed">
              We use cookies to enhance your experience, analyze site traffic, and for marketing purposes. By continuing to use our site, you consent to our use of cookies.
            </p>
            <div className="flex gap-2">
              <Button
                onClick={handleAccept}
                size="sm"
                variant="accent"
                className="text-xs h-8 px-4"
              >
                Accept All
              </Button>
              <Button
                onClick={handleDecline}
                size="sm"
                variant="outline"
                className="text-xs h-8 px-4"
              >
                Decline
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
