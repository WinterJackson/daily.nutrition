"use client"

import { useTheme } from "next-themes"
import { useEffect, useRef } from "react"

interface SavvyCalEmbedProps {
  link: string
  displayName?: string
  email?: string
  theme?: "light" | "dark"
}

declare global {
  interface Window {
    SavvyCal: any
  }
}

export function SavvyCalEmbed({ link, displayName, email, theme }: SavvyCalEmbedProps) {
  const { resolvedTheme } = useTheme()
  const initializedRef = useRef(false)
  
  // Determine effective theme
  const effectiveTheme = theme || (resolvedTheme === "dark" ? "dark" : "light")

  useEffect(() => {
    // 1. Load the script if not present
    const scriptId = "savvycal-embed-script"
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script")
      script.id = scriptId
      script.src = "https://embed.savvycal.com/v1/embed.js"
      script.async = true
      document.body.appendChild(script)
      
      // Initialize global object
      window.SavvyCal = window.SavvyCal || function() {
        (window.SavvyCal.q = window.SavvyCal.q || []).push(arguments)
      }
      
      window.SavvyCal('init')
    }

    // 2. Extract the slug from the full URL if necessary
    // The link should be the full URL e.g. https://savvycal.com/user/slug
    // The API expects just the path e.g. "user/slug" usually, but let's check.
    // Based on standard simple embeds, usually passing the full link works or the relative path.
    // The script doc says `link` option is required.
    // Let's clean the link to be safe.
    let cleanLink = link
    if (link.startsWith("https://savvycal.com/")) {
        cleanLink = link.replace("https://savvycal.com/", "")
    }

    // 3. Render the inline widget
    // We use a timeout to ensure the script has likely loaded or the queue is ready
    window.SavvyCal('inline', {
      link: cleanLink,
      selector: "#savvycal-embed",
      theme: effectiveTheme,
      displayName: displayName,
      email: email,
      hideBanner: true // Cleaner look for internal embed
    })

    return () => {
        // Cleanup if needed - SavvyCal doesn't seem to have a destroy method documented in the snippet
        // but removing the innerHTML of the selector might be good practice if we unmount
        const el = document.getElementById("savvycal-embed")
        if (el) el.innerHTML = ""
    }
  }, [link, effectiveTheme, displayName, email])

  return (
    <div 
        id="savvycal-embed" 
        className="w-full min-h-[500px]" // Min height to prevent collapse before load
    />
  )
}
