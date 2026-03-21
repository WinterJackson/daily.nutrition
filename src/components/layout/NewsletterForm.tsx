"use client"

import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Loader2 } from "lucide-react"
import { useState } from "react"

export function NewsletterForm() {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return

    setStatus("loading")
    setMessage("")

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (res.ok) {
        setStatus("success")
        setMessage("Thank you for subscribing!")
        setEmail("")
      } else {
        setStatus("error")
        setMessage(data.error || "Failed to subscribe")
      }
    } catch {
      setStatus("error")
      setMessage("An unexpected error occurred.")
    }

    setTimeout(() => {
      setStatus("idle")
      setMessage("")
    }, 5000)
  }

  return (
    <div className="space-y-4">
      <h4 className="font-semibold text-lg text-white">Join Our Newsletter</h4>
      <p className="text-sm text-white/80 leading-relaxed mb-4">
        Get weekly nutrition advice, healthy recipes, and exclusive offers straight to your inbox.
      </p>
      
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex bg-white/10 p-1 rounded-full border border-white/20 focus-within:border-orange/50 focus-within:ring-1 focus-within:ring-orange/50 transition-all">
          <Input
            type="email"
            required
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-transparent border-0 text-white placeholder:text-white/50 focus-visible:ring-0 focus-visible:ring-offset-0 px-4 h-11"
            disabled={status === "loading" || status === "success"}
          />
          <Button
            type="submit"
            disabled={status === "loading" || status === "success" || !email}
            className="rounded-full bg-orange hover:bg-orange/90 text-white px-6 h-11 shrink-0"
          >
            {status === "loading" ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : status === "success" ? (
              "Subscribed"
            ) : (
              "Subscribe"
            )}
          </Button>
        </div>
      </form>
      
      {message && (
        <p className={`text-xs px-2 ${status === "success" ? "text-brand-green" : "text-red-400"}`}>
          {message}
        </p>
      )}
    </div>
  )
}
