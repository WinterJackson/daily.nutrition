import {
    Button,
    Section,
    Text
} from "@react-email/components";
import { BrandedEmailLayout, EmailBrandingData } from "./BrandedEmailLayout";

interface BookingExpiredProps {
  clientName: string;
  serviceName: string;
  date: string;
  time: string;
  referenceCode?: string;
  branding: EmailBrandingData;
  bookingUrl: string;
}

export const BookingExpiredEmail = ({
  clientName = "Client",
  serviceName = "Consultation",
  date = "October 24, 2026",
  time = "10:00 AM",
  referenceCode,
  branding,
  bookingUrl = "https://edwaknutrition.co.ke/booking"
}: BookingExpiredProps) => {
  const previewText = `Booking Hold Expired: ${serviceName} with Edwak Nutrition`;

  return (
    <BrandedEmailLayout
      branding={branding}
      previewText={previewText}
      heading="Booking Hold Expired"
    >
        <Text className="text-black text-[14px] leading-[24px]">
        Hello <strong>{clientName}</strong>,
        </Text>
        <Text className="text-black text-[14px] leading-[24px]">
        Your 45-minute payment hold for <strong>{serviceName}</strong> has expired because we did not receive payment confirmation in time. The time slot has now been released.
        </Text>
        
        <Section className="bg-red-50 p-6 rounded-lg my-6 border border-red-100">
        <Text className="m-0 text-red-800 font-bold uppercase text-xs mb-2">
            Expired Appointment
        </Text>
        <Text className="m-0 text-lg font-semibold mb-2 text-red-900">
            {serviceName}
        </Text>
        <Text className="m-0 text-base text-red-800 mb-4">
            {date} at {time}
        </Text>
        </Section>

        <Text className="text-black text-[14px] leading-[24px]">
        If you still wish to book an appointment, please return to our website to select a new time slot and complete the payment process.
        </Text>

        <Section className="text-center mt-[32px] mb-[32px]">
            <Button
              className="bg-brand rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
              href={bookingUrl}
            >
              Book a New Appointment
            </Button>
        </Section>
    </BrandedEmailLayout>
  );
};

export default BookingExpiredEmail;
