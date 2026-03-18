import {
    Body,
    Container,
    Head,
    Heading,
    Html,
    Preview,
    Tailwind,
    Text
} from "@react-email/components"
import * as React from "react"

interface MainEmailLayoutProps {
  previewText: string
  heading?: string
  children: React.ReactNode
}

/**
 * @deprecated Use `BrandedEmailLayout` from `@/components/emails/BrandedEmailLayout` instead.
 * This layout is kept only for backward compatibility during migration.
 */
export function MainEmailLayout({ previewText, heading, children }: MainEmailLayoutProps) {
  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind
        config={{
          theme: {
            extend: {
              colors: {
                brand: "#D4AF37",
                bg: "#FaFbf9",
                surface: "#ffffff",
                olive: "#4A5D23",
                orange: "#E86A33",
                charcoal: "#2C3539",
              },
              fontFamily: {
                sans: ["Inter", "Helvetica", "Arial", "sans-serif"],
                serif: ["Playfair Display", "Georgia", "serif"],
              },
            },
          },
        }}
      >
        <Body className="bg-bg text-charcoal font-sans m-auto py-10 px-4">
          <Container className="bg-surface border border-olive/10 rounded-2xl shadow-sm mx-auto p-8 max-w-[600px]">
            {/* Header/Logo placeholder */}
            <div className="mb-8 text-center">
               <Text className="text-2xl font-serif text-olive font-bold m-0 tracking-wide uppercase">
                  Edwak Nutrition
               </Text>
            </div>

            {heading && (
              <Heading className="text-2xl font-serif text-charcoal font-medium text-center mb-6">
                {heading}
              </Heading>
            )}

            <div className="space-y-6">
              {children}
            </div>

            <Text className="text-charcoal/50 text-xs text-center mt-12 pt-6 border-t border-olive/10">
              This is an automated administrative notification from Edwak Nutrition. 
              Please do not reply to this email.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}
