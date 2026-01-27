import { Activity, AlertCircle, Apple, HeartPulse, Phone, Scale, Sparkles } from "lucide-react"

export const iconMap: Record<string, any> = {
  "Phone": Phone,
  "Activity": Activity,
  "HeartPulse": HeartPulse,
  "Apple": Apple,
  "Scale": Scale,
  "Sparkles": Sparkles
}

interface ServiceIconProps {
  name: string
  className?: string
}

export function ServiceIcon({ name, className }: ServiceIconProps) {
  const Icon = iconMap[name] || AlertCircle
  return <Icon className={className} />
}
