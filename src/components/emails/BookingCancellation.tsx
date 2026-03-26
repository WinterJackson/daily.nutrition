import {
    Button,
    Section,
    Text
} from "@react-email/components";
import { BrandedEmailLayout, EmailBrandingData } from "./BrandedEmailLayout";

interface BookingCancellationProps {
  clientName: string;
  serviceName: string;
  date: string;
  time: string;
  referenceCode?: string;
  branding: EmailBrandingData;
  bookingUrl: string;
}

export const BookingCancellationEmail = ({
  clientName = "Client",
  serviceName = "Consultation",
  date = "October 24, 2026",
  time = "10:00 AM",
  referenceCode,
  branding,
  bookingUrl = "http://localhost:3000/booking"
}: BookingCancellationProps) => {
  const previewText = `Booking Cancelled: ${serviceName} with Edwak Nutrition`;

  return (
    <BrandedEmailLayout
      branding={branding}
      previewText={previewText}
      heading="Booking Cancelled"
    >
        <Text className="text-black text-[14px] leading-[24px]">
        Hello <strong>{clientName}</strong>,
        </Text>
        <Text className="text-black text-[14px] leading-[24px]">
        This email confirms that your appointment for <strong>{serviceName}</strong> has been cancelled.
        </Text>
        
        <Section className="bg-red-50 p-6 rounded-lg my-6 border border-red-100">
        <Text className="m-0 text-red-800 font-bold uppercase text-xs mb-2">
            Cancelled Appointment
        </Text>
        <Text className="m-0 text-lg font-semibold mb-2 text-red-900">
            {serviceName}
        </Text>
        <Text className="m-0 text-base text-red-800 mb-4">
            {date} at {time}
        </Text>
        {referenceCode && (
            <>
                <Text className="m-0 text-red-800 font-bold uppercase text-xs mb-2 mt-4">
                    Reference Code
                </Text>
                <Text className="m-0 text-base font-mono font-semibold text-red-900">
                    {referenceCode}
                </Text>
            </>
        )}
        </Section>

        <Text className="text-black text-[14px] leading-[24px]">
            If this cancellation was a mistake or you would like to book a new appointment at a different time, please visit our booking page below.
        </Text>

        <Section className="text-center mt-[32px] mb-[32px]">
        <Button
            className="bg-brand rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
            href={bookingUrl}
        >
            Book New Appointment
        </Button>
        </Section>

        <Text className="text-[#666666] text-[12px] leading-[20px]">
            If you have any questions about this cancellation, please don&apos;t hesitate to contact us at{" "}
            <a href={`mailto:${branding.supportEmail}`} className="text-brand underline">{branding.supportEmail}</a>.
        </Text>
    </BrandedEmailLayout>
  );
};

export default BookingCancellationEmail;
