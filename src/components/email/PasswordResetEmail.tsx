import { Button, Link, Text } from "@react-email/components"
import { BrandedEmailLayout, EmailBrandingData } from "../emails/BrandedEmailLayout"

interface PasswordResetEmailProps {
  resetLink: string
  userName?: string
  branding: EmailBrandingData
}

export function PasswordResetEmail({ resetLink, userName = "User", branding }: PasswordResetEmailProps) {
  return (
    <BrandedEmailLayout
      branding={branding}
      previewText="Reset your Edwak Nutrition password"
      heading="Password Reset Request"
    >
      <Text className="text-charcoal text-base">
        Hello {userName},
      </Text>
      
      <Text className="text-charcoal text-base">
        We received a request to reset the password for your administrative account. 
        If you made this request, please click the button below to set a new password.
      </Text>

      <div className="text-center my-8">
        <Button
          href={resetLink}
          className="bg-orange text-white font-medium py-3 px-6 rounded-lg decoration-none inline-block text-center tracking-wide"
        >
          Reset Password
        </Button>
      </div>

      <Text className="text-charcoal/80 text-sm">
        Or copy and paste this link into your browser: <br />
        <Link href={resetLink} className="text-olive break-all underline decoration-olive/30">
          {resetLink}
        </Link>
      </Text>

      <Text className="text-charcoal/80 text-sm mt-6">
        This link will expire in 30 minutes. If you did not request a password reset, 
        you can safely ignore this email and your password will remain unchanged.
      </Text>
    </BrandedEmailLayout>
  )
}

export default PasswordResetEmail
