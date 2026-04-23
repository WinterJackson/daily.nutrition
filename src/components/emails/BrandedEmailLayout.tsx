import {
    Body,
    Container,
    Head,
    Heading,
    Html,
    Img,
    Link,
    Preview,
    Section,
    Tailwind,
    Text,
} from "@react-email/components";
import * as React from "react";

export interface EmailBrandingData {
    logoUrl?: string | null;
    primaryColor: string;
    accentColor: string;
    footerText: string;
    websiteUrl: string;
    supportEmail: string;
    clinicLocation?: string;
    contactPhone?: string;
    paymentTill?: string;
    paymentPaybill?: string;
    paymentAccountNumber?: string;
    paymentAccountName?: string;
}

interface BrandedEmailLayoutProps {
    branding: EmailBrandingData;
    previewText: string;
    heading?: string;
    children: React.ReactNode;
}

export const BrandedEmailLayout = ({
    branding,
    previewText,
    heading,
    children,
}: BrandedEmailLayoutProps) => {
    const { primaryColor, accentColor, logoUrl, footerText, websiteUrl, supportEmail, clinicLocation, contactPhone, paymentPaybill, paymentAccountNumber, paymentAccountName } = branding;
    const appBaseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const resolvedLogoUrl = logoUrl || `${appBaseUrl}/logo.png`;

    return (
        <Html>
            <Head />
            <Preview>{previewText}</Preview>
            <Tailwind
                config={{
                    theme: {
                        extend: {
                            colors: {
                                brand: primaryColor,
                                accent: accentColor,
                                olive: primaryColor,       // Alias for backward compatibility if needed
                                offwhite: "#F8FAF5",
                            },
                        },
                    },
                }}
            >
                <Body className="bg-white my-auto mx-auto font-sans">
                    <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] w-[465px]">
                        {/* Header */}
                        <Section className="mt-[32px] mb-[32px] text-center">
                            <div
                                style={{
                                    display: "inline-block",
                                    backgroundColor: primaryColor,
                                    borderRadius: "10px",
                                    padding: "16px 24px",
                                }}
                            >
                                <Img
                                    src={resolvedLogoUrl}
                                    width="160"
                                    height="60"
                                    alt="Edwak Nutrition"
                                    style={{
                                        display: "block",
                                        margin: "0 auto",
                                        objectFit: "contain",
                                    }}
                                />
                            </div>
                            {heading && (
                                <Heading className="text-black text-[24px] font-normal text-center p-0 my-[20px] mx-0">
                                    {heading}
                                </Heading>
                            )}
                        </Section>

                        {/* Content */}
                        {children}

                        {/* Footer */}
                        <Section className="text-center mt-[32px] border-t border-[#eaeaea] pt-[20px]">
                            <Text className="text-[#666666] text-[12px] leading-[24px]">
                                {footerText}
                            </Text>
                            <div className="text-[12px] text-[#666666]">
                                <Link href={websiteUrl} className="text-brand underline mr-3">
                                    Website
                                </Link>
                                <Link href={`mailto:${supportEmail}`} className="text-brand underline">
                                    Contact Support
                                </Link>
                            </div>

                            {/* Dynamic Global Contact & Payment Injection */}
                            {(clinicLocation || contactPhone || paymentPaybill) && (
                                <div className="mt-6 p-4 rounded-xl text-left border border-[#eaeaea] bg-offwhite">
                                    <Text className="m-0 text-olive font-bold uppercase text-[10px] mb-2 tracking-wider">
                                        Business Details
                                    </Text>
                                    {clinicLocation && (
                                        <Text className="m-0 text-[#666] text-[12px] leading-[20px] pb-1">
                                            📍 {clinicLocation}
                                        </Text>
                                    )}
                                    {contactPhone && (
                                        <Text className="m-0 text-[#666] text-[12px] leading-[20px] pb-1">
                                            📞 {contactPhone}
                                        </Text>
                                    )}
                                    
                                    {paymentPaybill && (
                                        <>
                                            <div className="w-full h-[1px] bg-[#eaeaea] my-3" />
                                            <Text className="m-0 text-olive font-bold uppercase text-[10px] mb-2 tracking-wider">
                                                Accepted Payment Methods (M-Pesa)
                                            </Text>
                                            <Text className="m-0 text-[#666] text-[12px] leading-[20px] pb-1">
                                                <strong>Paybill:</strong> {paymentPaybill}
                                            </Text>
                                            {paymentAccountNumber && (
                                                <Text className="m-0 text-[#666] text-[12px] leading-[20px] pb-1">
                                                    <strong>Account Number:</strong> {paymentAccountNumber}
                                                </Text>
                                            )}
                                            {paymentAccountName && (
                                                <Text className="m-0 text-[#666] text-[12px] leading-[20px] pb-1">
                                                    <strong>Account Name:</strong> {paymentAccountName}
                                                </Text>
                                            )}
                                        </>
                                    )}
                                </div>
                            )}
                        </Section>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
};
