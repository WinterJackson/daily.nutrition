import { Button, Hr, Section, Text } from "@react-email/components";
import { BrandedEmailLayout, EmailBrandingData } from "./BrandedEmailLayout";

interface InquiryReplyEmailProps {
  clientName: string;
  originalMessage: string;
  replyMessage: string;
  branding: EmailBrandingData;
}

export function InquiryReplyEmail({
  clientName,
  originalMessage,
  replyMessage,
  branding,
}: InquiryReplyEmailProps) {
  return (
    <BrandedEmailLayout
      branding={branding}
      previewText={`We've replied to your message — Edwak Nutrition`}
      heading="We've Replied to Your Message"
    >
      <Text className="text-black text-[14px] leading-[24px]">
        Hi <strong>{clientName}</strong>,
      </Text>
      <Text className="text-black text-[14px] leading-[24px]">
        Thank you for reaching out. Here is our response to your inquiry:
      </Text>

      {/* Our Reply */}
      <Section className="bg-white p-5 rounded-lg my-6 border-2 border-brand/20">
        <Text className="m-0 font-bold text-gray-500 uppercase text-xs mb-2 tracking-wider">
          Our Reply
        </Text>
        <Text className="m-0 text-[15px] leading-[28px] text-black" style={{ whiteSpace: "pre-wrap" }}>
          {replyMessage}
        </Text>
      </Section>

      {/* Original Message */}
      <Section className="bg-gray-50 p-4 rounded-md border-l-4 border-accent">
        <Text className="m-0 font-bold text-gray-500 uppercase text-xs mb-2 tracking-wider">
          Your Original Message
        </Text>
        <Text className="m-0 text-[14px] leading-[24px] text-gray-500 italic">
          &ldquo;{originalMessage}&rdquo;
        </Text>
      </Section>

      <Hr className="border-gray-200 my-6" />

      <Section className="text-center mt-[32px] mb-[32px]">
        <Button
          className="bg-brand rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
          href={`${branding.websiteUrl}/booking`}
        >
          Book a Consultation
        </Button>
      </Section>
    </BrandedEmailLayout>
  );
}

export default InquiryReplyEmail;
