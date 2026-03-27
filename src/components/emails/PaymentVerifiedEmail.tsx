import {
    Button,
    Section,
    Text
} from "@react-email/components";
import { BrandedEmailLayout, EmailBrandingData } from "./BrandedEmailLayout";

interface PaymentVerifiedProps {
  clientName: string;
  serviceName: string;
  date: string;
  time: string;
  meetLink?: string;
  referenceCode?: string;
  sessionType?: "virtual" | "in-person";
  branding: EmailBrandingData;
}

export const PaymentVerifiedEmail = ({
  clientName = "Client",
  serviceName = "Consultation",
  date = "October 24, 2026",
  time = "10:00 AM",
  meetLink = "",
  referenceCode = "DN-123456",
  sessionType = "virtual",
  branding
}: PaymentVerifiedProps) => {
  const isVirtual = sessionType === "virtual";
  const previewText = `Payment Verified: ${serviceName} Confirmed`;

  return (
    <BrandedEmailLayout
      branding={branding}
      previewText={previewText}
      heading="Payment Verified & Booking Confirmed"
    >
        <Text className="text-black text-[14px] leading-[24px]">
        Hello <strong>{clientName}</strong>,
        </Text>
        <Text className="text-black text-[14px] leading-[24px]">
        We have successfully received and verified your M-Pesa payment. Your appointment for <strong>{serviceName}</strong> is now fully confirmed.
        We look forward to meeting with you!
        </Text>
        
        <Section className="bg-offwhite p-6 rounded-lg my-6">
        <Text className="m-0 text-olive font-bold uppercase text-xs mb-2">
            When
        </Text>
        <Text className="m-0 text-lg font-semibold mb-4">
            {date} at {time}
        </Text>
        
        <Text className="m-0 text-olive font-bold uppercase text-xs mb-2">
            Where
        </Text>
        <Text className="m-0 text-lg font-semibold">
           {isVirtual ? "Google Meet (Video Call)" : "In-Person — PMC Park Medical Center, Parklands"}
        </Text>
        
        {referenceCode && (
            <>
                <Text className="m-0 text-olive font-bold uppercase text-xs mb-2 mt-4">
                    Reference Code
                </Text>
                <Text className="m-0 text-lg font-mono font-semibold">
                    {referenceCode}
                </Text>
            </>
        )}
        </Section>

        {isVirtual && meetLink ? (
          <Section className="text-center mt-[32px] mb-[32px]">
            <Button
              className="bg-brand rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
              href={meetLink}
            >
              Join Virtual Meeting
            </Button>
          </Section>
        ) : (
          <Section className="text-center mt-[32px] mb-[32px]">
            <Button
              className="bg-brand rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
              href={`${branding.websiteUrl}/booking/manage/${referenceCode}`}
            >
              Manage Booking
            </Button>
          </Section>
        )}
        
        <Text className="text-black text-[14px] leading-[24px]">
        If you need to reschedule or have any questions, please reply directly to this email at least 24 hours in advance.
        </Text>
    </BrandedEmailLayout>
  );
};

export default PaymentVerifiedEmail;
