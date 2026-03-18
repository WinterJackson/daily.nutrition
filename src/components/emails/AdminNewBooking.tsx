import { Button, Section, Text } from "@react-email/components";
import { BrandedEmailLayout, EmailBrandingData } from "./BrandedEmailLayout";

interface AdminNewBookingProps {
    branding: EmailBrandingData;
    clientName: string;
    serviceName: string;
    date: string;
    time: string;
    bookingUrl: string;
}

export const AdminNewBookingEmail = ({
    branding,
    clientName,
    serviceName,
    date,
    time,
    bookingUrl
}: AdminNewBookingProps) => {
    return (
        <BrandedEmailLayout
            branding={branding}
            previewText={`New Booking from ${clientName}`}
            heading="New Booking Confirmed"
        >
            <Section>
                <Text className="text-[14px] leading-[24px] text-black">
                    You have a new booking request.
                </Text>
                
                <Section className="bg-gray-50 p-4 rounded-md my-4 border border-gray-100">
                    <Text className="m-0 font-bold text-gray-700">Client</Text>
                    <Text className="m-0 mb-2 text-gray-600">{clientName}</Text>
                    
                    <Text className="m-0 font-bold text-gray-700">Service</Text>
                    <Text className="m-0 mb-2 text-gray-600">{serviceName}</Text>
                    
                    <Text className="m-0 font-bold text-gray-700">Date & Time</Text>
                    <Text className="m-0 text-gray-600">{date} at {time}</Text>
                </Section>

                <Section className="text-center mt-[32px] mb-[32px]">
                    <Button
                        className="bg-brand text-white rounded px-5 py-3 text-[12px] font-semibold no-underline text-center"
                        href={bookingUrl}
                    >
                        View Booking Details
                    </Button>
                </Section>
            </Section>
        </BrandedEmailLayout>
    );
};

export default AdminNewBookingEmail;
