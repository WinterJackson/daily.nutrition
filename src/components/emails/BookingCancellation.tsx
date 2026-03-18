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
  branding: EmailBrandingData;
  bookingUrl: string;
}

export const BookingCancellationEmail = ({
  clientName = "Client",
  serviceName = "Consultation",
  date = "October 24, 2026",
  time = "10:00 AM",
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
        This email confirms that your appointment for <strong>{serviceName}</strong> has been cancelled as requested.
        </Text>
        
        <Section className="bg-red-50 p-6 rounded-lg my-6 border border-red-100">
        <Text className="m-0 text-red-800 font-bold uppercase text-xs mb-2">
            Cancelled Appointment
        </Text>
        <Text className="m-0 text-lg font-semibold mb-4 text-red-900">
            {date} at {time}
        </Text>
        </Section>

        <Text className="text-black text-[14px] leading-[24px]">
            If you would like to book a new appointment at a different time, please visit our booking page below.
        </Text>

        <Section className="text-center mt-[32px] mb-[32px]">
        <Button
            className="bg-brand rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
            href={bookingUrl}
        >
            Book New Appointment
        </Button>
        </Section>
    </BrandedEmailLayout>
  );
};

export default BookingCancellationEmail;
