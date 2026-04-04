import { Button, Link, Text } from "@react-email/components"
import { BrandedEmailLayout, EmailBrandingData } from "../emails/BrandedEmailLayout"

interface StaffInviteEmailProps {
  setupLink: string
  userName?: string
  role: string
  inviterName?: string
  branding: EmailBrandingData
}

export function StaffInviteEmail({ setupLink, userName = "User", role, inviterName = "An administrator", branding }: StaffInviteEmailProps) {
  return (
    <BrandedEmailLayout
      branding={branding}
      previewText="Set up your new Edwak Nutrition account"
      heading="Welcome to Edwak Nutrition"
    >
      <Text className="text-charcoal text-base">
        Hello {userName},
      </Text>
      
      <Text className="text-charcoal text-base">
        {inviterName} has invited you to join the Edwak Nutrition platform as a <strong>{role}</strong>. 
        Please click the button below to complete your account setup and set your secure password.
      </Text>

      <div className="text-center my-8">
        <Button
          href={setupLink}
          className="bg-brand-green text-white font-medium py-3 px-6 rounded-lg decoration-none inline-block text-center tracking-wide"
        >
          Set Up Account
        </Button>
      </div>

      <Text className="text-charcoal/80 text-sm">
        Or copy and paste this link into your browser: <br />
        <Link href={setupLink} className="text-olive break-all underline decoration-olive/30">
          {setupLink}
        </Link>
      </Text>

      <Text className="text-charcoal/80 text-sm mt-6">
        This invitation link will expire in 48 hours for security reasons. If you did not expect this invitation, 
        you can safely ignore this email.
      </Text>
    </BrandedEmailLayout>
  )
}

export default StaffInviteEmail
