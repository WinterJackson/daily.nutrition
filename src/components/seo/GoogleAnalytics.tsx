"use client"

import Script from "next/script"
import { useEffect } from "react"

export function GoogleAnalytics({ gaId }: { gaId: string }) {
  useEffect(() => {
    // We only execute this on the client
    if (typeof window === "undefined") return

    // 1. Check existing cookie consent status
    const consent = localStorage.getItem("cookie-consent")
    
    // 2. Set default consent state for Google Analytics (GDPR requirement)
    // We deny analytics and ad storage by default until user explicitly accepts
    ;(window as any).gtag = (window as any).gtag || function() {
      // eslint-disable-next-line prefer-rest-params
      ((window as any).dataLayer = (window as any).dataLayer || []).push(arguments)
    }
    
    ;(window as any).gtag("consent", "default", {
      analytics_storage: "denied",
      ad_storage: "denied",
    })

    // 3. If they had previously accepted, immediately update the consent to granted
    if (consent === "accepted") {
      ;(window as any).gtag("consent", "update", {
        analytics_storage: "granted",
        ad_storage: "granted",
      })
    }
  }, [])

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            
            // Note: The consent default has already been handled in the useEffect above
            gtag('config', '${gaId}', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />
    </>
  )
}
