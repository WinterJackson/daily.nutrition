"use client"

import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { zodResolver } from "@hookform/resolvers/zod"
import { CheckCircle, Loader2, XCircle } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import * as z from "zod"

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  service: z.string().optional(),
  message: z.string().min(10, "Message must be at least 10 characters"),
})

export function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    setSubmitStatus("idle")

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })

      if (response.ok) {
        setSubmitStatus("success")
        reset()
      } else {
        setSubmitStatus("error")
      }
    } catch {
      setSubmitStatus("error")
    } finally {
      setIsSubmitting(false)
      // Reset status after 5 seconds
      setTimeout(() => setSubmitStatus("idle"), 5000)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium text-charcoal dark:text-neutral-300">
            Full Name
          </label>
          <Input id="name" placeholder="John Doe" {...register("name")} />
          {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-charcoal dark:text-neutral-300">
            Email Address
          </label>
          <Input id="email" type="email" placeholder="john@example.com" {...register("email")} />
          {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label htmlFor="phone" className="text-sm font-medium text-charcoal dark:text-neutral-300">
            Phone Number
          </label>
          <Input id="phone" placeholder="+254 700 000 000" {...register("phone")} />
          {errors.phone && <p className="text-red-500 text-xs">{errors.phone.message}</p>}
        </div>

        <div className="space-y-2">
          <label htmlFor="service" className="text-sm font-medium text-charcoal dark:text-neutral-300">
            Service Interest
          </label>
          <select
            id="service"
            className="flex h-10 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:ring-offset-charcoal"
            {...register("service")}
          >
            <option value="">Select a service...</option>
            <option value="cancer">Oncology Nutrition</option>
            <option value="diabetes">Diabetes Management</option>
            <option value="gut">Gut Health</option>
            <option value="general">General Counselling</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="message" className="text-sm font-medium text-charcoal dark:text-neutral-300">
          Message
        </label>
        <textarea
          id="message"
          className="flex min-h-[120px] w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:ring-offset-charcoal dark:placeholder:text-neutral-400"
          placeholder="How can we help you?"
          {...register("message")}
        />
        {errors.message && <p className="text-red-500 text-xs">{errors.message.message}</p>}
      </div>

      <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Sending...
          </>
        ) : (
          "Send Message"
        )}
      </Button>

      {/* Success Notification */}
      {submitStatus === "success" && (
        <div className="flex items-center gap-3 p-4 bg-brand-green/10 text-brand-green rounded-xl border border-brand-green/20 animate-in slide-in-from-bottom-2">
          <CheckCircle className="w-5 h-5 shrink-0" />
          <div>
            <p className="font-semibold text-sm">Message sent successfully!</p>
            <p className="text-xs text-brand-green/80">We&apos;ll get back to you within 24-48 hours.</p>
          </div>
        </div>
      )}

      {/* Error Notification */}
      {submitStatus === "error" && (
        <div className="flex items-center gap-3 p-4 bg-red-500/10 text-red-600 rounded-xl border border-red-500/20 animate-in slide-in-from-bottom-2">
          <XCircle className="w-5 h-5 shrink-0" />
          <div>
            <p className="font-semibold text-sm">Failed to send message</p>
            <p className="text-xs text-red-500/80">Please try again or contact us directly.</p>
          </div>
        </div>
      )}
    </form>
  )
}
