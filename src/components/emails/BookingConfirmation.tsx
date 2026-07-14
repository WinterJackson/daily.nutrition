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
  expectedAmount?: number | null;
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
  expectedAmount,
  branding
}: BookingConfirmationProps) => {
  const isVirtual = sessionType === "virtual";
  const previewText = `Action Required: Complete Payment for ${serviceName}`;

  return (
    <BrandedEmailLayout
      branding={branding}
      previewText={previewText}
      heading="Action Required: Complete Payment"
    >
        <Text className="text-black text-[14px] leading-[24px]">
        Hello <strong>{clientName}</strong>,
        </Text>
        <Text className="text-black text-[14px] leading-[24px]">
        Your reservation for <strong>{serviceName}</strong> is currently <strong>PENDING</strong>.
        To secure this time slot, please complete your M-Pesa payment using the instructions located in the Secure Payment block at the bottom of this email.
        </Text>
        <Text className="text-black text-[14px] leading-[24px]">
        Once payment is verified by our team, you will receive a final confirmation containing your Google Meet link or check-in instructions.
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
                <Text className="m-0 text-lg font-mono font-semibold mb-4">
                    {referenceCode}
                </Text>
            </>
        )}
        
        {expectedAmount != null && (
            <>
                <Text className="m-0 text-olive font-bold uppercase text-xs mb-2 mt-4">
                    Amount to Pay
                </Text>
                <Text className="m-0 text-lg font-semibold text-brand-green">
                    Ksh {expectedAmount.toLocaleString()}
                </Text>
            </>
        )}
        </Section>

        <Section className="text-center mt-[32px] mb-[32px]">
            <Button
              className="bg-brand rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
              href={`${branding.websiteUrl}/booking/manage/${referenceCode}`}
            >
              Track Booking Status
            </Button>
        </Section>
        
        <Text className="text-black text-[14px] leading-[24px]">
        If you need to cancel this reservation or have any questions, please reply directly to this email. Unpaid slots will be automatically released.
        </Text>
    </BrandedEmailLayout>
  );
};

export default BookingConfirmationEmail;
