import { Section, Text } from "@react-email/components";
import { BrandedEmailLayout, EmailBrandingData } from "./BrandedEmailLayout";

interface AdminPasswordChangedProps {
    branding: EmailBrandingData;
    date: string;
    ipAddress?: string;
}

export const AdminPasswordChangedEmail = ({
    branding,
    date,
    ipAddress
}: AdminPasswordChangedProps) => {
    return (
        <BrandedEmailLayout
            branding={branding}
            previewText="Security Alert: Password Changed"
            heading="Password Changed"
        >
            <Section>
                <Text className="text-[14px] leading-[24px] text-black">
                    Your account password was recently changed.
                </Text>
                
                <Section className="bg-red-50 p-4 rounded-md my-4 border border-red-100">
                    <Text className="m-0 font-bold text-gray-700">Time</Text>
                    <Text className="m-0 mb-2 text-gray-600">{date}</Text>
                    
                    {ipAddress && (
                        <>
                            <Text className="m-0 font-bold text-gray-700">IP Address</Text>
                            <Text className="m-0 text-gray-600">{ipAddress}</Text>
                        </>
                    )}
                </Section>

                <Text className="text-[14px] leading-[24px] text-black">
                    If this was you, you can safely ignore this email. If you did not make this change, please contact support immediately.
                </Text>
            </Section>
        </BrandedEmailLayout>
    );
};

export default AdminPasswordChangedEmail;
