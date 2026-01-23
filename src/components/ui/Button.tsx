import { cn } from "@/lib/utils"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:ring-offset-charcoal dark:focus-visible:ring-brand-green",
  {
    variants: {
      variant: {
        default: "bg-brand-green text-white hover:bg-brand-green/90",
        olive: "bg-olive text-white hover:bg-olive/90",
        accent: "bg-orange text-charcoal hover:bg-orange/90 font-semibold", // High contrast
        outline:
          "border border-brand-green bg-transparent text-brand-green hover:bg-brand-green/10",
        secondary:
          "bg-soft-green text-white hover:bg-soft-green/80",
        ghost: "hover:bg-brand-green/10 hover:text-brand-green",
        link: "text-brand-green underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
