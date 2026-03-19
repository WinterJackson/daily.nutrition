import {
    Button,
    Section,
    Text
} from "@react-email/components";
import { BrandedEmailLayout, EmailBrandingData } from "./BrandedEmailLayout";

interface BookingConfirmationProps {
  clientName: string;
  serviceName: string;
  date: string;
  time: string;
  meetLink?: string;
  rescheduleLink?: string;
  referenceCode?: string;
  sessionType?: "virtual" | "in-person";
  branding: EmailBrandingData;
}

export const BookingConfirmationEmail = ({
  clientName = "Client",
  serviceName = "Consultation",
  date = "October 24, 2026",
  time = "10:00 AM",
  meetLink = "",
  referenceCode = "DN-123456",
  sessionType = "virtual",
  branding
}: BookingConfirmationProps) => {
  const isVirtual = sessionType === "virtual";
  const previewText = `Booking Confirmed: ${serviceName} with Edwak Nutrition`;

  return (
    <BrandedEmailLayout
      branding={branding}
      previewText={previewText}
      heading="Booking Confirmed"
    >
        <Text className="text-black text-[14px] leading-[24px]">
        Hello <strong>{clientName}</strong>,
        </Text>
        <Text className="text-black text-[14px] leading-[24px]">
        Your appointment for <strong>{serviceName}</strong> has been successfully scheduled.
        We look forward to meeting with you.
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
              Join Meeting
            </Button>
          </Section>
        ) : (
          <Section className="text-center mt-[32px] mb-[32px]">
            <Button
              className="bg-brand rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
              href={`${branding.websiteUrl}/booking/manage`}
            >
              Manage Booking
            </Button>
          </Section>
        )}
        
        <Text className="text-black text-[14px] leading-[24px]">
        If you need to reschedule, please visit our manage booking page or reply to this email at least 24 hours in advance.
        </Text>
    </BrandedEmailLayout>
  );
};

export default BookingConfirmationEmail;
