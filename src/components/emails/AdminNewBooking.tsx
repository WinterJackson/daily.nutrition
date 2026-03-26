import { Button, Section, Text } from "@react-email/components";
import { BrandedEmailLayout, EmailBrandingData } from "./BrandedEmailLayout";

interface AdminNewBookingProps {
    branding: EmailBrandingData;
    clientName: string;
    clientEmail: string;
    clientPhone?: string;
    serviceName: string;
    date: string;
    time: string;
    referenceCode?: string;
    sessionType?: "virtual" | "in-person";
    bookingUrl: string;
}

export const AdminNewBookingEmail = ({
    branding,
    clientName,
    clientEmail,
    clientPhone,
    serviceName,
    date,
    time,
    referenceCode,
    sessionType = "virtual",
    bookingUrl
}: AdminNewBookingProps) => {
    return (
        <BrandedEmailLayout
            branding={branding}
            previewText={`New Booking from ${clientName} — ${serviceName}`}
            heading="New Booking Received"
        >
            <Section>
                <Text className="text-[14px] leading-[24px] text-black">
                    A new appointment has been booked. Here are the details:
                </Text>
                
                <Section className="bg-gray-50 p-5 rounded-lg my-4 border border-gray-100">
                    <Text className="m-0 font-bold text-gray-500 uppercase text-xs mb-1 tracking-wider">Client</Text>
                    <Text className="m-0 mb-3 text-black font-semibold">{clientName}</Text>
                    
                    <Text className="m-0 font-bold text-gray-500 uppercase text-xs mb-1 tracking-wider">Email</Text>
                    <Text className="m-0 mb-3 text-black">
                        <a href={`mailto:${clientEmail}`} className="text-brand underline">{clientEmail}</a>
                    </Text>

                    {clientPhone && (
                        <>
                            <Text className="m-0 font-bold text-gray-500 uppercase text-xs mb-1 tracking-wider">Phone</Text>
                            <Text className="m-0 mb-3 text-black">
                                <a href={`tel:${clientPhone}`} className="text-brand underline">{clientPhone}</a>
                            </Text>
                        </>
                    )}
                    
                    <Text className="m-0 font-bold text-gray-500 uppercase text-xs mb-1 tracking-wider">Service</Text>
                    <Text className="m-0 mb-3 text-black font-semibold">{serviceName}</Text>
                    
                    <Text className="m-0 font-bold text-gray-500 uppercase text-xs mb-1 tracking-wider">Date & Time</Text>
                    <Text className="m-0 mb-3 text-black font-semibold">{date} at {time}</Text>

                    <Text className="m-0 font-bold text-gray-500 uppercase text-xs mb-1 tracking-wider">Session Type</Text>
                    <Text className="m-0 mb-3 text-black">{sessionType === "virtual" ? "🖥️ Virtual (Google Meet)" : "🏥 In-Person"}</Text>

                    {referenceCode && (
                        <>
                            <Text className="m-0 font-bold text-gray-500 uppercase text-xs mb-1 tracking-wider">Reference Code</Text>
                            <Text className="m-0 text-lg font-mono font-bold text-brand">{referenceCode}</Text>
                        </>
                    )}
                </Section>

                <Section className="text-center mt-[32px] mb-[32px]">
                    <Button
                        className="bg-brand text-white rounded px-5 py-3 text-[12px] font-semibold no-underline text-center"
                        href={bookingUrl}
                    >
                        View in Admin Dashboard
                    </Button>
                </Section>
            </Section>
        </BrandedEmailLayout>
    );
};

export default AdminNewBookingEmail;
